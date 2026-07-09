# GKD_subscription 项目规则

## 项目概述

GKD 订阅项目，基于 Node.js + TypeScript 编写 Android 应用自动化规则。
Issue 内容检查工作流用于自动审核用户提交的快照链接。

---

## Issue 内容检查工作流 — 架构规则

### 核心架构：Orchestrator + Worker

```
GitHub Actions (.yml) = Orchestrator（编排器）
Python (scripts/python/) = Worker（分析器）
```

两者职责**严格分离**。

### GitHub Actions (.yml) 职责

- Workflow 触发与权限声明（`contents: read` + `issues: write`）
- Job / Step 编排与条件分支（if）
- 环境准备（checkout、setup-python、标签预创建）
- 标签操作（gh CLI，标签在 analyze Job 中预创建）
- 评论操作（find-comment + create-or-update-comment）
- Issue 关闭 / 重新打开（gh CLI）
- 读取 Python 输出，决定执行哪些 Job
- Recovery 场景清理残留警告评论（gh api DELETE）

**原则：GitHub Actions 能完成的事，不允许放进 Python。**

### Python 职责

- Markdown 文本解析与正则匹配
- URL 提取与分类
- HTTP 网络请求（HEAD / GET+Range）
- GKD 分享链接 → GH 附件 URL 转换（用于网络检查）
- GitHub 附件 → GKD 代理链接转换（用于 Bot 评论）
- Markdown 评论内容生成
- 结果输出到 GITHUB_OUTPUT

**Python 禁止：**
- 调用 GitHub REST API
- 打标签 / 移除标签
- 发表 / 更新评论
- 关闭 / 打开 Issue
- 任何 GitHub 状态修改

---

## 工作流业务流程（多 Job 架构）

```
1. analyze
   - 合并 Issue Body + 评论内容
   - issue_comment 仅处理作者评论
   |
   +-- has_snapshot == 'false'
   |   └─> handle-missing-snapshot: 标签+评论+关闭 (阻断后续所有 Job)
   |
   +-- has_snapshot == 'true'
       |
       +-- has_unreachable == 'true'
       |   └─> handle-unreachable-snapshot: 标签+评论 (不关闭, 不阻断后续)
       |
       +-- network_status 分支 (并行):
       |   +-- '404'       ──> handle-network-404:       标签+评论 (不关闭, 阻断转换)
       |   +-- 'uncertain' ──> handle-network-uncertain: 标签+评论 (不关闭, 阻断转换)
       |   +-- 'ok'        ──> (无动作, 继续后续)
       |
       +-- has_convertible == 'true' (仅当 404/uncertain 均 skipped)
       |   └─> handle-convert: Bot 评论
       |
       └─> warning_type == 'recovery' (仅当 missing-skipped + 全部检查通过)
           └─> handle-recovery: 移除标签+重新打开+恢复评论+清理残留
```

### Job 划分方案

| Job 名称                      | 依赖                                | 触发条件                                              | 动作                                   |
| ----------------------------- | ----------------------------------- | ----------------------------------------------------- | -------------------------------------- |
| `analyze`                     | 无                                  | 始终执行（issue_comment 仅处理作者评论）              | 运行 Python 分析 + 预创建标签          |
| `handle-missing-snapshot`     | analyze                             | `has_snapshot == 'false'`                             | 标签 + 评论 + 关闭（阻断后续所有 Job） |
| `handle-unreachable-snapshot` | analyze + handle-missing-snapshot   | missing-skipped && `has_unreachable == 'true'`        | 标签 + 评论（不关闭，不阻断后续）      |
| `handle-network-404`          | analyze + handle-missing-snapshot   | missing-skipped && `network_status == '404'`          | 标签 + 评论（不关闭，阻断转换）        |
| `handle-network-uncertain`    | analyze + handle-missing-snapshot   | missing-skipped && `network_status == 'uncertain'`    | 标签 + 折叠评论（不关闭，阻断转换）    |
| `handle-convert`              | analyze + missing + 404 + uncertain | missing/404/uncertain 均 skipped && `has_convertible` | Bot 评论                               |
| `handle-recovery`             | analyze + 所有上述 Job              | missing-skipped && `warning_type == 'recovery'`       | 移除标签 + 重新打开 + 评论 + 清理残留  |

### 多种警告可共存

不可访问快照和 404/不确定可以同时触发，各自打标签和发评论。
只有缺失快照是唯一致命场景（关闭 Issue）。

---

## 关键设计决策

### 1. Python 只运行一次

Python 脚本只在 `analyze` Job 中执行一次，输出所有原子化布尔标志和按场景独立的评论内容。
各处理 Job 根据这些标志决定是否执行。

