import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.hihonor.android.launcher',
  name: '荣耀桌面',
  groups: [
    {
      key: 1,
      name: '功能类-[不]添加小部件到桌面',
      desc: '弹窗, 点击[取消]',
      rules: [
        {
          fastQuery: true,
          matchTime: 5000, //由其他app调用系统api唤起的 荣耀桌面 弹窗, 并非一直处于荣耀桌面, 因此加上执行限制
          actionMaximum: 1,
          resetMatch: 'app',
          activityIds: '.dragndrop.AddItemActivity',
          matches: [
            '[text="添加到主屏幕"][visibleToUser=true]',
            '[text="取消"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/34847270',
          exampleUrls: 'https://e.gkd.li/ed73cb4e-4985-4960-a653-d7df9d473f4e',
        },
      ],
    },
  ],
});
