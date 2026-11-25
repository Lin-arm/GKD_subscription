import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xxwolo.cc5',
  name: '测测',
  groups: [
    {
      key: 0,
      name: '通知提示-系统通知开启',
      desc: '点击×关闭底部开启系统通知横幅',
      rules: [
        {
          key: 0,
          name: '①关闭横幅',
          activityIds: 'com.cece.app.MainActivity',
          matchRoot: true,
          actionCd: 3000,
          matches:
            '@[clickable=true][desc=null][width<120][height<120] + [desc="去开启"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35392398',
        },
        {
          key: 1,
          name: '②每日运势弹窗',
          activityIds: 'com.cece.app.MainActivity',
          matchTime: 10000,
          actionMaximum: 3,
          resetMatch: 'activity',
          matches:
            '@[desc="取消"][clickable=true] + [desc="打开通知"][clickable=true] -3 [desc="每日运势准时为你解读"]',
          snapshotUrls: 'https://i.gkd.li/i/35392498',
        },
      ],
    },
    {
      key: 1,
      name: '其他-添加小组件弹窗',
      desc: '点[关闭]跳过组件引导',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          name: '①关闭',
          activityIds: 'com.cece.app.MainActivity',
          matches:
            '[desc^="添加小组件"] > @[desc="关闭"][clickable=true] + [desc="查看教程"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35392522',
        },
      ],
    },
    {
      key: 2,
      name: '局部广告-右下角浮窗',
      desc: '点击×关闭右下角推广浮窗',
      matchRoot: true,
      forcedTime: 10000,
      actionCd: 3000,
      rules: [
        {
          name: '①关闭浮窗',
          activityIds: 'com.cece.app.MainActivity',
          matches:
            '@ImageView[clickable=true][childCount=0][width<80][height<80][visibleToUser=true] < [childCount=2][clickable=true][width<350][height<350][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/35392429',
        },
      ],
    },
  ],
});
