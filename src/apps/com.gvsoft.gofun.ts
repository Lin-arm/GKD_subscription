import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.gvsoft.gofun',
  name: 'GoFun出行',
  groups: [
    {
      key: 5,
      name: '全屏广告-弹窗广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.module.home.activity.HomeActivity',
          matches: '[vid="cardView"] + [vid="iv_close"]',
          snapshotUrls: 'https://i.gkd.li/i/13497777',
        },
      ],
    },
  ],
});
