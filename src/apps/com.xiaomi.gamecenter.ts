import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xiaomi.gamecenter',
  name: '小米游戏中心',
  groups: [
    {
      key: 1,
      name: '局部广告-首页右侧悬浮广告',
      rules: [
        {
          activityIds: '.ui.MainTabActivity',
          matches: '[vid="ad_view"] + [vid="close_btn"]',
          snapshotUrls: 'https://i.gkd.li/i/12715800',
        },
      ],
    },
  ],
});
