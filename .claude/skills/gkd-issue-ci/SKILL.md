---
name: gkd-issue-ci
description: 维护 GitHub Issue 自动审核工作流（.github/workflows/issue_content_check.yml + scripts/python/）时使用：修改快照链接提取/分类、网络可访问性检查、快照解析、Bot 评论格式、标签与评论逻辑、Job 编排，或编写对应的 Python 测试。
---

# Issue 自动审核 CI

字段表、标签、链接规则、评论格式等细节见同目录的 [reference.md](reference.md)。修改输出变量、标签、评论格式之前**先读它**。

## 核心架构：Orchestrator + Worker

```
GitHub Actions (issue_content_check.yml) = Orchestrator（编排器）
Python (scripts/python/)                 = Worker（分析器）
```

两者职责**严格分离**。**原则：GitHub Actions 能完成的事，不允许放进 Python。**

**GitHub Actions 负责**：

- 声明 workflow 触发条件和权限（`contents: read` + `issues: write`）
- Job / Step 编排和条件分支（if）
- 准备环境：checkout、setup-python、安装依赖、预创建标签
- 标签操作（gh CLI）
- 评论操作（find-comment + create-or-update-comment）
- 关闭和重新打开 Issue（gh CLI）
- 读取 Python 输出，决定执行哪些 Job
- 在 Recovery 场景下清理残留的警告评论（gh api DELETE）

**Python 负责**：

- Markdown 解析和正则匹配
- 提取 URL 并分类
- 发起 HTTP 请求（HEAD / GET+Range）
- 链接转换：GKD 分享链接 → GH 附件 URL（用于网络检查）；GitHub 附件 → GKD 代理链接（用于 Bot 评论）
- 下载并解析快照
- 生成 Markdown 评论内容
- 把结果输出到 `GITHUB_OUTPUT`

**Python 禁止**：调用 GitHub REST API、增删标签、发表或更新评论、关闭或打开 Issue，以及任何修改 GitHub 状态的操作。

## 业务流程（多 Job 决策树）

```
1. analyze（合并 Issue Body 和评论；issue_comment 事件只处理 Issue 作者本人的评论）
   |
   +-- has_snapshot == 'false'
   |   └─> handle-missing-snapshot: 标签 + 评论 + 关闭（阻断后续所有 Job）
   |
   +-- has_snapshot == 'true'
       +-- has_unreachable == 'true'
       |   └─> handle-unreachable-snapshot: 标签 + 评论（不关闭，不阻断）
       +-- network_status 分支（并行）:
       |   +-- '404'       ──> handle-network-404:       标签 + 评论（不关闭，阻断转换）
       |   +-- 'uncertain' ──> handle-network-uncertain: 标签 + 评论（不关闭，阻断转换）
       |   +-- 'ok'        ──> 无动作
       +-- has_convertible == 'true'（仅当 404 和 uncertain 都被跳过）
       |   └─> handle-convert: Bot 评论
       └─> warning_type == 'recovery'（仅当 missing 被跳过且所有检查都通过）
           └─> handle-recovery: 移除标签 + 重新打开 + 恢复评论 + 清理残留评论
```

| Job                           | 依赖                                | 触发条件                                          | 动作                                         |
| ----------------------------- | ----------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| `analyze`                     | 无                                  | 始终执行（issue_comment 只处理作者本人的评论）    | 运行 Python 分析 + 预创建标签 + 导出缓存数据 |
| `save-cache`                  | analyze                             | `issues` 事件，且 analyze 成功                    | 把缓存保存到 GitHub Actions Cache            |
| `handle-missing-snapshot`     | analyze                             | `has_snapshot == 'false'`                         | 标签 + 评论 + 关闭                           |
| `handle-unreachable-snapshot` | analyze + missing                   | missing 被跳过 && `has_unreachable == 'true'`     | 标签 + 评论                                  |
| `handle-network-404`          | analyze + missing                   | missing 被跳过 && `network_status == '404'`       | 标签 + 评论                                  |
| `handle-network-uncertain`    | analyze + missing                   | missing 被跳过 && `network_status == 'uncertain'` | 标签 + 折叠评论                              |
| `handle-convert`              | analyze + missing + 404 + uncertain | 这三个都被跳过 && `has_convertible`               | Bot 评论                                     |
| `handle-recovery`             | analyze + 所有 handle Job           | missing 被跳过 && `warning_type == 'recovery'`    | 移除标签 + 重新打开 + 评论 + 清理            |

多种警告可以同时出现：「不可访问快照」和「404/不确定」会同时触发，各自打标签、各自发评论。只有「缺失快照」是致命的，会关闭 Issue。

## 关键设计决策

