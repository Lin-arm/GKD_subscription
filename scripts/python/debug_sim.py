"""
Issue 模拟测试工具

本地交互式调试 check_issue.py 的分析逻辑，无需创建真实 GitHub Issue。
默认启用网络检查（模拟真实 CI 环境），网络不可用时自动降级为离线模式。
与 check_issue.py 保持逻辑一致：历史链接合并、快照缓存、Fail Fast 网络检查。

支持三种输入方式：
  1. 交互式：运行脚本后在终端输入 Issue Body，输入 END 结束
  2. 文件：python debug_sim.py --file issue.md
  3. 管道：echo "..." | python debug_sim.py

使用方法：
  python scripts/python/debug_sim.py                        # 交互式（默认联网）
  python scripts/python/debug_sim.py --file issue.md        # 文件输入
  python scripts/python/debug_sim.py --offline              # 离线模式（跳过网络）
  python scripts/python/debug_sim.py --no-snapshot          # 跳过快照下载
  python scripts/python/debug_sim.py --user testuser        # 指定用户名
  python scripts/python/debug_sim.py --action comment       # 模拟评论事件
  python scripts/python/debug_sim.py --action comment \\
      --comment "补充快照：https://i.gkd.li/i/29899905" \\
      --history old_bot.txt --history-source old_bot        # 模拟评论+历史链接合并
"""

import argparse
import json
import sys
from dataclasses import asdict
from pathlib import Path

# 自动设置模块搜索路径
_script_dir = Path(__file__).parent
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
from utils.common import extract_filename  # noqa: E402
from utils.models import LinkInfo, SnapshotInfo  # noqa: E402

# ── 常量 ──

_SNAPSHOT_KINDS = {"gkd", "github_attachment", "unreachable_snapshot"}
_WIDTH = 48
_STEP_TEMPLATE = "[{idx}/{total}] {title}"

# 快照缓存（本地调试专用，与 CI 的 /tmp/snapshot_cache 隔离）
_CACHE_DIR = Path.home() / ".cache" / "gkd_debug"
_CACHE_FILE = "snapshots.json"


# ── 流水线输出 ──


def _step_header(idx: int, total: int, title: str):
    """打印流水线步骤标题。"""
    print(f"\n{_STEP_TEMPLATE.format(idx=idx, total=total, title=title)}")
    print("─" * _WIDTH)


def _ok(msg: str):
    """打印成功标记。"""
    print(f"  ✓ {msg}")


def _warn(msg: str):
    """打印警告标记。"""
    print(f"  ⚠ {msg}")


def _fail(msg: str):
    """打印失败标记。"""
    print(f"  ✗ {msg}")


def _info(msg: str):
    """打印信息行。"""
    print(f"  → {msg}")


# ── 输入处理 ──


def read_interactive() -> str:
    """交互式读取 Issue Body，支持 END 终止符。"""
    print("Issue Body (输入 END 结束):")
    lines = []
    while True:
        try:
            line = input("> ")
        except EOFError:
            break
        if line.strip() == "END":
            break
        lines.append(line)
    return "\n".join(lines)


def read_from_file(filepath: str) -> str:
    """从文件读取 Issue Body。"""
    return Path(filepath).read_text(encoding="utf-8")


def read_from_stdin() -> str:
    """从标准输入读取（管道模式）。"""
    return sys.stdin.read()


# ── 网络可达性预检 ──


def _preflight_network() -> bool:
    """
    预检网络是否可用。

    通过 HEAD 请求测试 GitHub 是否可达。
    返回 True 表示网络可用，False 表示离线。
    """
    _info("预检网络连通性...")
    try:
        import urllib.request

        req = urllib.request.Request("https://github.com", method="HEAD")
        resp = urllib.request.urlopen(req, timeout=5)
        resp.close()
        _ok("网络可用")
        return True
    except Exception:
        _warn("网络不可用，自动降级为离线模式")
        return False


# ── 链接合并（与 check_issue.py 一致） ──


