# GKD 快照数据 API 文档

## 1. 概述

GKD（自动跳过广告工具）在运行过程中会通过无障碍服务捕获当前界面的视图树快照（Snapshot），并以 JSON 格式存储。该快照包含了应用信息、设备信息、GKD 自身状态以及完整的视图节点树，可用于离线分析、规则编写与调试。

本文档定义了 GKD 快照的数据结构、字段含义以及基于快照进行节点匹配时需遵循的规则，特别是针对 **快速查询（fastQuery）** 优化的支持。

---

## 2. 快照根对象

快照 JSON 的顶层是一个对象，包含以下字段：

| 字段             | 类型       | 必选 | 说明                                                         |
| ---------------- | ---------- | ---- | ------------------------------------------------------------ |
| `id`             | number     | 是   | 快照的唯一标识（通常为时间戳）                               |
| `appId`          | string     | 是   | 目标应用的包名                                               |
| `activityId`     | string     | 是   | 当前界面的 Activity 完整类名                                 |
| `screenHeight`   | int        | 是   | 屏幕高度（像素）                                             |
| `screenWidth`    | int        | 是   | 屏幕宽度（像素）                                             |
| `isLandscape`    | boolean    | 是   | 是否为横屏                                                   |
| `appInfo`        | object     | 否   | 目标应用的详细信息（见 2.1），与顶层 `appName` 等互斥        |
| `appName`        | string     | 否   | 目标应用的显示名称（精简模式）                               |
| `appVersionCode` | int/string | 否   | 目标应用的版本号（精简模式）                                 |
| `appVersionName` | string     | 否   | 目标应用的版本名称（精简模式）                               |
| `gkdAppInfo`     | object     | 否   | GKD 自身的详细信息（见 2.2），与顶层 `gkdVersionCode` 等互斥 |
| `gkdVersionCode` | int        | 否   | GKD 的版本号（精简模式）                                     |
| `gkdVersionName` | string     | 否   | GKD 的版本名称（精简模式）                                   |
| `device`         | object     | 是   | 设备信息（见 2.3）                                           |
| `nodes`          | array      | 是   | 视图节点数组，每个元素为一个节点对象（见第 3 节）            |

### 2.1 `appInfo` 对象（完整模式）

| 字段          | 类型    | 说明                    |
| ------------- | ------- | ----------------------- |
| `id`          | string  | 包名（同 `appId`）      |
| `name`        | string  | 应用名称                |
| `versionCode` | int     | 版本号                  |
| `versionName` | string  | 版本名称                |
| `isSystem`    | boolean | 是否为系统应用          |
| `mtime`       | number  | 最后修改时间戳（毫秒）  |
| `hidden`      | boolean | 是否隐藏                |
| `enabled`     | boolean | 是否启用                |
| `userId`      | int     | 用户 ID（0 表示主用户） |

### 2.2 `gkdAppInfo` 对象（完整模式）

| 字段          | 类型    | 说明                       |
| ------------- | ------- | -------------------------- |
| `id`          | string  | GKD 包名（`li.songe.gkd`） |
| `name`        | string  | GKD 名称                   |
| `versionCode` | int     | GKD 版本号                 |
| `versionName` | string  | GKD 版本名称               |
| `isSystem`    | boolean | 是否系统应用               |
| `mtime`       | number  | 最后修改时间戳             |
| `hidden`      | boolean | 是否隐藏                   |
| `enabled`     | boolean | 是否启用                   |
| `userId`      | int     | 用户 ID                    |

### 2.3 `device` 对象

| 字段           | 类型   | 说明                    |
| -------------- | ------ | ----------------------- |
| `device`       | string | 设备代号（如 `PD2445`） |
| `model`        | string | 用户可见的设备型号      |
| `manufacturer` | string | 制造商                  |
| `brand`        | string | 品牌                    |
| `sdkInt`       | int    | Android SDK 版本号      |
| `release`      | string | Android 系统版本字符串  |

