# 技术栈与项目结构

这份文档面向本仓库的开发者和维护者，目标是帮助你快速判断：

- 这个项目是用什么技术栈维护的
- 规则源码、构建产物、自动化脚本分别放在哪里
- 修改某类内容时，应该优先动哪个目录或脚本

## 项目定位

这是一个 **GKD 第三方订阅规则仓库**。

仓库中的核心工作不是开发传统前后端应用，而是维护一套可构建、可校验、可发布的 **GKD 订阅规则源码**，并配套：

- 规则校验
- README / 发行产物生成
- Issue / PR 自动化
- 资源链接有效性检查

## 技术栈

### 运行时与包管理

- `Node.js >= 22`
- `pnpm`
- `ESM` 模块模式

仓库约束见 [package.json](../package.json) 和 [tsconfig.json](../tsconfig.json)：

- `type: "module"`
- `packageManager: "pnpm@10.25.0"`
- `engines.node: ">=22"`

### 语言与工具链

- `TypeScript 5`
- `tsx`
- `ESLint 9`
- `Prettier 3`
- `simple-git-hooks`
- `commitlint`

这套组合主要用于：

- 编写规则源码与脚本
- 运行构建/检查脚本
- 保持提交前代码风格一致

### GKD 相关依赖

- `@gkd-kit/define`
- `@gkd-kit/api`
- `@gkd-kit/tools`

它们分别承担：

- 规则与订阅结构定义
- 类型声明
- 订阅校验、批量导入应用、生成构建产物等辅助能力

### 自动化平台

- `GitHub Actions`

当前工作流主要覆盖：

- 自动检查与修复格式问题
- PR 规则变更检查
- 资源链接有效性校验
- Issue 快照自动解析与摘要回写
- 定时构建与发布发行版

## 目录结构

下面是维护时最常用的目录视图：

```bash
.
├─ .github/
│  ├─ ISSUE_TEMPLATE/          # Issue 表单模板
│  └─ workflows/               # CI、发布、Issue/PR 自动化
├─ docs/                       # 面向贡献者的说明文档
├─ dist/                       # 构建产物，不建议手改
├─ scripts/                    # 构建、检查、自动化辅助脚本
├─ src/
│  ├─ apps/                    # 按应用拆分的规则源码
│  ├─ categories.ts            # 规则分类定义
│  ├─ globalDefaultApps.ts     # 全局规则默认启用/禁用应用列表
│  ├─ globalGroups.ts          # 全局规则
│  └─ subscription.ts          # 订阅总入口
├─ Template.md                 # README 模板
├─ README.md                   # 根 README，由模板与构建结果生成
└─ selectors.subscription.json # 选择器参考数据
```

## 核心源码层说明

### `src/apps/`

这里是项目最核心的规则源码目录。

- 一个文件通常对应一个应用
- 文件名一般直接使用包名，如 [src/apps/com.eg.android.AlipayGphone.ts](../src/apps/com.eg.android.AlipayGphone.ts)
- 每个文件通过 `defineGkdApp(...)` 导出应用配置

常见结构大致如下：

1. `id` / `name`
2. `groups`
3. 每个 `group` 下的 `rules`
4. 每条规则上的 `matches`、`activityIds`、`snapshotUrls`、`exampleUrls` 等字段

如果你是新增或修复某个 App 的规则，通常从这里开始。

### `src/globalGroups.ts`

这里定义“跨应用复用”的全局规则，例如：

- 开屏广告
- 更新提示
- 青少年模式

适合放在这里的逻辑通常具备：

- 多个 App 都可能命中
- 选择器具有较强通用性
- 可以通过应用黑白名单控制启用范围

### `src/categories.ts`

这里定义规则分类，例如：

- 开屏广告
- 权限提示
- 局部广告
- 分段广告
- 功能类

它影响订阅中的分类展示与规则归类，但不是 Issue 表单的来源。

### `src/subscription.ts`

这是订阅总入口，负责把分散的规则源码组装成完整订阅。

核心职责：

- 批量导入 `src/apps/`
- 调整某些规则组顺序
- 合并 `categories`、`globalGroups`、`apps`
- 最终调用 `defineGkdSubscription(...)` 导出订阅对象

如果想理解“整个订阅是怎么拼起来的”，先看 [src/subscription.ts](../src/subscription.ts)。

## `scripts/` 脚本层说明

`scripts/` 目录承载“源码之外的工程能力”，也就是把规则仓库维护成一个可持续演进项目的那部分逻辑。

### 构建与产物生成

- [scripts/build.ts](../scripts/build.ts)
  - 调用 `@gkd-kit/tools` 生成 `dist/`
  - 再更新根 README

- [scripts/updateReadMeMd.ts](../scripts/updateReadMeMd.ts)
  - 从 `dist/README.md` 里读取统计信息
  - 把统计值填回 [Template.md](../Template.md)
  - 生成根 [README.md](../README.md)

也就是说：

- `dist/README.md` 是构建产物
- 根 `README.md` 也是“半生成文件”
- 如果需要长期改 README 结构，优先看 [Template.md](../Template.md)

### 规则检查

- [scripts/check.ts](../scripts/check.ts)
  - 导入订阅总入口
  - 调用 `checkApiVersion()`
  - 调用 `checkSubscription(...)`
  - 顺带校验 issue form 是否与脚本生成结果一致

它是 `pnpm run check` 的脚本入口之一，也是本仓库最常用的总检查入口。

### Issue / PR 自动化辅助脚本

