import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'xyz.nextalone.nagram',
  name: 'Nagram',
  groups: [
    {
      key: 1,
      name: '更新提示',
      rules: [
        {
          fastQuery: true,
          activityIds: 'org.telegram.ui.LaunchActivity',
          matches:
            '[text="更新Nagram"] <<3 ScrollView +3 * > [text="稍后提醒我"]',
          snapshotUrls: 'https://i.gkd.li/i/25640114',
          exampleUrls: 'https://e.gkd.li/793f238d-aa07-400a-8196-88a47b8bcd7c',
        },
      ],
    },
  ],
});
