# CLAUDE.md

## 项目概述

GKD 订阅规则仓库 — 为 [GKD](https://gkd.li/) 提供第三方订阅规则（TypeScript）。`scripts/python/` 包含 GitHub Issue 自动审核工具（Python）。

## 技术栈

- **规则定义**: TypeScript + `@gkd-kit/define`
- **构建**: pnpm + tsx
- **CI**: GitHub Actions + Python 3.10+（标准库，无第三方依赖）
- **验证**: `@gkd-kit/tools`

## 开发命令

```bash
pnpm install          # 安装依赖
pnpm run check        # 类型检查 + 订阅验证
pnpm run build        # 构建 dist/gkd.json5 + 更新 README
pnpm run lint         # ESLint 自动修复
pnpm run format       # Prettier 格式化
```

## 禁止行为

- ❌ 不要安装新依赖除非明确要求
- ❌ 不要修改 `.env` 文件
- ❌ 不要绕过 `pnpm run check` 直接提交

## 注意事项

- 当代码架构发生中大幅度改变时(影响文档指导准确性时)，需要更新对应的`.md`文件。

## 目录结构

```
src/apps/*.ts        # 每个 Android 应用一个规则文件（以包名命名）
src/subscription.ts  # 入口：组装订阅对象
src/categories.ts    # 规则分类定义
src/globalGroups.ts  # 跨应用全局规则
scripts/python/      # Issue 自动审核工具
scripts/*.ts         # 构建/检查脚本
dist/                # 构建输出
```

## 上下文加载策略

详细文档按需加载，不要全部塞入上下文：

| 场景                  | 加载文件                        |
| --------------------- | ------------------------------- |
| 编写/修改订阅规则     | `.claude/rules/architecture.md` |
| 维护 CI / Python 脚本 | `.claude/rules/ci-cd.md`        |
| 编码规范 / 提交规范   | `.claude/rules/conventions.md`  |