1. **Python 只运行一次**：只在 `analyze` 里执行，输出原子化的布尔标志和按场景分开的评论内容，各个 handler Job 根据标志决定是否执行。这样可以减少环境准备的开销，也避免重复解析 Issue。
2. **检查全部链接，跳过坏链接**：所有链接都会检查，好链接照常用于快照解析和 Bot 评论，坏链接只生成警告，不阻断好链接的处理。
3. **幂等**：每次 opened / edited / issue_comment 都完整重跑一遍，保证最终状态一致，不会遗留旧标签或旧评论。
4. **评论防刷屏**：用 `peter-evans/find-comment@v4` 按场景标记查找已有评论，再用 `peter-evans/create-or-update-comment@v5`（`comment-id` + `edit-mode: replace`）更新，而不是每次新建。每个场景有自己独立的 HTML 标记（见 reference.md）。
5. **多 Job 架构**：一个 Job 对应一个业务节点或流程分支，Step 是节点内部的执行动作。这个项目本质上是一棵 Issue 审核决策树，不是线性的 CI 流水线。
6. **`GH_REPO` 环境变量**：在 workflow 级别设置 `GH_REPO: ${{ github.repository }}`，handler Job 里的 `gh` 不需要 checkout 就能确定仓库。
7. **标签预创建**：在 `analyze` 里用 `gh label create --force` 预先创建所有标签，否则 `gh issue edit --add-label` 遇到不存在的标签会失败。
8. **Recovery 清理残留评论**：`find-comment` 只能返回一条结果。Recovery 用 `<!-- gkd-warning` 前缀匹配，把第一条警告评论替换成恢复评论，再用 `gh api` 删除其余的警告评论（排除 `gkd-warning-recovery` 和 `gkd-bot-comment`）。
9. **issue_comment 只处理作者本人的评论**：Recovery 要求必须由 Issue 发起者自己补充有效链接。
10. **GKD 链接先转换再做网络检查**：`https://i.gkd.li/i/{id}` 是代理链接，要先转换成 GH 附件 URL 再检查能否访问。支持的域名维护在 `scripts/python/utils/common.py` 的 `GKD_DOMAINS` 里，新增镜像域名只要追加一行。

## Python 模块结构

```
scripts/python/
  ├── core/             # 核心功能层
  │   ├── extractor.py        # 提取并分类链接
  │   ├── checker.py          # 网络检查（httpx）
  │   ├── converter.py        # 链接转换
  │   └── snapshot_parser.py  # 下载并解析快照 zip
  ├── utils/            # 工具层
  │   ├── models.py           # 数据结构
  │   ├── common.py           # 通用函数 + GKD_DOMAINS + SNAPSHOT_KINDS 常量
  │   ├── cache.py            # 快照缓存（支持 CI 和本地调试两种模式）
  │   └── utils.py            # 写入 GITHUB_OUTPUT
  ├── api/              # 高层 API 层
  │   ├── base.py             # URLChecker 基类（可扩展到 Issue/PR/Commit 等场景）
  │   └── issue_checker.py    # Issue 场景检查器
  ├── entry/check_issue.py    # Issue 场景主入口
  ├── formatter.py            # 生成评论 Markdown（跨层使用）
  ├── debug_sim.py            # 交互式模拟 Issue（逻辑和 check_issue.py 保持一致）
  ├── tests/                  # 单元测试 + run_tests.sh + verify.py + test_scenarios.json
  ├── requirements.txt        # 第三方依赖（目前只有 httpx）
  ├── ruff.toml               # 静态检查配置
  └── README.md               # 模块说明
```

模块化要求：每个文件只负责一件事；不要重复代码；不要写几百行的大脚本；每个文件开头说明用途；每个函数都要有注释；复杂逻辑要加注释。

## Python 代码风格

- 文件使用 UTF-8 编码，类型注解使用 Python 3.10+ 语法，数据结构用 dataclass。
- 必须通过 ruff 检查（规则 E/W/F/I/B/UP，配置在 `scripts/python/ruff.toml`）。
- **依赖**：尽量只用标准库。现在唯一的第三方依赖是 `httpx`（在 `checker.py` 和 `debug_sim.py` 中使用），统一放在 `scripts/python/requirements.txt`，CI 通过 `uv pip install -r` 安装。**新增第三方依赖必须先得到用户明确同意。**
- workflow YAML 里的 Step 名称用中文。

## 测试

- 运行：`bash scripts/python/tests/run_tests.sh`。这个脚本只在 `scripts/python/` 或 `.github/workflows/` 有变更时，才执行 ruff check、ruff format --check 和 unittest。
- 手动运行单元测试：`cd scripts/python && PYTHONPATH=. python -m unittest discover -s tests -p "test_*.py" -v`
- 本地模拟 Issue：`debug_sim.py`；按场景批量验证：`tests/verify.py` + `tests/test_scenarios.json`。
- 修改提取、转换、格式化逻辑时，要同步更新 `tests/test_*.py`。
- 模块结构或设计有较大变化时，同步更新本 skill、reference.md 和 `scripts/python/README.md`。
