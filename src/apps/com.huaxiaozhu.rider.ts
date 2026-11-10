import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.huaxiaozhu.rider',
  name: '花小猪打车',
  groups: [
    {
      key: 1,
      name: '更新提示',
      desc: '点击"稍后更新"',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: 'com.huaxiaozhu.sdk.app.MainActivity',
          matches: '[text="稍后更新"]',
          exampleUrls:
            'https://m.gkd.li/57941037/7b5e81bf-6c51-4222-b832-ba4176be2a4b',
          snapshotUrls: 'https://i.gkd.li/i/14233480',
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告-弹窗广告',
      desc: '点击关闭',
      actionMaximum: 1,
      resetMatch: 'match',
      activityIds: 'com.huaxiaozhu.sdk.app.MainActivity',
      rules: [
        {
          key: 0,
          fastQuery: true,
          matches: '[vid="popClose"]',
          snapshotUrls: 'https://i.gkd.li/i/14233488',
        },
        {
          key: 1,
          name: '坐标点击x掉',
          actionCd: 3000,
          actionDelay: 300,
          position: { left: 'width/2', top: 'height*0.794' },
          matches:
            '@FrameLayout[vid="webview_layout"][visibleToUser=true] >n [id="animation-container-content"] >2 Image[visibleToUser=true][width>700][height>1100]',
          snapshotUrls: 'https://i.gkd.li/i/34613080',
          exampleUrls: 'https://e.gkd.li/59049b44-eb7e-4659-94f1-f33c35aeeb4c',
        },
      ],
    },
  ],
});
