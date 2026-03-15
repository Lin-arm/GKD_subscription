import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.tumblr',
  name: 'Tumblr',
  groups: [
    {
      key: 1,
      name: '分段广告-信息流广告',
      desc: '更多-举报Ad-展示太频繁',
      fastQuery: true,
      activityIds: '.communityhubs.CommunityHubActivity',
      rules: [
        {
          key: 0,
          name: '点击菜单',
          matches:
            'ViewGroup > @[desc="更多"][clickable=true] -(1,2) [text^="赞助"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/25996699',
            'https://i.gkd.li/i/26002004',
          ],
          exampleUrls: 'https://e.gkd.li/932873cc-13e0-4c87-a518-dab86c5949e1',
        },
        {
          key: 1,
          preKeys: [0],
          name: '点击举报广告',
          matches:
            '@[clickable=true] > [vid="menu_option_title"][text="举报广告"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25996711',
          exampleUrls: 'https://e.gkd.li/09561a19-92af-476b-a2fd-825fc0c822d9',
        },
        {
          preKeys: [1],
          name: '点击此广告出现得过于频繁',
          matches:
            '@[clickable=true] > [vid="menu_option_title"][text="此广告出现得过于频繁"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25996722',
          exampleUrls: 'https://e.gkd.li/ef99a82e-811c-4206-8cda-593a7291049c',
        },
      ],
    },
  ],
});
