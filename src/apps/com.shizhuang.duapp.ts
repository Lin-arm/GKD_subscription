import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.shizhuang.duapp',
  name: '得物',
  groups: [
    {
      key: 4,
      name: '其他-截屏分享',
      desc: '关闭截屏时app弹出的分享弹窗',
      rules: [
        {
          fastQuery: true,
          activityIds:
            '.modules.product_detail.detailv4.ui.ProductDetailActivityV4',
          matches: '[vid="ivClose"] +2 [vid="ivSave"]',
          snapshotUrls: 'https://i.gkd.li/i/13473449',
        },
      ],
    },
  ],
});
