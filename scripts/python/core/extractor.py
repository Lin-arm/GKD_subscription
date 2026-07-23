"""
链接提取与分类模块

从 Issue Body 中提取所有快照相关链接，并分类为：
- gkd：GKD 分享链接 (https://i.gkd.li/i/XXXXXXXX)
- github_attachment：GitHub 附件链接 (github.com/user-attachments/files/)
- unreachable_snapshot：不可访问的快照链接 (i.gkd.li/snapshot/)

从旧 Bot 评论中提取快照链接：
- extract_links_from_bot_comment：提取 [snapshot_id](url) 格式的链接
  - 代理链接 (i.gkd.li/i?url=...) 分类为 "gkd_proxy"
  - 标准链接 (i.gkd.li/i/数字) 分类为 "gkd"

本模块只负责提取和分类，不做任何检查或判断。
"""

import re

from utils.common import gkd_regex
from utils.models import LinkInfo

# ── 正则模式 ──

# Markdown 格式链接：[显示文字](URL)
_RE_MD_LINK = re.compile(r"\[([^\]]*)\]\(([^)]+)\)")

# GKD 相关正则从域名列表动态构建（新增域名只需修改 GKD_DOMAINS）
_RE_GKD_LINK = gkd_regex(r"/i/\d+")

# GitHub 附件链接：https://github.com/user-attachments/files/...
_RE_GITHUB_ATTACHMENT = re.compile(r"https://github\.com/user-attachments/files/[^\s\)]+")

# 不可访问的快照链接：https://i.gkd.li/snapshot/...
_RE_UNREACHABLE_SNAPSHOT = gkd_regex(r"/snapshot/[^\s\)]*")

# GKD 代理链接：https://i.gkd.li/i?url=...
_RE_GKD_PROXY_LINK = gkd_regex(r"/i\?url=(https://[^\s\)]+)")

# 从旧 Bot 评论中提取快照链接：[snapshot_id](url) 格式
# snapshot_id 是数字 ID（通常是 10 位以上的时间戳）
_RE_BOT_SNAPSHOT_LINK = re.compile(r"\[(\d{10,})\]\((https://[^\)]+)\)")

# 从旧 Bot 评论中提取 GKD 链接：纯文本 URL
_RE_BOT_GKD_LINK = gkd_regex(r"/i/\d+")


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


# ── 从旧 Bot 评论中提取链接 ──


def _classify_bot_url(url: str) -> str:
    """
    对旧 Bot 评论中提取的 URL 进行分类。

    返回值：
    - "gkd_proxy"：GKD 代理链接（i.gkd.li/i?url=...），内含 GitHub 附件地址
    - "gkd"：标准 GKD 分享链接（i.gkd.li/i/数字）
    """
    if _RE_GKD_PROXY_LINK.match(url):
        return "gkd_proxy"
    return "gkd"


def extract_links_from_bot_comment(comment: str) -> list[LinkInfo]:
    """
    从旧 Bot 评论中提取快照链接。

    旧 Bot 评论格式：
    - [snapshot_id](url) 格式的链接
      - 代理链接：url 为 i.gkd.li/i?url=GitHub附件地址，kind 为 "gkd_proxy"
      - 标准链接：url 为 i.gkd.li/i/数字，kind 为 "gkd"
    - https://i.gkd.li/i/数字 格式的 GKD 链接（纯文本），kind 为 "gkd"

    返回：LinkInfo 列表，kind 根据 URL 格式正确分类
    """
    if not comment:
        return []

    seen: set[str] = set()
    results: list[LinkInfo] = []

    # 提取 [snapshot_id](url) 格式的链接
    for match in _RE_BOT_SNAPSHOT_LINK.finditer(comment):
        snapshot_id = match.group(1)
        url = match.group(2)
        if url not in seen:
            seen.add(url)
            kind = _classify_bot_url(url)
            results.append(LinkInfo(url=url, kind=kind, display_text=snapshot_id))

    # 提取纯文本 GKD 链接
    for match in _RE_BOT_GKD_LINK.finditer(comment):
        url = match.group(0)
        if url not in seen:
            seen.add(url)
            snapshot_id = url.split("/")[-1]
            results.append(LinkInfo(url=url, kind="gkd", display_text=snapshot_id))

    return results
