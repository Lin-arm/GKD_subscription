import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.byyoung.setting',
  name: '爱玩机工具箱',
  groups: [
    {
      key: 1,
      name: '功能类-忽略授权提示',
      activityIds: '.Welcome.PermissionActivity',
      rules: [
        {
          matches: '[vid="tv_name"][text*="忽略授权"]',
          snapshotUrls: 'https://i.gkd.li/i/12829909',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-每日自动签到',
      fastQuery: true,
      activityIds: '.HomePage.activitys.MainActivity',
      actionDelay: 3000, // 等待3秒，确保页面(后台)加载完成
      rules: [
        {
          matches: '[vid="userIsLogin"] >2 [text="签到"]', // 尝试不进个人页直接签到
          snapshotUrls: 'https://i.gkd.li/i/27209865',
          exampleUrls: 'https://e.gkd.li/febcaadd-d766-4970-b8ee-edbccf4022ac',
        },
      ],
    },
  ],
});
