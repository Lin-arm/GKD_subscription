import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'xxx.pornhub.fuck',
  name: 'JavDB',
  groups: [
    {
      key: 1,
      name: '通知提示-公告弹窗',
      desc: '点击[知道了]',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: ['.MainActivity', '.AppActivity'],
          matches:
            'View[desc="公告"] +n @Button[desc="知道了"][clickable=true][visibleToUser=true] <<n [id="android:id/content"]',
          snapshotUrls: [
            'https://i.gkd.li/i/14559882',
            'https://i.gkd.li/i/35229398',
          ],
          exampleUrls: 'https://e.gkd.li/a3782695-5b94-4588-9c82-24989d4e04bd',
        },
      ],
    },
  ],
});
