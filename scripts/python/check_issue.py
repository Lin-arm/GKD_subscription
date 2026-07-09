"""
Issue 快照链接检查主入口

职责：协调各模块执行分析流程，将原子化结果输出到 GITHUB_OUTPUT。
不直接操作 GitHub API —— 所有 GitHub 操作由 YAML 工作流完成。

流程（Fail Fast，遇到致命错误立即停止）：
  1. 提取链接 → 判断是否缺少快照（致命）
  2. 检查本地链接（非致命，不提前返回）
  3. 检查不可访问快照链接（非致命，继续）
  4. 网络有效性检查（404 致命 / 不确定非致命）
  5. 链接转换 + Bot 评论生成
  6. 编辑恢复判断

输出变量（原子化标志，供 YAML 多 Job 条件判断）：
  - has_snapshot      : 是否包含任何快照链接
  - has_local_link    : 是否包含本地链接
  - has_unreachable   : 是否包含不可访问快照
  - network_status    : 网络检查结果 (ok / 404 / uncertain / skipped)
  - network_detail    : 网络错误详情
  - has_convertible   : 是否有可转换的 GitHub 附件
  - warning_type      : 警告类型 (missing / local / unreachable / inaccessible / uncertain / recovery / "")
  - comment_missing   : 缺失快照评论（含 <!-- gkd-warning-missing --> 标记）
  - comment_local     : 本地链接评论（含 <!-- gkd-warning-local --> 标记）
  - comment_unreachable : 不可访问快照评论（含 <!-- gkd-warning-unreachable --> 标记）
  - comment_404       : 链接404评论（含 <!-- gkd-warning-404 --> 标记）
  - comment_uncertain : 网络不确定评论（含 <!-- gkd-warning-uncertain --> 标记）
  - comment_recovery  : 恢复评论（含 <!-- gkd-warning-recovery --> 标记）
  - comment_bot       : Bot 评论（含 <!-- gkd-bot-comment --> 标记）
"""

import os
from dataclasses import dataclass

from extractor import extract_links
from checker import check_local_links, check_unreachable_links, check_network_links
from converter import convert_github_attachments
from formatter import (
    build_warning_missing,
    build_warning_local,
    build_warning_unreachable,
    build_warning_inaccessible,
    build_warning_uncertain,
    build_recovery_comment,
    build_bot_comment,
)
from utils import write_output


# ── 快照相关链接类型集合 ──

_SNAPSHOT_KINDS = {"gkd", "github_attachment", "unreachable_snapshot", "local"}


# ── 网络检查聚合结果 ──


@dataclass
class _NetworkCheckResult:
    """网络检查聚合结果，记录首次遇到的致命/不确定错误"""

    status: str = "ok"
    detail: str = ""
    fail_url: str = ""
    uncertain_url: str = ""
    uncertain_code: int = 0
    uncertain_detail: str = ""


# ── 主流程 ──


