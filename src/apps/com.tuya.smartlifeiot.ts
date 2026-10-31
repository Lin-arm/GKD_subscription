import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.tuya.smartlifeiot',
  name: '(涂鸦)智能生活',
  groups: [
    {
      key: 1,
      name: '局部广告-轮播图',
      desc: 'x掉',
      rules: [
        {
          fastQuery: true,
          activityIds:
            'com.thingclips.smart.hometab.activity.FamilyHomeActivity',
          matches: '[vid="imv_ad_close"]',
          snapshotUrls: 'https://i.gkd.li/i/34208175',
          exampleUrls: 'https://e.gkd.li/96d00f2a-7518-4fe2-aee1-7564a76a7d60',
        },
      ],
    },
  ],
});
