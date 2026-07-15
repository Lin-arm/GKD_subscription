"""
入口脚本模块

提供各种 CI 场景的主入口脚本。
"""

from entry.check_issue import main as check_issue_main

__all__ = ["check_issue_main"]
