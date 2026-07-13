"""
Issue 模拟测试工具

本地交互式调试 check_issue.py 的分析逻辑，无需创建真实 GitHub Issue。

支持三种输入方式：
  1. 交互式：运行脚本后在终端输入 Issue Body，输入 END 结束
  2. 文件：python debug_sim.py --file issue.md
  3. 管道：echo "..." | python debug_sim.py

使用方法：
  python scripts/python/debug_sim.py                        # 交互式
  python scripts/python/debug_sim.py --file issue.md        # 文件
  python scripts/python/debug_sim.py --with-network         # 启用网络检查
  python scripts/python/debug_sim.py --with-snapshot        # 启用快照下载
  python scripts/python/debug_sim.py --user testuser        # 指定用户名
  python scripts/python/debug_sim.py --action comment       # 模拟评论事件
"""

import argparse
import sys
from pathlib import Path

# 自动设置模块搜索路径
_script_dir = Path(__file__).parent
if str(_script_dir) not in sys.path:
    sys.path.insert(0, str(_script_dir))

from core.checker import check_network_links, check_unreachable_links, gkd_to_gh_attachment_url  # noqa: E402
from core.converter import GKD_PROXY_TEMPLATE  # noqa: E402
from core.extractor import extract_links  # noqa: E402
from core.snapshot_parser import download_and_parse  # noqa: E402
from formatter import (  # noqa: E402
    build_bot_comment,
    build_recovery_comment,
    build_warning_inaccessible,
    build_warning_missing,
    build_warning_uncertain,
    build_warning_unreachable,
)

# ── 常量 ──

_SNAPSHOT_KINDS = {"gkd", "github_attachment", "unreachable_snapshot"}
_SEPARATOR = "─" * 40


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


# ── 分析流程（复用 check_issue.py 逻辑） ──


def analyze(
    body: str,
    comment_body: str = "",
    issue_user: str = "testuser",
    issue_action: str = "opened",
    with_network: bool = False,
    with_snapshot: bool = False,
) -> dict:
    """
    执行 Issue 分析，返回所有结果。

    参数与 check_issue.py.main() 对应，但输出到字典而非 GITHUB_OUTPUT。
    """
    # 合并链接（简化版：不处理 history_content）
    if issue_action == "comment" and comment_body:
        links = extract_links(comment_body)
        full_text = body
    else:
        full_text = body
        links = extract_links(full_text)

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

    # ── 判断是否缺少快照 ──
    has_any_snapshot = any(lnk.kind in _SNAPSHOT_KINDS for lnk in links)

    if not has_any_snapshot:
        result["has_snapshot"] = "false"
        result["warning_type"] = "missing"
        result["comment_missing"] = build_warning_missing(issue_user)
        return result

    # ── 检查不可访问快照链接 ──
    unreachable_links = check_unreachable_links(links)
    if unreachable_links:
        result["has_unreachable"] = "true"
        result["comment_unreachable"] = build_warning_unreachable(issue_user)

    # ── 网络有效性检查 ──
    if with_network:
        net_result = _check_all_links_interactive(links)
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
        result["network_status"] = "skipped"

    # ── 链接转换 + Bot 评论 ──
    network_ok = result["network_status"] in ("ok", "skipped")

    if network_ok:
        if with_snapshot:
            snapshots, gkd_links = _parse_all_snapshots(links)
        else:
            snapshots, gkd_links = [], _build_gkd_links_preview(links)

        if snapshots or gkd_links:
            result["has_convertible"] = "true"
            comment_body_text = build_bot_comment(snapshots, gkd_links)
            result["comment_bot"] = "<!-- gkd-bot-comment -->\n" + comment_body_text

    # ── 恢复判断 ──
    has_valid_snapshot = any(lnk.kind in ("gkd", "github_attachment") for lnk in links)
    if issue_action in ("edited", "comment") and has_valid_snapshot and network_ok:
        result["warning_type"] = "recovery"
        result["comment_recovery"] = build_recovery_comment(issue_user)

    return result


def _check_all_links_interactive(links: list) -> dict:
    """网络检查（交互式版本）。"""
    result = {
        "status": "skipped",
        "detail": "",
        "fail_url": "",
        "uncertain_url": "",
        "uncertain_code": 0,
        "uncertain_detail": "",
    }

    for lnk in links:
        if lnk.kind == "github_attachment":
            check_url = lnk.url
        elif lnk.kind == "gkd":
            check_url = gkd_to_gh_attachment_url(lnk.url)
            if not check_url:
                continue
        else:
            continue

        print(f"  检查: {check_url[:80]}...")
        check = check_network_links(check_url)

        if check.status == "404":
            result["status"] = "404"
            result["fail_url"] = lnk.url
            return result

        if check.status == "ok" and result["status"] == "skipped":
            result["status"] = "ok"

        if check.status == "uncertain" and result["status"] != "uncertain":
            result["status"] = "uncertain"
            result["detail"] = f"HTTP {check.status_code}: {check.detail}"
            result["uncertain_url"] = lnk.url
            result["uncertain_code"] = check.status_code
            result["uncertain_detail"] = check.detail

    return result


