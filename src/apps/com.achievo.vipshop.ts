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
          // 进应用后弹出的「送你回归福利券 / 40元」弹窗，点击右上角 X
          // 用同级兄弟 coupon_la_container 锚定，避免误伤同样套 vip_dialog_layout 的其它弹窗
          activityIds: '.activity.LodingActivity',
          matches:
            '@[vid="iv_close"][visibleToUser=true] + [vid="coupon_la_container"]',
          // 快照上传到 i.gkd.li 后取消注释并替换 id
          // snapshotUrls: 'https://i.gkd.li/i/00000000',
        },
      ],
    },
  ],
});
