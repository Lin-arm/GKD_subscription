## 优先选择 clickable=true 的节点

当规则或规则组的 `action` 属性使用默认值 `click` 时，如果节点符合 `clickable=true`，则向系统发起一个点击无障碍节点事件。即使节点在屏幕外部或者被其它节点遮挡，也依然能够正确触发点击目标节点。

### 示例

对于快照 https://i.gkd.li/i/12798810

- `[text="我不喜欢这个广告"]` ❎不符合要求

- `@[clickable=true] > [text="我不喜欢这个广告"]` ✅符合要求

[相关 API](https://gkd.li/api/interfaces/RawAppRule#action)
