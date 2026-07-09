"""
快照解析模块

负责下载 zip 压缩包、提取 snapshot.json、解析为结构化数据。
本模块只负责数据解析，不负责评论格式化（由 formatter.py 处理）。

解析策略：
- 下载 zip 到内存，不解压到磁盘
- 从 zip 中查找 snapshot.json（兼容不同目录层级）
- 兼容精简模式（顶层字段）和完整模式（appInfo/gkdAppInfo 对象）
- 缺失字段使用合理默认值
"""

import io
import json
import zipfile
from dataclasses import dataclass

import urllib.request
import urllib.error


# ── 数据结构 ──


@dataclass
class SnapshotInfo:
    """快照解析后的结构化信息"""

    # 应用信息
    app_name: str
    app_id: str
    app_version_name: str
    app_version_code: str

    # 界面信息
    activity_id: str
    snapshot_id: str

    # 屏幕信息
    screen_width: int
    screen_height: int
    is_landscape: bool

    # GKD 信息
    gkd_version_name: str
    gkd_version_code: str
    gkd_user_id: str

    # 设备信息
    device_code: str
    device_model: str
    device_manufacturer: str
    device_brand: str
    device_sdk: int
    device_release: str

    # 节点统计
    total_nodes: int
    visible_nodes: int
    clickable_nodes: int
    max_depth: int
    id_qf_count: int
    text_qf_count: int

    # 链接
    original_url: str
    converted_url: str


# ── 下载与解析 ──


def download_and_parse(url: str, converted_url: str = "", timeout: int = 30) -> SnapshotInfo | None:
    """
    下载 zip 并解析快照信息。

    参数：
    - url：zip 文件的下载地址
    - converted_url：转换后的 GKD 代理链接（用于 Bot 评论展示）
    - timeout：下载超时时间（秒）

    返回 SnapshotInfo，下载或解析失败时返回 None。
    """
    zip_data = _download_zip(url, timeout)
    if not zip_data:
        return None

    snapshot_json = _extract_snapshot_json(zip_data)
    if not snapshot_json:
        return None

    return _parse_snapshot(snapshot_json, url, converted_url)


# ── 内部函数 ──


def _download_zip(url: str, timeout: int) -> bytes | None:
    """
    下载 zip 文件到内存。

    返回 zip 的字节数据，失败时返回 None。
    """
    try:
        req = urllib.request.Request(url, method="GET")
        req.add_header("User-Agent", "GKD-Issue-Checker/1.0")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()
    except Exception:
        return None


def _extract_snapshot_json(zip_data: bytes) -> dict | None:
    """
    从 zip 字节数据中提取 snapshot.json 的内容。

    查找 zip 内所有 .json 文件，优先选择名为 snapshot.json 的。
    兼容不同目录层级（根目录或子目录）。
    """
    try:
        with zipfile.ZipFile(io.BytesIO(zip_data)) as zf:
            # 优先查找 snapshot.json
            for name in zf.namelist():
                if name.endswith("snapshot.json"):
                    with zf.open(name) as f:
                        return json.loads(f.read().decode("utf-8"))

            # 回退：查找任意 .json 文件
            for name in zf.namelist():
                if name.endswith(".json"):
                    with zf.open(name) as f:
                        return json.loads(f.read().decode("utf-8"))
    except Exception:
        pass

    return None


def _parse_snapshot(data: dict, original_url: str, converted_url: str) -> SnapshotInfo:
    """
    将 snapshot.json 解析为 SnapshotInfo。

    兼容精简模式（顶层 appName 等字段）和完整模式（appInfo 对象）。
    缺失字段使用合理默认值。
    """
    # 应用信息：优先完整模式 appInfo，回退精简模式顶层字段
    app_info = data.get("appInfo", {}) or {}
    app_name = app_info.get("name") or data.get("appName", "")
    app_version_name = str(app_info.get("versionName") or data.get("appVersionName", ""))
    app_version_code = str(app_info.get("versionCode") or data.get("appVersionCode", ""))

    # GKD 信息：优先 gkdAppInfo，回退顶层字段
    gkd_info = data.get("gkdAppInfo", {}) or {}
    gkd_version_name = str(gkd_info.get("versionName") or data.get("gkdVersionName", ""))
    gkd_version_code = str(gkd_info.get("versionCode") or data.get("gkdVersionCode", ""))
    gkd_user_id = str(gkd_info.get("userId", ""))

    # 设备信息
    device = data.get("device", {}) or {}

    # 节点统计
    nodes = data.get("nodes", []) or []
    total_nodes = len(nodes)
    visible_nodes = 0
    clickable_nodes = 0
    max_depth = 0
    id_qf_count = 0
    text_qf_count = 0

    for node in nodes:
        attr = node.get("attr", {}) or {}

        if attr.get("visibleToUser", False):
            visible_nodes += 1
        if attr.get("clickable", False):
            clickable_nodes += 1

        depth = attr.get("depth", 0)
        if depth > max_depth:
            max_depth = depth

        # idQf / textQf 缺失视为 null，仅 true 时计数
        if node.get("idQf") is True:
            id_qf_count += 1
        if node.get("textQf") is True:
            text_qf_count += 1

    return SnapshotInfo(
        app_name=app_name,
        app_id=data.get("appId", ""),
        app_version_name=app_version_name,
        app_version_code=app_version_code,
        activity_id=data.get("activityId", ""),
        snapshot_id=str(data.get("id", "")),
        screen_width=data.get("screenWidth", 0),
        screen_height=data.get("screenHeight", 0),
        is_landscape=data.get("isLandscape", False),
        gkd_version_name=gkd_version_name,
        gkd_version_code=gkd_version_code,
        gkd_user_id=gkd_user_id,
        device_code=device.get("device", ""),
        device_model=device.get("model", ""),
        device_manufacturer=device.get("manufacturer", ""),
        device_brand=device.get("brand", ""),
        device_sdk=device.get("sdkInt", 0),
        device_release=device.get("release", ""),
        total_nodes=total_nodes,
        visible_nodes=visible_nodes,
        clickable_nodes=clickable_nodes,
        max_depth=max_depth,
        id_qf_count=id_qf_count,
        text_qf_count=text_qf_count,
        original_url=original_url,
        converted_url=converted_url,
    )