def _merge_links_dedup(history_links: list[LinkInfo], new_links: list[LinkInfo]) -> list[LinkInfo]:
    """
    合并历史链接和新链接，基于 URL 去重。

    策略：保留首次出现的链接（历史链接优先）。
    与 check_issue.py._merge_links_dedup() 完全一致。
    """
    seen: set[str] = set()
    result: list[LinkInfo] = []

    for lnk in history_links:
        if lnk.url not in seen:
            seen.add(lnk.url)
            result.append(lnk)

    for lnk in new_links:
        if lnk.url not in seen:
            seen.add(lnk.url)
            result.append(lnk)

    return result


def _build_full_text_from_links(links: list[LinkInfo]) -> str:
    """
    从链接列表构建用于检查缺失快照的文本。

    与 check_issue.py._build_full_text_from_links() 完全一致。
    """
    parts: list[str] = []
    for lnk in links:
        if lnk.display_text:
            parts.append(f"[{lnk.display_text}]({lnk.url})")
        else:
            parts.append(lnk.url)
    return "\n".join(parts)


# ── 快照缓存（与 check_issue.py 逻辑一致，目录不同） ──


def _load_cache() -> dict[str, dict]:
    """加载快照缓存。"""
    cache_file = _CACHE_DIR / _CACHE_FILE
    if not cache_file.exists():
        return {}
    try:
        with open(cache_file, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def _save_cache(cache: dict[str, dict]):
    """保存快照缓存。"""
    _CACHE_DIR.mkdir(parents=True, exist_ok=True)
    cache_file = _CACHE_DIR / _CACHE_FILE
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=2)


def _snapshot_from_cache(url: str, cache: dict[str, dict]) -> SnapshotInfo | None:
    """从缓存中恢复 SnapshotInfo。"""
    if url not in cache:
        return None
    try:
        return SnapshotInfo(**cache[url])
    except Exception:
        return None


def _snapshot_to_cache(url: str, snap: SnapshotInfo, cache: dict[str, dict]):
    """将 SnapshotInfo 保存到缓存。"""
    cache[url] = asdict(snap)


# ── 分析流程（流水线版本，与 check_issue.py 逻辑一致） ──


