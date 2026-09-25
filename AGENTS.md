# AGENTS.md

## 项目概述

GKD 订阅规则仓库，为 [GKD](https://gkd.li/) 提供第三方订阅规则。GKD 是一款基于 Android 无障碍服务的工具，能自动关闭广告、弹窗和不需要的 UI 元素。规则用 TypeScript 编写，通过 UI 节点选择器来匹配 Android 视图层级快照。

`scripts/python/` 是 GitHub Issue 自动审核工具（Python）。

## 技术栈

- **规则定义**：TypeScript + `@gkd-kit/define`
- **构建**：pnpm + tsx
- **验证**：`@gkd-kit/tools`
- **CI**：GitHub Actions + Python 3.10+

## 开发命令

```bash
pnpm install          # 安装依赖
pnpm run check        # 类型检查 + 订阅验证
pnpm run build        # 构建 dist/gkd.json5 并更新 README
pnpm run lint         # ESLint 自动修复
pnpm run format       # Prettier 格式化
```

## 核心流程

```
src/apps/*.ts ────────┐
src/globalGroups.ts ──┼──▶ src/subscription.ts ──▶ scripts/check.ts ──▶ scripts/build.ts ──▶ dist/gkd.json5
src/categories.ts ────┘     (defineGkdSubscription)  (checkSubscription)   (updateDist + updateReadMeMd)
```

- `src/subscription.ts`：入口文件。调用 `batchImportApps()` 自动导入 `src/apps/` 下所有 `.ts` 文件，再通过 `defineGkdSubscription()` 组装成订阅对象。
- `src/apps/`：每个 Android 应用一个文件，以包名命名（如 `com.tencent.mm.ts`），导出 `defineGkdApp()`，包含 `id`、`name` 和 `groups[]`。
- `src/categories.ts`：规则分类（开屏广告、青少年模式、更新提示等），包含 `key`、`name` 和默认的 `enable` 状态。**规则组名称必须以分类名开头**，比如 `分段广告-xxx`。
- `src/globalGroups.ts`：跨应用的全局规则（跳过开屏广告、更新提示、青少年模式），黑白名单在 `src/globalDefaultApps.ts`。
- `scripts/check.ts`：通过 `@gkd-kit/tools` 验证订阅和 API 版本。
- `scripts/build.ts`：构建 `dist/gkd.json5`、`dist/README.md`，并根据 `Template.md` 更新根目录的 `README.md`。

## 关键依赖

| 包名              | 用途                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| `@gkd-kit/define` | `defineGkdApp`、`defineGkdSubscription`、`defineGkdCategories`、`defineGkdGlobalGroups` |
| `@gkd-kit/api`    | TypeScript 类型（`RawApp`、`RawAppGroup` 等）                                           |
| `@gkd-kit/tools`  | `batchImportApps`、`checkSubscription`、`checkApiVersion`、`updateDist`                 |

## 目录结构

```
src/apps/*.ts        # 每个 Android 应用一个规则文件（以包名命名）
src/subscription.ts  # 入口：组装订阅对象
src/categories.ts    # 规则分类定义
src/globalGroups.ts  # 跨应用全局规则
scripts/*.ts         # 构建和检查脚本
scripts/python/      # Issue 自动审核工具
docs/                # 规则编写指南（选择器、快速查询等）
dist/                # 构建输出（由脚本生成，不要手动修改）
```

## 构建输出

| 文件                     | 说明                                                  |
| ------------------------ | ----------------------------------------------------- |
| `dist/gkd.json5`         | GKD 应用读取的主订阅文件                              |
| `dist/README.md`         | 自动生成的应用和规则数量摘要                          |
| `dist/gkd.version.json5` | 版本跟踪                                              |
| `dist/CHANGELOG.md`      | 自动生成的变更日志                                    |
| 根目录 `README.md`       | 构建时根据 `Template.md` 重新生成，包含当前的统计数据 |

## 禁止行为

- ❌ 没有明确要求时，不要安装新依赖
- ❌ 不要修改 `.env` 文件
- ❌ 不要跳过 `pnpm run check` 直接提交

## 提交规范

完成一个独立功能、修复一个 Bug 或完成一次重构，并且验证通过后，自动执行 `git commit`。提交前必须保证本地检查和测试全部通过，不能跳过任何测试。

提交信息遵循 conventional commits（`commitlint.config.ts`），规则相关的提交格式为：

```
<type>: <应用名> <规则组名>

- 具体改动（可选，用中文）
```

| 场景             | type                                                          | 示例                                                      |
| ---------------- | ------------------------------------------------------------- | --------------------------------------------------------- |
| 新增规则或规则组 | `feat`                                                        | `feat: 一个木函 功能类-[关闭]保存成功弹窗`                |
| 修复失效规则     | 看情况：新增了规则或流程用 `feat`，只调整了原有选择器用 `fix` | `feat: QQ 分段广告-QQ空间空友爱看` / `fix: 酷安 开屏广告` |
| 修复旧规则误触   | `fix`                                                         | `fix: <应用名> <规则组名>`                                |
| 优化规则         | `perf`                                                        | `perf: 番茄免费小说 分段广告-阅读页面广告`                |
| 发版             | `chore`                                                       | `chore: v594`                                             |

不是规则相关的改动（文档、脚本、CI 等），使用常规的 `docs:`、`ci:`、`chore:` 等 type，后面用中文概括改动。

## PR 约束

PR 检查要求每个 PR **最多修改 1 个订阅源文件**，也就是只能修改一个 `src/apps/*.ts`、`src/categories.ts`、`src/globalGroups.ts` 或 `src/subscription.ts`。

## Git 钩子

通过 `simple-git-hooks` + `lint-staged` 实现：

- **pre-commit**：对暂存的 `.ts`/`.tsx`/`.js`/`.mjs`/`.cjs` 文件执行 ESLint + Prettier；对 `.json` 执行 Prettier；对 `.py` 执行 ruff check + ruff format。
- **commit-msg**：commitlint。
- **pre-push**：`pnpm run check`，外加 `scripts/python/tests/run_tests.sh`。后者只在 `scripts/python/` 或 `.github/workflows/` 有变更时，才执行 ruff 和 Python 单元测试。

## 代码风格

- TypeScript：遵循 ESLint + Prettier 配置，使用 `@gkd-kit/define` 提供的类型安全 API。
- Python：UTF-8 编码，类型注解使用 Python 3.10+ 语法，必须通过 `scripts/python/ruff.toml` 的检查。
