import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.achievo.vipshop',
  name: '唯品会',
  groups: [
    {
      key: 0,
      name: '开屏广告-优惠券弹窗',
      desc: '点击右上角[关闭]',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          matches:
            '@[vid="iv_close"][visibleToUser=true] + [vid="coupon_la_container"]',
        },
      ],
    },
  ],
});
