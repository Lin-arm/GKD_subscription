"""
核心功能模块

提供链接检查、转换、提取和快照解析等底层功能。
"""

from core.checker import (
    check_network_links,
    check_unreachable_links,
    check_urls_concurrent,
    gkd_to_gh_attachment_url,
)
from core.converter import GKD_PROXY_TEMPLATE
from core.extractor import extract_links, extract_links_from_bot_comment
from core.snapshot_parser import download_and_parse

__all__ = [
    "check_network_links",
    "check_unreachable_links",
    "gkd_to_gh_attachment_url",
    "check_urls_concurrent",
    "GKD_PROXY_TEMPLATE",
    "extract_links",
    "extract_links_from_bot_comment",
    "download_and_parse",
]
