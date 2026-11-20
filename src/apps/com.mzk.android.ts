import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.mzk.android',
  name: '大连明珠卡',
  groups: [
    {
      key: 1,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          key: 0,
          matches: '[vid="cll_splash_skip"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35126804',
        },
      ],
    },
  ],
});
