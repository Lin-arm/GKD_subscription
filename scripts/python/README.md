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
│   ├── test_extractor.py   # extractor.py 单元测试
│   ├── test_converter.py   # converter.py 单元测试
│   ├── test_formatter.py   # formatter.py 单元测试
│   ├── run_tests.sh        # 条件运行脚本（pre-push 集成）
│   ├── verify.py           # 本地验证脚本
│   └── test_scenarios.json # 测试场景配置
├── debug_sim.py       # Issue 模拟测试工具（交互式调试）
├── formatter.py       # 评论格式化（跨层使用）
├── ruff.toml          # Python 静态检查配置
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
| `test_extractor.py` | extractor.py 单元测试（13 个用例） |
| `test_converter.py` | converter.py 单元测试（6 个用例） |
| `test_formatter.py` | formatter.py 单元测试（20 个用例） |
| `run_tests.sh` | 条件运行脚本（对比 origin/main，仅 Python/YAML 变更时触发） |
| `verify.py` | 本地验证脚本（端到端集成验证） |
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

### Issue 模拟测试（推荐）

交互式调试工具，模拟 GitHub Issue 分析流程，无需创建真实 Issue。
默认启用网络检查（模拟真实 CI），网络不可用时自动降级为离线模式。

```bash
# 交互式输入
python scripts/python/debug_sim.py

# 从文件读取
python scripts/python/debug_sim.py --file test_issue.md

# 管道输入
echo "## 适配请求
快照：https://i.gkd.li/i/29899905" | python scripts/python/debug_sim.py

# 离线模式（跳过网络检查）
python scripts/python/debug_sim.py --offline

# 跳过快照下载（保留网络检查）
python scripts/python/debug_sim.py --no-snapshot

# 模拟评论恢复场景
python scripts/python/debug_sim.py --action comment \
  --comment "补充快照：https://i.gkd.li/i/29899905"

# 指定用户名
python scripts/python/debug_sim.py --user myname
```

**输出示例（流水线风格）：**

```
[1/5] 链接提取─────────────────────
  ✓ 提取到 1 个链接
     1. kind=gkd  https://i.gkd.li/i/29899905

[2/5] 快照检查─────────────────────
  ✓ 快照链接存在

[3/5] 不可访问快照检查 ────────────
  ✓ 无不可访问快照

[4/5] 网络有效性检查 ──────────────
  → 检查 https://github.com/user-attachments/files/123/file.zip...
  ✓ 200 OK → https://i.gkd.li/i/29899905

[5/5] 评论生成─────────────────────
  ✓ Bot 评论已生成 (1 快照, 0 GKD 链接)

══════════════════════════════════════════════════
结果汇总
══════════════════════════════════════════════════
  has_snapshot         = true
  has_unreachable      = false
  network_status       = ok
  has_convertible      = true
  warning_type         = (empty)
```

### 单元测试

```bash
cd scripts/python
PYTHONPATH=. python -m unittest discover -s tests -p "test_*.py" -v
```

### 静态检查

```bash
ruff check scripts/python/
ruff format --check scripts/python/
```

### 端到端验证

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
