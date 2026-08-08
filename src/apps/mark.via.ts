import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'mark.via',
  name: 'Via',
  groups: [
    {
      key: 1,
      name: '功能类-下载确认',
      fastQuery: true,
      rules: [
        {
          activityIds: 'mark.via.Shell',
          matches: '[vid="ed"][text="确定"][clickable=true]',
        },
      ],
    },
  ],
});
