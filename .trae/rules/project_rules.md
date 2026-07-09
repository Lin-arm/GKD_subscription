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

- Workflow 触发与权限声明
- Job / Step 编排与条件分支（if）
- 环境准备（checkout、setup-python）
- 标签操作（gh CLI）
- 评论操作（peter-evans/create-or-update-comment@v5）
- Issue 关闭 / 重新打开（gh CLI）
- 读取 Python 输出，决定执行哪些 Step

**原则：GitHub Actions 能完成的事，不允许放进 Python。**

### Python 职责

- Markdown 文本解析与正则匹配
- URL 提取与分类
- HTTP 网络请求（HEAD / GET+Range）
- 数据转换（GitHub 附件 → GKD 代理链接）
- Markdown 评论内容生成
- 结果输出到 GITHUB_OUTPUT

**Python 禁止：**
- 调用 GitHub REST API
- 打标签 / 移除标签
- 发表 / 更新评论
- 关闭 / 打开 Issue
- 任何 GitHub 状态修改

---

## 工作流业务流程

```
接收到 Issue (opened / edited)
    │
    ▼
环境准备 (checkout + setup-python)
    │
    ▼
Python 分析 Issue Body（只运行一次）
  输出原子化标志到 GITHUB_OUTPUT
    │
    ▼
是否缺少快照? ──是──> BAN（标签 + 评论 + 关闭）
    │否
    ▼
是否本地链接? ──是──> BAN（标签 + 评论 + 关闭）
    │否
    ▼
是否有不可访问快照(i.gkd.li/snapshot/)? ──是──> 提醒补充（标签 + 评论，不关闭）
    │
    ▼
网络检查 GitHub 附件链接
    │
    ├─ 404 ──> BAN（标签 + 评论 + 关闭）
    ├─ 不确定(403/5xx) ──> 提醒人工核查（标签 + 折叠错误详情，不关闭）
    │
    ▼ 可访问
链接转换 + Bot 评论生成
    │
    ▼
发布/更新 Bot 评论 (create-or-update-comment)
    │
    ▼
编辑恢复处理（edited 触发时：移除旧标签 + 重新打开 + 恢复评论）
```

---

## 关键设计决策

### 1. Python 只运行一次

Python 脚本只执行一次，输出所有原子化布尔标志。
YAML 根据这些标志决定执行哪些 Step。

**原因：** 减少 setup 开销，避免重复解析 Issue Body。

### 2. Fail Fast 原则

网络检查遇到第一个致命错误（404）立即停止，不发后续请求。

**原因：** 节省网络请求和运行时间，审核类工作流不需要完整报告。

### 3. 幂等性（Idempotent）

每次 opened 或 edited 触发都完全重跑全流程，保证最终状态一致。

**原因：** 避免遗留旧标签或旧评论，行为可预测。

### 4. 评论防刷屏

使用 `peter-evans/find-comment@v4` 查找已有评论 ID，再用 `peter-evans/create-or-update-comment@v5` + `comment-id` + `edit-mode: replace` 更新，而非重复创建。

---

## Python 输出变量

| 变量名            | 类型   | 含义                                                                                             |
| ----------------- | ------ | ------------------------------------------------------------------------------------------------ |
| `has_snapshot`    | bool   | 是否包含任何快照链接                                                                             |
| `has_local_link`  | bool   | 是否包含本地链接                                                                                 |
| `has_unreachable` | bool   | 是否包含不可访问快照                                                                             |
| `network_status`  | string | 网络检查结果：`ok` / `404` / `uncertain` / `skipped`                                             |
| `network_detail`  | string | 网络错误详情（折叠展示用）                                                                       |
| `has_convertible` | bool   | 是否有可转换的 GitHub 附件                                                                       |
| `warning_type`    | string | 警告类型：`missing` / `local` / `unreachable` / `inaccessible` / `uncertain` / `recovery` / `""` |
| `warning_comment` | string | 警告评论 Markdown（含 `<!-- gkd-warning -->` 标记）                                              |
| `bot_comment`     | string | Bot 评论 Markdown（含 `<!-- gkd-bot-comment -->` 标记）                                          |

---

## 标签定义

| 场景                      | 标签名                             | 是否关闭 Issue         |
| ------------------------- | ---------------------------------- | ---------------------- |
| 缺失快照                  | `缺失快照(missing-snapshot)`       | ✅ 关闭（not planned）  |
| 本地链接                  | `本地链接(local-link)`             | ✅ 关闭（not planned）  |
| 不可访问快照链接          | `需补充链接(need-supplement-link)` | ❌ 不关闭               |
| 链接无法访问(404/403/5xx) | `链接无法访问(inaccessible-link)`  | 404关闭，403/5xx不关闭 |

---

## 链接识别规则

| 类型         | 匹配模式                                        | 分类                   |
| ------------ | ----------------------------------------------- | ---------------------- |
| GKD 分享链接 | `https://i.gkd.li/i/\d+`                        | `gkd`                  |
| GitHub 附件  | `https://github.com/user-attachments/files/...` | `github_attachment`    |
| 本地链接     | `localhost` / `127.0.0.1` / `file://`           | `local`                |
| 不可访问快照 | `https://i.gkd.li/snapshot/...`                 | `unreachable_snapshot` |

---

## 链接转换规则

- 仅转换 `github_attachment` 类型链接
- 转换公式：`https://i.gkd.li/i?url={{原始GitHub附件URL}}`
- GKD 链接原样保留，不转换

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
  ├── checker.py        # 三类检查（本地/不可访问/网络）
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
4. 404 → 确认不可访问
5. 403 / 5xx → 不确定，折叠展示错误详情
6. 3xx → 跟随重定向，以最终状态码为准

---

## 使用的 GitHub Actions

| Action                                    | 用途                        |
| ----------------------------------------- | --------------------------- |
| `actions/checkout@v4`                     | 拉取仓库代码                |
| `actions/setup-python@v5`                 | 初始化 Python 环境          |
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