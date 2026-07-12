"""
统一数据结构定义模块

集中定义所有模块共享的数据结构（dataclass）。
各模块从本模块导入，避免重复定义，确保数据结构一致性。
"""

from dataclasses import dataclass, field

# ── 链接相关数据结构 ──


@dataclass
class LinkInfo:
    """
    提取出的单条链接信息

    由 extractor.py 的 extract_links() 函数返回。
    """

    url: str  # 完整 URL
    kind: str  # 分类：gkd / github_attachment / unreachable_snapshot
    display_text: str  # Markdown 链接的显示文字，纯文本时为空


@dataclass
class NetworkResult:
    """
    网络请求检查结果

    由 checker.py 的 check_network_links() 函数返回。
    """

    status: str  # "ok" / "404" / "uncertain" / "skipped"
    status_code: int = 0  # HTTP 状态码
    detail: str = ""  # 错误详情（供折叠展示）


@dataclass
class ConvertedLink:
    """
    转换后的链接信息

    由 converter.py 的 convert_github_attachments() 函数返回。
    """

    original_url: str  # 原始 GitHub 附件 URL
    converted_url: str  # 转换后的 GKD 代理 URL
    display_text: str  # 原始 Markdown 链接的显示文字
    app_name: str  # 从文件名提取的 App 名称（不匹配时为空）
    activity_name: str  # 从文件名提取的 Activity 名称（不匹配时为空）
    timestamp: str  # 从文件名提取的时间戳（不匹配时为空）


# ── 快照相关数据结构 ──


@dataclass
class SnapshotInfo:
    """
    快照解析后的结构化信息

    由 snapshot_parser.py 的 download_and_parse() 函数返回。
    包含应用信息、界面信息、设备信息、节点统计等完整快照数据。
    """

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


# ── 检查报告数据结构 ──


@dataclass
class LinkCheckResult:
    """
    单个链接的检查结果

    包含原始链接信息、网络检查结果、转换后的 URL、解析的快照信息。
    """

    link: LinkInfo
    network_result: NetworkResult
    converted_url: str = ""
    snapshot: SnapshotInfo | None = None


@dataclass
class CheckReport:
    """
    链接检查报告

    由 link_checker.py 的 LinkChecker.extract_and_check() 方法返回。
    包含统计信息和详细的检查结果列表。
    """

    total_links: int  # 总链接数
    ok_count: int  # 可访问链接数
    fail_count: int  # 404 失败链接数
    uncertain_count: int  # 不确定链接数（403/5xx）
    links: list = field(default_factory=list)  # list[LinkCheckResult]
