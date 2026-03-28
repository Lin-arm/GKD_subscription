import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.citiccard.mobilebank',
  name: '动卡空间',
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
          matches: '[vid="btn_skip"]',
          snapshotUrls: 'https://i.gkd.li/i/12684908',
        },
        {
          key: 1,
          matches: '[vid="jump"]',
          snapshotUrls: 'https://i.gkd.li/i/13049013',
        },
      ],
    },
    {
      key: 1,
      name: '全屏广告-弹窗广告',
      fastQuery: true,
      rules: [
        {
          activityIds: '.card.activity.BillDetailHomeActivity',
          matches: '[vid="iv_bill_home_cancel"]',
          snapshotUrls: 'https://i.gkd.li/i/13049284',
        },
      ],
    },
    {
      key: 2,
      name: '权限提示-通知权限',
      desc: '点击关闭',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      fastQuery: true,
      rules: [
        {
          matches: '[vid="ll_app_upgrade_content"] + [vid="iv_close"]',
          snapshotUrls: 'https://i.gkd.li/i/13049283',
        },
      ],
    },
  ],
});
