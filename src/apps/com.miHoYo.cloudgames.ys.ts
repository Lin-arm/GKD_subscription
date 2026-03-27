import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.miHoYo.cloudgames.ys',
  name: '云·原神',
  groups: [
    {
      key: 0,
      name: '开屏广告-自动下载版本更新',
      desc: '强制更新否则不让玩(本质和开屏广告性质一样)',
      matchTime: 16000,
      actionMaximum: 2,
      resetMatch: 'app',
      fastQuery: true,
      activityIds: 'com.mihoyo.cloudgame.main.MiHoYoCloudMainActivity',
      rules: [
        {
          key: 0,
          name: '点击[立即更新]',
          matches:
            '[vid="mUpgradeTitle"][visibleToUser=true] +3 LinearLayout > [vid="mUpgradeDialogOK"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/26310355',
          exampleUrls: 'https://e.gkd.li/c061f2fd-ed19-4ae2-84c9-ae1bbc37ace1',
        },
        {
          preKeys: [0],
          name: '点击[开始安装]',
          matches:
            'ViewGroup[childCount=3] > [vid="mDescription"][visibleToUser=true] + [vid="mBtnConfirm"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/26310561',
          exampleUrls: 'https://e.gkd.li/c5f4db25-e1e5-492e-874d-c4e96eea5e99',
        },
      ],
    },
    {
      key: 1,
      name: '功能类-自动点击[使用流量进行游戏]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.mihoyo.cloudgame.main.MiHoYoCloudMainActivity',
          matches: '[text="使用流量进行游戏"]',
          exampleUrls:
            'https://m.gkd.li/57941037/84c18536-b3a4-4f6e-99b2-264c1a36beb5',
          snapshotUrls: 'https://i.gkd.li/i/14783168',
        },
      ],
    },
  ],
});
