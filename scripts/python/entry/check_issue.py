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
import sys
from dataclasses import dataclass, field
from pathlib import Path

# 自动设置模块搜索路径，确保能在任意目录下执行
_script_dir = Path(__file__).parent.parent  # 指向 scripts/python 目录
if str(_script_dir) not in sys.path:
    sys.path.insert(0, str(_script_dir))

from core.checker import (  # noqa: E402
    check_network_links,
    check_unreachable_links,
    gkd_to_gh_attachment_url,
)
from core.converter import GKD_PROXY_TEMPLATE  # noqa: E402
from core.extractor import extract_links, extract_links_from_bot_comment  # noqa: E402
from core.snapshot_parser import download_and_parse  # noqa: E402
from formatter import (  # noqa: E402
    build_bot_comment,
    build_recovery_comment,
    build_warning_inaccessible,
    build_warning_missing,
    build_warning_uncertain,
    build_warning_unreachable,
)
from utils.common import (  # noqa: E402
    build_full_text_from_links,
    extract_filename,
    merge_links_dedup,
)
from utils.models import LinkInfo, SnapshotInfo  # noqa: E402
from utils.utils import write_output  # noqa: E402

# ── 快照相关链接类型集合 ──

_SNAPSHOT_KINDS = {"gkd", "github_attachment", "unreachable_snapshot"}


# ── 网络检查聚合结果 ──


@dataclass
class _NetworkCheckResult:
    """网络检查聚合结果，记录所有链接的检查状态"""

    status: str = "skipped"  # ok / 404 / uncertain / skipped
    detail: str = ""
    fail_urls: list = field(default_factory=list)  # 404 链接列表
    uncertain_urls: list = field(default_factory=list)  # uncertain 链接列表
    uncertain_code: int = 0
    uncertain_detail: str = ""
    good_links: list = field(default_factory=list)  # 可访问的链接
    bad_links: list = field(default_factory=list)  # 不可访问的链接


# ── 主流程 ──


def main():
    body = os.environ.get("ISSUE_BODY", "") or ""
    comment_body = os.environ.get("ISSUE_COMMENT_BODY", "") or ""
    issue_user = os.environ.get("ISSUE_USER", "")
    issue_action = os.environ.get("ISSUE_ACTION", "")
    history_content = os.environ.get("HISTORY_CONTENT", "") or ""
    history_source = os.environ.get("HISTORY_SOURCE", "") or ""

    # 当评论事件时，合并历史链接 + 新评论链接
    # 当 opened/edited 事件时，只分析 Issue Body
    if issue_action == "comment" and comment_body:
        # 提取新评论中的链接
        new_links = extract_links(comment_body)

        # 提取历史链接
        history_links: list[LinkInfo] = []
        if history_content:
            if history_source == "old_bot":
                # 从旧 Bot 评论中提取快照链接
                history_links = extract_links_from_bot_comment(history_content)
            else:
                # 从所有评论中提取链接
                history_links = extract_links(history_content)

        # 合并去重：历史链接 + 新链接
        # 使用 URL 作为去重键，保留首次出现的链接
        all_links = merge_links_dedup(history_links, new_links)

        # 用于后续处理的链接列表
        links = all_links

        # 用于检查缺失快照的文本（合并后的内容）
        full_text = build_full_text_from_links(links)
    else:
        full_text = body
        links = extract_links(full_text)

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
    # 检查所有链接，区分好链接和坏链接
    net_result = _check_all_links(links)
    network_detail = net_result.detail

    # 有坏链接时生成警告评论（显示所有坏链接）
    if net_result.fail_urls:
        comment_404 = build_warning_inaccessible(issue_user, net_result.fail_urls)
    if net_result.uncertain_urls:
        comment_uncertain = build_warning_uncertain(
            issue_user,
            net_result.uncertain_urls,
            net_result.uncertain_code,
            net_result.uncertain_detail,
        )

    # ── 第五步：链接转换 + 快照解析 + Bot 评论生成 ──
    # 只处理好链接，跳过坏链接
    # 只要有好链接就允许转换
    if net_result.good_links:
        network_status = "ok"
        snapshots, gkd_links = _parse_all_snapshots(net_result.good_links)
        if snapshots or gkd_links:
            has_convertible = "true"
            comment_body = build_bot_comment(snapshots, gkd_links)
            comment_bot = "<!-- gkd-bot-comment -->\n" + comment_body
    else:
        # 全部都是坏链接
        network_status = net_result.status if net_result.status != "skipped" else "404"

    # ── 第六步：编辑/评论恢复判断 ──
    # 当 edited 或 issue_comment 触发且有好链接时，触发恢复流程
    has_valid_snapshot = any(lnk.kind in ("gkd", "github_attachment") for lnk in net_result.good_links)

    if issue_action in ("edited", "comment") and has_valid_snapshot:
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

    新逻辑：检查所有链接，区分好链接和坏链接。
    - 好链接：可以用于后续快照解析和转换
    - 坏链接：记录但不阻断好链接的处理

    返回：_NetworkCheckResult 包含 good_links 和 bad_links
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

        if check.status == "ok":
            result.good_links.append(lnk)
            if result.status == "skipped":
                result.status = "ok"
        elif check.status == "404":
            result.bad_links.append(lnk)
            result.fail_urls.append(lnk.url)
            if result.status == "skipped":
                result.status = "404"
        elif check.status == "uncertain":
            result.bad_links.append(lnk)
            result.uncertain_urls.append(lnk.url)
            if not result.uncertain_code:
                result.uncertain_code = check.status_code
                result.uncertain_detail = check.detail
                result.detail = f"HTTP {check.status_code}: {check.detail}"
            if result.status == "skipped":
                result.status = "uncertain"

    # 最终状态判断：有好链接就是 ok，全部坏链接才保持 404/uncertain
    if result.good_links:
        result.status = "ok"
    elif result.bad_links and result.status == "skipped":
        result.status = "404"

    return result


