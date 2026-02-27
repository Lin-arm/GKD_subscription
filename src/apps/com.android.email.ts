import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.android.email',
  name: '电子邮件',
  groups: [
    {
      // 小米自带电子邮件
      key: 1,
      name: '权限提示-【小米】自启动',
      desc: '点击取消',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.wps.multiwindow.main.HomeActivity',
          matches: [
            '[text^="检测到您的自启动权限未开启"]',
            '[text="取消"][clickable=true]',
          ],
          exampleUrls: 'https://e.gkd.li/1eacdaf8-1405-44d8-a9b9-228e913c5180',
          snapshotUrls: 'https://i.gkd.li/i/17276404',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-【小米】非合并账户自动切换到合并账户',
      desc: '仅在收件箱界面开屏时触发',
      rules: [
        {
          key: 0,
          fastQuery: true,
          matchTime: 5000,
          actionMaximum: 1,
          resetMatch: 'app',
          activityIds: 'com.wps.multiwindow.main.HomeActivity',
          matches:
            '@[vid="titleContainer"][clickable=true] > [text!="合并账户"] - [text="收件箱"]',
          snapshotUrls: 'https://i.gkd.li/i/25607057',
        },
        {
          key: 1,
          preKeys: 0,
          fastQuery: true,
          actionDelay: 200, // 目标节点不是 clickable 的，等动画放完再点
          activityIds: 'com.wps.multiwindow.main.HomeActivity',
          matches: '[text="合并账户"][checkable=true]',
          snapshotUrls: 'https://i.gkd.li/i/25607113',
        },
      ],
    },
  ],
});