**原因：** 减少 setup 开销，避免重复解析 Issue Body。

### 2. Fail Fast 原则

网络检查遇到第一个 404 立即停止，不发后续请求。

**原因：** 节省网络请求和运行时间，审核类工作流不需要完整报告。

### 3. 幂等性（Idempotent）

每次 opened / edited / issue_comment 触发都完全重跑全流程，保证最终状态一致。

**原因：** 避免遗留旧标签或旧评论，行为可预测。

### 4. 评论防刷屏

使用 `peter-evans/find-comment@v4` 按场景独立标记查找已有评论 ID，
再用 `peter-evans/create-or-update-comment@v5` + `comment-id` + `edit-mode: replace` 更新，而非重复创建。

每个场景使用独立的 HTML 标记：
- `<!-- gkd-warning-missing -->` — 缺失快照
- `<!-- gkd-warning-unreachable -->` — 不可访问快照
- `<!-- gkd-warning-404 -->` — 链接 404
- `<!-- gkd-warning-uncertain -->` — 网络不确定
- `<!-- gkd-warning-recovery -->` — 编辑/评论恢复
- `<!-- gkd-bot-comment -->` — Bot 转换评论

恢复场景使用 `<!-- gkd-warning` 前缀匹配，可找到任意类型的旧警告评论并替换。
替换后，额外执行 `gh api DELETE` 清理残留的其他警告评论（当 Issue 同时存在多种警告时）。

### 5. 多 Job 架构

Workflow 使用多个 Job 表达业务分支，每个 Job 对应一个明确的业务节点。
Job = 业务节点 / 流程分支，Step = 节点内部执行动作。

**原因：** 本项目本质是 Issue 审核决策树，需要事件驱动 + 条件 Job 设计，
而非普通 CI 线性流水线。

### 6. GH_REPO 环境变量

Workflow 级设置 `GH_REPO: ${{ github.repository }}`，使 handler Job 中的 `gh` CLI
无需 `actions/checkout` 即可确定目标仓库。

**原因：** handler Job 只执行标签/评论/关闭操作，不需要拉取代码。
避免每个 handler Job 额外执行 checkout，节省运行时间。

### 7. 标签预创建

在 `analyze` Job 中使用 `gh label create --force` 预创建所有工作流所需标签，
确保后续 handler Job 的 `--add-label` 操作不会因标签不存在而失败。

**原因：** `gh issue edit --add-label` 在标签不存在时会报错导致 step 失败。
预创建是幂等操作（`--force` 标志），重复执行无副作用。

### 8. Recovery 清理残留评论

当 Issue 同时存在多种非致命警告（如不可访问快照 + 404）时，
会产生多条独立标记的警告评论。Recovery 场景先替换第一条为恢复评论，
再通过 `gh api` 查找并删除剩余的警告评论（排除 `gkd-warning-recovery` 和 `gkd-bot-comment`）。

**原因：** `find-comment` 只能返回一条匹配结果，无法一次性处理多条残留评论。
使用 GitHub API 直接删除是最干净的方案。

### 9. issue_comment 仅处理作者评论

`issue_comment` 事件触发时，analyze Job 的 `if` 条件会过滤非作者的评论。
只有 Issue 发起者本人的评论才会触发分析流程。

**原因：** Recovery 机制要求必须是议题发起者亲自补充有效链接。

### 10. GKD 链接网络检查转换

GKD 分享链接（`https://i.gkd.li/i/{id}`）指向审查工具 URL，无法直接访问判断。
网络检查前先转换为 GitHub 附件 URL（`https://github.com/user-attachments/files/{id}/file.zip`），
再对该 URL 发起 HTTP 请求验证可访问性。

**原因：** GKD 分享链接本身是代理链接，需要检查其背后附件的实际可访问性。

---

## Python 输出变量

| 变量名                | 类型   | 含义                                                                                   |
| --------------------- | ------ | -------------------------------------------------------------------------------------- |
| `has_snapshot`        | bool   | 是否包含任何快照链接                                                                   |
| `has_unreachable`     | bool   | 是否包含不可访问快照                                                                   |
| `network_status`      | string | 网络检查结果：`ok` / `404` / `uncertain` / `skipped`                                   |
| `network_detail`      | string | 网络错误详情（折叠展示用）                                                             |
| `has_convertible`     | bool   | 是否有可转换的 GitHub 附件                                                             |
| `warning_type`        | string | 警告类型：`missing` / `unreachable` / `inaccessible` / `uncertain` / `recovery` / `""` |
| `comment_missing`     | string | 缺失快照评论 Markdown（含 `<!-- gkd-warning-missing -->` 标记）                        |
| `comment_unreachable` | string | 不可访问快照评论 Markdown（含 `<!-- gkd-warning-unreachable -->` 标记）                |
| `comment_404`         | string | 链接 404 评论 Markdown（含 `<!-- gkd-warning-404 -->` 标记）                           |
| `comment_uncertain`   | string | 网络不确定评论 Markdown（含 `<!-- gkd-warning-uncertain -->` 标记）                    |
| `comment_recovery`    | string | 恢复评论 Markdown（含 `<!-- gkd-warning-recovery -->` 标记）                           |
| `comment_bot`         | string | Bot 评论 Markdown（含 `<!-- gkd-bot-comment -->` 标记）                                |

