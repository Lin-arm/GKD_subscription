"""
Issue 快照链接检查主入口

职责：协调各模块执行分析流程，将原子化结果输出到 GITHUB_OUTPUT。
不直接操作 GitHub API —— 所有 GitHub 操作由 YAML 工作流完成。

流程：
  1. 提取链接 → 判断是否缺少快照（唯一致命，关闭 Issue）
  2. 检查不可访问快照链接（i.gkd.li/snapshot/，非致命）
  3. 网络有效性检查（GKD 链接先转 GH 附件 URL 再检查 / GH 附件直接检查）
     - 404 非致命，打标签+评论但不关闭
     - 403/5xx 不确定，打标签+评论
  4. 链接转换 + Bot 评论生成（仅当含有 GitHub 附件链接时）
  5. 编辑/评论恢复判断

输出变量（原子化标志，供 YAML 多 Job 条件判断）：
  - has_snapshot      : 是否包含任何快照链接
  - has_unreachable   : 是否包含不可访问快照
  - network_status    : 网络检查结果 (ok / 404 / uncertain / skipped)
  - network_detail    : 网络错误详情
  - has_convertible   : 是否有可转换的 GitHub 附件
  - warning_type      : 警告类型 (missing / unreachable / inaccessible / uncertain / recovery / "")
  - comment_missing   : 缺失快照评论（含 <!-- gkd-warning-missing --> 标记）
  - comment_unreachable : 不可访问快照评论（含 <!-- gkd-warning-unreachable --> 标记）
  - comment_404       : 链接404评论（含 <!-- gkd-warning-404 --> 标记）
  - comment_uncertain : 网络不确定评论（含 <!-- gkd-warning-uncertain --> 标记）
  - comment_recovery  : 恢复评论（含 <!-- gkd-warning-recovery --> 标记）
  - comment_bot       : Bot 评论（含 <!-- gkd-bot-comment --> 标记）
"""

import os
from dataclasses import dataclass

from utils.models import LinkInfo, SnapshotInfo
from utils.common import extract_filename
from core.extractor import extract_links
from core.checker import (
    check_unreachable_links,
    check_network_links,
    gkd_to_gh_attachment_url,
)
from core.converter import convert_github_attachments, GKD_PROXY_TEMPLATE
from core.snapshot_parser import download_and_parse
from formatter import (
    build_warning_missing,
    build_warning_unreachable,
    build_warning_inaccessible,
    build_warning_uncertain,
    build_recovery_comment,
    build_bot_comment,
)
from utils.utils import write_output


# ── 快照相关链接类型集合 ──

_SNAPSHOT_KINDS = {"gkd", "github_attachment", "unreachable_snapshot"}


# ── 网络检查聚合结果 ──


@dataclass
class _NetworkCheckResult:
    """网络检查聚合结果，记录首次遇到的致命/不确定错误"""

    status: str = "skipped"  # 初始状态为 skipped，只有实际检查后才变为 ok/404/uncertain
    detail: str = ""
    fail_url: str = ""
    uncertain_url: str = ""
    uncertain_code: int = 0
    uncertain_detail: str = ""


# ── 主流程 ──


def main():
    body = os.environ.get("ISSUE_BODY", "") or ""
    comment_body = os.environ.get("ISSUE_COMMENT_BODY", "") or ""
    issue_user = os.environ.get("ISSUE_USER", "")
    issue_action = os.environ.get("ISSUE_ACTION", "")

    # 合并 Issue Body 和评论内容一起分析（评论补充的链接也参与检查）
    full_text = body + "\n" + comment_body if comment_body else body

    has_snapshot = "true"
    has_unreachable = "false"
    network_status = "skipped"
    network_detail = ""
    has_convertible = "false"
    warning_type = ""
    comment_missing = ""
    comment_unreachable = ""
    comment_404 = ""
    comment_uncertain = ""
    comment_recovery = ""
    comment_bot = ""

    # ── 第一步：提取所有链接 ──
    links = extract_links(full_text)

    # ── 第二步：判断是否缺少快照（唯一致命 → 提前返回） ──
    has_any_snapshot = any(lnk.kind in _SNAPSHOT_KINDS for lnk in links)

    if not has_any_snapshot:
        comment_missing = build_warning_missing(issue_user)
        _output(
            has_snapshot="false",
            has_unreachable="false",
            network_status="skipped",
            network_detail="",
            has_convertible="false",
            warning_type="missing",
            comment_missing=comment_missing,
            comment_unreachable="",
            comment_404="",
            comment_uncertain="",
            comment_recovery="",
            comment_bot="",
        )
        return

    # ── 第三步：检查不可访问快照链接（非致命，继续后续检查） ──
    unreachable_links = check_unreachable_links(links)
    has_unreachable = "true" if unreachable_links else "false"
    if unreachable_links:
        comment_unreachable = build_warning_unreachable(issue_user)

    # ── 第四步：网络有效性检查 ──
    # GKD 分享链接先转换为 GH 附件 URL 再检查，GH 附件链接直接检查
    net_result = _check_all_links(links)
    network_status = net_result.status
    network_detail = net_result.detail

    if network_status == "404":
        comment_404 = build_warning_inaccessible(issue_user, net_result.fail_url)

    if network_status == "uncertain":
        comment_uncertain = build_warning_uncertain(
            issue_user,
            net_result.uncertain_url,
            net_result.uncertain_code,
            net_result.uncertain_detail,
        )

    # ── 第五步：链接转换 + 快照解析 + Bot 评论生成 ──
    # 仅当网络检查通过（ok/skipped）且含有可下载的快照链接时执行
    # 如果网络检查失败（404/uncertain），不生成 Bot 评论
    if network_status in ("ok", "skipped"):
        snapshots, gkd_links = _parse_all_snapshots(links)
        if snapshots or gkd_links:
            has_convertible = "true"
            comment_body = build_bot_comment(snapshots, gkd_links)
            comment_bot = "<!-- gkd-bot-comment -->\n" + comment_body

    # ── 第六步：编辑/评论恢复判断 ──
    # 当 edited 或 issue_comment 触发且所有检查均通过时，触发恢复流程
    # 恢复条件：edited/comment + 至少有一个有效快照链接 + 网络OK
    # 不要求旧问题链接消失——作者补充有效链接即可恢复
    has_valid_snapshot = any(lnk.kind in ("gkd", "github_attachment") for lnk in links)

    if issue_action in ("edited", "comment") and has_valid_snapshot and network_status in ("ok", "skipped"):
        warning_type = "recovery"
        comment_recovery = build_recovery_comment(issue_user)

    _output(
        has_snapshot=has_snapshot,
        has_unreachable=has_unreachable,
        network_status=network_status,
        network_detail=network_detail,
        has_convertible=has_convertible,
        warning_type=warning_type,
        comment_missing=comment_missing,
        comment_unreachable=comment_unreachable,
        comment_404=comment_404,
        comment_uncertain=comment_uncertain,
        comment_recovery=comment_recovery,
        comment_bot=comment_bot,
    )


