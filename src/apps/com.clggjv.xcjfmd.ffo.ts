import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.clggjv.xcjfmd.ffo',
  name: 'Lanerc',
  groups: [
    {
      key: 1,
      name: '通知提示-公告弹窗',
      desc: '点击[已知晓]',
      rules: [
        {
          matches: '@Button[desc="已知晓"][clickable=true]',
          fastQuery: true,
          activityIds: '.MainActivity',
          snapshotUrls: 'https://i.gkd.li/i/29703051',
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告-弹窗广告',
      desc: '倒计时结束后点击[暂时跳过]',
      rules: [
        {
          matches: '[desc*="暂时跳过"]',
          actionDelay: 5000,
          fastQuery: true,
          activityIds: '.MainActivity',
          snapshotUrls: [
            'https://i.gkd.li/i/29703192',
            'https://i.gkd.li/i/29703246',
          ],
        },
      ],
    },
  ],
});
