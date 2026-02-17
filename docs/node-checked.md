## 巧用 checked 做限制

倘若目标节点是`[checkable=true]`(可勾选) 的选择框，一般都有个`checked`属性代表当前节点的勾选状态。

那么如果我们想打勾[✔]，可以点击状态为`[checked=false]`(未选中) 的节点，反之亦然。

### 示例

快照1 https://i.gkd.li/i/25098582 ，快照2 https://i.gkd.li/i/25098563

- 点击勾选上 [✔]

```ts
@CheckBox[clickable=true][checked=false] + [text$="不再询问"]
```

- 点击取消勾选 [ ]

```ts
@CheckBox[clickable=true][checked=true] + [text$="不再询问"]
```