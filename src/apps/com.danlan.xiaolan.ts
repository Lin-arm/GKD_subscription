import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.danlan.xiaolan',
  name: 'Blued X',
  groups: [
    {
      key: 1,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      actionMaximumKey: 0,
      resetMatch: 'app',
      rules: [
        {
          key: 0,
          matches:
            '[text*="跳过"][text.length<10][width<500 && height<300][visibleToUser=true]',
        },
        {
          key: 1,
          matches:
            '@ImageView[width<156 && height<156] < [visibleToUser=true] < [childCount=1] +2 ViewGroup >2 [text="广告"]',
          snapshotUrls: 'https://i.gkd.li/i/35126957',
        },
      ],
    },
    {
      key: 3,
      name: '分段广告-卡片广告',
      fastQuery: true,
      activityIds: [
        'com.blued.android.core.ui.TerminalActivity',
        'com.soft.blued.ui.home.HomeActivity',
      ],
      rules: [
        {
          key: 0,
          matches: '[vid="img_close"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/13421613',
            'https://i.gkd.li/i/13421923',
          ],
        },
        {
          preKeys: [0],
          key: 1,
          matches: '@LinearLayout > [text="不感兴趣"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13421622',
            'https://i.gkd.li/i/13422170',
          ],
        },
      ],
    },
  ],
});
