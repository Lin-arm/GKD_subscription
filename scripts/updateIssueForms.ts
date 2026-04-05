import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

type SyncMode = 'check' | 'write';

const issueTemplateDir = path.join(process.cwd(), '.github', 'ISSUE_TEMPLATE');

const normalizeText = (value: string) =>
  value.replace(/\r\n/g, '\n').trimEnd() + '\n';

const renderFeatureRequest = () => `name: 请求适配
title: '[Feature] '
description: 请求增加适配 APP 规则
body:
  - type: markdown
    attributes:
      value: |
        ## ⚠️ 在提交 issue 之前，请您务必确认以下信息，否则此 issue 可能会被关闭❗❗❗

        > [!WARNING]
        > - 不要提供截图，截图对编写规则**没有任何作用❗**
        > - 不要使用**截屏快照**

  - type: input
    id: scene
    attributes:
      label: 🎯 场景说明 / 补充信息
      description: 可填写本次想适配的界面、场景、按钮文字或其他补充说明
      placeholder: 例如：支付宝首页红包弹窗关闭按钮、进入直播间后的悬浮广告等
    validations:
      required: true

  - type: checkboxes
    id: base-info-confirm
    attributes:
      label: ✅ 请核对以下内容
      options:
        - label: 我已阅读 [不予适配情况合集](https://tinyurl.com/4re9bu6p) 并确认没有提及我想要适配的情况
          required: true
        - label: 我已**开启全局规则**并确认**此 App 无法触发全局规则**
          required: true
        - label: 我已确认使用的是 **最新版订阅** [![GitHub Release](https://img.shields.io/github/v/release/Lin-arm/GKD_subscription)](https://github.com/Lin-arm/GKD_subscription/releases/latest) 和 **最新版GKD** [![GitHub Release](https://img.shields.io/github/v/release/gkd-kit/gkd)](https://github.com/gkd-kit/gkd/releases/latest)
          required: true

  - type: checkboxes
    id: snapshot-confirm
    attributes:
      label: 📸 请确认快照已正确完整提供
      options:
        - label: 我已提供正确的**界面快照**（非截图）
          required: true
        - label: 如果是多次点击才能生效的情况，我已提供**每一次点击的快照**
          required: true

  - type: textarea
    id: snapshot
    attributes:
      label: |
        📸 需要适配界面的快照
      description: |
        快照是一个 zip 文件，快照链接是类似 "https://i.gkd.li/i/XXXXXXXX" 的文本，按照如下方式可获得快照信息

        按照下面的截图示例来获取界面快照，上传文件或者生成链接并粘贴到下面的输入框。\
        ![img](https://raw.githubusercontent.com/Lin-arm/GKD_subscription/refs/heads/main/Snapshot.webp)
    validations:
      required: true
`;

const renderBugReport = () => `name: 报告 Bug
title: '[Bug] '
description: 报告 误触/问题 规则
body:
  - type: markdown
    attributes:
      value: |
        ## ⚠️ 在提交 issue 之前，请您务必确认以下信息，否则此 issue 可能会被关闭❗❗❗

        > [!WARNING]
        > - 不要提供截图，截图对编写规则**没有任何作用❗**
        > - 不要使用**截屏快照**

  - type: checkboxes
    id: base-info-confirm
    attributes:
      label: ✅ 请核对以下内容
      options:
        - label: 我已提供正确的**界面快照**（非截图），并会在下方说明具体误触/问题情况
          required: true
        - label: 如果是多次点击才能生效的情况，我已提供**每一次点击的快照**
          required: true
        - label: 我已确认使用的是 **最新版订阅** [![GitHub Release](https://img.shields.io/github/v/release/Lin-arm/GKD_subscription)](https://github.com/Lin-arm/GKD_subscription/releases/latest) 和 **最新版GKD** [![GitHub Release](https://img.shields.io/github/v/release/gkd-kit/gkd)](https://github.com/gkd-kit/gkd/releases/latest)
          required: true

  - type: checkboxes
    id: extra-confirm
    attributes:
      label: 📋 其他信息
      description: 该问题是否属于以下情况？
      options:
        - label: 规则不生效，但是截取快照/重新进入软件后生效
        - label: 规则触发了（有点击提示），但实际不生效

  - type: textarea
    id: snapshot
    attributes:
      label: |
        📸 请提供误触界面/出现问题界面的快照（不要提供截图！！！不要使用截屏快照！！！），也可补充说明
      description: |
        快照是一个 zip 文件，快照链接是类似 "https://i.gkd.li/i/XXXXXXXX" 的文本，按照如下方式可获得快照信息

        按照下面的截图示例来获取界面快照，上传文件或者生成链接并粘贴到下面的输入框。\
        ![img](https://raw.githubusercontent.com/Lin-arm/GKD_subscription/refs/heads/main/Snapshot.webp)
    validations:
      required: true

  - type: textarea
    id: rule
    attributes:
      label: |
        🎯 问题说明 / 相关规则信息
      description: |
        请说明误触、不生效或其他异常情况，可补充相关规则名、触发步骤或记录界面截图
      placeholder: 例如：支付宝首页红包弹窗误触了全局规则，或进入直播间后悬浮广告没有触发
    validations:
      required: true
`;

const templates = [
  {
    path: path.join(issueTemplateDir, 'feature_request.yml'),
    content: renderFeatureRequest(),
  },
  {
    path: path.join(issueTemplateDir, 'bug_report.yml'),
    content: renderBugReport(),
  },
] as const;

const syncTemplate = async (
  templatePath: string,
  content: string,
  mode: SyncMode,
) => {
  const expected = normalizeText(content);
  const current = normalizeText(await fs.readFile(templatePath, 'utf8'));

  if (mode === 'check') {
    if (current !== expected) {
      throw new Error(
        `${path.relative(process.cwd(), templatePath)} 未与 issue form 生成脚本同步，请运行 pnpm run update:issue-forms`,
      );
    }
    return;
  }

  if (current !== expected) {
    await fs.writeFile(templatePath, expected, 'utf8');
  }
};

export const syncIssueForms = async (mode: SyncMode = 'check') => {
  await Promise.all(
    templates.map((template) =>
      syncTemplate(template.path, template.content, mode),
    ),
  );
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode: SyncMode = process.argv.includes('--write') ? 'write' : 'check';
  await syncIssueForms(mode);
}
