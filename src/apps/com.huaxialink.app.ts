import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.huaxialink.app',
  name: '华夏直通',
  groups: [
    {
      key: 1,
      name: '功能类-每日自动签到',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.MainActivity',
          matches:
            '[text="每日签到"] < [childCount=2] + [text="签到"][index=parent.childCount.minus(1)]',
          snapshotUrls: 'https://i.gkd.li/i/27374402',
          exampleUrls: 'https://e.gkd.li/ad4a4cff-3bb7-4f06-94f1-57378afc10ab',
        },
      ],
    },
  ],
});
