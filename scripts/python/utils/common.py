"""
通用工具函数模块

提供跨模块复用的工具函数，消除重复代码。
各模块从本模块导入所需函数，确保实现一致性。
"""

import re

# ── URL 处理函数 ──


# GitHub 附件 URL 正则：提取文件名部分
_RE_GITHUB_FILENAME = re.compile(r"https://github\.com/user-attachments/files/\d+/(.+)")


def extract_filename(url: str) -> str:
    """
    从 URL 中提取文件名。

    参数：
        url: 完整的 URL 地址

    返回：
        文件名字符串，如 "app.zip"

    示例：
        >>> extract_filename("https://example.com/path/to/file.zip")
        "file.zip"
    """
    return url.rsplit("/", 1)[-1] if "/" in url else url


def extract_github_filename(url: str) -> str:
    """
    从 GitHub 附件 URL 中提取文件名。

    专门处理 GitHub 附件链接格式：
    https://github.com/user-attachments/files/{id}/{filename}

    参数：
        url: GitHub 附件 URL

    返回：
        文件名字符串

    示例：
        >>> extract_github_filename("https://github.com/user-attachments/files/12345/app.zip")
        "app.zip"
    """
    match = _RE_GITHUB_FILENAME.match(url)
    return match.group(1) if match else extract_filename(url)


# ── Activity 名称处理 ──


def short_activity_name(activity_id: str) -> str:
    """
    Activity 类名取最后一段（类名简写）。

    参数：
        activity_id: 完整的 Activity 类名，如 "com.example.MyActivity"

    返回：
        简写形式，如 "MyActivity"

    示例：
        >>> short_activity_name("com.mihoyo.cloudgame.main.MiHoYoCloudMainActivity")
        "MiHoYoCloudMainActivity"
    """
    if "." in activity_id:
        return activity_id.rsplit(".", 1)[-1]
    return activity_id


# ── 链接合并函数 ──


def merge_links_dedup(history_links: list, new_links: list) -> list:
    """
    合并历史链接和新链接，基于 URL 去重。

    策略：保留首次出现的链接（历史链接优先）。

    参数：
        history_links: 历史链接列表（优先级高）
        new_links: 新链接列表

    返回：
        去重后的链接列表
    """
    seen: set[str] = set()
    result: list = []

    for lnk in history_links:
        if lnk.url not in seen:
            seen.add(lnk.url)
            result.append(lnk)

    for lnk in new_links:
        if lnk.url not in seen:
            seen.add(lnk.url)
            result.append(lnk)

    return result


def build_full_text_from_links(links: list) -> str:
    """
    从链接列表构建文本，每行一个链接，包含显示文字和 URL。

    参数：
        links: 链接列表

    返回：
        每行一个链接的文本字符串
    """
    parts: list[str] = []
    for lnk in links:
        if lnk.display_text:
            parts.append(f"[{lnk.display_text}]({lnk.url})")
        else:
            parts.append(lnk.url)
    return "\n".join(parts)
