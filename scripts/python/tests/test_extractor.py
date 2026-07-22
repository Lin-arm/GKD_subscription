"""
extractor.py 单元测试

测试链接提取与分类模块的两个核心函数：
- extract_links()：从 Issue Body 提取快照链接
- extract_links_from_bot_comment()：从旧 Bot 评论提取链接
"""

import unittest

from core.extractor import extract_links, extract_links_from_bot_comment


class TestExtractLinks(unittest.TestCase):
    """测试 extract_links() 函数"""

    def test_gkd_link(self):
        """纯 GKD 分享链接应分类为 gkd"""
        result = extract_links("https://i.gkd.li/i/29899905")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].url, "https://i.gkd.li/i/29899905")
        self.assertEqual(result[0].kind, "gkd")
        self.assertEqual(result[0].display_text, "")

    def test_github_attachment(self):
        """GitHub 附件链接应分类为 github_attachment"""
        url = "https://github.com/user-attachments/files/12345/snapshot.zip"
        result = extract_links(url)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].url, url)
        self.assertEqual(result[0].kind, "github_attachment")

    def test_unreachable_snapshot(self):
        """i.gkd.li/snapshot/ 链接应分类为 unreachable_snapshot"""
        url = "https://i.gkd.li/snapshot/abc123"
        result = extract_links(url)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].url, url)
        self.assertEqual(result[0].kind, "unreachable_snapshot")

    def test_markdown_link_preserves_display_text(self):
        """Markdown 格式链接应保留显示文字"""
        result = extract_links("[开屏广告快照](https://i.gkd.li/i/29899905)")
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].url, "https://i.gkd.li/i/29899905")
        self.assertEqual(result[0].kind, "gkd")
        self.assertEqual(result[0].display_text, "开屏广告快照")

    def test_ignore_non_target_url(self):
        """非目标 URL 不应返回任何结果"""
        result = extract_links("https://google.com")
        self.assertEqual(result, [])

    def test_dedup(self):
        """同一 URL 出现两次应只返回一次"""
        body = "https://i.gkd.li/i/29899905 和 https://i.gkd.li/i/29899905"
        result = extract_links(body)
        self.assertEqual(len(result), 1)

    def test_mixed_types(self):
        """混合类型链接应各自返回正确的 kind"""
        body = (
            "有效快照：https://i.gkd.li/i/29899905\n"
            "GitHub附件：https://github.com/user-attachments/files/123/snap.zip\n"
            "不可访问：https://i.gkd.li/snapshot/abc123"
        )
        result = extract_links(body)
        self.assertEqual(len(result), 3)
        kinds = {r.kind for r in result}
        self.assertEqual(kinds, {"gkd", "github_attachment", "unreachable_snapshot"})

    def test_empty_string(self):
        """空字符串应返回空列表"""
        result = extract_links("")
        self.assertEqual(result, [])

    def test_no_links(self):
        """无链接文本应返回空列表"""
        result = extract_links("这个应用有很多广告需要处理")
        self.assertEqual(result, [])


class TestExtractLinksFromBotComment(unittest.TestCase):
    """测试 extract_links_from_bot_comment() 函数"""

    def test_bot_snapshot_link(self):
        """[snapshot_id](url) 格式（标准 GKD 链接）应分类为 gkd"""
        comment = "[1783704841971](https://i.gkd.li/i/29899905)"
        result = extract_links_from_bot_comment(comment)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].url, "https://i.gkd.li/i/29899905")
        self.assertEqual(result[0].kind, "gkd")
        self.assertEqual(result[0].display_text, "1783704841971")

    def test_bot_proxy_link(self):
        """[snapshot_id](url) 格式（代理链接）应分类为 gkd_proxy"""
        comment = "[1773646272170](https://i.gkd.li/i?url=https://github.com/user-attachments/files/26105236/_MainTabActivity-1773646272170.zip)"
        result = extract_links_from_bot_comment(comment)
        self.assertEqual(len(result), 1)
        self.assertEqual(
            result[0].url,
            "https://i.gkd.li/i?url=https://github.com/user-attachments/files/26105236/_MainTabActivity-1773646272170.zip",
        )
        self.assertEqual(result[0].kind, "gkd_proxy")
        self.assertEqual(result[0].display_text, "1773646272170")

    def test_bot_mixed_links(self):
        """代理链接和标准链接混合应正确分类"""
        comment = (
            "[1773646272170](https://i.gkd.li/i?url=https://github.com/user-attachments/files/26105236/_MainTabActivity-1773646272170.zip)"
            " · "
            "[1783207234571](https://i.gkd.li/i/29666442)"
        )
        result = extract_links_from_bot_comment(comment)
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].kind, "gkd_proxy")
        self.assertEqual(result[1].kind, "gkd")

    def test_bot_gkd_link(self):
        """纯 GKD 链接应正确提取"""
        comment = "https://i.gkd.li/i/29899905"
        result = extract_links_from_bot_comment(comment)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].url, "https://i.gkd.li/i/29899905")
        self.assertEqual(result[0].kind, "gkd")

    def test_empty_comment(self):
        """空评论应返回空列表"""
        result = extract_links_from_bot_comment("")
        self.assertEqual(result, [])

    def test_none_comment(self):
        """None 应返回空列表"""
        result = extract_links_from_bot_comment(None)  # type: ignore[arg-type]
        self.assertEqual(result, [])


if __name__ == "__main__":
    unittest.main()
