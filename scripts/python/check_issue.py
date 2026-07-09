"""
Issue 快照链接检查主入口

职责：分析 Issue Body 中的快照链接，将检查结果输出到 GITHUB_OUTPUT。
不直接操作 GitHub API —— 所有 GitHub 操作由 YAML 工作流完成。

流程图：
  接收到 Issue
      │
      ▼
  判断是否缺少快照 ──是──> BAN（关闭 + 标签）
      │否
      ▼
  判断是否使用不可分享本地链接 ──是──> BAN（关闭 + 标签）
      │否
      ▼
  检查不可访问快照链接(i.gkd.li/snapshot/) ──是──> 提醒补充（不关闭）
      │
      ▼
  网络有效性检查（GitHub 附件链接）
      │
      ├─ 不可访问 ──> BAN（关闭 + 标签）
      ├─ 不确定 ──> 提醒人工核查（不关闭）
      │
      ▼ 可访问
  分类处理：
      ├─ GKD 分享链接 ──> pass（无需处理）
      └─ GitHub 附件链接 ──> 转换为 GKD 代理链接 + Bot 评论

输出变量：
  - labels_to_add    : 逗号分隔的标签名
  - labels_to_remove : 逗号分隔的标签名（编辑修正后移除旧标签）
  - should_close     : "true" / "false"
  - should_reopen    : "true" / "false"
  - warning_comment  : 警告评论内容（含 <!-- gkd-warning --> 标记），为空则不发
  - bot_comment      : 快照转换评论内容（含 <!-- gkd-bot-comment --> 标记），为空则不发
"""

import os

from extractor import extract_links
from checker import check_local_links, check_unreachable_links, check_network_links
from converter import convert_github_attachments, build_bot_comment

# ── 本工作流管理的所有标签 ──

MANAGED_LABELS = [
    "缺失快照(missing-snapshot)",
    "本地链接(local-link)",
    "需补充链接(need-supplement-link)",
    "链接无法访问(inaccessible-link)",
]

# ── GITHUB_OUTPUT 写入工具 ──


def _write_output(key: str, value: str):
    """
    向 GITHUB_OUTPUT 写入一个键值对。

    使用 heredoc 语法支持多行值。
    """
    with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
        f.write(f"{key}<<GKD_OUTPUT_EOF\n{value}\nGKD_OUTPUT_EOF\n")


def _output_result(
    labels_to_add: list[str],
    labels_to_remove: list[str],
    should_close: bool,
    should_reopen: bool,
    warning_comment: str,
    bot_comment: str,
):
    """将所有分析结果写入 GITHUB_OUTPUT。"""
    _write_output("labels_to_add", ",".join(labels_to_add))
    _write_output("labels_to_remove", ",".join(labels_to_remove))
    _write_output("should_close", "true" if should_close else "false")
    _write_output("should_reopen", "true" if should_reopen else "false")
    _write_output("warning_comment", warning_comment)
    _write_output("bot_comment", bot_comment)


# ── 各场景的评论内容生成 ──


def _warning_missing_snapshot(user: str) -> str:
    """缺失快照时的警告评论"""
    return (
        "<!-- gkd-warning -->\n"
        f"您好 @{user}，由于您没有提供快照链接，此 Issue 已被自动关闭。\n\n"
        "请提供正确的快照链接后重新打开或提交新的 Issue。"
    )


def _warning_local_link(user: str) -> str:
    """检测到本地链接时的警告评论"""
    return (
        "<!-- gkd-warning -->\n"
        f"您好 @{user}，检测到您使用了不可分享的本地链接"
        "（如 localhost、127.0.0.1、file:// 等），他人无法访问该链接，"
        "此 Issue 已被自动关闭。\n\n"
        "请使用正确的分享方式上传快照后重新提交。"
    )


def _warning_unreachable_snapshot(user: str) -> str:
    """检测到 i.gkd.li/snapshot/ 时的提醒评论（不关闭）"""
    return (
        "<!-- gkd-warning -->\n"
        f"您好 @{user}，检测到您提供了他人无法访问的快照链接"
        "（i.gkd.li/snapshot/），请点击查看 "
        "[正确的分享快照方式说明](https://gkd.li/guide/snapshot#share-note) 。"
        "可在下方评论区补充。"
    )


def _warning_inaccessible_link(user: str, url: str) -> str:
    """链接不可访问（404）时的警告评论"""
    return (
        "<!-- gkd-warning -->\n"
        f"您好 @{user}，检测到您提供的快照链接无法访问：\n\n"
        f"`{url}`\n\n"
        "此 Issue 已被自动关闭。请确认链接正确后重新提交。"
    )


