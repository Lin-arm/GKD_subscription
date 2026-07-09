"""
链接转换与 Bot 评论生成模块

负责：
1. 将 GitHub 附件链接转换为 GKD 代理链接
2. 按文件名中的 App/Activity 分组
3. 生成格式化的 Bot 评论内容
"""

import re
from dataclasses import dataclass

from extractor import LinkInfo


# ── 数据结构 ──


@dataclass
class ConvertedLink:
    """转换后的链接信息"""

    original_url: str  # 原始 GitHub 附件 URL
    converted_url: str  # 转换后的 GKD 代理 URL
    display_text: str  # 原始 Markdown 链接的显示文字
    app_name: str  # 从文件名提取的 App 名称
    activity_name: str  # 从文件名提取的 Activity 名称
    timestamp: str  # 从文件名提取的时间戳


# ── 常量 ──

# GKD 代理链接模板
GKD_PROXY_TEMPLATE = "https://i.gkd.li/i?url={url}"

# 文件名模式：{App}_{Activity}-{timestamp}.zip
# 例如：QQ_SplashActivity-1781663723542.zip
_RE_FILENAME = re.compile(
    r"https://github\.com/user-attachments/files/\d+/(.+)"
)

_RE_NAME_PATTERN = re.compile(
    r"^(?P<app>.+?)_(?P<activity>.+?)-(?P<timestamp>\d+)\.zip$"
)


# ── 转换逻辑 ──


def convert_github_attachments(links: list[LinkInfo]) -> list[ConvertedLink]:
    """
    将 GitHub 附件链接转换为 GKD 代理链接。

    仅处理 kind == "github_attachment" 的链接。
    文件名不符合 {App}_{Activity}-{timestamp}.zip 模式的，
    app_name / activity_name / timestamp 设为空字符串。
    """
    results: list[ConvertedLink] = []
    for lnk in links:
        if lnk.kind != "github_attachment":
            continue

        converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)

        # 从 URL 中提取文件名
        filename_match = _RE_FILENAME.match(lnk.url)
        filename = filename_match.group(1) if filename_match else ""

        # 尝试解析文件名中的 App / Activity / timestamp
        app_name = ""
        activity_name = ""
        timestamp = ""
        if filename:
            name_match = _RE_NAME_PATTERN.match(filename)
            if name_match:
                app_name = name_match.group("app")
                activity_name = name_match.group("activity")
                timestamp = name_match.group("timestamp")

        results.append(
            ConvertedLink(
                original_url=lnk.url,
                converted_url=converted_url,
                display_text=lnk.display_text,
                app_name=app_name,
                activity_name=activity_name,
                timestamp=timestamp,
            )
        )

    return results


# ── 评论生成 ──


def build_bot_comment(converted: list[ConvertedLink]) -> str:
    """
    生成 Bot 评论内容。

    格式：
    ### AppName
    #### ActivityName
    [timestamp](转换后URL)   ← 有 display_text 时用 [display_text](转换后URL)

    底部 <details> 折叠所有原始附件 URL。
    """
    if not converted:
        return ""

    # 按文件名模式分组：app → activity → [links]
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

    # 生成分组部分
    for app_name in _stable_key_order(grouped):
        activities = grouped[app_name]
        lines.append(f"### {app_name}")
        for activity_name in _stable_key_order(activities):
            items = activities[activity_name]
            lines.append(f"#### {activity_name}")
            for item in items:
                lines.append(_format_link_line(item))
            lines.append("")

    # 生成未分组部分（文件名不匹配模式）
    if ungrouped:
        for item in ungrouped:
            lines.append(_format_link_line(item))
        lines.append("")

    # 生成快速复制折叠区
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

    - 有 display_text 时：[display_text](converted_url)
    - 有 timestamp 时：[timestamp](converted_url)
    - 否则：直接输出 converted_url
    """
    if item.display_text:
        return f"[{item.display_text}]({item.converted_url})"
    if item.timestamp:
        return f"[{item.timestamp}]({item.converted_url})"
    return item.converted_url


def _stable_key_order(d: dict) -> list[str]:
    """按插入顺序返回字典的键（Python 3.7+ dict 保持插入顺序）。"""
    return list(d.keys())