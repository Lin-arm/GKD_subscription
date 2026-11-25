import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xxwolo.cc5',
  name: '测测',
  groups: [
    {
      key: 0,
      name: '权限提示-通知权限',
      desc: '点击[×掉/取消]',
      activityIds: 'com.cece.app.MainActivity',
      rules: [
        {
          key: 0,
          name: '底部横幅',
          matchRoot: true,
          actionCd: 3000,
          matches:
            '[desc*="开启系统通知"] > @[clickable=true][desc=null][width<106][height<107] + [desc="去开启"]',
          snapshotUrls: 'https://i.gkd.li/i/35392398',
          exampleUrls: 'https://e.gkd.li/94819262-26e5-458b-ba2b-a633924d6456',
        },
        {
          key: 1,
          name: '弹窗',
          matchTime: 10000,
          actionMaximum: 3,
          matches:
            '@[desc="取消"][clickable=true] + [desc="打开通知"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35392498',
          exampleUrls: 'https://e.gkd.li/26d36064-b217-4a49-993a-83a60d86ea0a',
        },
      ],
    },
    {
      key: 1,
      name: '全屏广告-小组件弹窗',
      desc: '点击[关闭]',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.cece.app.MainActivity',
          matches:
            '@[desc="关闭"][clickable=true] <n View[desc^="添加小组件"] < * < * < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/35392522',
          exampleUrls: 'https://e.gkd.li/2d688ba5-7c0f-4737-b764-7efc744600e0',
        },
      ],
    },
    {
      key: 2,
      name: '局部广告-右下角浮窗',
      desc: '点击×掉',
      matchRoot: true,
      forcedTime: 10000,
      actionCd: 3000,
      rules: [
        {
          activityIds: 'com.cece.app.MainActivity',
          matches:
            '@ImageView[clickable=true][childCount=0][width<80][height<80][visibleToUser=true] < [childCount=2][clickable=true][width<350][height<350][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/35392429',
        },
      ],
    },
  ],
});
