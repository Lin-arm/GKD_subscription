"""
评论格式化模块

负责生成所有 Bot 评论的 Markdown 内容，包括：
- 各类警告评论（缺失快照 / 不可访问快照 / 链接无法访问 / 不确定）
- 编辑/评论恢复评论
- 快照转换 Bot 评论（按 App > Activity 分组）

每类评论使用独立的 HTML 标记，供 YAML 工作流中 find-comment 按场景查找。
本模块只负责内容生成，不负责评论发布（由 YAML 工作流完成）。
"""

from converter import ConvertedLink


# ── 警告评论生成 ──


def build_warning_missing(user: str) -> str:
    """缺失快照时的警告评论（关闭 Issue）"""
    return (
        "<!-- gkd-warning-missing -->\n"
        f"您好 @{user}，由于您没有提供快照链接，此 Issue 已被自动关闭。\n\n"
        "请提供正确的快照链接后重新打开或提交新的 Issue。"
    )


def build_warning_unreachable(user: str) -> str:
    """检测到 i.gkd.li/snapshot/ 时的提醒评论（不关闭）"""
    return (
        "<!-- gkd-warning-unreachable -->\n"
        f"您好 @{user}，检测到您提供了他人无法访问的快照链接"
        "（i.gkd.li/snapshot/），请点击查看 "
        "[正确的分享快照方式说明](https://gkd.li/guide/snapshot#share-note) 。"
        "可在下方评论区补充。"
    )


def build_warning_inaccessible(user: str, url: str) -> str:
    """链接不可访问（404）时的警告评论（不关闭 Issue）"""
    return (
        "<!-- gkd-warning-404 -->\n"
        f"您好 @{user}，检测到您提供的快照链接无法访问：\n\n"
        f"`{url}`\n\n"
        "请确认链接正确后在评论区补充有效的快照链接。"
    )


def build_warning_uncertain(
    user: str, url: str, status_code: int, detail: str
) -> str:
    """链接返回不确定状态码时的提醒评论（不关闭，折叠错误详情）"""
    return (
        "<!-- gkd-warning-uncertain -->\n"
        f"您好 @{user}，检测到快照链接访问异常（HTTP {status_code}），"
        "暂时无法确认链接是否有效，请人工核查：\n\n"
        f"`{url}`\n\n"
        f"<details>\n<summary>详细错误信息</summary>\n\n```\n{detail}\n```\n</details>"
    )


def build_recovery_comment(user: str) -> str:
    """编辑/评论补充有效链接后检查通过时的恢复评论"""
    return (
        "<!-- gkd-warning-recovery -->\n"
        f"✅ 您好 @{user}，快照链接检查已通过，之前的标记已移除。"
    )


# ── Bot 转换评论生成 ──


def build_bot_comment(converted: list[ConvertedLink]) -> str:
    """
    生成快照转换 Bot 评论内容。

    格式：
    ### AppName
    #### ActivityName
    [timestamp](转换后URL) 或 [display_text](转换后URL)

    不匹配文件名模式的附件不分组，逐条列出。

    底部 <details> 折叠区包含所有原始附件 URL（快速复制）。
    """
    if not converted:
        return ""

    grouped: dict[str, dict[str, list[ConvertedLink]]] = {}
    ungrouped: list[ConvertedLink] = []

    for item in converted:
        if item.app_name and item.activity_name:
            grouped.setdefault(item.app_name, {}).setdefault(
                item.activity_name, []
            ).append(item)
        else:
            ungrouped.append(item)

    lines: list[str] = []

    for app_name in grouped:
        activities = grouped[app_name]
        lines.append(f"### {app_name}")
        for activity_name in activities:
            items = activities[activity_name]
            lines.append(f"#### {activity_name}")
            for item in items:
                lines.append(_format_link_line(item))
            lines.append("")

    if ungrouped:
        for item in ungrouped:
            lines.append(_format_link_line(item))
        lines.append("")

    lines.append("<details>")
    lines.append("<summary>快速复制</summary>")
    lines.append("")
    lines.append("## 快速复制")
    lines.append("```")
    for item in converted:
        lines.append(item.original_url)
    lines.append("```")
    lines.append("</details>")

    return "\n".join(lines)


def _format_link_line(item: ConvertedLink) -> str:
    """
    格式化单条链接行。

    优先级：
    1. 有 display_text 时：[display_text](converted_url)
    2. 有 timestamp 时：[timestamp](converted_url)
    3. 否则：直接输出 converted_url
    """
    if item.display_text:
        return f"[{item.display_text}]({item.converted_url})"
    if item.timestamp:
        return f"[{item.timestamp}]({item.converted_url})"
    return item.converted_url