import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.kuaiduizuoye.scan',
  name: '快对AI',
  groups: [
    {
      key: 1,
      name: '分段广告',
      desc: '①点击[关闭] ②点击[知道了]',
      fastQuery: true,
      activityIds: [
        '.activity.manyquestionsearch.activity.PicManySearchActivity',
        '.picturesearch.pages.whole.PicManySearchNewV3Activity',
      ],
      rules: [
        {
          key: 1,
          name: '①点击[关闭]',
          matches:
            '[width>700][height<300] >(2,3) [text="关闭"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/33854308',
            'https://i.gkd.li/i/34192315',
            'https://i.gkd.li/i/35073276',
          ],
          exampleUrls: 'https://e.gkd.li/e81f7bbd-a5ce-4b57-b09a-185bd9529c9d',
        },
        {
          key: 20,
          preKeys: [1],
          name: '②点击[知道了]',
          matches: '[text="知道了"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/34192316',
          exampleUrls: 'https://e.gkd.li/fc3499a7-a8a7-4b7d-9f47-71814bf7e811',
        },
      ],
    },
  ],
});
