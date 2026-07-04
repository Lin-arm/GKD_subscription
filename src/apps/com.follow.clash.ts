import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.follow.clash',
  name: 'FlClash',
  groups: [
    {
      key: 1,
      name: '功能类-节点自动测延迟',
      desc: '进app后仅测1次',
      matchTime: 5000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.MainActivity',
          matches: '@Button[clickable=true] -4 * > [desc="代理"]',
          snapshotUrls: [
            'https://i.gkd.li/i/26210674',
            'https://i.gkd.li/i/29658034',
          ],
        },
      ],
    },
  ],
});
