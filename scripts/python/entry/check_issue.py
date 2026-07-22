"""
Issue 快照链接检查主入口

职责：协调各模块执行分析流程，将原子化结果输出到 GITHUB_OUTPUT。
不直接操作 GitHub API —— 所有 GitHub 操作由 YAML 工作流完成。

流程：
  1. 提取链接 → 判断是否缺少快照（唯一致命，关闭 Issue）
  2. 检查不可访问快照链接（i.gkd.li/snapshot/，非致命）
  3. 网络有效性检查（GKD 链接先转 GH 附件 URL 再检查 / GH 附件直接检查）
     - 404 非致命，打标签+评论但不关闭
     - 403/5xx 不确定，打标签+评论
  4. 链接转换 + Bot 评论生成（仅当含有 GitHub 附件链接时）
  5. 编辑/评论恢复判断

输出变量（原子化标志，供 YAML 多 Job 条件判断）：
  - has_snapshot      : 是否包含任何快照链接
  - has_unreachable   : 是否包含不可访问快照
  - network_status    : 网络检查结果 (ok / 404 / uncertain / skipped)
  - network_detail    : 网络错误详情
  - has_convertible   : 是否有可转换的 GitHub 附件
  - warning_type      : 警告类型 (missing / unreachable / inaccessible / uncertain / recovery / "")
  - comment_missing   : 缺失快照评论（含 <!-- gkd-warning-missing --> 标记）
  - comment_unreachable : 不可访问快照评论（含 <!-- gkd-warning-unreachable --> 标记）
  - comment_404       : 链接404评论（含 <!-- gkd-warning-404 --> 标记）
  - comment_uncertain : 网络不确定评论（含 <!-- gkd-warning-uncertain --> 标记）
  - comment_recovery  : 恢复评论（含 <!-- gkd-warning-recovery --> 标记）
  - comment_bot       : Bot 评论（含 <!-- gkd-bot-comment --> 标记）
"""

import os
import sys
from pathlib import Path

# 自动设置模块搜索路径，确保能在任意目录下执行
_script_dir = Path(__file__).parent.parent  # 指向 scripts/python 目录
if str(_script_dir) not in sys.path:
    sys.path.insert(0, str(_script_dir))

from api.issue_checker import IssueChecker  # noqa: E402
from utils.utils import write_output  # noqa: E402


def main():
    """主函数：读取环境变量，执行分析，输出结果。"""
    # 读取环境变量
    body = os.environ.get("ISSUE_BODY", "") or ""
    comment_body = os.environ.get("ISSUE_COMMENT_BODY", "") or ""
    issue_user = os.environ.get("ISSUE_USER", "")
    issue_action = os.environ.get("ISSUE_ACTION", "")
    history_content = os.environ.get("HISTORY_CONTENT", "") or ""
    history_source = os.environ.get("HISTORY_SOURCE", "") or ""

    # 创建检查器并执行分析
    checker = IssueChecker()
    result = checker.analyze(
        text=body,
        comment_body=comment_body,
        history_content=history_content,
        history_source=history_source,
        issue_action=issue_action,
        issue_user=issue_user,
    )

    # 输出结果到 GITHUB_OUTPUT
    _output(**result)


def _output(**kwargs):
    """将所有分析结果写入 GITHUB_OUTPUT。"""
    for key, value in kwargs.items():
        write_output(key, value)


if __name__ == "__main__":
    main()
