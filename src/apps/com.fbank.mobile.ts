import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.fbank.mobile',
  name: '富民银行',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          matches: '[vid="iv_dumiao"]',
          snapshotUrls: 'https://i.gkd.li/i/13797434',
        },
      ],
    },
  ],
});
