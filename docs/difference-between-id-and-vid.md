## id 和 vid 的区别

`vid` 属性是 GKD 在 2023 年 12 月 28 日的更新 [v1.6.0](https://github.com/gkd-kit/gkd/releases/tag/v1.6.0) 中新增的，在此之前截取的快照节点是没有 `vid` 属性的。所以在维护此项目时如果遇到旧快照的 `id` 符合格式 `应用包名:id/*`，可以使用 `vid` 简写。

总结一下就是：能用 `vid` 的地方尽可能用 `vid`，可以使选择器更加简洁。

### 示例

快照 <https://i.gkd.li/i/13255698> （包名：`com.google.android.gm`）

需要点击以下选择器：

```ts
[id="com.google.android.gm:id/button_chip_ad_teaser_info_icon"][clickable=true]
```

可以换成以下写法，也支持快速查询：

```ts
[vid="button_chip_ad_teaser_info_icon"][clickable=true]
```