def analyze(
    body: str,
    comment_body: str = "",
    issue_user: str = "testuser",
    issue_action: str = "opened",
    with_network: bool = True,
    with_snapshot: bool = True,
    history_content: str = "",
    history_source: str = "",
) -> dict:
    """
    执行 Issue 分析，返回所有结果。

    与 check_issue.py.main() 逻辑完全一致：
    - comment 事件合并历史链接 + 新链接
    - 支持 old_bot / all 两种历史来源
    - 网络检查 Fail Fast
    - 快照缓存
    """
    # ── 链接提取（与 check_issue.py 一致） ──
    if issue_action == "comment" and comment_body:
        new_links = extract_links(comment_body)

        history_links: list[LinkInfo] = []
        if history_content:
            if history_source == "old_bot":
                history_links = extract_links_from_bot_comment(history_content)
            else:
                history_links = extract_links(history_content)

        all_links = _merge_links_dedup(history_links, new_links)
        links = all_links
    else:
        links = extract_links(body)

    result = {
        "has_snapshot": "true",
        "has_unreachable": "false",
        "network_status": "skipped",
        "network_detail": "",
        "has_convertible": "false",
        "warning_type": "",
        "comment_missing": "",
        "comment_unreachable": "",
        "comment_404": "",
        "comment_uncertain": "",
        "comment_recovery": "",
        "comment_bot": "",
    }

    total_steps = 5

    # ── Step 1: 链接提取 ──
    _step_header(1, total_steps, "链接提取")
    if not links:
        _ok("提取到 0 个链接")
    else:
        _ok(f"提取到 {len(links)} 个链接")
        for i, lnk in enumerate(links, 1):
            display = f"[{lnk.display_text}]({lnk.url})" if lnk.display_text else lnk.url
            print(f"     {i}. kind={lnk.kind}  {display}")

    # ── Step 2: 判断是否缺少快照 ──
    _step_header(2, total_steps, "快照检查")
    has_any_snapshot = any(lnk.kind in _SNAPSHOT_KINDS for lnk in links)

    if not has_any_snapshot:
        _fail("未提供任何快照链接 → 将关闭 Issue")
        result["has_snapshot"] = "false"
        result["warning_type"] = "missing"
        result["comment_missing"] = build_warning_missing(issue_user)
        return result

    _ok("快照链接存在")

    # ── Step 3: 不可访问快照检查 ──
    _step_header(3, total_steps, "不可访问快照检查")
    unreachable_links = check_unreachable_links(links)
    if unreachable_links:
        _warn(f"发现 {len(unreachable_links)} 个不可访问快照 (i.gkd.li/snapshot/)")
        result["has_unreachable"] = "true"
        result["comment_unreachable"] = build_warning_unreachable(issue_user)
    else:
        _ok("无不可访问快照")

    # ── Step 4: 网络有效性检查 ──
    _step_header(4, total_steps, "网络有效性检查")
    if with_network:
        net_result = _check_all_links_pipeline(links)
        result["network_status"] = net_result["status"]
        result["network_detail"] = net_result["detail"]

        if net_result["status"] == "404":
            result["comment_404"] = build_warning_inaccessible(issue_user, net_result["fail_url"])

        if net_result["status"] == "uncertain":
            result["comment_uncertain"] = build_warning_uncertain(
                issue_user,
                net_result["uncertain_url"],
                net_result["uncertain_code"],
                net_result["uncertain_detail"],
            )
    else:
        _info("离线模式，跳过网络检查")
        result["network_status"] = "skipped"

    # ── Step 5: 链接转换 + Bot 评论（带缓存） ──
    _step_header(5, total_steps, "评论生成")
    network_ok = result["network_status"] in ("ok", "skipped")

    if network_ok:
        if with_snapshot:
            snapshots, gkd_links = _parse_all_snapshots_cached(links)
        else:
            snapshots, gkd_links = [], _build_gkd_links_preview(links)

        if snapshots or gkd_links:
            result["has_convertible"] = "true"
            comment_body_text = build_bot_comment(snapshots, gkd_links)
            result["comment_bot"] = "<!-- gkd-bot-comment -->\n" + comment_body_text
            _ok(f"Bot 评论已生成 ({len(snapshots)} 快照, {len(gkd_links)} GKD 链接)")
        else:
            _info("无可转换链接，跳过 Bot 评论")
    else:
        _warn("网络检查未通过，跳过快照解析和 Bot 评论")

    # ── 恢复判断 ──
    has_valid_snapshot = any(lnk.kind in ("gkd", "github_attachment") for lnk in links)
    if issue_action in ("edited", "comment") and has_valid_snapshot and network_ok:
        result["warning_type"] = "recovery"
        result["comment_recovery"] = build_recovery_comment(issue_user)
        _ok("触发恢复流程 (recovery)")

    return result


def _check_all_links_pipeline(links: list) -> dict:
    """
    网络检查（流水线版本）。

    与 check_issue.py._check_all_links() 逻辑一致：
    - GKD 链接先转 GH 附件 URL 再检查
    - Fail Fast：遇到 404 立即返回
    - 403/5xx 记录为 uncertain 但不中断
    """
    result = {
        "status": "skipped",
        "detail": "",
        "fail_url": "",
        "uncertain_url": "",
        "uncertain_code": 0,
        "uncertain_detail": "",
    }

    checkable = [lnk for lnk in links if lnk.kind in ("github_attachment", "gkd")]
    if not checkable:
        _info("无可检查链接")
        return result

    for lnk in checkable:
        if lnk.kind == "github_attachment":
            check_url = lnk.url
        else:
            check_url = gkd_to_gh_attachment_url(lnk.url)
            if not check_url:
                continue

        _info(f"检查 {check_url[:72]}...")
        try:
            check = check_network_links(check_url)
        except Exception as e:
            _warn(f"请求异常: {e}")
            continue

        if check.status == "404":
            _fail(f"404 Not Found → {lnk.url}")
            result["status"] = "404"
            result["fail_url"] = lnk.url
            return result

        if check.status == "ok":
            _ok(f"200 OK → {lnk.url}")
            if result["status"] == "skipped":
                result["status"] = "ok"

        if check.status == "uncertain" and result["status"] != "uncertain":
            _warn(f"HTTP {check.status_code} → {lnk.url}")
            result["status"] = "uncertain"
            result["detail"] = f"HTTP {check.status_code}: {check.detail}"
            result["uncertain_url"] = lnk.url
            result["uncertain_code"] = check.status_code
            result["uncertain_detail"] = check.detail

    if result["status"] == "skipped":
        _ok("所有链接检查完成")

    return result


