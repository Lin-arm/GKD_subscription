"""纯标准库的最小 PNG 读写：只支持 8 位 RGB / RGBA、非隔行扫描（GKD 快照截图即此格式）。

不支持的格式直接抛出 ValueError，避免写出损坏的图片。
"""

from __future__ import annotations

import struct
import zlib
from dataclasses import dataclass

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
# 颜色类型 -> 每像素字节数
CHANNELS = {2: 3, 6: 4}


@dataclass
class Image:
    """解码后的图片：pixels 为逐行拼接的原始像素（无过滤字节）。"""

    width: int
    height: int
    color_type: int
    pixels: bytearray

    @property
    def bpp(self) -> int:
        """每像素字节数。"""
        return CHANNELS[self.color_type]


def _chunks(data: bytes):
    """依次产出 (类型, 数据)。"""
    pos = len(PNG_SIGNATURE)
    while pos < len(data):
        (length,) = struct.unpack(">I", data[pos : pos + 4])
        kind = data[pos + 4 : pos + 8]
        yield kind, data[pos + 8 : pos + 8 + length]
        pos += 12 + length


def _paeth(a: int, b: int, c: int) -> int:
    """PNG Paeth 预测器。"""
    p = a + b - c
    pa, pb, pc = abs(p - a), abs(p - b), abs(p - c)
    if pa <= pb and pa <= pc:
        return a
    return b if pb <= pc else c


def _unfilter_row(ftype: int, row: bytearray, prev: bytearray, bpp: int) -> None:
    """原地还原一行的 PNG 过滤（0 None / 1 Sub / 2 Up / 3 Average / 4 Paeth）。"""
    n = len(row)
    if ftype == 0:
        return
    if ftype == 1:
        for i in range(bpp, n):
            row[i] = (row[i] + row[i - bpp]) & 0xFF
    elif ftype == 2:
        for i in range(n):
            row[i] = (row[i] + prev[i]) & 0xFF
    elif ftype == 3:
        for i in range(n):
            left = row[i - bpp] if i >= bpp else 0
            row[i] = (row[i] + ((left + prev[i]) >> 1)) & 0xFF
    elif ftype == 4:
        for i in range(n):
            if i >= bpp:
                row[i] = (row[i] + _paeth(row[i - bpp], prev[i], prev[i - bpp])) & 0xFF
            else:
                row[i] = (row[i] + prev[i]) & 0xFF
    else:
        raise ValueError(f"未知的 PNG 过滤类型: {ftype}")


def decode(data: bytes) -> Image:
    """解码 PNG 字节为 Image。"""
    if not data.startswith(PNG_SIGNATURE):
        raise ValueError("不是 PNG 文件")
    header = None
    idat = bytearray()
    for kind, body in _chunks(data):
        if kind == b"IHDR":
            header = struct.unpack(">IIBBBBB", body)
        elif kind == b"IDAT":
            idat += body
    if header is None:
        raise ValueError("缺少 IHDR")
    width, height, depth, color_type, _, _, interlace = header
    if depth != 8 or color_type not in CHANNELS or interlace != 0:
        raise ValueError(
            f"不支持的 PNG 格式: bitdepth={depth} colortype={color_type} interlace={interlace}"
        )

    bpp = CHANNELS[color_type]
    stride = width * bpp
    raw = zlib.decompress(bytes(idat))
    pixels = bytearray(stride * height)
    prev = bytearray(stride)
    for y in range(height):
        start = y * (stride + 1)
        row = bytearray(raw[start + 1 : start + 1 + stride])
        _unfilter_row(raw[start], row, prev, bpp)
        pixels[y * stride : (y + 1) * stride] = row
        prev = row
    return Image(width, height, color_type, pixels)


def _chunk(kind: bytes, body: bytes) -> bytes:
    """组装一个带 CRC 的 PNG chunk。"""
    return (
        struct.pack(">I", len(body))
        + kind
        + body
        + struct.pack(">I", zlib.crc32(kind + body) & 0xFFFFFFFF)
    )


def encode(img: Image) -> bytes:
    """把 Image 编码为 PNG 字节（所有行使用过滤类型 0）。"""
    stride = img.width * img.bpp
    raw = bytearray()
    for y in range(img.height):
        raw.append(0)
        raw += img.pixels[y * stride : (y + 1) * stride]
    ihdr = struct.pack(">IIBBBBB", img.width, img.height, 8, img.color_type, 0, 0, 0)
    return (
        PNG_SIGNATURE
        + _chunk(b"IHDR", ihdr)
        + _chunk(b"IDAT", zlib.compress(bytes(raw), 9))
        + _chunk(b"IEND", b"")
    )


def fill_rect(
    img: Image, left: int, top: int, right: int, bottom: int, rgb: tuple[int, int, int]
) -> tuple[int, int, int, int]:
    """用纯色填充矩形（右、下边界不含），坐标会被裁剪到图片范围内，返回实际填充区域。"""
    left, right = max(0, left), min(img.width, right)
    top, bottom = max(0, top), min(img.height, bottom)
    if left >= right or top >= bottom:
        return (left, top, left, top)
    color = bytes(rgb) + (b"\xff" if img.bpp == 4 else b"")
    line = color * (right - left)
    stride = img.width * img.bpp
    for y in range(top, bottom):
        start = y * stride + left * img.bpp
        img.pixels[start : start + len(line)] = line
    return (left, top, right, bottom)
