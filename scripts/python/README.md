# Python 脚本模块说明

本目录包含 GitHub Issue 自动化处理的 Python 脚本。

## 目录结构

```
scripts/python/
├── core/              # 核心功能层
│   ├── extractor.py   # 链接提取与分类
│   ├── checker.py     # 网络检查
│   ├── converter.py   # 链接转换
│   └── snapshot_parser.py  # 快照解析
├── utils/             # 工具模块层
│   ├── models.py      # 数据结构定义
│   ├── common.py      # 通用工具函数
│   └── utils.py       # GITHUB_OUTPUT 工具
├── api/               # 高层 API 层
│   └── link_checker.py  # 可复用的链接检查器
├── entry/             # 入口脚本层
│   └── check_issue.py   # Issue 场景主入口
├── tests/             # 测试层
│   ├── verify.py      # 本地验证脚本
│   └── test_scenarios.json  # 测试场景配置
├── formatter.py       # 评论格式化（跨层使用）
└── README.md          # 本文件
```

## 模块职责

### core/ - 核心功能层

| 文件 | 职责 | 主要函数 |
|------|------|---------|
| `extractor.py` | 从文本提取链接 | `extract_links(text)` |
| `checker.py` | 检查链接可访问性 | `check_network_links(url)`, `gkd_to_gh_attachment_url(url)` |
| `converter.py` | 链接格式转换 | `convert_github_attachments(links)` |
| `snapshot_parser.py` | 下载解析快照zip | `download_and_parse(url)` |

### utils/ - 工具模块层

| 文件 | 职责 | 主要函数/类 |
|------|------|------------|
| `models.py` | 数据结构定义 | `LinkInfo`, `NetworkResult`, `SnapshotInfo`, `CheckReport` |
| `common.py` | 通用工具函数 | `extract_filename()`, `short_activity_name()` |
| `utils.py` | 工具函数 | `write_output()` |

### api/ - 高层 API 层

| 文件 | 职责 | 主要函数/类 |
|------|------|------------|
| `link_checker.py` | 可复用的链接检查器 | `LinkChecker` 类, `check_links_in_text()` |

### entry/ - 入口脚本层

| 文件 | 职责 | 主要函数 |
|------|------|---------|
| `check_issue.py` | Issue 场景主入口 | `main()` |

### tests/ - 测试层

| 文件 | 职责 |
|------|------|
| `verify.py` | 本地验证脚本 |
| `test_scenarios.json` | 测试场景配置 |

## 使用方式

### 1. 在其他 CI 中复用（推荐）

```python
from api.link_checker import LinkChecker, check_links_in_text

# 方式1：使用类
checker = LinkChecker(timeout=20)
report = checker.extract_and_check(text)
print(f"检查完成: {report.ok_count} 成功, {report.fail_count} 失败")

# 方式2：使用便捷函数
report = check_links_in_text(text)
```

### 2. Issue 场景专用

```bash
cd scripts/python
export ISSUE_BODY="..."
export ISSUE_USER="testuser"
export ISSUE_ACTION="opened"
python entry/check_issue.py
```

## 本地验证

修改 Python 脚本后，运行验证确保功能正常：

```bash
cd scripts/python
python tests/verify.py
```

## 依赖关系

```
utils/models.py (无依赖)
utils/common.py (无依赖)
utils/utils.py (无依赖)
    ↓
core/extractor.py → utils/models.py
core/checker.py → utils/models.py
core/converter.py → utils/models.py, utils/common.py
core/snapshot_parser.py → utils/models.py
formatter.py → utils/models.py, utils/common.py
    ↓
api/link_checker.py → utils/models.py, core/*.py
    ↓
entry/check_issue.py → utils/*.py, core/*.py, formatter.py
```