def _check_all_links(links: list) -> _NetworkCheckResult:
    """
    对所有可检查链接执行网络有效性检查。

    检查对象：
    - GitHub 附件链接：直接检查原始 URL
    - GKD 分享链接：先转换为 GH 附件 URL 再检查

    遵循 Fail Fast 原则：遇到 404 立即返回。
    不确定结果（403/5xx）为非致命，记录但不中断。

    返回：_NetworkCheckResult 聚合结果
    """
    result = _NetworkCheckResult()

    for lnk in links:
        if lnk.kind == "github_attachment":
            check_url = lnk.url
        elif lnk.kind == "gkd":
            check_url = gkd_to_gh_attachment_url(lnk.url)
            if not check_url:
                continue
        else:
            continue

        check = check_network_links(check_url)

        if check.status == "404":
            result.status = "404"
            result.fail_url = lnk.url
            return result

        if check.status == "ok":
            # 检查成功，更新状态为 ok（只有首次成功时更新）
            if result.status == "skipped":
                result.status = "ok"

        if check.status == "uncertain" and result.status != "uncertain":
            result.status = "uncertain"
            result.detail = f"HTTP {check.status_code}: {check.detail}"
            result.uncertain_url = lnk.url
            result.uncertain_code = check.status_code
            result.uncertain_detail = check.detail

    return result


def _parse_all_snapshots(links: list) -> tuple[list[SnapshotInfo], list[tuple[str, str]]]:
    """
    下载并解析所有快照链接，同 Activity 只下载一个代表。

    返回：
    - snapshots：解析成功的 SnapshotInfo 列表
    - gkd_links：无法下载解析的 GKD 链接 [(display_text, converted_url), ...]
    """
    from converter import GKD_PROXY_TEMPLATE

    snapshots: list[SnapshotInfo] = []
    gkd_links: list[tuple[str, str]] = []

    # 已下载的 Activity 集合，用于去重
    seen_activities: set[str] = set()

    # 先处理 GitHub 附件链接
    for lnk in links:
        if lnk.kind != "github_attachment":
            continue

        converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)
        snap = download_and_parse(lnk.url, converted_url)

        if snap is None:
            # 下载失败，仍作为可转换链接保留
            gkd_links.append((lnk.display_text or _extract_filename(lnk.url), converted_url))
            continue

        act_key = f"{snap.app_id}|{snap.activity_id}"
        if act_key in seen_activities:
            # 同 Activity 已有代表，只记录链接
            gkd_links.append((snap.snapshot_id or _extract_filename(lnk.url), converted_url))
        else:
            seen_activities.add(act_key)
            snapshots.append(snap)

    # 再处理 GKD 分享链接（GKD 链接原样保留，不套代理模板）
    for lnk in links:
        if lnk.kind != "gkd":
            continue

        gh_url = gkd_to_gh_attachment_url(lnk.url)
        if not gh_url:
            continue

        snap = download_and_parse(gh_url, lnk.url)

        if snap is None:
            gkd_links.append((lnk.display_text or lnk.url, lnk.url))
            continue

        act_key = f"{snap.app_id}|{snap.activity_id}"
        if act_key in seen_activities:
            gkd_links.append((snap.snapshot_id or lnk.url, lnk.url))
        else:
            seen_activities.add(act_key)
            snapshots.append(snap)

    return snapshots, gkd_links


def _extract_filename(url: str) -> str:
    """从 URL 中提取文件名"""
    return extract_filename(url)


def _output(**kwargs):
    """将所有分析结果写入 GITHUB_OUTPUT。"""
    for key, value in kwargs.items():
        write_output(key, value)


if __name__ == "__main__":
    main()