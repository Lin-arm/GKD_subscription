# GKD 快照数据 API 文档

## 快照版本历史

| GKD 版本        | 快照格式变化                          | 主要影响             |
| --------------- | ------------------------------------- | -------------------- |
| 2023-10-16 之前 | 无 quickFind 字段                     | 早期快照             |
| 2023-10-16      | 添加 `quickFind` 字段                 | 初步支持快速查询     |
| 2023-11-14      | `quickFind` 分离为 `idQf` 和 `textQf` | 更精细的快速查询支持 |
| 2023-11-17      | 移除 idQf/textQf 的相互依赖           | 两者完全独立         |
| 约 2024-01      | 移除 `quickFind` 字段                 | 仅保留 idQf/textQf   |
| 2025-11-02      | 修复 appInfo 获取逻辑                 | 提高兼容性           |

---

## 1. 概述

GKD（自动跳过广告工具）在运行过程中会通过无障碍服务捕获当前界面的视图树快照（Snapshot），并以 JSON 格式存储。该快照包含了应用信息、设备信息、GKD 自身状态以及完整的视图节点树，可用于离线分析、规则编写与调试。

本文档定义了 GKD 快照的数据结构、字段含义以及基于快照进行节点匹配时需遵循的规则，特别是针对 **快速查询（fastQuery）** 优化的支持。

---

## 2. 快照根对象

快照 JSON 的顶层是一个对象，包含以下字段：

| 字段           | 类型        | 必选 | 说明                                              |
| -------------- | ----------- | ---- | ------------------------------------------------- |
| `id`           | number      | 是   | 快照的唯一标识（通常为时间戳）                    |
| `appId`        | string      | 是   | 目标应用的包名                                    |
| `activityId`   | string/null | 否   | 当前界面的 Activity 完整类名，可能为 null         |
| `screenHeight` | int         | 是   | 屏幕高度（像素）                                  |
| `screenWidth`  | int         | 是   | 屏幕宽度（像素）                                  |
| `isLandscape`  | boolean     | 是   | 是否为横屏                                        |
| `appInfo`      | object/null | 否   | 目标应用的详细信息（见 2.1），可能为 null         |
| `gkdAppInfo`   | object/null | 否   | GKD 自身的详细信息（见 2.2），可能为 null         |
| `device`       | object      | 是   | 设备信息（见 2.3）                                |
| `nodes`        | array       | 是   | 视图节点数组，每个元素为一个节点对象（见第 3 节） |

> **旧版兼容字段**：旧版 GKD 生成的快照不包含 `appInfo` / `gkdAppInfo`，而是使用以下字段。解析器应优先读取 `appInfo` / `gkdAppInfo`，若缺失则回退至这些字段：
>
> | 字段             | 类型   | 说明                                                         |
> | ---------------- | ------ | ------------------------------------------------------------ |
> | `appName`        | string | 目标应用的显示名称 → 对应 `appInfo.name`                     |
> | `appVersionCode` | int    | 目标应用的版本号 → 对应 `appInfo.versionCode`                |
> | `appVersionName` | string | 目标应用的版本名称 → 对应 `appInfo.versionName`              |
> | `gkdVersionCode` | int    | GKD 的版本号 → 对应 `gkdAppInfo.versionCode`（旧版位于 `device` 对象内） |
> | `gkdVersionName` | string | GKD 的版本名称 → 对应 `gkdAppInfo.versionName`（旧版位于 `device` 对象内） |

### 2.1 `appInfo` 对象

| 字段          | 类型        | 说明                                |
| ------------- | ----------- | ----------------------------------- |
| `id`          | string      | 包名（同 `appId`）                  |
| `name`        | string      | 应用名称                            |
| `versionCode` | int         | 版本号                              |
| `versionName` | string/null | 版本名称，可能为 null               |
| `isSystem`    | boolean     | 是否为系统应用                      |
| `mtime`       | number      | 最后修改时间戳（毫秒）              |
| `hidden`      | boolean     | 是否隐藏                            |
| `enabled`     | boolean     | 应用是否启用（来自 PackageManager） |
| `userId`      | int         | 用户 ID（来自 MultiUserManager）    |

### 2.2 `gkdAppInfo` 对象

结构与 `appInfo` 相同（见 2.1），用于描述 GKD 自身信息，其中 `id` 固定为 `li.songe.gkd`。

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

| 字段     | 类型     | 必选 | 说明                                                                |
| -------- | -------- | ---- | ------------------------------------------------------------------- |
| `id`     | int      | 是   | 节点在当前数组中的唯一自增标识，从 0 开始                           |
| `pid`    | int      | 是   | 父节点的 `id`，根节点为 `-1`                                        |
| `idQf`   | boolean? | 是   | **合格标志**：`attr.id` 是否稳定且可用于快速查询（见第 5 节）       |
| `textQf` | boolean? | 是   | **合格标志**：`attr.text` 是否静态稳定且可用于快速查询（见第 5 节） |
| `attr`   | object   | 是   | 节点的详细属性（见第 4 节）                                         |

> **注意**：历史快照中可能缺少 `idQf` 或 `textQf` 字段（即 `undefined`），解析时应视为 `null`。

