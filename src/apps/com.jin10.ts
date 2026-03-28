import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.jin10',
  name: '金十数据',
  groups: [
    {
      key: 1,
      name: '更新提示',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.lgd.update.UpdateActivity',
          matches: '@[vid="update_cancel"] + [vid="iv_pic"]',
          snapshotUrls: 'https://i.gkd.li/i/12706043',
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告-首页弹窗广告',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.lgd.biz.MainActivity',
          matches: '[vid="iv_body"] + [vid="iv_close"]',
          snapshotUrls: 'https://i.gkd.li/i/12706045',
        },
      ],
    },
    {
      key: 3,
      name: '全屏广告-快讯页面弹窗广告',
      rules: [
        {
          activityIds: '.lgd.biz.MainActivity',
          matches: '@[vid="iv_close"] + [vid="iv_pic"]',
          snapshotUrls: 'https://i.gkd.li/i/12706047',
        },
      ],
    },
    {
      key: 10,
      name: '局部广告-会员页面顶部广告',
      rules: [
        {
          activityIds: '.lgd.biz.MainActivity',
          matches: '[vid="iv_header"] + [vid="iv_close"]',
          snapshotUrls: 'https://i.gkd.li/i/12706051',
        },
      ],
    },
  ],
});
