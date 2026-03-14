import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.hungrypanda.waimai',
  name: '熊猫外卖',
  groups: [
    {
      key: 1,
      name: '全屏广告',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: [
            'com.haya.app.pandah4a.ui.sale.home.container.HomeContainerActivity',
            'com.haya.app.pandah4a.ui.pay.success.order.PaySuccessActivity',
          ],
          matches: [
            '[vid="iv_home_ad_close" || vid="iv_close"][clickable=true][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/25813448', // iv_home_ad_close_首页
            'https://i.gkd.li/i/25822079', // iv_home_ad_close
            'https://i.gkd.li/i/25813449', // iv_close
            'https://i.gkd.li/i/25995791', // iv_home_ad_close_结算页
          ],
        },
      ],
    },
  ],
});
