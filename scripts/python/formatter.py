"""
评论格式化模块

负责生成所有 Bot 评论的 Markdown 内容，包括：
- 各类警告评论（缺失快照 / 不可访问快照 / 链接无法访问 / 不确定）
- 编辑/评论恢复评论
- 快照转换 Bot 评论（基于 SnapshotInfo 按 App > Activity 分组）

每类评论使用独立的 HTML 标记，供 YAML 工作流中 find-comment 按场景查找。
本模块只负责内容生成，不负责评论发布（由 YAML 工作流完成）。
"""

from utils.common import GKD_DOMAINS, short_activity_name
from utils.models import SnapshotInfo

# ── 警告评论生成 ──


def build_warning_missing(user: str) -> str:
    """缺失快照时的警告评论（关闭 Issue）"""
    return (
        "<!-- gkd-warning-missing -->\n"
        f"您好 @{user}，由于您没有提供快照链接，此 Issue 已被自动关闭。\n\n"
        "请提供正确的快照链接后重新打开或提交新的 Issue。"
    )


def build_warning_unreachable(user: str) -> str:
    """检测到 GKD snapshot 链接时的提醒评论（不关闭）"""
    domain = GKD_DOMAINS[0] if GKD_DOMAINS else "i.gkd.li"
    return (
        "<!-- gkd-warning-unreachable -->\n"
        f"您好 @{user}，检测到您提供了他人无法访问的快照链接"
        f"（{domain}/snapshot/），请点击查看 "
        "[正确的分享快照方式说明](https://gkd.li/guide/snapshot#share-note) 。"
        "可在下方评论区补充。"
    )


def build_warning_inaccessible(user: str, urls: list[str]) -> str:
    """链接不可访问（404）时的警告评论（不关闭 Issue）"""
    url_list = "\n".join(f"`{url}`" for url in urls)
    return (
        "<!-- gkd-warning-404 -->\n"
        f"您好 @{user}，检测到您提供的快照链接无法访问：\n\n"
        f"{url_list}\n\n"
        "请确认链接正确后在评论区补充有效的快照链接。"
    )


def build_warning_uncertain(user: str, urls: list[str], status_code: int, detail: str) -> str:
    """链接返回不确定状态码时的提醒评论（不关闭，折叠错误详情）"""
    url_list = "\n".join(f"`{url}`" for url in urls)
    return (
        "<!-- gkd-warning-uncertain -->\n"
        f"您好 @{user}，检测到快照链接访问异常（HTTP {status_code}），"
        "暂时无法确认链接是否有效，请人工核查：\n\n"
        f"{url_list}\n\n"
        f"<details>\n<summary>详细错误信息</summary>\n\n```\n{detail}\n```\n</details>"
    )


def build_recovery_comment(user: str) -> str:
    """编辑/评论补充有效链接后检查通过时的恢复评论"""
    return f"<!-- gkd-warning-recovery -->\n✅ 您好 @{user}，快照链接检查已通过，之前的标记已移除。"


# ── Bot 转换评论生成 ──


def build_bot_comment(snapshots: list[SnapshotInfo], gkd_links: list[tuple[str, str]]) -> str:
    """
    生成快照转换 Bot 评论内容。

    主区域：App 标题 + Activity 行（快查/深度/可点击/节点数）+ 链接
    折叠区：App 详细信息表 + 设备信息表

    参数：
    - snapshots：解析成功的 SnapshotInfo 列表（同 Activity 的所有快照都在）
    - gkd_links：无法解析的 GKD 链接列表 [(display_text, converted_url), ...]
    """
    if not snapshots and not gkd_links:
        return ""

    lines: list[str] = []

    # 按 appId 分组，同 appId 下按 activityId 分组
    app_groups, activity_links = _group_by_app(snapshots)

    # 主区域：按 App 输出
    for app_key, app_snapshots in app_groups.items():
        _render_app_section(lines, app_key, app_snapshots, activity_links)

    # GKD 链接（无法下载解析的）
    if gkd_links:
        lines.append("**GKD 链接**")
        link_parts = [f"[{dt}]({url})" for dt, url in gkd_links]
        lines.append(" · ".join(link_parts))
        lines.append("")

    # 折叠区：详细信息
    detail_lines = _render_detail_section(snapshots)
    if detail_lines:
        lines.append("<details>")
        lines.append("<summary>详细信息</summary>")
        lines.append("")
        lines.extend(detail_lines)
        lines.append("</details>")

    return "\n".join(lines)


# ── 分组与去重 ──


def _group_by_app(
    snapshots: list[SnapshotInfo],
) -> tuple[dict[str, list[SnapshotInfo]], dict[str, list[tuple[str, str]]]]:
    """
    按 appId 分组，同 appId 下按 activityId 分组。

    返回：
    - groups：有序字典，key = "appName `appId` versionName"，value = 该 App 的代表快照列表（每个 Activity 一个）
    - activity_links：字典，key = "appId|activityId"，value = 该 Activity 的所有快照链接 [(snapshot_id, converted_url), ...]
    """
    from collections import OrderedDict

    groups: dict[str, list[SnapshotInfo]] = OrderedDict()
    activity_links: dict[str, list[tuple[str, str]]] = {}
    seen_activities: set[str] = set()

    for snap in snapshots:
        app_key = f"{snap.app_name} `{snap.app_id}` {snap.app_version_name}"
        groups.setdefault(app_key, [])

        act_key = f"{snap.app_id}|{snap.activity_id}"
        activity_links.setdefault(act_key, [])

        # 收集该 Activity 的所有快照链接
        link_display = snap.snapshot_id or snap.original_url.split("/")[-1]
        link_url = snap.converted_url or snap.original_url
        activity_links[act_key].append((link_display, link_url))

        # 每个 Activity 只保留第一个快照作为代表（用于显示统计信息）
        if act_key not in seen_activities:
            seen_activities.add(act_key)
            groups[app_key].append(snap)

    return groups, activity_links


