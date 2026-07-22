"""
formatter.py 单元测试

测试评论格式化模块的所有函数：
- 警告评论生成（5 个函数）
- Bot 评论生成（build_bot_comment）
"""

import unittest

from formatter import (
    build_bot_comment,
    build_recovery_comment,
    build_warning_inaccessible,
    build_warning_missing,
    build_warning_uncertain,
    build_warning_unreachable,
)
from utils.models import SnapshotInfo


def _make_snapshot(**overrides) -> SnapshotInfo:
    """
    构造 SnapshotInfo 测试对象，未指定的字段使用默认值。

    参数：
        overrides: 覆盖默认值的字段字典
    """
    defaults = {
        "app_name": "测试应用",
        "app_id": "com.test.app",
        "app_version_name": "1.0.0",
        "app_version_code": "1",
        "activity_id": "com.test.app.MainActivity",
        "snapshot_id": "1783704841971",
        "screen_width": 1080,
        "screen_height": 2400,
        "is_landscape": False,
        "gkd_version_name": "1.12.1",
        "gkd_version_code": "92",
        "gkd_user_id": "0",
        "device_code": "test123",
        "device_model": "TEST 10",
        "device_manufacturer": "test",
        "device_brand": "test",
        "device_sdk": 34,
        "device_release": "14",
        "total_nodes": 20,
        "visible_nodes": 15,
        "clickable_nodes": 3,
        "max_depth": 10,
        "id_qf_count": 2,
        "text_qf_count": 1,
        "original_url": "https://github.com/user-attachments/files/123/snap.zip",
        "converted_url": "https://i.gkd.li/i?url=https://github.com/user-attachments/files/123/snap.zip",
    }
    defaults.update(overrides)
    return SnapshotInfo(**defaults)


class TestWarningMissing(unittest.TestCase):
    """测试 build_warning_missing()"""

    def test_contains_html_marker(self):
        """应包含 HTML 标记注释"""
        result = build_warning_missing("testuser")
        self.assertIn("<!-- gkd-warning-missing -->", result)

    def test_contains_username(self):
        """应包含 @用户名"""
        result = build_warning_missing("testuser")
        self.assertIn("@testuser", result)

    def test_contains_close_message(self):
        """应包含自动关闭提示"""
        result = build_warning_missing("testuser")
        self.assertIn("自动关闭", result)


class TestWarningUnreachable(unittest.TestCase):
    """测试 build_warning_unreachable()"""

    def test_contains_html_marker(self):
        result = build_warning_unreachable("testuser")
        self.assertIn("<!-- gkd-warning-unreachable -->", result)

    def test_contains_snapshot_hint(self):
        """应包含 snapshot 说明"""
        result = build_warning_unreachable("testuser")
        self.assertIn("snapshot", result)


class TestWarningInaccessible(unittest.TestCase):
    """测试 build_warning_inaccessible()"""

    def test_contains_html_marker(self):
        result = build_warning_inaccessible("testuser", ["https://example.com"])
        self.assertIn("<!-- gkd-warning-404 -->", result)

    def test_contains_url(self):
        """应包含无法访问的 URL"""
        url = "https://i.gkd.li/i/99999999"
        result = build_warning_inaccessible("testuser", [url])
        self.assertIn(url, result)

    def test_multiple_urls(self):
        """应包含多个无法访问的 URL"""
        urls = ["https://i.gkd.li/i/11111111", "https://i.gkd.li/i/22222222"]
        result = build_warning_inaccessible("testuser", urls)
        self.assertIn(urls[0], result)
        self.assertIn(urls[1], result)


class TestWarningUncertain(unittest.TestCase):
    """测试 build_warning_uncertain()"""

    def test_contains_html_marker(self):
        result = build_warning_uncertain("testuser", ["https://example.com"], 403, "Forbidden")
        self.assertIn("<!-- gkd-warning-uncertain -->", result)

    def test_contains_status_code(self):
        """应包含 HTTP 状态码"""
        result = build_warning_uncertain("testuser", ["https://example.com"], 403, "Forbidden")
        self.assertIn("403", result)

    def test_contains_details_tag(self):
        """应包含折叠详情标签"""
        result = build_warning_uncertain("testuser", ["https://example.com"], 500, "Server Error")
        self.assertIn("<details>", result)
        self.assertIn("</details>", result)


