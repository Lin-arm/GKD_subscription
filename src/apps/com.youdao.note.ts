import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.youdao.note',
  name: '有道云笔记',
  groups: [
    {
      key: 1,
      name: '局部广告-卡片广告',
      rules: [
        {
          key: 1,
          name: '首页上方卡片广告',
          fastQuery: true,
          activityIds: '.activity2.MainActivity',
          matches: '[vid="recycle_view"] + [vid="close_ad"]',
          snapshotUrls: 'https://i.gkd.li/i/13379524',
        },
      ],
    },
  ],
});
