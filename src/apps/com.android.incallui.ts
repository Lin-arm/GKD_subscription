import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.android.incallui',
  name: '电话',
  groups: [
    {
      key: 1,
      name: '功能类-接通话时自动点击录音',
      actionMaximum: 1,
      rules: [
        {
          actionDelay: 500,
          fastQuery: true,
          activityIds: '.InCallActivity',
          matches: [
            '[vid="elapsedTime"][visibleToUser=true]',
            '[vid="recordButton"][desc="录音"][visibleToUser=true]',
          ],
          exampleUrls: 'https://e.gkd.li/cfe191ef-3786-403c-ba88-e18d299803a8',
          snapshotUrls: 'https://i.gkd.li/i/20876897',
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/20876893', // 接通后
            'https://i.gkd.li/i/20877514', // 未接通时点击无效
          ],
        },
      ],
    },
    {
      key: 2,
      name: '功能类-通话时自动开[免提]',
      desc: '适合老人用',
      rules: [
        {
          fastQuery: true,
          actionCd: 3000, // cd 太短会重复点击
          activityIds: '.InCallActivity',
          matches: '@[vid="audioButton"][checked=false] >2 [text="免提"]',
          snapshotUrls: 'https://i.gkd.li/i/25824399', //未开[免提]
          excludeSnapshotUrls: 'https://i.gkd.li/i/25824401', //已开[免提] [checked=true]
        },
      ],
    },
  ],
});
