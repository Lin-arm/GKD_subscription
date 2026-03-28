import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.leduoworks.gpstoolbox',
  name: 'GPS工具箱',
  groups: [
    {
      key: 1,
      name: '局部广告-首页占位广告',
      rules: [
        {
          fastQuery: true,
          activityIds: '.frmt.MainFrmtActivity',
          matches: '[vid="iv_close"]',
          snapshotUrls: 'https://i.gkd.li/i/13062612',
        },
      ],
    },
  ],
});
