## 复选框的勾选状态

倘若目标节点是 `[checkable=true]` (可勾选) 的复选框，一般可以通过 `checked` 属性获取当前节点的勾选状态。

那么如果我们想打勾[✔]，可以点击状态为 `[checked=false]` (未勾选) 的节点，反之亦然。

> [!IMPORTANT]  
> 
> 不是所有复选框都能通过 `checked` 属性判断是否勾选，使用前务必抓取勾选前和勾选后的快照进行对比。

### 示例

快照：[未勾选](https://i.gkd.li/i/25098582) , [已勾选](https://i.gkd.li/i/25098563)

- 点击未勾选的复选框，使其勾选上 [ &nbsp;&nbsp;] → [✔]

  ```ts
  @CheckBox[clickable=true][checked=false] + [text$="不再询问"]
  ```

- 点击已经勾选的复选框，使其取消勾选 [✔] → [ &nbsp;&nbsp;]

  ```ts
  @CheckBox[clickable=true][checked=true] + [text$="不再询问"]
  ```