---

## 3. 节点对象（`nodes` 数组元素）

每个节点代表视图树中的一个视图（View）或视图组（ViewGroup）。

| 字段     | 类型         | 必选 | 说明                                                                |
| -------- | ------------ | ---- | ------------------------------------------------------------------- |
| `id`     | int          | 是   | 节点在当前数组中的唯一自增标识，从 0 开始                           |
| `pid`    | int          | 是   | 父节点的 `id`，根节点为 `-1`                                        |
| `idQf`   | boolean/null | 是   | **合格标志**：`attr.id` 是否稳定且可用于快速查询（见第 5 节）       |
| `textQf` | boolean/null | 是   | **合格标志**：`attr.text` 是否静态稳定且可用于快速查询（见第 5 节） |
| `attr`   | object       | 是   | 节点的详细属性（见第 4 节）                                         |

> **注意**：历史快照中可能缺少 `idQf` 或 `textQf` 字段（即 `undefined`），解析时应视为 `null`。

---

## 4. 属性对象（`attr`）

描述视图的具体布局、内容及交互属性。

| 字段            | 类型        | 说明                                       |
| --------------- | ----------- | ------------------------------------------ |
| `id`            | string/null | 视图的资源 ID（如 `android:id/content`）   |
| `vid`           | string/null | 视图的资源名称（ID 的简写）                |
| `name`          | string      | 视图的类名（如 `android.widget.TextView`） |
| `text`          | string/null | 视图显示的文本内容                         |
| `desc`          | string/null | 内容描述（无障碍描述）                     |
| `clickable`     | boolean     | 是否可点击                                 |
| `focusable`     | boolean     | 是否可获得焦点                             |
| `checkable`     | boolean     | 是否可勾选                                 |
| `checked`       | boolean     | 是否已勾选                                 |
| `editable`      | boolean     | 是否可编辑                                 |
| `longClickable` | boolean     | 是否可长按                                 |
| `visibleToUser` | boolean     | 是否对用户可见                             |
| `left`          | int         | 视图左边缘坐标（像素）                     |
| `top`           | int         | 视图上边缘坐标                             |
| `right`         | int         | 视图右边缘坐标                             |
| `bottom`        | int         | 视图下边缘坐标                             |
| `width`         | int         | 视图宽度（`right - left`）                 |
| `height`        | int         | 视图高度（`bottom - top`）                 |
| `childCount`    | int         | 子节点数量（仅视图组有效）                 |
| `index`         | int         | 在父节点中的位置索引                       |
| `depth`         | int         | 在视图树中的深度（根节点为 0）             |

---

## 5. 合格标志（`idQf` / `textQf`）与快速查询

### 5.1 定义

- **`idQf`**（ID Qualified）：若为 `true`，表示 `attr.id` 是稳定的、来自 Android 资源的视图 ID，可通过 `findAccessibilityNodeInfosByViewId` 快速定位。
- **`textQf`**（Text Qualified）：若为 `true`，表示 `attr.text` 是静态固定文本（不是时间、计数器等动态内容），可通过 `findAccessibilityNodeInfosByText` 快速定位。

### 5.2 快速查询优化

GKD 在匹配规则时，如果选择器使用了 `[vid="..."]` 或 `[text="..."]`，且对应节点的 `idQf` 或 `textQf` 为 `true`，则会调用 Android 系统的快速查找 API，**避免手动遍历整个视图树**，极大提升匹配效率。

- **适用条件**：节点必须在快照面板中被标记为“可快速查找”（即 `idQf === true` 或 `textQf === true`），否则快速查询 API 可能返回空或错误结果。
- **选择器示例**：
  - `[vid="com.example:id/confirm_button"]` → 依赖 `idQf`
  - `[text="确定"]` → 依赖 `textQf`

### 5.3 匹配规则

在编写或解析规则时，**必须遵守以下约束**：