def _parse_all_snapshots_cached(links: list) -> tuple[list[SnapshotInfo], list[tuple[str, str]]]:
    """
    下载并解析所有快照（带缓存）。

    与 check_issue.py._parse_all_snapshots() 逻辑一致：
    - 优先从缓存读取，命中则跳过下载
    - 下载失败仍保留为 GKD 链接
    """
    snapshots: list[SnapshotInfo] = []
    gkd_links: list[tuple[str, str]] = []

    cache = _load_cache()
    cache_updated = False

    # 先处理 GitHub 附件链接
    for lnk in links:
        if lnk.kind != "github_attachment":
            continue

        converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)

        snap = _snapshot_from_cache(lnk.url, cache)
        if snap:
            snap.converted_url = converted_url
            snapshots.append(snap)
            _info(f"缓存命中: {snap.app_id} / {snap.activity_id}")
            continue

        _info(f"下载快照 {lnk.url[:72]}...")
        try:
            snap = download_and_parse(lnk.url, converted_url)
        except Exception as e:
            _warn(f"下载失败: {e}")
            snap = None

        if snap is None:
            gkd_links.append((lnk.display_text or extract_filename(lnk.url), converted_url))
            continue

        _snapshot_to_cache(lnk.url, snap, cache)
        cache_updated = True
        _ok(f"解析成功: {snap.app_id} / {snap.activity_id}")
        snapshots.append(snap)

    # 再处理 GKD 分享链接
    for lnk in links:
        if lnk.kind != "gkd":
            continue

        gh_url = gkd_to_gh_attachment_url(lnk.url)
        if not gh_url:
            continue

        snap = _snapshot_from_cache(lnk.url, cache)
        if snap:
            snapshots.append(snap)
            _info(f"缓存命中: {snap.app_id} / {snap.activity_id}")
            continue

        _info(f"下载快照 {lnk.url}...")
        try:
            snap = download_and_parse(gh_url, lnk.url)
        except Exception as e:
            _warn(f"下载失败: {e}")
            snap = None

        if snap is None:
            gkd_links.append((lnk.display_text or lnk.url, lnk.url))
            continue

        _snapshot_to_cache(lnk.url, snap, cache)
        cache_updated = True
        _ok(f"解析成功: {snap.app_id} / {snap.activity_id}")
        snapshots.append(snap)

    if cache_updated:
        _save_cache(cache)

    return snapshots, gkd_links


def _build_gkd_links_preview(links: list) -> list[tuple[str, str]]:
    """构建 GKD 链接预览（不下载快照时使用）。"""
    gkd_links = []
    for lnk in links:
        if lnk.kind == "github_attachment":
            converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)
            display = lnk.display_text or converted_url.split("/")[-1]
            gkd_links.append((display, converted_url))
        elif lnk.kind == "gkd":
            gkd_links.append((lnk.display_text or lnk.url, lnk.url))
    return gkd_links


# ── 结果汇总输出 ──


