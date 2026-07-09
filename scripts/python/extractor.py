"""
链接提取模块

从 Issue Body 中提取所有快照相关链接，并分类为：
- gkd：GKD 分享链接 (https://i.gkd.li/i/XXXXXXXX)
- github_attachment：GitHub 附件链接 (github.com/user-attachments/files/)
- local：不可分享的本地链接 (localhost / 127.0.0.1 / file://)
- unreachable_snapshot：不可访问的快照链接 (i.gkd.li/snapshot/)
"""

import re
from dataclasses import dataclass


@dataclass
class LinkInfo:
    """提取出的单条链接信息"""

    url: str
    kind: str  # gkd / github_attachment / local / unreachable_snapshot
    display_text: str  # Markdown 链接的显示文字，纯文本时为空


# ── 正则模式 ──

# Markdown 格式链接：[显示文字](URL)
_RE_MD_LINK = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")

# GKD 分享链接：https://i.gkd.li/i/数字
_RE_GKD_LINK = re.compile(r"https://i\.gkd\.li/i/\d+")

# GitHub 附件链接：https://github.com/user-attachments/files/...
_RE_GITHUB_ATTACHMENT = re.compile(
    r"https://github\.com/user-attachments/files/[^\s\)]+"
)

# 不可访问的快照链接：https://i.gkd.li/snapshot/...
_RE_UNREACHABLE_SNAPSHOT = re.compile(r"https://i\.gkd\.li/snapshot/[^\s\)]*")

# 本地链接：localhost / 127.0.0.1 / file:// 等
_RE_LOCAL_LINK = re.compile(
    r"(?:https?://(?:localhost|127\.0\.0\.1|0\.0\.0\.0)[^\s\)]*"
    r"|file://[^\s\)]*)",
    re.IGNORECASE,
)


def _classify_url(url: str) -> str | None:
    """
    对单个 URL 进行分类。

    返回值：
    - "gkd"：GKD 分享链接
    - "github_attachment"：GitHub 附件链接
    - "local"：本地不可分享链接
    - "unreachable_snapshot"：不可访问的快照链接
    - None：不属于以上任何类别
    """
    if _RE_LOCAL_LINK.match(url):
        return "local"
    if _RE_UNREACHABLE_SNAPSHOT.match(url):
        return "unreachable_snapshot"
    if _RE_GKD_LINK.match(url):
        return "gkd"
    if _RE_GITHUB_ATTACHMENT.match(url):
        return "github_attachment"
    return None


def extract_links(body: str) -> list[LinkInfo]:
    """
    从 Issue Body 中提取所有快照相关链接。

    处理两种格式：
    1. Markdown 链接：[文字](URL) → 保留显示文字
    2. 纯文本 URL：直接匹配 → display_text 为空
    """
    seen: set[str] = set()
    results: list[LinkInfo] = []

    # 先提取 Markdown 格式链接
    for match in _RE_MD_LINK.finditer(body):
        display_text = match.group(1)
        url = match.group(2)
        kind = _classify_url(url)
        if kind and url not in seen:
            seen.add(url)
            results.append(LinkInfo(url=url, kind=kind, display_text=display_text))

    # 再提取纯文本 URL（排除已被 Markdown 链接捕获的）
    all_url_patterns = [
        (_RE_LOCAL_LINK, "local"),
        (_RE_UNREACHABLE_SNAPSHOT, "unreachable_snapshot"),
        (_RE_GKD_LINK, "gkd"),
        (_RE_GITHUB_ATTACHMENT, "github_attachment"),
    ]
    for pattern, kind in all_url_patterns:
        for match in pattern.finditer(body):
            url = match.group(0)
            if url not in seen:
                seen.add(url)
                results.append(LinkInfo(url=url, kind=kind, display_text=""))

    return results