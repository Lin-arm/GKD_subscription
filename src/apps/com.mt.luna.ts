import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.mt.luna',
  name: 'Luna',
  groups: [
    {
      key: 1,
      name: '功能类-自动确认下载',
      desc: '弹窗, 点击[下载]',
      rules: [
        {
          activityIds: '.activity.MainActivity',
          matches:
            '[text="下载"] < @[clickable=true] -n [visibleToUser=true][text="下载文件"]',
          snapshotUrls: 'https://i.gkd.li/i/35264146',
          exampleUrls: 'https://e.gkd.li/85733b49-2631-4771-a112-5a7e53d736bb',
        },
      ],
    },
  ],
});