---

## 4. 属性对象（`attr`）

描述视图的具体布局、内容及交互属性。

| 字段            | 类型         | 说明                                       |
| --------------- | ------------ | ------------------------------------------ |
| `id`            | string/null  | 视图的资源 ID（如 `android:id/content`）   |
| `vid`           | string/null  | 视图的资源名称（ID 的简写）                |
| `name`          | string/null  | 视图的类名（如 `android.widget.TextView`） |
| `text`          | string/null  | 视图显示的文本内容                         |
| `desc`          | string/null  | 内容描述（无障碍描述）                     |
| `clickable`     | boolean      | 是否可点击                                 |
| `focusable`     | boolean      | 是否可获得焦点                             |
| `checkable`     | boolean      | 是否可勾选                                 |
| `checked`       | boolean/null | 是否已勾选，可能为 null                    |
| `editable`      | boolean      | 是否可编辑                                 |
| `longClickable` | boolean      | 是否可长按                                 |
| `visibleToUser` | boolean      | 是否对用户可见                             |
| `left`          | int          | 视图左边缘坐标（像素）                     |
| `top`           | int          | 视图上边缘坐标                             |
| `right`         | int          | 视图右边缘坐标                             |
| `bottom`        | int          | 视图下边缘坐标                             |
| `width`         | int          | 视图宽度（`right - left`）                 |
| `height`        | int          | 视图高度（`bottom - top`）                 |
| `childCount`    | int          | 子节点数量（仅视图组有效）                 |
| `index`         | int          | 在父节点中的位置索引                       |
| `depth`         | int          | 在视图树中的深度（根节点为 0）             |

---

## 5. 合格标志（`idQf` / `textQf`）与快速查询

### 5.1 定义

- **`idQf`**（ID Qualified）：若为 `true`，表示 `attr.id` 是稳定的、来自 Android 资源的视图 ID，可通过 `findAccessibilityNodeInfosByViewId` 快速定位。
- **`textQf`**（Text Qualified）：若为 `true`，表示 `attr.text` 是静态固定文本（不是时间、计数器等动态内容），可通过 `findAccessibilityNodeInfosByText` 快速定位。

### 5.2 快速查询优化

GKD 在匹配规则时，如果选择器使用了 `[vid="..."]` 或 `[text="..."]`，且对应节点的 `idQf` 或 `textQf` 为 `true`，则会调用 Android 系统的快速查找 API，**避免手动遍历整个视图树**，极大提升匹配效率。

- **适用条件**：节点必须在快照面板中被标记为"可快速查找"（即 `idQf === true` 或 `textQf === true`），否则快速查询 API 可能返回空或错误结果。
- **选择器示例**：
  - `[vid="com.example:id/confirm_button"]` → 依赖 `idQf`
  - `[text="确定"]` → 依赖 `textQf`

> **注意**：`textQf` 仅在 `[text="..."]` 精确匹配时有效。`text*="..."` / `text~="..."` / `text$="..."` 等通配符匹配无法使用快速查询，需要手动遍历视图树。

### 5.3 匹配规则

在编写或解析规则时，**必须遵守以下约束**：

| 条件                         | 行为                                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| `idQf === true`              | 可以安全地使用 `attr.id` 进行精确匹配，并可启用快速查询                   |
| `idQf === false` 或 `null`   | **不建议**使用 `attr.id` 作为匹配条件（ID 可能动态变化或不可靠）          |
| `textQf === true`            | 可以安全地使用 `attr.text` 进行完全匹配，并可启用快速查询                 |
| `textQf === false` 或 `null` | **不建议**使用 `attr.text` 作为固定文本匹配（例如倒计时"03:59:45"应忽略） |

> **解析器实现要求**：在匹配节点前，必须检查对应的 QF 标志。仅当标志为 `true` 时，才将该属性纳入匹配条件。

### 5.4 传播机制

GKD 在生成快照时，`idQf` / `textQf` 并非逐节点独立计算，而是通过**传播机制**批量赋值：

1. **计算顺序**：
   - 第一轮：从叶子节点向根节点反向遍历，只处理叶子节点
   - 第二轮：再次反向遍历，处理非叶子节点
2. **兄弟传播**：若某节点的 `idQf` 被确定为值，则其兄弟节点中未初始化的会被赋相同值（`textQf` 同理）。
3. **祖先传播**：若某节点的 `idQf` 为 `true`，则向所有未初始化的祖先节点传播 `idQf = true`，并同步传播至祖先的未初始化兄弟节点（叔伯节点）。
4. **子树传播**：若某节点的 `idQf` 为 `false`，则向其**整个子树**传播 `idQf = false`。
5. **等价传播**：若存在一个节点同时满足 `idQf === true && textQf === true`，则标记全局 `idTextQf = true`。后续传播中：
   - 传播 `idQf` 时，会同步传播 `textQf` 至兄弟节点和祖先的兄弟节点
   - 传播 `textQf` 时，会同步传播 `idQf` 至兄弟节点和祖先的兄弟节点

> **实际影响**：快照中经常出现整棵子树的 `idQf` / `textQf` 值完全相同，这是传播机制的结果，而非每个节点独立验证。