def main():
    body = os.environ.get("ISSUE_BODY", "") or ""
    issue_user = os.environ.get("ISSUE_USER", "")
    issue_action = os.environ.get("ISSUE_ACTION", "")

    # 初始化所有输出变量
    has_snapshot = "true"
    has_local_link = "false"
    has_unreachable = "false"
    network_status = "skipped"
    network_detail = ""
    has_convertible = "false"
    warning_type = ""
    comment_missing = ""
    comment_local = ""
    comment_unreachable = ""
    comment_404 = ""
    comment_uncertain = ""
    comment_recovery = ""
    comment_bot = ""

    # ── 第一步：提取所有链接 ──
    links = extract_links(body)

    # ── 第二步：判断是否缺少快照（致命 → 提前返回） ──
    has_any_snapshot = any(lnk.kind in _SNAPSHOT_KINDS for lnk in links)

    if not has_any_snapshot:
        comment_missing = build_warning_missing(issue_user)
        _output(
            has_snapshot="false",
            has_local_link="false",
            has_unreachable="false",
            network_status="skipped",
            network_detail="",
            has_convertible="false",
            warning_type="missing",
            comment_missing=comment_missing,
            comment_local="",
            comment_unreachable="",
            comment_404="",
            comment_uncertain="",
            comment_recovery="",
            comment_bot="",
        )
        return

    # ── 第三步：检查本地链接（非致命，不提前返回） ──
    local_links = check_local_links(links)
    has_local_link = "true" if local_links else "false"
    if local_links:
        comment_local = build_warning_local(issue_user)

    # ── 第四步：检查不可访问快照链接（非致命，继续后续检查） ──
    unreachable_links = check_unreachable_links(links)
    has_unreachable = "true" if unreachable_links else "false"
    if unreachable_links:
        comment_unreachable = build_warning_unreachable(issue_user)

    # ── 第五步：网络有效性检查（仅 GitHub 附件） ──
    attachment_links = [lnk for lnk in links if lnk.kind == "github_attachment"]

    if attachment_links:
        net_result = _check_attachments(attachment_links)
        network_status = net_result.status
        network_detail = net_result.detail

        # 404 是致命错误 → 提前返回
        if network_status == "404":
            comment_404 = build_warning_inaccessible(issue_user, net_result.fail_url)
            _output(
                has_snapshot=has_snapshot,
                has_local_link=has_local_link,
                has_unreachable=has_unreachable,
                network_status=network_status,
                network_detail=network_detail,
                has_convertible="false",
                warning_type="inaccessible",
                comment_missing=comment_missing,
                comment_local=comment_local,
                comment_unreachable=comment_unreachable,
                comment_404=comment_404,
                comment_uncertain="",
                comment_recovery="",
                comment_bot="",
            )
            return

        # 不确定状态 → 生成评论，但不中断流程
        if network_status == "uncertain":
            comment_uncertain = build_warning_uncertain(
                issue_user,
                net_result.uncertain_url,
                net_result.uncertain_code,
                net_result.uncertain_detail,
            )

    # ── 第六步：链接转换 + Bot 评论生成（仅当网络检查通过时） ──
    if network_status in ("ok", "skipped") and attachment_links:
        converted = convert_github_attachments(attachment_links)
        has_convertible = "true" if converted else "false"
        if converted:
            comment_body = build_bot_comment(converted)
            comment_bot = "<!-- gkd-bot-comment -->\n" + comment_body

    # ── 第七步：编辑恢复判断 ──
    # 当 edited 触发且所有检查均通过时，触发恢复流程
    all_clean = (
        has_unreachable == "false"
        and network_status in ("ok", "skipped")
        and has_local_link == "false"
    )

    if issue_action == "edited" and all_clean:
        warning_type = "recovery"
        comment_recovery = build_recovery_comment(issue_user)

    _output(
        has_snapshot=has_snapshot,
        has_local_link=has_local_link,
        has_unreachable=has_unreachable,
        network_status=network_status,
        network_detail=network_detail,
        has_convertible=has_convertible,
        warning_type=warning_type,
        comment_missing=comment_missing,
        comment_local=comment_local,
        comment_unreachable=comment_unreachable,
        comment_404=comment_404,
        comment_uncertain=comment_uncertain,
        comment_recovery=comment_recovery,
        comment_bot=comment_bot,
    )


def _check_attachments(attachment_links: list) -> _NetworkCheckResult:
    """
    对 GitHub 附件链接执行网络检查。

    遵循 Fail Fast 原则：遇到 404 立即返回致命结果。
    不确定结果（403/5xx）为非致命，记录但不中断。

    返回：_NetworkCheckResult 聚合结果
    """
    result = _NetworkCheckResult()

    for lnk in attachment_links:
        check = check_network_links(lnk.url)

        if check.status == "404":
            result.status = "404"
            result.fail_url = lnk.url
            return result

        if check.status == "uncertain" and result.status != "uncertain":
            result.status = "uncertain"
            result.detail = f"HTTP {check.status_code}: {check.detail}"
            result.uncertain_url = lnk.url
            result.uncertain_code = check.status_code
            result.uncertain_detail = check.detail

    return result


def _output(**kwargs):
    """将所有分析结果写入 GITHUB_OUTPUT。"""
    for key, value in kwargs.items():
        write_output(key, value)


if __name__ == "__main__":
    main()