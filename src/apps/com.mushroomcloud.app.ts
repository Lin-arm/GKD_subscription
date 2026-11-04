import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.mushroomcloud.app',
  name: '蘑菇云手机',
  groups: [
    {
      key: 1,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          key: 0,
          matches:
            '@View[clickable=true][width<150 && height<150] - FrameLayout[childCount=3][getChild(2).name$="TextView"] >(n+5) [text*="三方应用" || text*="扭动手机" || text*="上滑" || text*="扭一扭"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/34136348',
            'https://i.gkd.li/i/34367435',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告-弹窗广告',
      desc: 'x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.SplashActivity',
          matches: '[vid="content_image"] + [vid="close_btn"]',
          snapshotUrls: 'https://i.gkd.li/i/34140126',
          exampleUrls: 'https://e.gkd.li/ce650c5f-4629-40d7-b846-0d201900392a',
        },
      ],
    },
  ],
});
