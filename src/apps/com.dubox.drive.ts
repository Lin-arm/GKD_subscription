import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.dubox.drive',
  name: 'TeraBox',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      actionMaximumKey: 0,
      priorityTime: 10000,
      rules: [
        {
          key: 0,
          matches: 'TextView[vid="tv_skip"]',
          snapshotUrls: 'https://i.gkd.li/i/13200574',
        },
        {
          key: 1,
          matches: '@[vid="ivClose"] - * >2 [id="inmobi-ad"]',
          snapshotUrls: 'https://i.gkd.li/i/13688384',
        },
      ],
    },
    {
      key: 1,
      name: '全屏广告-弹窗广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.ui.MainActivity',
          matches: 'ImageView[vid="ivClose"]',
          snapshotUrls: 'https://i.gkd.li/i/13200577',
        },
      ],
    },
    {
      key: 2,
      name: '权限提示-通知权限',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.permission.view.PermissionDialogActivity',
          matches: '[text="Authorize"] - [vid="dialog_button_cancel"]',
          snapshotUrls: 'https://i.gkd.li/i/13688406',
        },
      ],
    },
  ],
});
