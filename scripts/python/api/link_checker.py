"""
高层链接检查器模块

提供可复用的通用 API，可在任何 CI 场景中使用。

本模块封装了底层的链接提取、网络检查、快照解析等功能，
提供简洁的高层接口，隐藏实现细节。

使用示例：
    from link_checker import LinkChecker

    # 创建检查器实例
    checker = LinkChecker()

    # 从文本提取链接并检查
    report = checker.extract_and_check(text)
    print(f"检查完成: {report.ok_count} 成功, {report.fail_count} 失败")

    # 批量检查 URL
    results = checker.check_urls(["https://example.com/1.zip", "https://example.com/2.zip"])
    for r in results:
        print(f"{r.link.url}: {r.network_result.status}")
"""

from utils.models import (
    LinkInfo,
    NetworkResult,
    SnapshotInfo,
    CheckReport,
    LinkCheckResult,
)
from core.extractor import extract_links
from core.checker import check_network_links, gkd_to_gh_attachment_url
from core.converter import GKD_PROXY_TEMPLATE
from core.snapshot_parser import download_and_parse


# ── 快照相关链接类型集合 ──

_SNAPSHOT_KINDS = {"gkd", "github_attachment", "unreachable_snapshot"}


class LinkChecker:
    """
    通用链接检查器

    可在任何 CI 场景中复用，不绑定特定业务逻辑。
    封装了底层模块的复杂性，提供简洁的高层接口。
    """

    def __init__(self, timeout: int = 20):
        """
        初始化链接检查器。

        参数：
            timeout: 网络请求超时时间（秒），默认 20 秒
        """
        self.timeout = timeout

    def extract_links(self, text: str) -> list[LinkInfo]:
        """
        从文本中提取所有快照相关链接。

        支持的链接类型：
        - GKD 分享链接：https://i.gkd.li/i/数字
        - GitHub 附件链接：https://github.com/user-attachments/files/...
        - 不可访问快照链接：https://i.gkd.li/snapshot/...

        参数：
            text: 包含链接的文本内容

        返回：
            LinkInfo 列表，包含提取出的所有链接
        """
        return extract_links(text)

    def check_url(self, url: str) -> NetworkResult:
        """
        检查单个 URL 的可访问性。

        请求策略：
        1. HEAD 请求 —— 最快，只获取响应头
        2. GET 请求 + Range 头 —— 只请求前 1 字节，兼容不支持 HEAD 的服务器

        参数：
            url: 要检查的 URL

        返回：
            NetworkResult 检查结果
        """
        return check_network_links(url, self.timeout)

    def check_urls(self, urls: list[str]) -> list[LinkCheckResult]:
        """
        批量检查多个 URL 的可访问性。

        参数：
            urls: URL 列表

        返回：
            LinkCheckResult 列表，每个元素包含链接信息和检查结果
        """
        results = []
        for url in urls:
            # 创建 LinkInfo 对象
            link = LinkInfo(url=url, kind="unknown", display_text="")

            # 执行网络检查
            net_result = self.check_url(url)

            results.append(LinkCheckResult(link=link, network_result=net_result))
        return results

    def extract_and_check(self, text: str) -> CheckReport:
        """
        从文本提取链接并检查可访问性（完整流程）。

        这是最常用的方法，执行完整的链接检查流程：
        1. 从文本中提取所有链接
        2. 对每个链接执行网络可访问性检查
        3. 尝试下载并解析快照（如果可能）
        4. 汇总统计结果

        参数：
            text: 包含链接的文本内容

        返回：
            CheckReport 检查报告，包含统计信息和详细结果
        """
        # 提取所有链接
        links = self.extract_links(text)
        results = []

        for link in links:
            # 根据链接类型确定检查 URL
            check_url = self._get_check_url(link)
            if not check_url:
                # 无法检查的链接类型，跳过网络检查
                results.append(LinkCheckResult(
                    link=link,
                    network_result=NetworkResult(status="skipped"),
                ))
                continue

            # 执行网络检查
            net_result = self.check_url(check_url)

            # 尝试下载解析快照（可选）
            snapshot = None
            if link.kind in ("github_attachment", "gkd"):
                snapshot = self._try_parse_snapshot(link, check_url)

            results.append(LinkCheckResult(
                link=link,
                network_result=net_result,
                converted_url=check_url,
                snapshot=snapshot,
            ))

        # 统计结果
        ok_count = sum(1 for r in results if r.network_result.status == "ok")
        fail_count = sum(1 for r in results if r.network_result.status == "404")
        uncertain_count = sum(1 for r in results if r.network_result.status == "uncertain")

        return CheckReport(
            total_links=len(results),
            ok_count=ok_count,
            fail_count=fail_count,
            uncertain_count=uncertain_count,
            links=results,
        )

    def _get_check_url(self, link: LinkInfo) -> str | None:
        """
        根据链接类型确定用于检查的 URL。

        - github_attachment：直接使用原始 URL
        - gkd：转换为 GitHub 附件 URL
        - 其他类型：返回 None（不检查）

        参数：
            link: 链接信息

        返回：
            用于检查的 URL，或 None
        """
        if link.kind == "github_attachment":
            return link.url
        elif link.kind == "gkd":
            return gkd_to_gh_attachment_url(link.url)
        else:
            return None

    def _try_parse_snapshot(self, link: LinkInfo, check_url: str) -> SnapshotInfo | None:
        """
        尝试下载并解析快照。

        参数：
            link: 原始链接信息
            check_url: 用于下载的 URL

        返回：
            SnapshotInfo 或 None（下载/解析失败时）
        """
        # 确定转换后的 URL（用于 Bot 评论展示）
        if link.kind == "github_attachment":
            converted_url = GKD_PROXY_TEMPLATE.format(url=link.url)
        else:
            converted_url = link.url

        # 尝试下载解析
        return download_and_parse(check_url, converted_url, self.timeout)


# ── 便捷函数 ──


def check_links_in_text(text: str, timeout: int = 20) -> CheckReport:
    """
    便捷函数：从文本提取链接并检查可访问性。

    等同于创建 LinkChecker 实例并调用 extract_and_check()。

    参数：
        text: 包含链接的文本内容
        timeout: 网络请求超时时间（秒）

    返回：
        CheckReport 检查报告

    示例：
        from link_checker import check_links_in_text

        report = check_links_in_text(issue_body)
        if report.fail_count > 0:
            print("发现不可访问的链接")
    """
    checker = LinkChecker(timeout=timeout)
    return checker.extract_and_check(text)
