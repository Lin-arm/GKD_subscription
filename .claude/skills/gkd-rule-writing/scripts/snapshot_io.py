"""GKD 快照读写的公共函数：从 zip / 目录 / json 读取快照，以及把修改后的内容写回 zip。"""

from __future__ import annotations

import json
import zipfile
from pathlib import Path


def load_snapshot(path: Path) -> tuple[dict, str]:
    """读取快照，返回 (快照 dict, 来源描述)。支持 .zip、解压后的目录、.json 文件。"""
    if path.is_dir():
        json_file = next(path.glob("*.json"), None)
        if json_file is None:
            raise FileNotFoundError(f"{path} 下没有 json 文件")
        return json.loads(json_file.read_text("utf-8")), str(json_file)
    if path.suffix == ".zip":
        with zipfile.ZipFile(path) as z:
            name = next((n for n in z.namelist() if n.endswith(".json")), None)
            if name is None:
                raise FileNotFoundError(f"{path} 内没有 json 文件")
            return json.loads(z.read(name).decode("utf-8")), f"{path}!{name}"
    return json.loads(path.read_text("utf-8")), str(path)


def read_zip(path: Path) -> tuple[list[zipfile.ZipInfo], dict[str, bytes]]:
    """读取 zip 的全部条目，保留原始 ZipInfo 以便原样写回。"""
    with zipfile.ZipFile(path) as z:
        infos = z.infolist()
        return infos, {i.filename: z.read(i.filename) for i in infos}


def write_zip(path: Path, infos: list[zipfile.ZipInfo], data: dict[str, bytes]) -> None:
    """按原始条目顺序和元信息把内容写回 zip。"""
    with zipfile.ZipFile(path, "w") as z:
        for info in infos:
            z.writestr(info, data[info.filename])