- [scripts/buildIssueSnapshotSummary.ts](../scripts/buildIssueSnapshotSummary.ts)
  - 解析 issue 中的快照链接或附件
  - 兼容新旧快照 JSON
  - 生成 `summary.json` 与 `block.md`
  - 供 `issue_content_check.yml` 回写 Issue 摘要

- [scripts/enhanceIssueSnapshotSection.ts](../scripts/enhanceIssueSnapshotSection.ts)
  - 专门增强 Issue 原始快照区
  - 为 GitHub 附件链接追加“快速打开审查工具”
  - 为连续同应用附件块追加“复制全部链接”折叠块

- [scripts/buildIssueUpdatePayload.ts](../scripts/buildIssueUpdatePayload.ts)
  - 根据原标题、自动摘要区块和增强后的原始快照区生成最终回写载荷
  - 负责输出给 workflow 读取的 `title.txt` 与 `body.md`
  - 不直接调用 GitHub API，`reopen`、移除标签等副作用仍由 workflow 处理

- [scripts/checkResourceLinks.ts](../scripts/checkResourceLinks.ts)
  - 检查规则源码中的 `snapshotUrls`、`excludeSnapshotUrls`、`exampleUrls`
  - 供 PR / push 工作流复用

### Issue 表单生成

- [scripts/updateIssueForms.ts](../scripts/updateIssueForms.ts)
  - 负责生成或校验仓库中的 Issue 表单文件

如果你修改了 Issue 模板，记得确认它是否属于生成产物，而不是直接手改后放着不管。

## `dist/` 产物层说明

`dist/` 是构建产物目录，主要包含：

- `gkd.json5`
- `gkd.version.json5`
- `CHANGELOG.md`
- `README.md`

一般原则：

- 优先修改 `src/` 和 `scripts/`
- 不直接手改 `dist/`，除非你明确知道这个文件不是由构建流程生成的

## GitHub Actions 工作流说明

### [build_release.yml](../.github/workflows/build_release.yml)

作用：

- 检查 `src/` 是否有变化
- 执行构建
- 提交产物
- 打 tag / 发 release

这是“发布链路”。

### [check_fix_push.yml](../.github/workflows/check_fix_push.yml)

作用：

- 检查本次 push 中的资源链接
- 跑 `pnpm run check`
- 跑格式化和 lint
- 必要时自动提交修复结果

这是“push 后自动收口链路”。

### [pull_request_check.yml](../.github/workflows/pull_request_check.yml)

作用：

- 检查 PR 变更文件数量
- 检查本次 PR 中的资源链接
- 同步机器人提醒评论
- 执行检查、格式化、lint

这是“PR 入口质量门禁”。

### [issue_content_check.yml](../.github/workflows/issue_content_check.yml)

作用：

- 先把 issue 归类为 `ready_to_parse / blocked_uploading / blocked_private_link / missing_snapshot`
- 对无法进入解析链路的 issue 按分支执行关闭或提醒
- 对可解析 issue 调用脚本生成快照摘要、增强原始快照区、组装最终标题和正文
- 解析失败时单独提醒，解析成功时再同步标题与正文并清理 `invalid`

当前树状路径是：

- `ready_to_parse -> parse-content -> (parsed -> sync-issue | parse_failed -> handle-parse-failure)`
- `missing_snapshot -> handle-precheck-blocked`
- `blocked_uploading -> handle-precheck-blocked`
- `blocked_private_link -> handle-precheck-blocked`

这是“反馈工单自动化链路”。

## 常用维护路径

### 新增或修复某个 App 规则

1. 修改 `src/apps/<包名>.ts`
2. 运行 `pnpm run check`
3. 运行 `pnpm run build`
4. 检查 `dist/` 和 `README.md` 是否符合预期

### 调整全局规则

1. 修改 [src/globalGroups.ts](../src/globalGroups.ts)
2. 如有需要，调整 [src/globalDefaultApps.ts](../src/globalDefaultApps.ts)
3. 执行 `pnpm run check`

### 调整分类

1. 修改 [src/categories.ts](../src/categories.ts)
2. 执行 `pnpm run check`
3. 如有 README / 构建结果变化，再执行 `pnpm run build`

### 调整 Issue / PR 自动化

优先查看：

- `scripts/` 中是否已有对应脚本
- `.github/workflows/` 中该脚本如何被调用

建议逐步把复杂正文处理和解析逻辑从 YAML 抽到 `scripts/`，后续新增复杂行为时也建议优先走这个方向。

## 常用命令

```bash
pnpm install
pnpm run check
pnpm run build
pnpm run format
pnpm run lint
pnpm run check:resource-links -- --mode report --files src/apps/com.eg.android.AlipayGphone.ts
pnpm run build:issue-snapshot-summary -- --urls-file work/urls.json --out-dir work/issue-summary
pnpm run enhance:issue-snapshot-section -- --body-file work/issue-body.md --out-dir work/issue-body-enhanced
```

## 维护建议

- 需要长期维护的自动化逻辑，优先抽到 `scripts/`，不要把复杂逻辑堆在 workflow YAML 里
- 修改 README 展示结构时，优先检查 [Template.md](../Template.md) 和 [scripts/updateReadMeMd.ts](../scripts/updateReadMeMd.ts)
- 修改 Issue 模板时，优先检查它是否由脚本生成
- 改动规则链接时，注意 `snapshotUrls` / `exampleUrls` 的有效性，避免把失效链接带进主分支
