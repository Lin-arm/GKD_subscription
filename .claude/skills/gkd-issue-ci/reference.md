# Issue 审核 CI 参考

## Python 输出变量（GITHUB_OUTPUT）

| 变量名                | 类型   | 含义                                                                                   |
| --------------------- | ------ | -------------------------------------------------------------------------------------- |
| `has_snapshot`        | bool   | 是否包含任何快照链接                                                                   |
| `has_unreachable`     | bool   | 是否包含不可访问的快照链接                                                             |
| `network_status`      | string | 网络检查结果：`ok` / `404` / `uncertain` / `skipped`                                   |
| `network_detail`      | string | 网络错误详情（折叠展示）                                                               |
| `has_convertible`     | bool   | 是否有可以转换的 GitHub 附件                                                           |
| `warning_type`        | string | 警告类型：`missing` / `unreachable` / `inaccessible` / `uncertain` / `recovery` / `""` |
| `comment_missing`     | string | 缺失快照评论（含 `<!-- gkd-warning-missing -->`）                                      |
| `comment_unreachable` | string | 不可访问快照评论（含 `<!-- gkd-warning-unreachable -->`）                              |
| `comment_404`         | string | 链接 404 评论（含 `<!-- gkd-warning-404 -->`）                                         |
| `comment_uncertain`   | string | 网络不确定评论（含 `<!-- gkd-warning-uncertain -->`）                                  |
| `comment_recovery`    | string | 恢复评论（含 `<!-- gkd-warning-recovery -->`）                                         |
| `comment_bot`         | string | Bot 评论（含 `<!-- gkd-bot-comment -->`）                                              |
| `cache_data`          | string | 快照缓存 JSON（多行 heredoc），由 save-cache Job 持久化                                |

## 评论标记

| 标记                               | 场景             |
| ---------------------------------- | ---------------- |
| `<!-- gkd-warning-missing -->`     | 缺失快照         |
| `<!-- gkd-warning-unreachable -->` | 不可访问快照     |
| `<!-- gkd-warning-404 -->`         | 链接 404         |
| `<!-- gkd-warning-uncertain -->`   | 网络不确定       |
| `<!-- gkd-warning-recovery -->`    | 编辑或评论后恢复 |
| `<!-- gkd-bot-comment -->`         | Bot 转换评论     |

Recovery 用 `<!-- gkd-warning` 前缀匹配任意一条旧的警告评论。

## 标签

| 场景                        | 标签名                   | 是否关闭 Issue         |
| --------------------------- | ------------------------ | ---------------------- |
| 缺失快照                    | `缺失快照(no-snapshot)`  | ✅ 关闭（not planned） |
| 不可访问的快照链接          | `需补充链接(needs-link)` | ❌                     |
| 链接无法访问（404/403/5xx） | `链接失效(broken-link)`  | ❌                     |

## 链接识别

| 类型         | 匹配模式                                        | 分类                   |
| ------------ | ----------------------------------------------- | ---------------------- |
| GKD 分享链接 | `https://{domain}/i/\d+`                        | `gkd`                  |
| GitHub 附件  | `https://github.com/user-attachments/files/...` | `github_attachment`    |
| 不可访问快照 | `https://{domain}/snapshot/...`                 | `unreachable_snapshot` |

`{domain}` 匹配 `GKD_DOMAINS` 里的所有域名，默认是 `i.gkd.li`。

## 链接转换

**Bot 评论（GitHub 附件 → GKD 代理链接）**

- 只转换 `github_attachment` 类型的链接：`https://{primary_domain}/i?url={原始GitHub附件URL}`。
- GKD 链接原样保留。`primary_domain` 就是 `GKD_DOMAINS[0]`。

**网络检查（GKD 分享链接 → GH 附件 URL）**

- 只用于检查能否访问，不影响 Bot 评论的内容。
- `https://{domain}/i/{id}` → `https://github.com/user-attachments/files/{id}/file.zip`。其中 `file.zip` 是固定的占位文件名，`GKD_DOMAINS` 里的所有域名都适用。

## 网络检查策略

1. 优先发 HEAD 请求，只获取响应头。
2. HEAD 返回 405 时，改用 GET 加 Range 头，只请求第 1 个字节。
3. 超时时间 20 秒。
4. 404：确认无法访问（非致命，不关闭 Issue）。
5. 403 / 5xx：结果不确定，错误详情折叠展示。
6. 3xx：跟随重定向，以最终状态码为准。
7. GKD 分享链接先转换成 GH 附件 URL 再检查。
8. 检查所有链接，区分好链接和坏链接，只有好链接进入后续处理。

## 快照解析与 Bot 评论格式

解析策略：

- 把 zip 下载到内存，解压后读取快照 json。
- 同一个 Activity 只下载一个代表快照，其余的只记录链接。
- GKD 分享链接先转换成 GH 附件 URL 再下载解析。
- 下载失败的链接仍然保留为可转换链接。

主区域（直接可见）：

```
## AppName `appId` versionName
device_model · Android release · GKD version

**Activity** — 快查 ID:x Text:x · 深度x · 可点击x · xxx节点
[snapshot_id](converted_url)

**GKD 链接**
[display](url) · [display](url)
```

- App 标题：appName + appId + appVersionName
- App 副标题：device_model + Android 版本 + GKD 版本（同一个 App 只显示一次）
- Activity 行：activityId（只取最后一段）+ 可快速查询的 ID/Text 数量 + 最大深度 + 可点击节点数 + 总节点数
- 链接行：snapshot_id，链接到 GKD 代理 URL

折叠区（详细信息）：

- 按 App 分组的详细信息表：可见节点数、分辨率、屏幕方向、appVersionCode、GKD 版本号和构建号、userId
- 设备信息表（去重）：代号、型号、制造商、品牌、SDK、Android 版本

## 使用的 GitHub Actions

| Action                                               | 用途                                 |
| ---------------------------------------------------- | ------------------------------------ |
| `actions/checkout@v7`                                | 拉取代码                             |
| `actions/setup-python@v6`                            | 初始化 Python 环境                   |
| `astral-sh/setup-uv@v8.0.0`                          | 安装 uv，用来安装 `requirements.txt` |
| `actions/cache/restore@v6` / `actions/cache/save@v6` | 恢复和保存快照解析缓存               |
| `peter-evans/find-comment@v4`                        | 按作者和内容查找已有评论             |
| `peter-evans/create-or-update-comment@v5`            | 发布或更新评论（防刷屏）             |
| `gh` CLI（内置）                                     | 操作标签，关闭或重新打开 Issue       |
