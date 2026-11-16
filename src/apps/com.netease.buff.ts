import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.netease.buff',
  name: '网易BUFF',
  groups: [
    {
      key: 1,
      name: '权限提示-通知权限',
      desc: '点击[取消]',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.entry.MainActivity',
          matches: [
            '[text*="通知"][visibleToUser=true]',
            '[text="取消"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/34897764',
          exampleUrls: 'https://e.gkd.li/04139a2c-6d43-49b8-be52-d7611d31df46',
        },
      ],
    },
  ],
});
