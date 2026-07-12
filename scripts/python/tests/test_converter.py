"""
converter.py 单元测试

测试链接转换模块的 convert_github_attachments() 函数：
- GitHub 附件 URL → GKD 代理 URL 的转换逻辑
- 文件名解析（App/Activity/timestamp）
"""

import unittest
from core.converter import convert_github_attachments, GKD_PROXY_TEMPLATE
from utils.models import LinkInfo


class TestConvertGithubAttachments(unittest.TestCase):
    """测试 convert_github_attachments() 函数"""

    def test_convert_github_attachment(self):
        """GitHub 附件链接应正确转换为 GKD 代理链接"""
        links = [
            LinkInfo(
                url="https://github.com/user-attachments/files/12345/snapshot.zip",
                kind="github_attachment",
                display_text="",
            )
        ]
        result = convert_github_attachments(links)
        self.assertEqual(len(result), 1)
        expected_url = GKD_PROXY_TEMPLATE.format(
            url="https://github.com/user-attachments/files/12345/snapshot.zip"
        )
        self.assertEqual(result[0].converted_url, expected_url)
        self.assertEqual(result[0].original_url, links[0].url)

    def test_skip_non_github(self):
        """GKD 链接应被跳过，不返回结果"""
        links = [
            LinkInfo(url="https://i.gkd.li/i/29899905", kind="gkd", display_text="")
        ]
        result = convert_github_attachments(links)
        self.assertEqual(result, [])

    def test_filename_parse_valid(self):
        """文件名符合 {App}_{Activity}-{timestamp}.zip 模式时应正确解析"""
        links = [
            LinkInfo(
                url="https://github.com/user-attachments/files/123/WeChat_com.tencent.mm-1712345678.zip",
                kind="github_attachment",
                display_text="",
            )
        ]
        result = convert_github_attachments(links)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].app_name, "WeChat")
        self.assertEqual(result[0].activity_name, "com.tencent.mm")
        self.assertEqual(result[0].timestamp, "1712345678")

    def test_filename_parse_invalid(self):
        """文件名不符合模式时字段应为空字符串"""
        links = [
            LinkInfo(
                url="https://github.com/user-attachments/files/123/snapshot.zip",
                kind="github_attachment",
                display_text="",
            )
        ]
        result = convert_github_attachments(links)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].app_name, "")
        self.assertEqual(result[0].activity_name, "")
        self.assertEqual(result[0].timestamp, "")

    def test_empty_list(self):
        """空列表应返回空结果"""
        result = convert_github_attachments([])
        self.assertEqual(result, [])

    def test_preserve_display_text(self):
        """Markdown 显示文字应被保留"""
        links = [
            LinkInfo(
                url="https://github.com/user-attachments/files/123/snap.zip",
                kind="github_attachment",
                display_text="快照1",
            )
        ]
        result = convert_github_attachments(links)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0].display_text, "快照1")


if __name__ == "__main__":
    unittest.main()
