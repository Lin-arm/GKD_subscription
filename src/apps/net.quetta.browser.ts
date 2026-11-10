import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'net.quetta.browser',
  name: 'Quetta',
  groups: [
    {
      key: 1,
      name: '功能类-自动跳转第三方应用',
      desc: '点击[前往应用打开]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'org.chromium.chrome.browser.ChromeTabbedActivity',
          matches: '[text="前往应用打开"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/30294905',
          exampleUrls: 'https://e.gkd.li/fe296c51-cf5c-4a6f-a7b8-00a4dc194d5d',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-自动[保留]下载文件',
      rules: [
        {
          fastQuery: true,
          activityIds: 'org.chromium.chrome.browser.ChromeTabbedActivity',
          matches: '[vid="modal_dialog_view"] >2 [text="保留"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/30702229',
          exampleUrls: 'https://e.gkd.li/e45a8495-d6dd-4f7c-b324-0364ff0afe7b',
        },
      ],
    },
    {
      key: 3,
      name: '功能类-自动点击[仍然下载]',
      desc: '例如提示 文件可能有害 啥的, 点击[仍然下载]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'org.chromium.chrome.browser.ChromeTabbedActivity',
          matches: '[text="仍然下载"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/34111999',
          exampleUrls: 'https://e.gkd.li/1390ac8c-50aa-4f0c-a4fd-b451fea175ac',
        },
      ],
    },
    {
      key: 4,
      name: '功能类-防止误关所有标签页',
      desc: '弹窗,要关闭所有标签页吗? 点击[取消]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'org.chromium.chrome.browser.ChromeTabbedActivity',
          matches:
            '[text="要关闭所有标签页吗？"] +2 [visibleToUser=true] > [text="取消"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/34112024',
          exampleUrls: 'https://e.gkd.li/2087b9bc-f161-43b1-a931-0c7f28029dd4',
        },
      ],
    },
    {
      key: 5,
      name: '功能类-自动点击[下载]',
      desc: '弹窗, 点击[下载]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'org.chromium.chrome.browser.ChromeTabbedActivity',
          matches: '[vid="downloadLocationButton"]',
          snapshotUrls: 'https://i.gkd.li/i/34135770',
          exampleUrls: 'https://e.gkd.li/c6a867d4-c234-4412-be73-7900aadbdca4',
        },
      ],
    },
    {
      key: 6,
      name: '功能类-下载完自动[打开]文件',
      desc: '点击[打开]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'org.chromium.chrome.browser.ChromeTabbedActivity',
          matches:
            '@[text="打开"] < FrameLayout - [visibleToUser=true] > [text$="文件已下载完毕"]',
          snapshotUrls: 'https://i.gkd.li/i/34482455',
          exampleUrls: 'https://e.gkd.li/e83bcee8-2540-4b99-8077-fe18378f5ac5',
        },
      ],
    },
  ],
});
