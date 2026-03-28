import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.dmzj.manhua',
  name: '动漫之家',
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
          activityIds: '.ui.LaunchInterceptorActivity',
          matches: '[vid="iv_close"]',
          snapshotUrls: 'https://i.gkd.li/i/13542503',
        },
      ],
    },
    {
      key: 2,
      name: '局部广告-悬浮广告',
      desc: '点击取消',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.ui.home.HomeTabsActivitys',
          matches: '[vid="ivAdClose"]',
          snapshotUrls: 'https://i.gkd.li/i/13542506',
        },
      ],
    },
  ],
});
