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
  ],
});
