import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.yadea.smartmoto',
  name: '雅迪智行',
  groups: [
    {
      key: 0,
      name: '权限提示-通知权限',
      actionMaximum: 1,
      matchTime: 10000,
      resetMatch: 'app',
      fastQuery: true,
      activityIds: [
        'com.yadea.smartmoto.ui.home.HomeActivity'
      ],
      rules: [
        {
          matches: '[id="com.yadea.smartmoto:id/tv_cancel"]',
        },
      ],
    },
  ],
});