---

## 标签定义

| 场景                      | 标签名                             | 是否关闭 Issue        |
| ------------------------- | ---------------------------------- | --------------------- |
| 缺失快照                  | `缺失快照(missing-snapshot)`       | ✅ 关闭（not planned） |
| 不可访问快照链接          | `需补充链接(need-supplement-link)` | ❌ 不关闭              |
| 链接无法访问(404/403/5xx) | `链接无法访问(inaccessible-link)`  | ❌ 不关闭              |

---

## 链接识别规则

| 类型         | 匹配模式                                        | 分类                   |
| ------------ | ----------------------------------------------- | ---------------------- |
| GKD 分享链接 | `https://i.gkd.li/i/\d+`                        | `gkd`                  |
| GitHub 附件  | `https://github.com/user-attachments/files/...` | `github_attachment`    |
| 不可访问快照 | `https://i.gkd.li/snapshot/...`                 | `unreachable_snapshot` |

---

## 链接转换规则

### Bot 评论转换（GitHub 附件 → GKD 代理链接）

- 仅转换 `github_attachment` 类型链接
- 转换公式：`https://i.gkd.li/i?url={{原始GitHub附件URL}}`
- GKD 链接原样保留，不转换

### 网络检查转换（GKD 分享链接 → GH 附件 URL）

- 仅用于网络可访问性检查，不影响 Bot 评论输出
- 转换公式：`https://i.gkd.li/i/{id}` → `https://github.com/user-attachments/files/{id}/file.zip`
- `{id}` 为 GKD 链接中的数字部分，`file.zip` 为固定占位符

---

## Bot 评论格式

### 分组规则

从附件文件名中提取 `{App}_{Activity}-{timestamp}.zip` 模式：
- `### AppName`（一级标题）
- `#### ActivityName`（二级标题）
- `[timestamp](转换后URL)` 或 `[display_text](转换后URL)`

### 不匹配文件名模式

文件名不符合 `{App}_{Activity}-{timestamp}.zip` 的附件，不分组，逐条列出。

### 快速复制折叠区

评论底部包含 `<details>` 折叠区，列出所有原始附件 URL。

---

## Python 模块结构

```
scripts/python/
  ├── check_issue.py    # 主入口：协调各模块，输出分析结果
  ├── extractor.py      # 链接提取与分类
  ├── checker.py        # 两类检查（不可访问快照/网络）+ GKD→GH 转换
  ├── converter.py      # GitHub 附件 → GKD 代理链接转换
  ├── formatter.py      # Bot 评论 Markdown 格式化生成
  └── utils.py          # 公共工具函数（GITHUB_OUTPUT 写入等）
```

### 模块化要求

- 每个文件职责单一
- 禁止互相重复代码
- 禁止一个几百行的大脚本
- 每个文件顶部说明用途
- 每个函数必须有注释
- 复杂逻辑必须有注释

---

## 网络检查策略

1. 优先 HEAD 请求（最快，只获取响应头）
2. HEAD 返回 405 时回退到 GET + Range 头（只请求前 1 字节）
3. 超时时间：20 秒
4. 404 → 确认不可访问（非致命，不关闭 Issue）
5. 403 / 5xx → 不确定，折叠展示错误详情
6. 3xx → 跟随重定向，以最终状态码为准
7. GKD 分享链接先转换为 GH 附件 URL 再检查

---

## 使用的 GitHub Actions

| Action                                    | 用途                        |
| ----------------------------------------- | --------------------------- |
| `actions/checkout@v7`                     | 拉取仓库代码                |
| `actions/setup-python@v6`                 | 初始化 Python 环境          |
| `peter-evans/find-comment@v4`             | 查找已有评论（按作者+内容） |
| `peter-evans/create-or-update-comment@v5` | 发布/更新评论（防刷屏）     |
| `gh` CLI（内置）                          | 标签操作、关闭/打开 Issue   |

---

## 代码风格

- Python 文件使用 UTF-8 编码
- 类型注解（Python 3.10+ 语法）
- dataclass 用于数据结构
- 不使用第三方库，仅使用 Python 标准库
- YAML Step 名称使用中文