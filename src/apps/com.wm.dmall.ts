import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.wm.dmall',
  name: '多点',
  groups: [
    {
      key: 1,
      name: '全屏广告-首页-弹窗广告',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          key: 1,
          fastQuery: true,
          activityIds: '.MainActivity',
          matches: '[vid="advert_close"]',
          exampleUrls: 'https://e.gkd.li/60b65af4-7efa-4e82-b294-d96d5b426953',
          snapshotUrls: 'https://i.gkd.li/i/13197627',
        },
        {
          key: 2,
          fastQuery: true,
          matches: [
            '[vid="coupon_activity"][text="去使用"]',
            '[vid="iv_close"]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/13331283',
        },
      ],
    },
    {
      key: 2,
      name: '局部广告-首页-浮窗广告',
      rules: [
        {
          fastQuery: true,
          activityIds: '.MainActivity',
          anyMatches: [
            '@[vid="iv_close"] + [vid="view_float"]',
            '[vid="close_iV"]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/13197634',
          excludeSnapshotUrls: 'https://i.gkd.li/i/13246242',
        },
      ],
    },
    {
      key: 3,
      name: '更新提示',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.MainActivity',
          matches: ['[vid="update_confirm_btn"]', '[vid="close_btn"]'],
          snapshotUrls: 'https://i.gkd.li/i/13234668',
        },
      ],
    },
  ],
});