def _parse_all_snapshots(links: list) -> tuple[list, list[tuple[str, str]]]:
    """下载并解析所有快照。"""
    snapshots = []
    gkd_links = []

    for lnk in links:
        if lnk.kind == "github_attachment":
            converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)
            print(f"  下载快照: {lnk.url[:80]}...")
            snap = download_and_parse(lnk.url, converted_url)
            if snap:
                snapshots.append(snap)
            else:
                gkd_links.append((lnk.display_text or lnk.url, converted_url))

        elif lnk.kind == "gkd":
            gh_url = gkd_to_gh_attachment_url(lnk.url)
            if not gh_url:
                continue
            print(f"  下载快照: {lnk.url}")
            snap = download_and_parse(gh_url, lnk.url)
            if snap:
                snapshots.append(snap)
            else:
                gkd_links.append((lnk.display_text or lnk.url, lnk.url))

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


# ── 输出格式化 ──


def print_links(links: list):
    """打印提取的链接。"""
    print(f"\n{_SEPARATOR}")
    print("链接提取")
    print(_SEPARATOR)

    if not links:
        print("  (无链接)")
        return

    for i, lnk in enumerate(links, 1):
        display = f"  [{lnk.display_text}]({lnk.url})" if lnk.display_text else f"  {lnk.url}"
        print(f"  [{i}] kind={lnk.kind}")
        print(f"      {display}")


def print_result(result: dict):
    """打印分析结果。"""
    print(f"\n{_SEPARATOR}")
    print("分析结果")
    print(_SEPARATOR)

    flags = [
        ("has_snapshot", result["has_snapshot"]),
        ("has_unreachable", result["has_unreachable"]),
        ("network_status", result["network_status"]),
        ("has_convertible", result["has_convertible"]),
        ("warning_type", result["warning_type"] or "(empty)"),
    ]
    for key, value in flags:
        print(f"  {key:<20s} = {value}")


def print_warnings(result: dict):
    """打印警告评论预览。"""
    print(f"\n{_SEPARATOR}")
    print("警告评论预览")
    print(_SEPARATOR)

    warnings = [
        ("missing", result["comment_missing"]),
        ("unreachable", result["comment_unreachable"]),
        ("404", result["comment_404"]),
        ("uncertain", result["comment_uncertain"]),
        ("recovery", result["comment_recovery"]),
    ]

    has_any = False
    for label, comment in warnings:
        if comment:
            has_any = True
            print(f"\n  ── {label} ──")
            for line in comment.split("\n"):
                print(f"  {line}")

    if not has_any:
        print("  (无警告)")


def print_bot_comment(result: dict):
    """打印 Bot 评论预览。"""
    print(f"\n{_SEPARATOR}")
    print("Bot 评论预览")
    print(_SEPARATOR)

    comment = result["comment_bot"]
    if not comment:
        print("  (未生成 — 可能网络检查未通过或无可转换链接)")
        return

    # 去掉 HTML 标记行
    lines = comment.split("\n")
    content_lines = [line for line in lines if not line.startswith("<!--")]

    for line in content_lines:
        print(f"  {line}")


# ── 主入口 ──


def main():
    parser = argparse.ArgumentParser(description="GKD Issue 模拟测试工具")
    parser.add_argument("--file", "-f", help="从文件读取 Issue Body")
    parser.add_argument("--user", "-u", default="testuser", help="模拟用户名 (默认: testuser)")
    parser.add_argument(
        "--action", "-a", default="opened", choices=["opened", "edited", "comment"], help="触发事件类型 (默认: opened)"
    )
    parser.add_argument("--comment", "-c", default="", help="评论内容 (用于 comment 事件)")
    parser.add_argument("--with-network", "-n", action="store_true", help="启用网络检查")
    parser.add_argument("--with-snapshot", "-s", action="store_true", help="启用快照下载+解析")
    args = parser.parse_args()

    print()
    print("╔══════════════════════════════════════════╗")
    print("║   GKD Issue 模拟测试工具                 ║")
    print("╚══════════════════════════════════════════╝")
    print()

    # 读取输入
    if args.file:
        body = read_from_file(args.file)
        print(f"从文件读取: {args.file}")
    elif not sys.stdin.isatty():
        body = read_from_stdin()
        print("从标准输入读取")
    else:
        # 交互式
        if args.action == "opened":
            action_label = "opened"
        elif args.action == "edited":
            action_label = "edited"
        else:
            action_label = "comment"
        print(f"模拟场景: {action_label}")
        print()
        body = read_interactive()

    if not body.strip():
        print("错误: 输入内容为空")
        sys.exit(1)

    # 执行分析
    print(
        f"\n分析中... (network={'on' if args.with_network else 'off'}, snapshot={'on' if args.with_snapshot else 'off'})"
    )

    result = analyze(
        body=body,
        comment_body=args.comment,
        issue_user=args.user,
        issue_action=args.action,
        with_network=args.with_network,
        with_snapshot=args.with_snapshot,
    )

    # 输出结果
    links = extract_links(body)
    print_links(links)
    print_result(result)
    print_warnings(result)
    print_bot_comment(result)
    print()


if __name__ == "__main__":
    main()
