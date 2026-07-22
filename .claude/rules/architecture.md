# 项目架构

## 项目概述

GKD 订阅规则仓库 — 为 [GKD](https://gkd.li/) 提供第三方订阅规则。GKD 是一款基于 Android 无障碍服务的工具，可自动关闭广告、弹窗和不需要的 UI 元素。规则以 TypeScript 文件编写，定义 UI 节点选择器来匹配 Android 视图层级快照。

## 核心流程

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

## 关键依赖

| 包名              | 用途                                                                                    |
| ----------------- | --------------------------------------------------------------------------------------- |
| `@gkd-kit/define` | `defineGkdApp`、`defineGkdSubscription`、`defineGkdCategories`、`defineGkdGlobalGroups` |
| `@gkd-kit/api`    | TypeScript 类型（`RawApp`、`RawAppGroup` 等）                                           |
| `@gkd-kit/tools`  | `batchImportApps`、`checkSubscription`、`checkApiVersion`、`updateDist`                 |

## 规则结构

每个应用规则文件遵循以下模式：

```ts
import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.example.app', // Android 包名
  name: '应用名称',
  groups: [
    {
      key: 0,
      name: '分段广告-具体描述', // 必须以 categories.ts 中的分类名称开头
      activityIds: ['com.example.Activity'], // 可选：限制特定 Activity
      rules: [
        {
          key: 0,
          name: '步骤 1 描述',
          matches: '[选择器语法]', // GKD 选择器（类 CSS 语法）
          snapshotUrls: ['https://i.gkd.li/i/...'], // 必填：用于维护的快照链接
        },
      ],
    },
  ],
});
```

## 选择器语法

GKD 选择器使用类 CSS 语法匹配 Android 视图节点。常用模式：

| 语法                        | 说明           | 示例                                 |
| --------------------------- | -------------- | ------------------------------------ |
| `[text="精确文本"]`         | 按文本内容匹配 | `[text="跳过广告"]`                  |
| `[text*="包含"]`            | 子字符串匹配   | `[text*="跳过"]`                     |
| `[id="com.example:id/btn"]` | 按资源 ID 匹配 | `[id="com.tencent.mm:id/close"]`     |
| `[vid="mainId"]`            | 按子 ID 匹配   | `[vid="btn_skip"]`                   |
| `[clickable=true]`          | 按属性匹配     | `[clickable=true]`                   |
| `@Node > [text="Child"]`    | 关系选择器     | `@FrameLayout > [text="关闭"]`       |
| `[visibleToUser=true]`      | 可见性约束     | `[visibleToUser=true][text*="广告"]` |

详见 [GKD API 文档](https://gkd.li/api/) 和 [选择器参考](../../docs/Selectors.md)
