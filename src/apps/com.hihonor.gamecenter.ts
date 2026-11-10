import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.hihonor.gamecenter',
  name: '(荣耀)游戏中心',
  groups: [
    {
      key: 1,
      name: '权限提示-通知权限',
      desc: '点击[禁止]',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.module.newmain.XMainActivity',
          matches: [
            '[text*="开启"][text*="通知"]',
            '[text="禁止"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/34632910',
          exampleUrls: 'https://e.gkd.li/310eb4ad-8855-4a98-9400-44de387b84f0',
        },
      ],
    },
  ],
});
