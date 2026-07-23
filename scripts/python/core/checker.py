"""
链接检查模块

负责两类检查：
1. 不可访问快照链接检查：识别 i.gkd.li/snapshot/ 链接
2. 网络有效性检查：对链接发起 HTTP 请求，验证可访问性
   - GitHub 附件链接直接检查
   - GKD 分享链接先转换为 GH 附件 URL 再检查

本模块只返回检查结果，不做任何业务判断（如是否关闭 Issue）。
"""

from typing import TYPE_CHECKING

import httpx

if TYPE_CHECKING:
    from utils.models import NetworkResult

# ── GKD 链接 → GH 附件 URL 转换 ──

from utils.common import gkd_regex  # noqa: E402 — 放在顶部导入之后，避免循环依赖

# 从 GKD 分享链接中提取数字 ID
_RE_GKD_ID = gkd_regex(r"/i/(\d+)")

# 从 GKD 代理链接中提取真实 GitHub 附件 URL
_RE_GKD_PROXY = gkd_regex(r"/i\?url=(https://github\.com/user-attachments/files/[^\s]+)")

# GH 附件 URL 模板：{id} 为 GKD 链接中的数字，file.zip 为固定占位符
_GH_ATTACHMENT_TEMPLATE = "https://github.com/user-attachments/files/{id}/file.zip"


def gkd_to_gh_attachment_url(gkd_url: str) -> str | None:
    """
    将 GKD 分享链接转换为 GitHub 附件 URL，用于网络可访问性检查。

    支持两种格式：
    1. 标准 GKD 分享链接：https://i.gkd.li/i/29722723 → https://github.com/user-attachments/files/29722723/file.zip
    2. GKD 代理链接：https://i.gkd.li/i?url=https://github.com/user-attachments/files/... → 提取真实 GitHub 附件 URL

    返回 None 表示 URL 不符合已知格式。
    """
    gkd_url = gkd_url.strip()

    # 优先尝试代理链接格式
    proxy_match = _RE_GKD_PROXY.search(gkd_url)
    if proxy_match:
        return proxy_match.group(1)

    # 标准数字 ID 格式
    match = _RE_GKD_ID.search(gkd_url)
    if not match:
        return None
    return _GH_ATTACHMENT_TEMPLATE.format(id=match.group(1))


# ── 不可访问快照链接检查 ──


def check_unreachable_links(links: list) -> list:
    """
    筛选出所有 i.gkd.li/snapshot/ 类型的不可访问链接。

    此类链接仅作者可访问，他人无法打开。
    """
    return [lnk for lnk in links if lnk.kind == "unreachable_snapshot"]


# ── HTTP 异常处理 ──


def _handle_http_error(e: httpx.HTTPError, url: str) -> "NetworkResult | None":
    """
    处理 HTTP 异常，返回对应的 NetworkResult。

    返回 None 表示需要回退到其他请求方式（如 HEAD → GET）。
    """
    from utils.models import NetworkResult

    if isinstance(e, httpx.HTTPStatusError):
        code = e.response.status_code

        if code == 404:
            return NetworkResult(status="404", status_code=404)

        if code == 405:
            # HEAD 不支持，需要回退到 GET
            return None

        if code == 403:
            return NetworkResult(
                status="uncertain",
                status_code=403,
                detail="HTTP 403 Forbidden — 服务器拒绝访问，可能是权限问题",
            )

        if 500 <= code < 600:
            return NetworkResult(
                status="uncertain",
                status_code=code,
                detail=f"HTTP {code} — 服务器内部错误，可能是临时问题",
            )

        return NetworkResult(
            status="uncertain",
            status_code=code,
            detail=f"HTTP {code} {e.response.reason_phrase}",
        )

    # 其他异常（连接错误、超时等）
    return NetworkResult(
        status="uncertain",
        status_code=0,
        detail=f"请求异常: {type(e).__name__}: {e}",
    )


# ── 网络有效性检查 ──


def check_network_links(url: str, timeout: int = 20) -> "NetworkResult":
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
    result = _try_head_request(url, timeout)
    if result is not None:
        return result

    return _try_get_range_request(url, timeout)


def _try_head_request(url: str, timeout: int) -> "NetworkResult | None":
    """
    发起 HEAD 请求。

    返回 None 表示服务器不支持 HEAD（如返回 405），
    需要回退到 GET 请求。
    """
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            resp = client.head(url, headers={"User-Agent": "GKD-Issue-Checker/1.0"})
            resp.raise_for_status()
            from utils.models import NetworkResult

            return NetworkResult(status="ok", status_code=resp.status_code)
    except httpx.HTTPError as e:
        return _handle_http_error(e, url)
    except Exception as e:
        from utils.models import NetworkResult

        return NetworkResult(
            status="uncertain",
            status_code=0,
            detail=f"请求异常: {type(e).__name__}: {e}",
        )


def _try_get_range_request(url: str, timeout: int) -> "NetworkResult":
    """
    发起 GET 请求 + Range 头（只请求前 1 字节）。

    用于兼容不支持 HEAD 方法的服务器。
    """
    from utils.models import NetworkResult

    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            resp = client.get(
                url,
                headers={
                    "User-Agent": "GKD-Issue-Checker/1.0",
                    "Range": "bytes=0-0",
                },
            )

            # 处理 Range 请求的响应
            if resp.status_code in (200, 206):
                return NetworkResult(status="ok", status_code=resp.status_code)

            return NetworkResult(
                status="uncertain",
                status_code=resp.status_code,
                detail=f"GET 请求返回非预期状态码: {resp.status_code}",
            )
    except httpx.HTTPError as e:
        result = _handle_http_error(e, url)
        if result is not None:
            return result
        # 如果返回 None（405），返回错误结果
        return NetworkResult(
            status="uncertain",
            status_code=0,
            detail="GET 请求失败",
        )
    except Exception as e:
        return NetworkResult(
            status="uncertain",
            status_code=0,
            detail=f"请求异常: {type(e).__name__}: {e}",
        )


# ── 并发检查（新增） ──


def check_urls_concurrent(
    urls: list[str],
    timeout: int = 20,
    max_workers: int = 10,
) -> list["NetworkResult"]:
    """
    并发检查多个 URL 的可访问性。

    使用线程池并发执行，提高检查效率。

    参数：
        urls: URL 列表
        timeout: 每个请求的超时时间（秒）
        max_workers: 最大并发数

    返回：
        NetworkResult 列表，与输入 URL 顺序对应
    """
    from concurrent.futures import ThreadPoolExecutor, as_completed

    from utils.models import NetworkResult

    def check_one(url: str) -> NetworkResult:
        return check_network_links(url, timeout)

    results: list[NetworkResult | None] = [None] * len(urls)

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        future_to_idx = {executor.submit(check_one, url): i for i, url in enumerate(urls)}

        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            try:
                results[idx] = future.result()
            except Exception as e:
                results[idx] = NetworkResult(
                    status="uncertain",
                    status_code=0,
                    detail=f"并发检查异常: {type(e).__name__}: {e}",
                )

    return results  # type: ignore
