"""
链接检查模块

负责三类检查：
1. 本地链接检查：识别 localhost / 127.0.0.1 / file:// 等不可分享链接
2. 不可访问快照链接检查：识别 i.gkd.li/snapshot/ 链接
3. 网络有效性检查：对 GitHub 附件链接发起 HTTP 请求，验证可访问性

本模块只返回检查结果，不做任何业务判断（如是否关闭 Issue）。
"""

from dataclasses import dataclass

from extractor import LinkInfo


# ── 数据结构 ──


@dataclass
class NetworkResult:
    """网络请求检查结果"""

    status: str       # "ok" / "404" / "uncertain"
    status_code: int = 0   # HTTP 状态码
    detail: str = ""       # 错误详情（供折叠展示）


# ── 本地链接检查 ──


def check_local_links(links: list[LinkInfo]) -> list[LinkInfo]:
    """
    筛选出所有本地不可分享链接。

    返回值为空列表时表示没有本地链接。
    """
    return [lnk for lnk in links if lnk.kind == "local"]


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

    # 尝试 HEAD 请求
    result = _try_head_request(url, timeout)
    if result is not None:
        return result

    # HEAD 不被支持，回退到 GET + Range
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