def _warning_uncertain_link(user: str, url: str, status_code: int, detail: str) -> str:
    """链接返回不确定状态码时的提醒评论（不关闭）"""
    return (
        f"您好 @{user}，检测到快照链接访问异常（HTTP {status_code}），"
        "暂时无法确认链接是否有效，请人工核查：\n\n"
        f"`{url}`\n\n"
        f"<details>\n<summary>详细错误信息</summary>\n\n```\n{detail}\n```\n</details>"
    )


def _recovery_comment(user: str) -> str:
    """编辑修正后检查通过时的恢复评论"""
    return (
        "<!-- gkd-warning -->\n"
        f"✅ 您好 @{user}，快照链接检查已通过，之前的标记已移除。"
    )


# ── 主流程 ──


def main():
    body = os.environ.get("ISSUE_BODY", "") or ""
    issue_user = os.environ.get("ISSUE_USER", "")
    issue_action = os.environ.get("ISSUE_ACTION", "")

    # 默认值
    labels_to_add: list[str] = []
    labels_to_remove: list[str] = []
    should_close = False
    should_reopen = False
    warning_comment = ""
    bot_comment = ""

    # ── 第一步：提取所有链接 ──
    links = extract_links(body)

    # ── 第二步：判断是否缺少快照 ──
    # 只有在没有任何快照相关链接时才判定为缺失
    has_gkd = any(lnk.kind == "gkd" for lnk in links)
    has_github_attachment = any(lnk.kind == "github_attachment" for lnk in links)
    has_unreachable = any(lnk.kind == "unreachable_snapshot" for lnk in links)
    has_local = any(lnk.kind == "local" for lnk in links)

    if not has_gkd and not has_github_attachment and not has_unreachable and not has_local:
        labels_to_add.append("缺失快照(missing-snapshot)")
        warning_comment = _warning_missing_snapshot(issue_user)
        should_close = True
        _output_result(
            labels_to_add, labels_to_remove,
            should_close, should_reopen,
            warning_comment, bot_comment,
        )
        return

    # ── 第三步：判断是否使用不可分享本地链接 ──
    local_links = check_local_links(links)
    if local_links:
        labels_to_add.append("本地链接(local-link)")
        warning_comment = _warning_local_link(issue_user)
        should_close = True
        _output_result(
            labels_to_add, labels_to_remove,
            should_close, should_reopen,
            warning_comment, bot_comment,
        )
        return

    # ── 第四步：检查不可访问的快照链接（i.gkd.li/snapshot/）──
    # 不关闭 Issue，允许用户补充，继续后续检查
    unreachable = check_unreachable_links(links)
    if unreachable:
        labels_to_add.append("需补充链接(need-supplement-link)")
        warning_comment = _warning_unreachable_snapshot(issue_user)

    # ── 第五步：网络有效性检查（仅针对 GitHub 附件链接）──
    attachment_links = [lnk for lnk in links if lnk.kind == "github_attachment"]
    banned = False
    for lnk in attachment_links:
        result = check_network_links(lnk.url)
        if result.status == "404":
            labels_to_add.append("链接无法访问(inaccessible-link)")
            warning_comment = _warning_inaccessible_link(issue_user, lnk.url)
            should_close = True
            banned = True
            break
        elif result.status == "uncertain":
            labels_to_add.append("链接无法访问(inaccessible-link)")
            uncertain_msg = _warning_uncertain_link(
                issue_user, lnk.url, result.status_code, result.detail,
            )
            # 追加到已有警告评论，或新建
            if warning_comment:
                warning_comment += f"\n\n---\n\n{uncertain_msg}"
            else:
                warning_comment = "<!-- gkd-warning -->\n" + uncertain_msg

    if banned:
        _output_result(
            labels_to_add, labels_to_remove,
            should_close, should_reopen,
            warning_comment, bot_comment,
        )
        return

    # ── 第六步：分类处理 ──
    # GKD 分享链接 → pass（无需处理）
    # GitHub 附件链接 → 转换为 GKD 代理链接 + Bot 评论
    if attachment_links:
        converted = convert_github_attachments(attachment_links)
        if converted:
            comment_body = build_bot_comment(converted)
            bot_comment = "<!-- gkd-bot-comment -->\n" + comment_body

    # ── 第七步：编辑时恢复 Issue 状态 ──
    if issue_action == "edited" and not labels_to_add and not should_close:
        should_reopen = True
        labels_to_remove = list(MANAGED_LABELS)
        warning_comment = _recovery_comment(issue_user)

    _output_result(
        labels_to_add, labels_to_remove,
        should_close, should_reopen,
        warning_comment, bot_comment,
    )


if __name__ == "__main__":
    main()