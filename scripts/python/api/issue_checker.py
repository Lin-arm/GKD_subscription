"""
Issue 场景 URL 检查器

专门用于 GitHub Issue 的链接检查，支持：
- Issue Body 分析
- 评论事件处理
- 历史链接合并
- 原子化结果输出（供 YAML 多 Job 条件判断）
"""

from __future__ import annotations

from api.base import NetworkCheckResult, URLChecker
from core.extractor import extract_links_from_bot_comment
from formatter import (
    build_bot_comment,
    build_recovery_comment,
    build_warning_inaccessible,
    build_warning_missing,
    build_warning_uncertain,
    build_warning_unreachable,
)
from utils.cache import SnapshotCache, get_ci_cache
from utils.common import merge_links_dedup
from utils.models import LinkInfo


class IssueChecker(URLChecker):
    """
    Issue 场景检查器

    专门用于 GitHub Issue 的链接检查，支持多种事件类型：
    - opened：新 Issue 创建
    - edited：Issue 编辑
    - issue_comment：评论事件
    """

    def __init__(
        self,
        timeout: int = 20,
        cache: SnapshotCache | None = None,
    ):
        """
        初始化 Issue 检查器。

        参数：
            timeout: 网络请求超时时间（秒）
            cache: 快照缓存实例，默认使用 CI 缓存
        """
        super().__init__(timeout, cache or get_ci_cache())

    def analyze(
        self,
        text: str,
        comment_body: str = "",
        history_content: str = "",
        history_source: str = "",
        issue_action: str = "opened",
        issue_user: str = "",
        **kwargs,
    ) -> dict:
        """
        完整分析 Issue，返回原子化结果。

        参数：
            text: Issue Body 内容
            comment_body: 评论内容（仅 issue_comment 事件）
            history_content: 历史内容（旧 Bot 评论或所有评论）
            history_source: 历史来源 ("old_bot" 或 "")
            issue_action: 事件类型 ("opened" / "edited" / "comment")
            issue_user: Issue 作者用户名

        返回：
            原子化结果字典，包含所有标志和评论内容
        """
        # 合并链接
        links = self._merge_links(text, comment_body, history_content, history_source)

        # 初始化结果
        result = self._init_result()

        # Step 1: 检查是否缺少快照（唯一致命）
        if not self.has_snapshot(links):
            result["has_snapshot"] = "false"
            result["warning_type"] = "missing"
            result["comment_missing"] = build_warning_missing(issue_user)
            return result

        # Step 2: 检查不可访问快照链接（非致命）
        unreachable_links = self.get_unreachable_links(links)
        if unreachable_links:
            result["has_unreachable"] = "true"
            result["comment_unreachable"] = build_warning_unreachable(issue_user)

        # Step 3: 网络有效性检查
        net_result = self.check_all_links(links)
        result["network_detail"] = net_result.detail

        # 生成警告评论
        if net_result.fail_urls:
            result["comment_404"] = build_warning_inaccessible(issue_user, net_result.fail_urls)
        if net_result.uncertain_urls:
            result["comment_uncertain"] = build_warning_uncertain(
                issue_user,
                net_result.uncertain_urls,
                net_result.uncertain_code,
                net_result.uncertain_detail,
            )

        # Step 4: 链接转换 + Bot 评论生成
        if net_result.good_links:
            snapshots, gkd_links = self.parse_all_snapshots(net_result.good_links)
            if snapshots or gkd_links:
                result["has_convertible"] = "true"
                comment_body_text = build_bot_comment(snapshots, gkd_links)
                result["comment_bot"] = "<!-- gkd-bot-comment -->\n" + comment_body_text

        # 更新 network_status
        result["network_status"] = self._get_network_status(net_result)

        # Step 5: 恢复判断
        has_valid_snapshot = any(lnk.kind in ("gkd", "github_attachment") for lnk in net_result.good_links)
        if issue_action in ("edited", "comment") and has_valid_snapshot:
            result["warning_type"] = "recovery"
            result["comment_recovery"] = build_recovery_comment(issue_user)

        # 保存缓存
        if self.cache and self.cache.updated:
            self.cache.save()

        return result

    def _merge_links(
        self,
        body: str,
        comment_body: str,
        history_content: str,
        history_source: str,
    ) -> list[LinkInfo]:
        """
        合并链接（处理评论事件的历史链接）。
        """
        if comment_body:
            # 提取新评论中的链接
            new_links = self.extract_links(comment_body)

            # 提取历史链接
            history_links: list[LinkInfo] = []
            if history_content:
                if history_source == "old_bot":
                    history_links = extract_links_from_bot_comment(history_content)
                else:
                    history_links = self.extract_links(history_content)

            # 合并去重
            return merge_links_dedup(history_links, new_links)
        else:
            return self.extract_links(body)

    def _init_result(self) -> dict:
        """初始化结果字典"""
        return {
            "has_snapshot": "true",
            "has_unreachable": "false",
            "network_status": "skipped",
            "network_detail": "",
            "has_convertible": "false",
            "warning_type": "",
            "comment_missing": "",
            "comment_unreachable": "",
            "comment_404": "",
            "comment_uncertain": "",
            "comment_recovery": "",
            "comment_bot": "",
        }

    def _get_network_status(self, net_result: NetworkCheckResult) -> str:
        """根据网络检查结果确定最终状态"""
        if net_result.fail_urls:
            return "404"
        elif net_result.uncertain_urls:
            return "uncertain"
        elif net_result.good_links:
            return "ok"
        else:
            return net_result.status if net_result.status != "skipped" else "404"


# ── 便捷函数 ──


def check_issue(
    body: str,
    comment_body: str = "",
    history_content: str = "",
    history_source: str = "",
    issue_action: str = "opened",
    issue_user: str = "",
    timeout: int = 20,
) -> dict:
    """
    便捷函数：检查 Issue 链接。

    参数：
        body: Issue Body 内容
        comment_body: 评论内容
        history_content: 历史内容
        history_source: 历史来源
        issue_action: 事件类型
        issue_user: Issue 作者
        timeout: 超时时间

    返回：
        原子化结果字典
    """
    checker = IssueChecker(timeout=timeout)
    return checker.analyze(
        text=body,
        comment_body=comment_body,
        history_content=history_content,
        history_source=history_source,
        issue_action=issue_action,
        issue_user=issue_user,
    )
