import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'mark.via',
  name: 'Via',
  groups: [
    {
      key: 1,
      name: '功能类-自动[确认]下载',
      desc: '自动点击下载弹窗中的[确定]按钮',
      rules: [
        {
          fastQuery: true,
          activityIds: '.Shell',
          matches:
            '@[text="确定" || text="確定" || text="OK"] -n [text*="下载" || text*="下載" || text*="download"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/30865110', //确定
            'https://i.gkd.li/i/30867153', //确定
            'https://i.gkd.li/i/30867205', //確定
            'https://i.gkd.li/i/30867206', //OK
          ],
          exampleUrls: 'https://e.gkd.li/2f2ef3bf-019d-4936-bbd8-51ba4cbe698c',
        },
      ],
    },
  ],
});
