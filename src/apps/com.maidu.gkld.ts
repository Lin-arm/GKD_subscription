import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.maidu.gkld',
  name: '公考雷达',
  groups: [
    {
      key: 2,
      name: '局部广告-首页右侧悬浮广告',
      rules: [
        {
          activityIds: '.ui.main.MainActivity',
          matches: '[vid="fl_float"] + [vid="close_image_view"]',
          snapshotUrls: 'https://i.gkd.li/i/12715291',
        },
      ],
    },
    {
      key: 10,
      name: '权限提示-通知权限',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          matches: '[vid="ll_open_app_notice"] + [vid="iv_cancel"]',
          snapshotUrls: 'https://i.gkd.li/i/12715250',
        },
      ],
    },
  ],
});
