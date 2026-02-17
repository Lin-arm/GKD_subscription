import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.microsoft.office.outlook',
  name: 'Outlook',
  groups: [
    {
      key: 0,
      name: '分段广告-收件箱顶部广告',
      fastQuery: true,
      activityIds: 'com.acompli.acompli.CentralActivity',
      rules: [
        {
          key: 0,
          fastQuery: true,
          matches:
            '@ImageButton[clickable=true] <n [vid="ad_choices_container"] <n * < [vid="ad_right_container"]',
          snapshotUrls: 'https://i.gkd.li/i/25366102',
          exampleUrls: 'https://e.gkd.li/b1354900-bc3f-4925-a9d0-a56fd46b4b2d',
        },
        {
          key: 1,
          preKeys: [0],
          fastQuery: true,
          matches: '@[clickable=true] >2 [text="Hide ad" || text="隐藏广告"]',
          snapshotUrls: ['https://i.gkd.li/i/25366119'],
        },
      ],
    },
  ],
});
