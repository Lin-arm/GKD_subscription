import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'cn.net.dascom.xrbridge',
  name: '新睿桥牌',
  groups: [
    {
      key: 1,
      name: '全屏广告',
      desc: '点击x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.ui.MainTabsActivity',
          matches: '[vid="iv_close"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/27314278', // 无 activityId,仅供参考
            'https://i.gkd.li/i/27316178',
          ],
        },
      ],
    },
  ],
});
