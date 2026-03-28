import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.black.unique',
  name: '全球购骑士特权',
  groups: [
    {
      key: 1,
      name: '全屏广告-弹窗广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.feature.home.HomeActivity',
          matches: '@ImageView[vid="iv_close"]',
          snapshotUrls: 'https://i.gkd.li/i/13499502',
        },
      ],
    },
  ],
});
