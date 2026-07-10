"""
链接提取与分类模块

从 Issue Body 中提取所有快照相关链接，并分类为：
- gkd：GKD 分享链接 (https://i.gkd.li/i/XXXXXXXX)
- github_attachment：GitHub 附件链接 (github.com/user-attachments/files/)
- unreachable_snapshot：不可访问的快照链接 (i.gkd.li/snapshot/)

本模块只负责提取和分类，不做任何检查或判断。
"""

import re

from utils.models import LinkInfo


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


# ── 分类函数 ──


def _classify_url(url: str) -> str | None:
    """
    对单个 URL 进行分类。

    返回值：
    - "gkd"：GKD 分享链接
    - "github_attachment"：GitHub 附件链接
    - "unreachable_snapshot"：不可访问的快照链接
    - None：不属于以上任何类别（忽略）
    """
    if _RE_UNREACHABLE_SNAPSHOT.match(url):
        return "unreachable_snapshot"
    if _RE_GKD_LINK.match(url):
        return "gkd"
    if _RE_GITHUB_ATTACHMENT.match(url):
        return "github_attachment"
    return None


# ── 主提取函数 ──


def extract_links(body: str) -> list[LinkInfo]:
    """
    从 Issue Body 中提取所有快照相关链接。

    处理两种格式：
    1. Markdown 链接：[文字](URL) → 保留显示文字
    2. 纯文本 URL：直接匹配 → display_text 为空

    去重策略：同一 URL 只保留首次出现。
    """
    seen: set[str] = set()
    results: list[LinkInfo] = []

    # 先提取 Markdown 格式链接（优先保留显示文字）
    for match in _RE_MD_LINK.finditer(body):
        display_text = match.group(1)
        url = match.group(2)
        kind = _classify_url(url)
        if kind and url not in seen:
            seen.add(url)
            results.append(LinkInfo(url=url, kind=kind, display_text=display_text))

    # 再提取纯文本 URL（排除已被 Markdown 链接捕获的）
    all_url_patterns = [
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