import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.android.incallui',
  name: '电话',
  groups: [
    {
      key: 1,
      name: '功能类-接通话时自动[录音]',
      actionMaximum: 1,
      rules: [
        {
          actionDelay: 500,
          fastQuery: true,
          activityIds: '.InCallActivity',
          matches: [
            '[vid="elapsedTime"][visibleToUser=true]',
            '[vid="recordButton"][desc="录音"]',
          ],
          exampleUrls: 'https://e.gkd.li/cfe191ef-3786-403c-ba88-e18d299803a8',
          snapshotUrls: 'https://i.gkd.li/i/20876897',
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/20876893', // 接通后,已在录音
            'https://i.gkd.li/i/20877514', // 未接通时点击无效
          ],
        },
      ],
    },
    {
      key: 2,
      name: '功能类-通话时自动开[免提]',
      desc: '适合老人用',
      fastQuery: true,
      actionCd: 3000, // cd 太短会重复点击
      rules: [
        {
          key: 0,
          activityIds: '.InCallActivity',
          matches: '[vid="audioButton"][clickable=true][checked=false]',
          snapshotUrls: 'https://i.gkd.li/i/25824399', // 未开[免提]
          excludeSnapshotUrls: 'https://i.gkd.li/i/25824401', // 已开[免提] [checked=true]
        },
        {
          key: 1,
          // activityIds: [],   // 老年人不一定能开shizuku
          matches: '[vid="audioButton"][checked=false] >2 [vid="ovalButton"]',
          snapshotUrls: 'https://i.gkd.li/i/27233140',
          excludeSnapshotUrls: 'https://i.gkd.li/i/27233263', // 已开[免提] [checked=true]
        },
        {
          key: 2,
          actionMaximum: 1, // [checkable=false] ,无 checked 变化,只能限制点击次数
          resetMatch: 'app',
          activityIds: '.InCallActivity',
          matches: '[vid="showAudioButton"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/20877514', // 华为版 电话app
        },
      ],
    },
  ],
});
