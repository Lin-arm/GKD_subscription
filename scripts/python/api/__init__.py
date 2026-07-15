"""
高层 API 模块

提供可复用的高层接口，隐藏实现细节。
支持多种 CI 场景（Issues、PR、Commit）。

使用示例：
    from api import IssueChecker, check_issue

    # 使用类
    checker = IssueChecker()
    result = checker.analyze(text=issue_body)

    # 使用便捷函数
    result = check_issue(body=issue_body)
"""

from api.base import NetworkCheckResult, URLChecker
from api.issue_checker import IssueChecker, check_issue

__all__ = [
    "URLChecker",
    "NetworkCheckResult",
    "IssueChecker",
    "check_issue",
]
