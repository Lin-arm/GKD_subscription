import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.netease.yanxuan',
  name: '网易严选',
  groups: [
    {
      key: 1,
      name: '全屏广告-首页弹窗广告',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.module.mainpage.activity.MainPageActivity',
          matches: '[vid="trans_cancel"]',
          snapshotUrls: 'https://i.gkd.li/i/12840641',
        },
      ],
    },
  ],
});
