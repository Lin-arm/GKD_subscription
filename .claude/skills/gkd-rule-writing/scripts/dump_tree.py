"""把 GKD 快照导出为缩进的节点树文本，便于阅读和设计选择器。

用法：
    python dump_tree.py <快照.zip | 解压目录 | .json> [...] [-o 输出目录]

每行格式：#节点id 类名 vid=.. text=.. desc=.. [C=可点击] [INV=不可见] [left,top,right,bottom] cc=子节点数 i=index
不指定 -o 时直接打印到标准输出。
"""

from __future__ import annotations

import argparse
import io
import sys
from pathlib import Path

from snapshot_io import load_snapshot


def format_node(node: dict) -> str:
    """把单个节点格式化为一行文本（不含缩进）。"""
    a = node["attr"]
    parts = [f"#{node['id']}", (a.get("name") or "").split(".")[-1]]
    for key in ("vid", "text", "desc"):
        if a.get(key):
            parts.append(f"{key}={a[key]!r}")
    if a.get("clickable"):
        parts.append("C")
    if not a.get("visibleToUser"):
        parts.append("INV")
    parts.append(
        f"[{a.get('left')},{a.get('top')},{a.get('right')},{a.get('bottom')}] cc={a.get('childCount')} i={a.get('index')}"
    )
    return " ".join(parts)


def dump(snapshot: dict) -> str:
    """把整个快照导出为缩进树文本，第一行是快照概要信息。"""
    nodes = snapshot["nodes"]
    children: dict[int, list[dict]] = {}
    for n in nodes:
        children.setdefault(n.get("pid", -1), []).append(n)
    header = (
        f"activity={snapshot.get('activityId')} id={snapshot.get('id')} "
        f"screen={snapshot.get('screenWidth')}x{snapshot.get('screenHeight')} nodes={len(nodes)}"
    )
    lines = [header]

    # 用显式栈代替递归，避免极深节点树触发递归上限
    stack = [(n, 0) for n in reversed(children.get(-1, []))]
    while stack:
        node, depth = stack.pop()
        lines.append("  " * depth + format_node(node))
        stack.extend((c, depth + 1) for c in reversed(children.get(node["id"], [])))
    return "\n".join(lines)


def main() -> None:
    """命令行入口。"""
    parser = argparse.ArgumentParser(description="导出 GKD 快照节点树")
    parser.add_argument(
        "paths", nargs="+", type=Path, help="快照 zip / 解压目录 / json"
    )
    parser.add_argument(
        "-o", "--out", type=Path, help="输出目录，每个快照写一个 <id>.tree.txt"
    )
    args = parser.parse_args()

    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    for path in args.paths:
        snapshot, source = load_snapshot(path)
        text = dump(snapshot)
        if args.out:
            args.out.mkdir(parents=True, exist_ok=True)
            out = args.out / f"{snapshot.get('id')}.tree.txt"
            out.write_text(text, encoding="utf-8")
            print(f"{source} -> {out}")
        else:
            print(f"===== {source}")
            print(text)


if __name__ == "__main__":
    main()
