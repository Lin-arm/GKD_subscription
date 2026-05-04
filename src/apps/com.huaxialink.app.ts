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
          matches: '[text="每日签到"] < [childCount=2] + [text="签到"]',
          snapshotUrls: 'https://i.gkd.li/i/27374402',
          exampleUrls: 'https://e.gkd.li/ad4a4cff-3bb7-4f06-94f1-57378afc10ab',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-自动关闭首页提示',
      desc: '关闭每次启动显示"不支持无缝切换"',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.MainActivity',
          matches:
            '[text*="暂不支持服务器间无缝切换"] <<3 * + [vid="buttonPanel"] >2 [text="我知道了"]',
          snapshotUrls: 'https://i.gkd.li/i/27377453',
          exampleUrls: 'https://e.gkd.li/0ef30ad2-9ba0-4b3e-a47d-241bb161ec6e',
        },
      ],
    },
  ],
});