# ── 主区域渲染 ──


def _render_app_section(
    lines: list[str], app_key: str, snapshots: list[SnapshotInfo], activity_links: dict[str, list[tuple[str, str]]]
):
    """
    渲染单个 App 的主区域内容。

    格式：
    ## AppName `appId` versionName
    device_model · Android release · GKD version

    **Activity** — 快查 ID:x Text:x · 深度x · 可点击x · xxx节点
    [id1](url) · [id2](url)
    """
    if not snapshots:
        return

    # App 标题（含旧版快照标记）
    is_legacy = any(s.is_legacy_snapshot for s in snapshots)
    legacy_tag = " `⚠️旧版快照`" if is_legacy else ""
    lines.append(f"## {app_key}{legacy_tag}")

    # App 副标题：设备 + Android + GKD（取第一个快照的设备信息）
    first = snapshots[0]
    subtitle_parts = []
    # if first.device_model:
    #     subtitle_parts.append(first.device_model)
    if first.device_release:
        subtitle_parts.append(f"Android {first.device_release}")
    if first.gkd_version_name:
        subtitle_parts.append(f"GKD {first.gkd_version_name}")
    if subtitle_parts:
        lines.append(" · ".join(subtitle_parts))
    lines.append("")

    # 按 Activity 渲染
    seen_activities: set[str] = set()
    for snap in snapshots:
        if snap.activity_id in seen_activities:
            continue
        seen_activities.add(snap.activity_id)

        # 获取该 Activity 的所有快照链接
        act_key = f"{snap.app_id}|{snap.activity_id}"
        links = activity_links.get(act_key, [])

        _render_activity_line(lines, snap, links)


def _render_activity_line(lines: list[str], snap: SnapshotInfo, links: list[tuple[str, str]]):
    """
    渲染单个 Activity 行。

    格式：**Activity** — 快查 ID:x Text:x · 深度x · 可点击x · xxx节点
    [id1](url) · [id2](url)
    """
    # Activity 名称取最后一段（类名简写）
    act_display = short_activity_name(snap.activity_id)

    # 统计信息已折叠到详细信息区域
    lines.append(f"**{act_display}**")

    # 链接行（该 Activity 的所有快照链接）
    if links:
        link_parts = [f"[{dt}]({url})" for dt, url in links]
        lines.append(" · ".join(link_parts))
    lines.append("")


# ── 折叠区渲染 ──


def _render_detail_section(snapshots: list[SnapshotInfo]) -> list[str]:
    """
    渲染折叠区内容。

    包含：
    - 按 App 分组的详细信息表（可见/分辨率/方向/APP版本代码/快查ID&Text/深度/可点击/节点数/GKD/userId）
    - 设备信息表（去重）
    """
    if not snapshots:
        return []

    lines: list[str] = []

    # 按 App 分组渲染详细信息表
    app_groups: dict[str, list[SnapshotInfo]] = {}
    for snap in snapshots:
        app_key = f"{snap.app_name} `{snap.app_id}`"
        app_groups.setdefault(app_key, []).append(snap)

    for app_key, app_snaps in app_groups.items():
        is_legacy = any(s.is_legacy_snapshot for s in app_snaps)
        legacy_tag = " `⚠️旧版快照`" if is_legacy else ""
        lines.append(f"**{app_key}{legacy_tag}**")
        lines.append("")
        lines.append(
            "| Activity | 可见 | 分辨率 | 方向 | APP版本代码 | 快查ID/Text | 深度 | 可点击 | 节点数 | GKD | userId |"
        )
        lines.append(
            "|----------|------|--------|------|-----------|-------------|------|-------|-------|-----|--------|"
        )
        for snap in app_snaps:
            orientation = "横屏" if snap.is_landscape else "竖屏"
            resolution = f"{snap.screen_width}×{snap.screen_height}"
            gkd_info = f"{snap.gkd_version_name} ({snap.gkd_version_code})" if snap.gkd_version_name else ""
            act_display = short_activity_name(snap.activity_id)
            lines.append(
                f"| {act_display} | {snap.visible_nodes} | {resolution} | {orientation} "
                f"| {snap.app_version_code} | {snap.id_qf_count}/{snap.text_qf_count} | {snap.max_depth} "
                f"| {snap.clickable_nodes} | {snap.total_nodes} | {gkd_info} | {snap.gkd_user_id} |"
            )
        lines.append("")

    # 设备信息表（去重）
    devices = _deduplicate_devices(snapshots)
    if len(devices) >= 1:
        lines.append("**设备信息**")
        lines.append("")
        lines.append("| 代号 | 型号 | 制造商 | 品牌 | SDK | Android |")
        lines.append("|------|------|--------|------|-----|---------|")
        for dev in devices:
            lines.append(
                f"| {dev['code']} | {dev['model']} | {dev['manufacturer']} "
                f"| {dev['brand']} | {dev['sdk']} | {dev['release']} |"
            )
        lines.append("")

    return lines


def _deduplicate_devices(snapshots: list[SnapshotInfo]) -> list[dict]:
    """
    设备信息去重。

    按 (device_code, device_model) 组合去重。
    """
    seen: set[tuple[str, str]] = set()
    result: list[dict] = []

    for snap in snapshots:
        key = (snap.device_code, snap.device_model)
        if key in seen:
            continue
        seen.add(key)
        result.append(
            {
                "code": snap.device_code,
                "model": snap.device_model,
                "manufacturer": snap.device_manufacturer,
                "brand": snap.device_brand,
                "sdk": str(snap.device_sdk),
                "release": snap.device_release,
            }
        )

    return result
