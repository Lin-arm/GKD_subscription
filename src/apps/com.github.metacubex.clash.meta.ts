import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.github.metacubex.clash.meta',
  name: 'Clash Meta for Android',
  groups: [
    {
      key: 1,
      name: '功能类-代理页面自动点击延迟测试',
      matchTime: 10000,
      actionMaximum: 1,
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.github.kr328.clash.ProxyActivity',
          matches: '[vid="url_test_view"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/490f4572-a1af-4345-8f6e-3b0081929628',
          snapshotUrls: 'https://i.gkd.li/i/20926416',
          excludeSnapshotUrls: 'https://i.gkd.li/i/20926355',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-自动[启动]后返回',
      desc: '进app后 ①点击[启动] ②返回键',
      fastQuery: true,
      activityIds: 'com.github.kr328.clash.MainActivity',
      matchTime: 1200, //防止进app手动关闭梯子时还触发
      rules: [
        {
          key: 1,
          name: '①点击[启动]',
          matches: '@[clickable=true] >3 [text$="启动"]',
          snapshotUrls: 'https://i.gkd.li/i/25926380',
          exampleUrls: 'https://e.gkd.li/7243edfc-00ac-4551-bf87-92ac0cdaba6f',
        },
        {
          preKeys: [1],
          name: '②返回键',
          action: 'back',
          actionDelay: 120, // 预留给key1 的点击时间
          matches: '[parent=null]',
        },
      ],
    },
  ],
});
