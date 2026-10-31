import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.phoenix.read.oversea.gp',
  name: '红果短剧',
  groups: [
    {
      key: 1,
      name: '权限提示-通知权限',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.dragon.read.pages.main.MainFragmentActivity',
          matches:
            '@[clickable=true] > [visibleToUser=true][text="暂不开启"] <<n [vid="push_permission_bottom_v2_compose_view"]',
          snapshotUrls: 'https://i.gkd.li/i/34212912',
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告',
      rules: [
        {
          fastQuery: true,
          swipeArg: {
            start: {
              x: 'screenWidth * 0.5',
              y: 'screenHeight * 0.7',
            },
            end: {
              x: 'screenWidth * 0.5',
              y: 'screenHeight * 0.3',
            },
            duration: 300, // 时间过短可能无效
          },
          activityIds: 'com.dragon.read.pages.main.MainFragmentActivity',
          matches: '[vid="ad_source"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/34213154',
        },
      ],
    },
  ],
});
