"""
链接转换模块

将 GitHub 附件链接转换为 GKD 代理链接。
仅处理 kind == "github_attachment" 的链接，GKD 链接原样保留。

转换公式：https://i.gkd.li/i?url={{原始GitHub附件URL}}

本模块只负责数据转换，不负责评论格式化（由 formatter.py 处理）。
"""

import re

from utils.common import GKD_PROXY_TEMPLATE, extract_github_filename
from utils.models import ConvertedLink, LinkInfo

# 文件名模式：{App}_{Activity}-{timestamp}.zip
_RE_NAME_PATTERN = re.compile(r"^(?P<app>.+?)_(?P<activity>.+?)-(?P<timestamp>\d+)\.zip$")


# ── 转换函数 ──


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

        # 执行 URL 转换
        converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)

        # 从 URL 中提取文件名
        filename = extract_github_filename(lnk.url)

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
