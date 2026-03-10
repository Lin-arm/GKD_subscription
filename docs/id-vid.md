### 关于 id 和 vid

GKD 能根据 `id` 这个属性快速查找节点，是通过 Android API 里的 [findAccessibilityNodeInfosByViewId](https://developer.android.google.cn/reference/android/view/accessibility/AccessibilityNodeInfo#findAccessibilityNodeInfosByViewId(java.lang.String)) ，其输入参数必须是完整的 'view id' 字符串。

与可以裁切的 `text` 属性不同，`id` 若经过 `^` 、 `$` 、 `*` 裁切，就会失去快速查询这一特性。

而 `vid` 不算完整的 'view id' 也能用快速查询，是因为在 GKD 内部 `vid` 会先跟应用包名拼接成完整 `id` 再调用快速查询的 API ，您可以理解为：

```ts
`id` = `应用包名:id/` + `vid` 
```

`vid` 属性是2023年12月14日引进的([cc5d6197](https://github.com/gkd-kit/gkd/commit/cc5d619737454a8ca1c995c66ac13224d9455674))，在此之前截的快照的节点是没有 `vid` 的，所以在维护此项目时遇到旧快照的 `id` 符合 `应用包名:id/` + `vid` 这种格式，可以直接简写用 `vid` ，例如：

快照 <https://i.gkd.li/i/13255698> （包名：com.google.android.gm）的选择器

```ts
[id="com.google.android.gm:id/button_chip_ad_teaser_info_icon"][clickable=true]
```

可以换成下面这种写法（也支持快速查询）

```ts
[vid="button_chip_ad_teaser_info_icon"][clickable=true]
```
