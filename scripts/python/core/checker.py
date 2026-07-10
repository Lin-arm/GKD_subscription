"""
链接检查模块

负责两类检查：
1. 不可访问快照链接检查：识别 i.gkd.li/snapshot/ 链接
2. 网络有效性检查：对链接发起 HTTP 请求，验证可访问性
   - GitHub 附件链接直接检查
   - GKD 分享链接先转换为 GH 附件 URL 再检查

本模块只返回检查结果，不做任何业务判断（如是否关闭 Issue）。
"""

import re

from utils.models import LinkInfo, NetworkResult


# ── GKD 链接 → GH 附件 URL 转换 ──

# 从 GKD 分享链接中提取数字 ID
_RE_GKD_ID = re.compile(r"https://i\.gkd\.li/i/(\d+)")

# GH 附件 URL 模板：{id} 为 GKD 链接中的数字，file.zip 为固定占位符
_GH_ATTACHMENT_TEMPLATE = "https://github.com/user-attachments/files/{id}/file.zip"


def gkd_to_gh_attachment_url(gkd_url: str) -> str | None:
    """
    将 GKD 分享链接转换为 GitHub 附件 URL，用于网络可访问性检查。

    例如：https://i.gkd.li/i/29722723 → https://github.com/user-attachments/files/29722723/file.zip

    返回 None 表示 URL 不符合 GKD 分享链接格式。
    """
    match = _RE_GKD_ID.match(gkd_url)
    if not match:
        return None
    return _GH_ATTACHMENT_TEMPLATE.format(id=match.group(1))


# ── 不可访问快照链接检查 ──


def check_unreachable_links(links: list[LinkInfo]) -> list[LinkInfo]:
    """
    筛选出所有 i.gkd.li/snapshot/ 类型的不可访问链接。

    此类链接仅作者可访问，他人无法打开。
    """
    return [lnk for lnk in links if lnk.kind == "unreachable_snapshot"]


# ── 网络有效性检查 ──


def check_network_links(url: str, timeout: int = 20) -> NetworkResult:
    """
    对单个 URL 发起网络请求，验证其可访问性。

    请求策略（按优先级）：
    1. HEAD 请求 —— 最快，只获取响应头
    2. GET 请求 + Range 头 —— 只请求前 1 字节，兼容不支持 HEAD 的服务器

    返回值：
    - status="ok"：链接可正常访问
    - status="404"：链接返回 404，确认不可访问
    - status="uncertain"：返回 403/5xx 等不确定状态码
    """
    import urllib.request
    import urllib.error

    result = _try_head_request(url, timeout)
    if result is not None:
        return result

    return _try_get_range_request(url, timeout)


def _try_head_request(url: str, timeout: int) -> NetworkResult | None:
    """
    发起 HEAD 请求。

    返回 None 表示服务器不支持 HEAD（如返回 405），
    需要回退到 GET 请求。
    """
    import urllib.request
    import urllib.error

    try:
        req = urllib.request.Request(url, method="HEAD")
        req.add_header("User-Agent", "GKD-Issue-Checker/1.0")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return NetworkResult(status="ok", status_code=resp.status)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return NetworkResult(status="404", status_code=404)
        if e.code == 405:
            return None
        if e.code == 403:
            return NetworkResult(
                status="uncertain",
                status_code=403,
                detail="HTTP 403 Forbidden — 服务器拒绝访问，可能是权限问题",
            )
        if 500 <= e.code < 600:
            return NetworkResult(
                status="uncertain",
                status_code=e.code,
                detail=f"HTTP {e.code} — 服务器内部错误，可能是临时问题",
            )
        return NetworkResult(
            status="uncertain",
            status_code=e.code,
            detail=f"HTTP {e.code} {e.reason}",
        )
    except Exception as e:
        return NetworkResult(
            status="uncertain",
            status_code=0,
            detail=f"请求异常: {type(e).__name__}: {e}",
        )


def _try_get_range_request(url: str, timeout: int) -> NetworkResult:
    """
    发起 GET 请求 + Range 头（只请求前 1 字节）。

    用于兼容不支持 HEAD 方法的服务器。
    """
    import urllib.request
    import urllib.error

    try:
        req = urllib.request.Request(url, method="GET")
        req.add_header("User-Agent", "GKD-Issue-Checker/1.0")
        req.add_header("Range", "bytes=0-0")
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            code = resp.status
            if code in (200, 206):
                return NetworkResult(status="ok", status_code=code)
            return NetworkResult(
                status="uncertain",
                status_code=code,
                detail=f"GET 请求返回非预期状态码: {code}",
            )
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return NetworkResult(status="404", status_code=404)
        if e.code == 403:
            return NetworkResult(
                status="uncertain",
                status_code=403,
                detail="HTTP 403 Forbidden — 服务器拒绝访问，可能是权限问题",
            )
        if 500 <= e.code < 600:
            return NetworkResult(
                status="uncertain",
                status_code=e.code,
                detail=f"HTTP {e.code} — 服务器内部错误，可能是临时问题",
            )
        return NetworkResult(
            status="uncertain",
            status_code=e.code,
            detail=f"HTTP {e.code} {e.reason}",
        )
    except Exception as e:
        return NetworkResult(
            status="uncertain",
            status_code=0,
            detail=f"请求异常: {type(e).__name__}: {e}",
        )