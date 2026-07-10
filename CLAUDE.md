# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 提供代码协作指导。

## 项目概述

GKD 订阅规则仓库 — 为 [GKD](https://gkd.li/) 提供第三方订阅规则。GKD 是一款基于 Android 无障碍服务的工具，可自动关闭广告、弹窗和不需要的 UI 元素。规则以 TypeScript 文件编写，定义 UI 节点选择器来匹配 Android 视图层级快照。

## 开发命令

```bash
pnpm install          # 安装依赖
pnpm run check        # TypeScript 类型检查 + 订阅验证（选择器语法、规则结构）
pnpm run build        # TypeScript 类型检查 + 构建 dist/gkd.json5 + 更新 dist/README.md 和根目录 README.md
pnpm run lint         # ESLint 自动修复（移除未使用的导入、Prettier 格式化）
pnpm run format       # Prettier 格式化所有源文件
```

**单文件验证**：没有单文件检查模式。`pnpm run check` 验证整个订阅树。修改规则后请运行此命令。

**Git 钩子**（通过 `simple-git-hooks` + `lint-staged`）：
- pre-commit：对暂存的 `.ts`/`.tsx`/`.js`/`.mjs`/`.cjs` 文件执行 ESLint + Prettier；对 `.json` 文件执行 Prettier
- commit-msg：commitlint（遵循 conventional commits，详见 `commitlint.config.ts`）
- pre-push：`pnpm run check`

## 自动提交规范

每当你完成一个独立功能的开发，或修复完一个 Bug 并验证通过后，请自动运行 `git commit` 提交代码，并生成一句简洁的中文 commit message。

**触发条件：**
- 完成一个独立功能的开发
- 修复完一个 Bug 并验证通过
- 重构完成并确认功能正常

**Commit message 格式：**
- 使用中文描述
- 简洁明了，一句话概括改动内容
- 示例：`修复 Python 脚本编码问题`、`新增链接检查验证工具`、`优化模块依赖结构`

## 架构设计

### 核心流程

```
src/apps/*.ts ──┐
src/globalGroups.ts ──┤──▶ src/subscription.ts ──▶ scripts/check.ts ──▶ scripts/build.ts ──▶ dist/gkd.json5
src/categories.ts ──┘         (defineGkdSubscription)   (checkSubscription)    (updateDist + updateReadMeMd)
```

- `src/subscription.ts` — 入口文件。调用 `batchImportApps()` 自动导入 `src/apps/` 下所有 `.ts` 文件，通过 `defineGkdSubscription()` 组装订阅对象。
- `src/apps/` — 每个 Android 应用一个 `.ts` 文件，以包名命名（如 `com.tencent.mm.ts`）。导出 `defineGkdApp()`，包含 `id`、`name` 和 `groups[]`。
- `src/categories.ts` — 定义规则分类（开屏广告、青少年模式、更新提示等），包含 `key`、`name` 和默认 `enable` 状态。规则组名称**必须**以分类名称开头（如 `分段广告-xxx`）。
- `src/globalGroups.ts` — 跨应用的全局规则（跳过开屏广告、更新提示、青少年模式）。使用 `src/globalDefaultApps.ts` 中的黑白名单。
- `scripts/check.ts` — 通过 `@gkd-kit/tools` 验证订阅和 API 版本。
- `scripts/build.ts` — 构建 `dist/gkd.json5`、`dist/README.md`，并从 `Template.md` 更新根目录 `README.md`。

### 关键依赖

- `@gkd-kit/define` — `defineGkdApp`、`defineGkdSubscription`、`defineGkdCategories`、`defineGkdGlobalGroups`
- `@gkd-kit/api` — TypeScript 类型（`RawApp`、`RawAppGroup` 等）
- `@gkd-kit/tools` — `batchImportApps`、`checkSubscription`、`checkApiVersion`、`updateDist`

### 规则结构

每个应用规则文件遵循以下模式：
```ts
import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.example.app',   // Android 包名
  name: '应用名称',
  groups: [
    {
      key: 0,
      name: '分段广告-具体描述',  // 必须以 categories.ts 中的分类名称开头
      activityIds: ['com.example.Activity'],   // 可选：限制特定 Activity
      rules: [
        {
          key: 0,
          name: '步骤 1 描述',
          matches: '[选择器语法]',         // GKD 选择器（类 CSS 语法）
          snapshotUrls: ['https://i.gkd.li/i/...'],  // 必填：用于维护的快照链接
        },
      ],
    },
  ],
});
```

### 选择器语法

GKD 选择器使用类 CSS 语法匹配 Android 视图节点。常用模式：
- `[text="精确文本"]` — 按文本内容匹配
- `[text*="包含"]` — 子字符串匹配
- `[id="com.example:id/btn"]` — 按资源 ID 匹配
- `[vid="viewId"]` — 按视图 ID 匹配
- `[clickable=true]` — 按属性匹配
- `@Node > [text="Child"]` — 关系选择器（子节点、兄弟节点、父节点）
- `[visibleToUser=true]` — 可见性约束
- 详见 [GKD API 文档](https://gkd.li/api/) 和 [选择器参考](./docs/Selectors.md)

## PR 约束

PR 检查强制要求每次 PR **最多修改 1 个订阅源文件**（即仅允许修改一个 `src/apps/*.ts`、`src/categories.ts`、`src/globalGroups.ts` 或 `src/subscription.ts`）。

## CI 工作流规范

本项目包含 GitHub Actions 工作流，用于自动审核用户提交的 Issue 内容。以下为设计规范：

### 核心架构：Orchestrator + Worker

```
GitHub Actions (.yml) = Orchestrator（编排器）
Python (scripts/python/) = Worker（分析器）
```

两者职责**严格分离**。

#### GitHub Actions 职责

- Workflow 触发与权限声明（`contents: read` + `issues: write`）
- Job / Step 编排与条件分支（if）
- 环境准备（checkout、setup-python、标签预创建）
- 标签操作（gh CLI）
- 评论操作（find-comment + create-or-update-comment）
- Issue 关闭 / 重新打开（gh CLI）
- 读取 Python 输出，决定执行哪些 Job

**原则：GitHub Actions 能完成的事，不允许放进 Python。**

#### Python 职责

- Markdown 文本解析与正则匹配
- URL 提取与分类
- HTTP 网络请求（HEAD / GET+Range）
- GKD 分享链接 → GH 附件 URL 转换
- GitHub 附件 → GKD 代理链接转换
- Markdown 评论内容生成
- 结果输出到 GITHUB_OUTPUT

**Python 禁止：**
- 调用 GitHub REST API
- 打标签 / 移除标签
- 发表 / 更新评论
- 关闭 / 打开 Issue
- 任何 GitHub 状态修改

### 关键设计决策

1. **Python 只运行一次** — 在 `analyze` Job 中执行一次，输出所有原子化布尔标志，各处理 Job 根据标志决定是否执行
2. **Fail Fast 原则** — 网络检查遇到第一个 404 立即停止，不发后续请求
3. **幂等性** — 每次触发都完全重跑全流程，保证最终状态一致
4. **评论防刷屏** — 使用 `find-comment` 按场景独立标记查找已有评论，更新而非重复创建
5. **多 Job 架构** — 每个 Job 对应一个明确的业务节点，而非线性流水线
6. **标签预创建** — 在 `analyze` Job 中预创建所有所需标签，确保后续操作不会因标签不存在而失败

### Python 模块结构

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
  └── README.md          # 模块说明文档
```

**模块化要求：**
- 每个文件职责单一
- 禁止互相重复代码
- 禁止一个几百行的大脚本
- 每个文件顶部说明用途
- 每个函数必须有注释

## Python 脚本

`scripts/python/` 包含 GitHub Issue 自动化工具：
- `check_issue.py` — 分析 Issue 内容中的快照链接（缺失、不可访问、可转换）
- `snapshot_parser.py` — 解析快照节点树
- `formatter.py` — 从快照数据格式化规则模板
- `converter.py` — 将快照转换为 GKD 规则格式

## 构建输出

- `dist/gkd.json5` — GKD 应用消费的主订阅文件
- `dist/README.md` — 自动生成的应用/规则数量摘要
- `dist/gkd.version.json5` — 版本跟踪
- `dist/CHANGELOG.md` — 自动生成的变更日志
- 根目录 `README.md` 在构建时从 `Template.md` 重新生成，包含当前统计数据
