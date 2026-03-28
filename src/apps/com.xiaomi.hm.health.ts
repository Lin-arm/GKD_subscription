import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xiaomi.hm.health',
  name: 'Zepp Life',
  groups: [
    {
      key: 1,
      name: '局部广告-首页-底部广告',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.ChannelMainTabActivity',
          matches: 'ImageView[vid="close_icon"]',
          snapshotUrls: 'https://i.gkd.li/i/13695424',
        },
      ],
    },
  ],
});