---

## 6. 示例

### 6.1 快照根对象（当前版本）

```json
{
    "id": 1711547793221,
    "appId": "com.miHoYo.cloudgames.ys",
    "activityId": "com.mihoyo.cloudgame.main.MiHoYoCloudMainActivity",
    "screenHeight": 1080,
    "screenWidth": 2400,
    "isLandscape": true,
    "appInfo": {
        "id": "com.miHoYo.cloudgames.ys",
        "name": "云·原神",
        "versionCode": 400000014,
        "versionName": "4.5.0",
        "isSystem": false,
        "mtime": 1711547793000,
        "hidden": false,
        "enabled": true,
        "userId": 10
    },
    "gkdAppInfo": {
        "id": "li.songe.gkd",
        "name": "GKD",
        "versionCode": 27,
        "versionName": "1.7.2",
        "isSystem": false,
        "mtime": 1711547793000,
        "hidden": false,
        "enabled": true,
        "userId": 10
    },
    "device": { ... },
    "nodes": [ ... ]
}
```

### 6.1b 快照根对象（旧版格式）

> 旧版 GKD 生成的快照不包含 `appInfo` / `gkdAppInfo`，应用信息以扁平字段形式存储，GKD 版本信息位于 `device` 对象内：

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
    "device": {
        "device": "PD2445",
        "model": "V2330A",
        "manufacturer": "vivo",
        "brand": "vivo",
        "sdkInt": 34,
        "release": "14",
        "gkdVersionCode": 27,
        "gkdVersionName": "1.7.2"
    },
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
- 若 `idQf` 或 `textQf` 缺失（`undefined`），解析时应视为 `null`，按"不合格"处理。
- **应用信息解析策略**：优先读取 `appInfo` 对象；若 `appInfo` 为 `null` 或缺失，回退读取顶层 `appName`、`appVersionCode`、`appVersionName`。
- **GKD 信息解析策略**：优先读取 `gkdAppInfo` 对象；若 `gkdAppInfo` 为 `null` 或缺失，回退读取 `device.gkdVersionCode`、`device.gkdVersionName`（旧版位于 `device` 对象内，而非顶层）。

### 7.2 树结构异常
- **孤儿节点**：`pid` 指向不存在的 `id` → 将该节点视为根节点。
- **循环引用**：检测到父子循环 → 终止遍历，记录错误日志。
- **重复 `id`**：`nodes` 数组中 `id` 必须唯一，若重复则后者覆盖前者（或报错）。

### 7.3 快速查询失败回退
- 即使 `idQf === true`，系统 API 也可能因节点未附加到窗口而返回空。解析器应实现回退策略：快速查询失败后，自动切换为手动遍历。

### 7.4 版本兼容

#### 7.4.1 节点字段差异

| 字段        | 当前版本   | 旧版快照               | 处理方式                                                                     |
| ----------- | ---------- | ---------------------- | ---------------------------------------------------------------------------- |
| `idQf`      | `boolean?` | 可能缺失               | 缺失时视为 `null`，不可快速查询                                              |
| `textQf`    | `boolean?` | 可能缺失               | 缺失时视为 `null`，不可快速查询                                              |
| `quickFind` | 不存在     | `boolean?`（历史字段） | 2023-10-16 引入，后分离为 idQf/textQf，现已完全移除。inspect-plus 兼容此字段 |

#### 7.4.2 属性字段差异

| 字段          | 当前版本  | 旧版快照  | 处理方式                         |
| ------------- | --------- | --------- | -------------------------------- |
| `clickable`   | `boolean` | 可能缺失  | 缺失时回退读取 `isClickable`     |
| `isClickable` | 不存在    | `boolean` | 等价于当前的 `clickable`         |
| `textLen`     | 不存在    | `number?` | 文本长度，当前版本已移除，可忽略 |
| `descLen`     | 不存在    | `number?` | 描述长度，当前版本已移除，可忽略 |
| 布尔属性      | 非空      | 可能缺失  | 缺失时视为 `false`               |

#### 7.4.3 根对象字段差异

| 字段          | 当前版本   | 旧版快照  | 处理方式                                       |
| ------------- | ---------- | --------- | ---------------------------------------------- |
| `appInfo`     | `AppInfo?` | 不存在    | 缺失时回退读取 `appName` / `appVersionCode` 等 |
| `gkdAppInfo`  | `AppInfo?` | 不存在    | 缺失时回退读取 `device.gkdVersionCode` 等      |
| `appName` 等  | 不存在     | 顶层字段  | 被 `appInfo` 取代，见第 2 节兼容字段表         |
| `gkdVersion*` | 不存在     | device 内 | 被 `gkdAppInfo` 取代，见第 2 节兼容字段表      |

---

## 8. 相关资源

- GKD 官方文档：[快速查询](https://gkd.li/guide/optimize#fast-query)
- 无障碍服务 API：[AccessibilityNodeInfo](https://developer.android.google.cn/reference/android/view/accessibility/AccessibilityNodeInfo)

---

*文档版本：1.1*
*最后更新：2026-07-16*
*基于 GKD 源码核实修正*