"""
快照缓存管理模块

提供统一的缓存管理功能，支持不同场景（CI/本地调试）使用不同的缓存目录。
消除 check_issue.py 和 debug_sim.py 中的重复缓存代码。
"""

import json
from dataclasses import asdict
from pathlib import Path
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from utils.models import SnapshotInfo

# ── 缓存类 ──


class SnapshotCache:
    """
    快照缓存管理器

    支持从文件加载/保存缓存，以及内存中的缓存操作。
    """

    def __init__(self, cache_dir: str | Path, cache_file: str = "snapshots.json"):
        """
        初始化缓存管理器。

        参数：
            cache_dir: 缓存目录路径
            cache_file: 缓存文件名
        """
        self.cache_dir = Path(cache_dir)
        self.cache_file = cache_file
        self._cache: dict[str, dict] = {}
        self._updated = False

    def load(self) -> dict[str, dict]:
        """
        从文件加载缓存。

        返回：
            缓存字典，格式为 {url: SnapshotInfo_dict, ...}
        """
        cache_path = self.cache_dir / self.cache_file
        if not cache_path.exists():
            self._cache = {}
            return self._cache

        try:
            with open(cache_path, encoding="utf-8") as f:
                self._cache = json.load(f)
        except Exception:
            self._cache = {}

        return self._cache

    def save(self):
        """
        保存缓存到文件。

        仅当有更新时才写入磁盘。
        """
        if not self._updated:
            return

        self.cache_dir.mkdir(parents=True, exist_ok=True)
        cache_path = self.cache_dir / self.cache_file

        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(self._cache, f, ensure_ascii=False, indent=2)

    def get(self, url: str, snapshot_cls: type | None = None) -> "SnapshotInfo | None":
        """
        从缓存中获取快照。

        参数：
            url: 快照 URL
            snapshot_cls: SnapshotInfo 类（用于反序列化）

        返回：
            SnapshotInfo 对象，或 None（未命中）
        """
        if url not in self._cache:
            return None

        if snapshot_cls is None:
            from utils.models import SnapshotInfo

            snapshot_cls = SnapshotInfo

        try:
            return snapshot_cls(**self._cache[url])
        except Exception:
            return None

    def set(self, url: str, snap: "SnapshotInfo"):
        """
        将快照保存到缓存。

        参数：
            url: 快照 URL
            snap: SnapshotInfo 对象
        """
        self._cache[url] = asdict(snap)
        self._updated = True

    @property
    def updated(self) -> bool:
        """缓存是否有更新"""
        return self._updated


# ── 便捷函数 ──

# CI 环境缓存目录
CI_CACHE_DIR = "/tmp/snapshot_cache"

# 本地调试缓存目录
DEBUG_CACHE_DIR = Path.home() / ".cache" / "gkd_debug"


def get_ci_cache() -> SnapshotCache:
    """获取 CI 环境的缓存实例"""
    return SnapshotCache(CI_CACHE_DIR)


def get_debug_cache() -> SnapshotCache:
    """获取本地调试的缓存实例"""
    return SnapshotCache(DEBUG_CACHE_DIR)
