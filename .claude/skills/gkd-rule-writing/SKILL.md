---
name: gkd-rule-writing
description: 根据 GKD 快照编写、修改或修复订阅规则（src/apps/*.ts、src/globalGroups.ts）：解析快照节点树、设计并本地验证选择器、编写规则组、快照脱敏、核对 snapshotUrls。
---

# GKD 规则编写

项目架构、分类约束、提交规范见根目录 `AGENTS.md`。选择器语法速查见同目录的 [selector-reference.md](selector-reference.md)，设计选择器之前**先读一遍**。

## 规则文件结构

```ts
import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.example.app', // Android 包名，和文件名一致
  name: '应用名称',
  groups: [
    {
      key: 0,
      name: '分段广告-具体描述', // 必须以 src/categories.ts 里的分类名开头
      desc: '①点击[关闭] ②点击[不感兴趣]',
      fastQuery: true,
      activityIds: 'com.example.MainActivity', // 可选：限定 Activity
      rules: [
        {
          key: 0,
          name: '①关闭',
          matches: '@[clickable=true] > [text="关闭"]',
          snapshotUrls: 'https://i.gkd.li/i/12345678', // 必填：快照链接
        },
        {
          key: 1,
          preKeys: [0], // 上一步触发后才会匹配
          name: '②不感兴趣',
          activityIds: '.OtherActivity', // 相对写法，会自动拼接包名
          matches: '@[clickable=true] > [text="不感兴趣"]',
          snapshotUrls: 'https://i.gkd.li/i/12345679',
        },
      ],
    },
  ],
});
```

完整字段（`matchTime`、`actionMaximum`、`resetMatch`、`action` 等）见 https://gkd.li/api/ ，或本地 `node_modules/@gkd-kit/api` 的类型定义。写之前先参考同类型的现有规则怎么用这些字段。

## 辅助脚本

脚本都在 `.claude/skills/gkd-rule-writing/scripts/` 下，**在仓库根目录运行**（`test_selector.mjs` 从当前目录解析 `node_modules`）。中间产物放在临时目录，不要写进仓库。

| 脚本                                                                        | 用途                                                                                                              |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `python dump_tree.py <快照...> [-o 目录]`                                   | 把快照 zip、目录或 json 导出为缩进的节点树文本                                                                    |
| `node test_selector.mjs <快照...> -- <选择器...>`                           | 在多个快照上批量匹配选择器，同时做类型检查并打印 fastQuery 列表。匹配逻辑移植自官方审查工具，结果和 i.gkd.li 一致 |
| `python desensitize.py <快照.zip> [--node ..] [--mask-node ..] [--rect ..]` | 替换节点文本，并用纯色矩形遮盖截图中的敏感区域。完整参数见脚本开头的说明                                          |

节点树每一行的格式：`#id 类名 vid=.. text=.. desc=.. C(可点击) INV(不可见) [left,top,right,bottom] cc=子节点数 i=index`

text/desc 用 Python 的 `repr()` 输出，所以不可见字符会显示成转义形式，例如 `​`（零宽空格）、`\xa0`（不换行空格）。这些字符在网页端和截图上都看不出来，**从 i.gkd.li 属性面板复制文本时也会一起被复制**。有些广告会故意在文字之间插入零宽空格，这时照着页面上看到的文字写 `[text^="应用名称"]` 会匹配不到。写选择器时要避开含这类字符的片段，改用 `^=`、`*=`、`$=` 匹配纯文字的部分，然后用 `test_selector.mjs` 验证。

## 流程

1. **理解快照**
   - 快照 zip 里有一个 json 和一张 png，文件名可能是 `{id}.json`/`{id}.png`，也可能是 `snapshot.json`/`screenshot.png`（旧版 GKD），脚本按扩展名查找，两种都支持。快照 ID 以 json 里的 `id` 字段为准，它是抓取时的**毫秒时间戳**；节点数据在 `nodes[]` 里，每个节点有 `id`、`pid`、`attr`。
   - 用 `dump_tree.py` 导出节点树，再用 Read 查看截图，弄清每个快照对应哪一步，以及要点击哪个节点。
   - 按时间戳排序，通常就是操作顺序。

2. **读现有规则**：打开 `src/apps/<包名>.ts`，找到目标规则组，看看已有的 key、`preKeys`、`activityIds`、`fastQuery` 是怎么写的。

3. **设计选择器**（遵守下面的「选择器约束」）
   - 先确定点击目标，再找附近稳定的锚点（text/desc），用关系运算符连起来。
   - 需要快速查询时，把 text/vid/id 锚点放在**最右侧**，而且要写在该属性选择器的第一个位置。

4. **本地验证**：用 `test_selector.mjs` 在**全部**快照上跑每条选择器。
   - 在目标快照里**正好命中 1 个**正确的节点；
   - 在其他快照里命中 0 个，尤其是同一个 Activity 的快照，避免误触。

5. **写规则**
   - 修改现有规则组时，**在后面追加新的 key**，不要主动删掉或修改旧规则，它们可能还在适配旧版本应用。
   - 多步操作用 `preKeys` 串联，每一步都写 `name`（例如 `'①更多操作'`）。
   - 如果某一步在另一个 Activity，就在这条 rule 上单独写 `activityIds`，可以用 `.activity.Xxx` 这种相对写法。
   - 同步更新规则组的 `desc`，描述新的操作步骤。
   - 规则组名称必须以 `src/categories.ts` 里的分类名开头。

6. **快照链接**
   - `snapshotUrls` 是必填项，只能由用户在 GKD 里上传后提供，AI 不能代替用户上传。写好规则后把快照 ID 列出来，请用户分享。
   - **提醒用户先脱敏**：快照上传后是公开的。和规则无关、但出现在快照里的个人信息（用户名、用户的好友姓名、真实姓名、头像等），要同时处理节点文本（`--node`）和截图（`--mask-node` 或 `--rect`）。规则目标节点和用来定位的锚点保持不变。处理完后用 Read 查看 `--preview` 输出的截图，并用 `dump_tree.py` 确认 zip 能正常读取。
   - 只接受 `https://i.gkd.li/i/{数字}` 格式的链接。`/snapshot/{id}` 是浏览器本地链接，别人打不开。
   - **核对链接和快照的对应关系**：用户给的链接顺序不一定对。可以在浏览器里打开每个链接，看页面上的拍摄时间，和快照 ID（时间戳，按北京时间换算）对照。
   - 需要让用户在线复查时，可以给出 `https://i.gkd.li/i/{id}?gkd={选择器的 base64url}`，打开后搜索框会自动填入这条选择器。

7. **检查并提交**：运行 `pnpm run check`，通过后按 `AGENTS.md` 的提交规范提交。每次只修改一个订阅源文件。

## 选择器约束

- **禁止使用混淆的短 vid / id**：像 `[vid="044"]`、`[vid="qf7"]` 这类由打包工具自动生成的 ID，应用每次更新都可能变化。只有语义化的 vid（如 `btn_skip`、`close_button`）才可以用。混淆 ID 可以用 text/desc 锚点加结构关系代替，中间节点用 `*` 或系统类名（`FrameLayout`、`ViewGroup` 等）。
- **优先点击 `clickable=true` 的节点**，这样即使节点被遮挡也能点中。目标节点本身不可点击时，用 `@[clickable=true] > ...` 选中可点击的父节点。详见 `docs/preferred-clickable-node.md`。
- 按钮在屏幕外时不应该点击：给目标节点加上 `[visibleToUser=true]`。
- 通过「已选中」「未选中」之类的状态来区分步骤，避免同一步重复触发。复选框的写法见 `docs/checkbox-state.md`。
- 描述里包含个人内容的节点（用户名、正文等）不能作为锚点。
