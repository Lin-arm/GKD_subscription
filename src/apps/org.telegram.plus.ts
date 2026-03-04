import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'org.telegram.plus',
  name: 'Telegram+ (Plus Messenger)',
  groups: [
    {
      key: 1,
      name: '功能类-更多-保存到相册',
      desc: '右上角菜单-点击[保存到相册]',
      rules: [
        {
          fastQuery: true,
          matches: '@[clickable=true][left>350] > [text="保存到相册"]',
          snapshotUrls: 'https://i.gkd.li/i/24337783',
          excludeSnapshotUrls: 'https://i.gkd.li/i/24450853', // [left=83]
          exampleUrls: 'https://e.gkd.li/d09a281b-5652-4072-ae19-42d944f01d95',
          activityIds: 'org.telegram.ui.LaunchActivity',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-更多-只保存单个媒体',
      desc: '弹窗-点击 [这张图片]或[这个媒体]',
      rules: [
        {
          fastQuery: true,
          matches:
            '[text^="保存" || text^="Save"] < * +2 * > [text="这张图片" || text="这个媒体" || text="This photo"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/22945715', //图片
            'https://i.gkd.li/i/22945853', //视频
            'https://i.gkd.li/i/25730622', //This photo
          ],
          exampleUrls: 'https://e.gkd.li/9225eb21-84e6-4baa-88c5-f5dc2230c111',
          activityIds: 'org.telegram.ui.LaunchActivity',
        },
      ],
    },
    {
      key: 3,
      name: '权限提示-通讯录权限',
      desc: '点击[稍后]',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: 'org.telegram.ui.LaunchActivity',
          matches: ['[text*="通讯录"]', '[text="稍后"][clickable=true]'],
          snapshotUrls: 'https://i.gkd.li/i/25730831',
          exampleUrls: 'https://e.gkd.li/d0f31779-9ed8-47a1-9324-c898e9add118',
        },
      ],
    },
  ],
});