class TestRecoveryComment(unittest.TestCase):
    """测试 build_recovery_comment()"""

    def test_contains_html_marker(self):
        result = build_recovery_comment("testuser")
        self.assertIn("<!-- gkd-warning-recovery -->", result)

    def test_contains_success_emoji(self):
        """应包含成功 emoji"""
        result = build_recovery_comment("testuser")
        self.assertIn("✅", result)


class TestBuildBotComment(unittest.TestCase):
    """测试 build_bot_comment()"""

    def test_empty_input(self):
        """空输入应返回空字符串"""
        result = build_bot_comment([], [])
        self.assertEqual(result, "")

    def test_single_app(self):
        """单 App 单 Activity 应包含标题和 Activity 行"""
        snap = _make_snapshot()
        result = build_bot_comment([snap], [])

        # App 标题
        self.assertIn("## 测试应用 `com.test.app` 1.0.0", result)
        # Activity 行
        self.assertIn("**MainActivity**", result)
        # 统计信息在折叠区域详细信息表中
        self.assertIn("2/1", result)  # 快查ID:2/Text:1
        self.assertIn("| 10 |", result)  # 深度10
        self.assertIn("| 3 |", result)  # 可点击3
        self.assertIn("| 20 |", result)  # 节点数20

    def test_multiple_activities(self):
        """多 Activity 应各有独立行"""
        snap1 = _make_snapshot(activity_id="com.test.app.Activity1")
        snap2 = _make_snapshot(activity_id="com.test.app.Activity2")
        result = build_bot_comment([snap1, snap2], [])

        self.assertIn("**Activity1**", result)
        self.assertIn("**Activity2**", result)

    def test_gkd_links_section(self):
        """有 GKD 链接时应包含 GKD 链接区域"""
        gkd_links = [("1783704841971", "https://i.gkd.li/i/29899905")]
        result = build_bot_comment([], gkd_links)

        self.assertIn("**GKD 链接**", result)
        self.assertIn("1783704841971", result)

    def test_detail_section(self):
        """应包含折叠详情区"""
        snap = _make_snapshot()
        result = build_bot_comment([snap], [])

        self.assertIn("<details>", result)
        self.assertIn("</details>", result)
        self.assertIn("**设备信息**", result)

    def test_device_dedup(self):
        """同设备的多个快照应只显示一行设备信息"""
        snap1 = _make_snapshot(snapshot_id="111")
        snap2 = _make_snapshot(snapshot_id="222")
        result = build_bot_comment([snap1, snap2], [])

        # 设备信息表中 "TEST 10" 应只出现一次
        device_count = result.count("| TEST 10 |")
        self.assertEqual(device_count, 1)

    def test_device_subtitle(self):
        """App 副标题应包含设备型号、Android 版本、GKD 版本"""
        snap = _make_snapshot()
        result = build_bot_comment([snap], [])

        self.assertIn("TEST 10", result)
        self.assertIn("Android 14", result)
        self.assertIn("GKD 1.12.1", result)

    def test_link_per_activity(self):
        """每个 Activity 的链接应独立展示"""
        snap1 = _make_snapshot(
            activity_id="com.test.app.Activity1",
            converted_url="https://i.gkd.li/i/111",
        )
        snap2 = _make_snapshot(
            activity_id="com.test.app.Activity2",
            converted_url="https://i.gkd.li/i/222",
        )
        result = build_bot_comment([snap1, snap2], [])

        # 每个 Activity 行后应有各自的链接
        lines = result.split("\n")
        act1_line_idx = next(i for i, line in enumerate(lines) if "**Activity1**" in line)
        act2_line_idx = next(i for i, line in enumerate(lines) if "**Activity2**" in line)

        # 链接应在各自 Activity 行之后
        self.assertIn("111", lines[act1_line_idx + 1])
        self.assertIn("222", lines[act2_line_idx + 1])


if __name__ == "__main__":
    unittest.main()