def _parse_all_snapshots(links: list) -> tuple[list[SnapshotInfo], list[tuple[str, str]]]:
    """
    下载并解析所有快照链接，同 Activity 的所有快照都保留。

    支持缓存：优先从缓存读取，命中则跳过下载。

    返回：
    - snapshots：解析成功的 SnapshotInfo 列表（同 Activity 的所有快照都在）
    - gkd_links：无法下载解析的 GKD 链接 [(display_text, converted_url), ...]
    """

    snapshots: list[SnapshotInfo] = []
    gkd_links: list[tuple[str, str]] = []

    # 加载缓存
    cache = _load_cache()
    cache_updated = False

    # 先处理 GitHub 附件链接
    for lnk in links:
        if lnk.kind != "github_attachment":
            continue

        converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)

        # 尝试从缓存读取
        snap = _snapshot_from_cache(lnk.url, cache)
        if snap:
            # 缓存命中，使用缓存的 converted_url
            snap.converted_url = converted_url
            snapshots.append(snap)
            continue

        # 缓存未命中，下载解析
        snap = download_and_parse(lnk.url, converted_url)

        if snap is None:
            # 下载失败，仍作为可转换链接保留
            gkd_links.append((lnk.display_text or _extract_filename(lnk.url), converted_url))
            continue

        # 保存到缓存
        _snapshot_to_cache(lnk.url, snap, cache)
        cache_updated = True

        # 所有成功解析的快照都添加到 snapshots 列表
        snapshots.append(snap)

    # 再处理 GKD 分享链接（GKD 链接原样保留，不套代理模板）
    for lnk in links:
        if lnk.kind != "gkd":
            continue

        gh_url = gkd_to_gh_attachment_url(lnk.url)
        if not gh_url:
            continue

        # 尝试从缓存读取（GKD 链接使用转换后的 URL 作为 key）
        snap = _snapshot_from_cache(lnk.url, cache)
        if snap:
            snapshots.append(snap)
            continue

        # 缓存未命中，下载解析
        snap = download_and_parse(gh_url, lnk.url)

        if snap is None:
            gkd_links.append((lnk.display_text or lnk.url, lnk.url))
            continue

        # 保存到缓存
        _snapshot_to_cache(lnk.url, snap, cache)
        cache_updated = True

        # 所有成功解析的快照都添加到 snapshots 列表
        snapshots.append(snap)

    # 保存缓存（如果有更新）
    if cache_updated:
        _save_cache(cache)

    return snapshots, gkd_links


def _extract_filename(url: str) -> str:
    """从 URL 中提取文件名"""
    return extract_filename(url)


def _output(**kwargs):
    """将所有分析结果写入 GITHUB_OUTPUT。"""
    for key, value in kwargs.items():
        write_output(key, value)


# ── 缓存相关函数 ──

_CACHE_DIR = "/tmp/snapshot_cache"
_CACHE_FILE = "snapshots.json"


def _load_cache() -> dict[str, dict]:
    """
    加载快照缓存。

    缓存结构：{url: SnapshotInfo_dict, ...}
    """
    import json
    import os

    cache_file = os.path.join(_CACHE_DIR, _CACHE_FILE)
    if not os.path.exists(cache_file):
        return {}

    try:
        with open(cache_file, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_cache(cache: dict[str, dict]):
    """
    保存快照缓存。

    缓存结构：{url: SnapshotInfo_dict, ...}
    """
    import json
    import os

    os.makedirs(_CACHE_DIR, exist_ok=True)
    cache_file = os.path.join(_CACHE_DIR, _CACHE_FILE)

    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def _snapshot_from_cache(url: str, cache: dict[str, dict]) -> SnapshotInfo | None:
    """
    从缓存中恢复 SnapshotInfo。

    如果 URL 在缓存中且数据有效，返回 SnapshotInfo；否则返回 None。
    """
    if url not in cache:
        return None

    try:
        data = cache[url]
        return SnapshotInfo(**data)
    except Exception:
        return None


def _snapshot_to_cache(url: str, snap: SnapshotInfo, cache: dict[str, dict]):
    """
    将 SnapshotInfo 保存到缓存。
    """
    from dataclasses import asdict

    cache[url] = asdict(snap)


if __name__ == "__main__":
    main()
