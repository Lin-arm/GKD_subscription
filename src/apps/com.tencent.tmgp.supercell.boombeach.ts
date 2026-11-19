import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.tencent.tmgp.supercell.boombeach',
  name: '海岛奇兵', //游戏
  groups: [
    {
      key: 1,
      name: '通知提示-未成年弹窗',
      desc: 'x掉',
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: 'com.supercell.titan.tencent.GameAppTencentMidas',
          matches:
            '@TextView[width<104 && height<104] -n [visibleToUser=true][text*="未成年游戏教育"]',
          snapshotUrls: 'https://i.gkd.li/i/35075364',
          exampleUrls: 'https://e.gkd.li/beb30964-2fbf-42a4-a325-8d6a4f209f65',
        },
      ],
    },
  ],
});
