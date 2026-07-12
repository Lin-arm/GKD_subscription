"""
公共工具模块

提供 GITHUB_OUTPUT 写入等共享工具函数，供其他模块调用。
本模块不包含任何业务逻辑。
"""

import os

# ── 本工作流管理的所有标签 ──

MANAGED_LABELS = [
    "缺失快照(missing-snapshot)",
    "需补充链接(need-supplement-link)",
    "链接无法访问(inaccessible-link)",
]


def write_output(key: str, value: str):
    """
    向 GITHUB_OUTPUT 写入一个键值对。

    使用 heredoc 语法支持多行值，确保 Markdown 内容正确传递。
    """
    with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
        f.write(f"{key}<<GKD_OUTPUT_EOF\n{value}\nGKD_OUTPUT_EOF\n")
