"""
Issue 模拟测试工具

本地交互式调试 check_issue.py 的分析逻辑，无需创建真实 GitHub Issue。
默认启用网络检查（模拟真实 CI 环境），网络不可用时自动降级为离线模式。
与 check_issue.py 保持逻辑一致：历史链接合并、快照缓存、网络检查（检查全部，跳过坏链接）。

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
import sys
from pathlib import Path

# 自动设置模块搜索路径
_script_dir = Path(__file__).parent
if str(_script_dir) not in sys.path:
    sys.path.insert(0, str(_script_dir))

from api.issue_checker import IssueChecker  # noqa: E402
from utils.cache import get_debug_cache  # noqa: E402

# ── 常量 ──

_WIDTH = 48
_STEP_TEMPLATE = "[{idx}/{total}] {title}"


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
        import httpx

        with httpx.Client(timeout=5) as client:
            resp = client.head("https://github.com", follow_redirects=True)
            resp.raise_for_status()
        _ok("网络可用")
        return True
    except Exception:
        _warn("网络不可用，自动降级为离线模式")
        return False


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
    - 网络检查：检查全部链接，跳过坏链接
    - 快照缓存
    """
    # 创建检查器
    cache = get_debug_cache()
    checker = IssueChecker(cache=cache)

    # Step 1: 链接提取
    _step_header(1, 5, "链接提取")
    links = checker._merge_links(body, comment_body, history_content, history_source)
    if not links:
        _ok("提取到 0 个链接")
    else:
        _ok(f"提取到 {len(links)} 个链接")
        for i, lnk in enumerate(links, 1):
            display = f"[{lnk.display_text}]({lnk.url})" if lnk.display_text else lnk.url
            print(f"     {i}. kind={lnk.kind}  {display}")

    # Step 2: 快照检查
    _step_header(2, 5, "快照检查")
    if not checker.has_snapshot(links):
        _fail("未提供任何快照链接 → 将关闭 Issue")
        return {
            "has_snapshot": "false",
            "has_unreachable": "false",
            "network_status": "skipped",
            "network_detail": "",
            "has_convertible": "false",
            "warning_type": "missing",
            "comment_missing": "",
            "comment_unreachable": "",
            "comment_404": "",
            "comment_uncertain": "",
            "comment_recovery": "",
            "comment_bot": "",
        }
    _ok("快照链接存在")

    # Step 3: 不可访问快照检查
    _step_header(3, 5, "不可访问快照检查")
    unreachable_links = checker.get_unreachable_links(links)
    if unreachable_links:
        _warn(f"发现 {len(unreachable_links)} 个不可访问快照 (i.gkd.li/snapshot/)")
    else:
        _ok("无不可访问快照")

    # Step 4: 网络有效性检查
    _step_header(4, 5, "网络有效性检查")
    if with_network:
        net_result = checker.check_all_links(links)

        # 打印检查结果
        for lnk in net_result.good_links:
            _ok(f"200 OK → {lnk.url}")
        for lnk in net_result.bad_links:
            _fail(f"不可访问 → {lnk.url}")

        _info(f"好链接: {len(net_result.good_links)}, 坏链接: {len(net_result.bad_links)}")
    else:
        _info("离线模式，跳过网络检查")
        net_result = None

    # Step 5: 评论生成
    _step_header(5, 5, "评论生成")
    if with_network and net_result and net_result.good_links:
        if with_snapshot:
            snapshots, gkd_links = checker.parse_all_snapshots(net_result.good_links)
        else:
            snapshots, gkd_links = [], []

        if snapshots or gkd_links:
            _ok(f"Bot 评论已生成 ({len(snapshots)} 快照, {len(gkd_links)} GKD 链接)")
        else:
            _info("无可转换链接，跳过 Bot 评论")
    else:
        _warn("网络检查未通过，跳过快照解析和 Bot 评论")

    # 保存缓存
    if cache.updated:
        cache.save()

    # 构建完整结果
    result = checker.analyze(
        text=body,
        comment_body=comment_body,
        history_content=history_content,
        history_source=history_source,
        issue_action=issue_action,
        issue_user=issue_user,
    )

    return result


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