| 条件                         | 行为                                                                    |
| ---------------------------- | ----------------------------------------------------------------------- |
| `idQf === true`              | 可以安全地使用 `attr.id` 进行精确匹配，并可启用快速查询                 |
| `idQf === false` 或 `null`   | **不应**使用 `attr.id` 作为匹配条件（ID 可能动态变化或不可靠）          |
| `textQf === true`            | 可以安全地使用 `attr.text` 进行完全匹配，并可启用快速查询               |
| `textQf === false` 或 `null` | **不应**使用 `attr.text` 作为固定文本匹配（例如倒计时“03:59:45”应忽略） |

> **解析器实现要求**：在匹配节点前，必须检查对应的 QF 标志。仅当标志为 `true` 时，才将该属性纳入匹配条件。

---

## 6. 示例

### 6.1 快照根对象（精简模式）

```json
{
    "id": 1711547793221,
    "appId": "com.miHoYo.cloudgames.ys",
    "activityId": "com.mihoyo.cloudgame.main.MiHoYoCloudMainActivity",
    "appName": "云·原神",
    "appVersionCode": 400000014,
    "appVersionName": "4.5.0",
    "screenHeight": 1080,
    "screenWidth": 2400,
    "isLandscape": true,
    "gkdVersionCode": 27,
    "gkdVersionName": "1.7.2",
    "device": { ... },
    "nodes": [ ... ]
}
```

### 6.2 节点对象（含合格标志）

```json
{
    "id": 5,
    "pid": 3,
    "idQf": true,
    "textQf": true,
    "attr": {
        "id": "com.ss.android.article.lite:id/dcw",
        "vid": "dcw",
        "name": "android.widget.TextView",
        "text": "领取成功！继续观看视频领取更多时长",
        "clickable": false,
        "visibleToUser": true,
        "left": 107,
        "top": 1470,
        "right": 974,
        "bottom": 1538,
        "width": 867,
        "height": 68,
        "childCount": 0,
        "index": 1,
        "depth": 4
    }
}
```

### 6.3 节点对象（动态文本，不可用于匹配）

```json
{
    "id": 9,
    "pid": 7,
    "idQf": true,
    "textQf": false,
    "attr": {
        "id": "com.ss.android.article.lite:id/dcs",
        "text": "03:59:45",
        ...
    }
}
```

> 该节点的 `textQf` 为 `false`，表示文本是动态倒计时，不应作为固定文本匹配。

---

## 7. 错误处理与兼容性

### 7.1 缺失字段
- 若 `idQf` 或 `textQf` 缺失（`undefined`），解析时应视为 `null`，按“不合格”处理。
- 若 `appInfo` 缺失，应回退读取 `appName`、`appVersionCode` 等顶层字段。
- 若 `gkdAppInfo` 缺失，应回退读取 `gkdVersionCode`、`gkdVersionName`。

### 7.2 树结构异常
- **孤儿节点**：`pid` 指向不存在的 `id` → 将该节点视为根节点。
- **循环引用**：检测到父子循环 → 终止遍历，记录错误日志。
- **重复 `id`**：`nodes` 数组中 `id` 必须唯一，若重复则后者覆盖前者（或报错）。

### 7.3 快速查询失败回退
- 即使 `idQf === true`，系统 API 也可能因节点未附加到窗口而返回空。解析器应实现回退策略：快速查询失败后，自动切换为手动遍历。

### 7.4 版本兼容
- 旧版 GKD 生成的快照可能不含 `idQf` / `textQf`，此时默认所有节点的这两个标志均为 `null`，即**无法使用快速查询**，需完全遍历。

---

## 8. 相关资源

- GKD 官方文档：[快速查询](https://gkd.li/guide/optimize#fast-query)
- 无障碍服务 API：[AccessibilityNodeInfo](https://developer.android.google.cn/reference/android/view/accessibility/AccessibilityNodeInfo)

---

*文档版本：1.0*  
*最后更新：2026-04-06*
*author：DeepSeek*
'内容由AI生成，请仔细甄别'