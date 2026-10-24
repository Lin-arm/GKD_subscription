import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.achievo.vipshop',
  name: '唯品会',
  groups: [
    {
      key: 1,
      name: '全屏广告-优惠券弹窗',
      desc: '点击右上角x掉',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.activity.LodingActivity',
          matches:
            '@[vid="iv_close"][visibleToUser=true] + [vid="coupon_la_container"]',
          snapshotUrls: 'https://i.gkd.li/i/33897647',
          exampleUrls: 'https://e.gkd.li/ff0541e8-5e5a-48e3-9c48-23693d76b91e',
        },
      ],
    },
  ],
});
