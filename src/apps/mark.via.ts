import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'mark.via',
  name: 'Via',
  groups: [
    {
      key: 1,
      name: '功能类-下载确认',
      desc: '自动点击下载弹窗中的确定按钮',
      fastQuery: true,
      rules: [
        {
          activityIds: 'mark.via.Shell',
          matches: '[vid="ed" || vid="eo"]',
          snapshotUrls: 'https://i.gkd.li/i/30865110',
        },
      ],
    },
  ],
});
