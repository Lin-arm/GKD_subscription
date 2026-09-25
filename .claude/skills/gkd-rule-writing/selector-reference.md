# 选择器速查

只摘录最容易写错的部分。完整语法见官方文档：

- 选择器语法：https://gkd.li/guide/selector
- 节点属性与方法：https://gkd.li/guide/node
- 选择示例：https://gkd.li/guide/example
- 查询优化：https://gkd.li/guide/optimize
- 规则字段（`RawAppRule` 等）：https://gkd.li/api/ ，或本地 `node_modules/@gkd-kit/api` 的类型定义

本仓库的补充文档：`docs/Selectors.md`（通用规则写法）、`docs/fast-query.md`、`docs/preferred-clickable-node.md`、`docs/checkbox-state.md`、`docs/difference-between-id-and-vid.md`。

## 匹配顺序与目标节点

- 选择器**从右往左**匹配：先找到最右侧的节点，再逐个验证左侧的关系。
- 目标节点：带 `@` 的那个属性选择器；如果没有 `@`，就是最右侧的属性选择器。
- 属性选择器和关系选择器之间**必须**用空格隔开：`A>B` 是非法写法，要写成 `A > B`。
- `TextView` 等价于 `[name='TextView'||name$='.TextView']`，`*` 表示匹配任意节点。

## 关系运算符（`A 运算符 B`，B 是更靠右、先被找到的节点）

| 写法               | 含义                                                                     |
| ------------------ | ------------------------------------------------------------------------ |
| `A + B` / `A +n B` | A 是 B 前面的兄弟节点，`A.index = B.index - n`                           |
| `A - B` / `A -n B` | A 是 B 后面的兄弟节点，`A.index = B.index + n`                           |
| `A > B` / `A >n B` | A 是 B 的祖先，`A.depth = B.depth - n`（`>2` 就是祖父节点）              |
| `A < B` / `A <n B` | A 是 B 的**直接子节点**，而且 A 是**第 n 个**子节点（`A.index = n - 1`） |
| `A <<n B`          | A 是 B 的子孙节点（任意深度）                                            |

- 数字可以写成元组 `(1,2,5)` 或多项式 `(an+b)`：`+(1,2)` 表示前 1 或前 2 个兄弟；`+n` 表示前面任意一个兄弟；`>n` 表示任意层级的祖先；`A B` 等价于 `A >n B`。
- **常见误解**：`<n` 表示的是「第 n 个子节点」，不是「往上 n 层」。要往上找 n 层，得把被找到的节点写在右边，用 `>n`。例如：
  - `@[clickable=true] <2 * >2 [text*="跳过"]`：先找到包含「跳过」的文本节点，往上 2 层得到容器 X；X 的第 2 个子节点（index=1）就是可点击的跳过按钮，也就是点击目标。
  - `@[clickable=true] + [text="广告"]`：先找到「广告」标签，它**前面**紧挨着的兄弟节点就是关闭按钮。
- 本项目不使用作用在整个选择器上的逻辑组合（`(A + B) || (C > D)`、`&&`、`!()`）。属性内部的 `&&`、`||`、`!()` 可以正常使用。

## 属性运算符

`=` `!=` `>` `>=` `<` `<=` `^=`（开头是）`*=`（包含）`$=`（结尾是）`~=`（正则）以及它们的否定形式 `!^=` `!*=` `!$=` `!~=`。

- 除了 `=` 和 `!=`，其他运算符在属性值为 null 时一律返回 false。比如 `[text!*="x"]` 对 text=null 的节点**不成立**；需要把 null 也算进来时，写成 `[text=null || text!*="x"]`。
- 常用属性：`id` `vid` `name` `text` `desc` `clickable` `visibleToUser` `checked` `index` `depth` `childCount` `left` `top` `right` `bottom` `width` `height` `parent`
- 常用方法：`text.length`、`parent.childCount.minus(1)`、`getChild(0)`

## 快速查询（fastQuery）

只有**最右侧属性选择器的第一个表达式**满足下面的形式之一时，才能走快速查询（通过 Android API 直接按 id/text 找节点）：

- `[id='x']` `[vid='x']` `[text='x']` `[text^='x']` `[text*='x']` `[text$='x']`，或者用 `||` 把它们连起来

注意：

- `A + B[vid='x'][childCount=2]` ✅，`A + B[childCount=2][vid='x']` ❎（`vid` 不在第一个位置）。
- **`desc` 不能参与快速查询**。只能靠 desc 定位时，规则可以正常工作，只是不走快速查询。
- 局部快速查询：`C[vid='x'] <<n D`，`C` 部分可以单独走快速查询。
- `test_selector.mjs` 会打印每条选择器的 fastQuery 列表。列表为空说明这条选择器不能快速查询。

## 字符串转义

选择器写在 TS/JSON 字符串里，会被转义两次：

- 正则 `\d` 在选择器里要写 `\\d`，放进规则字符串后要写成 `'[text~="\\\\d"]'`。
- 匹配单个 `\` 字符：`'[text="\\\\"]'`。