def print_summary(result: dict):
    """打印结果汇总。"""
    print(f"\n{'═' * _WIDTH}")
    print("结果汇总")
    print(f"{'═' * _WIDTH}")

    flags = [
        ("has_snapshot", result["has_snapshot"]),
        ("has_unreachable", result["has_unreachable"]),
        ("network_status", result["network_status"]),
        ("has_convertible", result["has_convertible"]),
        ("warning_type", result["warning_type"] or "(empty)"),
    ]
    for key, value in flags:
        print(f"  {key:<20s} = {value}")

    # 警告评论
    warnings = [
        ("missing", result["comment_missing"]),
        ("unreachable", result["comment_unreachable"]),
        ("404", result["comment_404"]),
        ("uncertain", result["comment_uncertain"]),
        ("recovery", result["comment_recovery"]),
    ]
    has_warnings = any(c for _, c in warnings)
    if has_warnings:
        print(f"\n{'─' * _WIDTH}")
        print("警告评论")
        print(f"{'─' * _WIDTH}")
        for label, comment in warnings:
            if comment:
                print(f"\n  ── {label} ──")
                for line in comment.split("\n"):
                    print(f"  {line}")

    # Bot 评论
    comment = result["comment_bot"]
    if comment:
        print(f"\n{'─' * _WIDTH}")
        print("Bot 评论预览")
        print(f"{'─' * _WIDTH}")
        content_lines = [line for line in comment.split("\n") if not line.startswith("<!--")]
        for line in content_lines:
            print(f"  {line}")


# ── 主入口 ──


def main():
    parser = argparse.ArgumentParser(description="GKD Issue 模拟测试工具")
    parser.add_argument("--file", "-f", help="从文件读取 Issue Body")
    parser.add_argument("--user", "-u", default="testuser", help="模拟用户名 (默认: testuser)")
    parser.add_argument(
        "--action",
        "-a",
        default="opened",
        choices=["opened", "edited", "comment"],
        help="触发事件类型 (默认: opened)",
    )
    parser.add_argument("--comment", "-c", default="", help="评论内容 (用于 comment 事件)")
    parser.add_argument("--history", help="历史内容文件 (用于 comment 事件，模拟旧 Bot 评论或历史评论)")
    parser.add_argument(
        "--history-source",
        default="",
        choices=["", "old_bot", "all"],
        help="历史来源: old_bot=旧Bot评论, all=所有评论 (默认: 从文件内容自动判断)",
    )
    parser.add_argument("--offline", action="store_true", help="离线模式（跳过网络检查和快照下载）")
    parser.add_argument("--no-snapshot", action="store_true", help="跳过快照下载+解析（保留网络检查）")
    args = parser.parse_args()

    print()
    print("╔══════════════════════════════════════════════════╗")
    print("║   GKD Issue 模拟测试工具                         ║")
    print("╚══════════════════════════════════════════════════╝")

    # 读取输入
    if args.file:
        body = read_from_file(args.file)
        print(f"\n从文件读取: {args.file}")
    elif not sys.stdin.isatty():
        body = read_from_stdin()
        print("\n从标准输入读取")
    else:
        action_label = args.action
        print(f"\n模拟场景: {action_label}")
        body = read_interactive()

    if not body.strip():
        print("\n错误: 输入内容为空")
        sys.exit(1)

    # 读取历史内容
    history_content = ""
    if args.history:
        history_content = read_from_file(args.history)
        print(f"历史内容: {args.history}")

    # 网络模式判断
    with_network = not args.offline
    with_snapshot = not args.offline and not args.no_snapshot

    if with_network:
        network_ok = _preflight_network()
        if not network_ok:
            with_network = False
            with_snapshot = False
    else:
        print("\n模式: 离线")

    # 执行分析
    result = analyze(
        body=body,
        comment_body=args.comment,
        issue_user=args.user,
        issue_action=args.action,
        with_network=with_network,
        with_snapshot=with_snapshot,
        history_content=history_content,
        history_source=args.history_source,
    )

    # 输出汇总
    print_summary(result)
    print()


if __name__ == "__main__":
    main()
