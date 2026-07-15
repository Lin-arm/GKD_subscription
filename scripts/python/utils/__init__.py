"""
工具模块

提供通用工具函数、数据结构和缓存管理。
"""

from utils.cache import SnapshotCache, get_ci_cache, get_debug_cache
from utils.common import SNAPSHOT_KINDS, build_full_text_from_links, merge_links_dedup
from utils.models import CheckReport, LinkCheckResult, LinkInfo, NetworkResult, SnapshotInfo

__all__ = [
    "SNAPSHOT_KINDS",
    "merge_links_dedup",
    "build_full_text_from_links",
    "SnapshotCache",
    "get_ci_cache",
    "get_debug_cache",
    "LinkInfo",
    "SnapshotInfo",
    "NetworkResult",
    "CheckReport",
    "LinkCheckResult",
]
