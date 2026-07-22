"""
通用 URL 检查器基类

提供可复用的高层 API，支持多种 CI 场景（Issues、PR、Commit）。
子类可覆盖特定方法以实现不同场景的定制逻辑。
"""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import TYPE_CHECKING

from core.checker import check_network_links, gkd_to_gh_attachment_url
from core.converter import GKD_PROXY_TEMPLATE
from core.extractor import extract_links
from core.snapshot_parser import download_and_parse
from utils.cache import SnapshotCache
from utils.common import SNAPSHOT_KINDS
from utils.models import (
    LinkInfo,
    NetworkResult,
    SnapshotInfo,
)

if TYPE_CHECKING:
    pass


# ── 网络检查聚合结果 ──


@dataclass
class NetworkCheckResult:
    """网络检查聚合结果，记录所有链接的检查状态"""

    status: str = "skipped"  # ok / 404 / uncertain / skipped
    detail: str = ""
    fail_urls: list[str] = field(default_factory=list)  # 404 链接列表
    uncertain_urls: list[str] = field(default_factory=list)  # uncertain 链接列表
    uncertain_code: int = 0
    uncertain_detail: str = ""
    good_links: list[LinkInfo] = field(default_factory=list)  # 可访问的链接
    bad_links: list[LinkInfo] = field(default_factory=list)  # 不可访问的链接


# ── 基类 ──


class URLChecker(ABC):
    """
    通用 URL 检查器基类

    提供完整的 URL 检查流程，子类可覆盖特定方法以实现定制逻辑。

    使用示例：
        checker = IssueChecker()
        report = checker.analyze(text)
        print(f"检查完成: {report.ok_count} 成功, {report.fail_count} 失败")
    """

    def __init__(self, timeout: int = 20, cache: SnapshotCache | None = None):
        """
        初始化 URL 检查器。

        参数：
            timeout: 网络请求超时时间（秒），默认 20 秒
            cache: 快照缓存实例，可选
        """
        self.timeout = timeout
        self.cache = cache

    def extract_links(self, text: str) -> list[LinkInfo]:
        """
        从文本中提取所有快照相关链接。

        参数：
            text: 包含链接的文本内容

        返回：
            LinkInfo 列表
        """
        return extract_links(text)

    def check_url(self, url: str) -> NetworkResult:
        """
        检查单个 URL 的可访问性。

        参数：
            url: 要检查的 URL

        返回：
            NetworkResult 检查结果
        """
        return check_network_links(url, self.timeout)

    def get_check_url(self, link: LinkInfo) -> str | None:
        """
        根据链接类型确定用于检查的 URL。

        参数：
            link: 链接信息

        返回：
            用于检查的 URL，或 None
        """
        if link.kind == "github_attachment":
            return link.url
        elif link.kind == "gkd_proxy":
            return gkd_to_gh_attachment_url(link.url)
        elif link.kind == "gkd":
            return gkd_to_gh_attachment_url(link.url)
        return None

    def check_all_links(self, links: list[LinkInfo]) -> NetworkCheckResult:
        """
        对所有可检查链接执行网络有效性检查。

        参数：
            links: 链接列表

        返回：
            NetworkCheckResult 聚合结果
        """
        result = NetworkCheckResult()

        for lnk in links:
            check_url = self.get_check_url(lnk)
            if not check_url:
                continue

            check = self.check_url(check_url)

            if check.status == "ok":
                result.good_links.append(lnk)
                if result.status == "skipped":
                    result.status = "ok"
            elif check.status == "404":
                result.bad_links.append(lnk)
                result.fail_urls.append(lnk.url)
                if result.status == "skipped":
                    result.status = "404"
            elif check.status == "uncertain":
                result.bad_links.append(lnk)
                result.uncertain_urls.append(lnk.url)
                if not result.uncertain_code:
                    result.uncertain_code = check.status_code
                    result.uncertain_detail = check.detail
                    result.detail = f"HTTP {check.status_code}: {check.detail}"
                if result.status == "skipped":
                    result.status = "uncertain"

        # 最终状态判断：有好链接就是 ok
        if result.good_links:
            result.status = "ok"
        elif result.bad_links and result.status == "skipped":
            result.status = "404"

        return result

    def parse_snapshot(self, link: LinkInfo, check_url: str) -> SnapshotInfo | None:
        """
        下载并解析单个快照。

        参数：
            link: 原始链接信息
            check_url: 用于下载的 URL

        返回：
            SnapshotInfo 或 None（下载/解析失败时）
        """
        # 确定转换后的 URL（用于 Bot 评论展示）
        if link.kind == "github_attachment":
            converted_url = GKD_PROXY_TEMPLATE.format(url=link.url)
        elif link.kind == "gkd_proxy":
            converted_url = link.url
        else:
            converted_url = link.url

        # 尝试下载解析
        return download_and_parse(check_url, converted_url, self.timeout)

    def parse_all_snapshots(self, links: list[LinkInfo]) -> tuple[list[SnapshotInfo], list[tuple[str, str]]]:
        """
        下载并解析所有快照链接。

        参数：
            links: 链接列表

        返回：
            - snapshots：解析成功的 SnapshotInfo 列表
            - gkd_links：无法下载解析的 GKD 链接 [(display_text, converted_url), ...]
        """
        snapshots: list[SnapshotInfo] = []
        gkd_links: list[tuple[str, str]] = []

        for lnk in links:
            check_url = self.get_check_url(lnk)
            if not check_url:
                continue

            # 尝试从缓存读取
            if self.cache:
                snap = self.cache.get(lnk.url)
                if snap:
                    # 更新 converted_url
                    if lnk.kind == "github_attachment":
                        snap.converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)
                    elif lnk.kind == "gkd_proxy":
                        snap.converted_url = lnk.url
                    snapshots.append(snap)
                    continue

            # 缓存未命中，下载解析
            snap = self.parse_snapshot(lnk, check_url)

            if snap is None:
                # 下载失败，保留为 GKD 链接
                if lnk.kind == "github_attachment":
                    converted_url = GKD_PROXY_TEMPLATE.format(url=lnk.url)
                    display = lnk.display_text or converted_url.split("/")[-1]
                    gkd_links.append((display, converted_url))
                elif lnk.kind == "gkd_proxy":
                    gkd_links.append((lnk.display_text or lnk.url, lnk.url))
                else:
                    gkd_links.append((lnk.display_text or lnk.url, lnk.url))
                continue

            # 保存到缓存
            if self.cache:
                self.cache.set(lnk.url, snap)

            snapshots.append(snap)

        return snapshots, gkd_links

    @abstractmethod
    def analyze(self, text: str, **kwargs) -> dict:
        """
        完整分析流程（子类必须实现）。

        参数：
            text: 输入文本
            **kwargs: 场景特定参数

        返回：
            分析结果字典
        """
        pass

    def has_snapshot(self, links: list[LinkInfo]) -> bool:
        """
        检查链接列表中是否包含快照链接。

        参数：
            links: 链接列表

        返回：
            是否包含快照链接
        """
        return any(lnk.kind in SNAPSHOT_KINDS for lnk in links)

    def get_unreachable_links(self, links: list[LinkInfo]) -> list[LinkInfo]:
        """
        筛选出所有不可访问的快照链接。

        参数：
            links: 链接列表

        返回：
            不可访问的链接列表
        """
        return [lnk for lnk in links if lnk.kind == "unreachable_snapshot"]
