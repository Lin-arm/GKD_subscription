import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.moutai.mall',
  name: 'i茅台',
  groups: [
    {
      key: 1,
      name: '全屏广告-首页弹窗广告',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: ['.MainActivity', '.module.splash.SplashActivity'],
          matches: '[vid="ivPic"] + ViewGroup + [vid="vClose"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12745130',
            'https://i.gkd.li/i/12745153',
          ],
        },
      ],
    },
    {
      key: 10,
      name: '权限提示-通知权限',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.MainActivity',
          matches: '@[vid="vClose"] - LinearLayout > [text*="开通消息通知"]',
          snapshotUrls: 'https://i.gkd.li/i/12745142',
        },
      ],
    },
  ],
});
