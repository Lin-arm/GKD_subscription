import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xmcy.hykb',
  name: '好游快爆',
  groups: [
    {
      key: 1,
      name: '更新提示',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.app.dialog.UpdateDialog',
          matches:
            '@[vid="iv_inner_button_close"] - RelativeLayout >n [vid="text_update_tip"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12870604',
            'https://i.gkd.li/i/13297450',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告-弹窗广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.app.ui.main.MainActivity',
          matches: '[vid="dialog_home_notice_image_close"]',
          snapshotUrls: 'https://i.gkd.li/i/13259427',
        },
      ],
    },
  ],
});
