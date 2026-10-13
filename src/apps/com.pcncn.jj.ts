import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.pcncn.jj',
  name: '作业精灵',
  groups: [
    {
      key: 6,
      name: '全屏广告-弹窗广告',
      desc: '点击关闭',
      fastQuery: true,
      rules: [
        {
          key: 0,
          activityIds: [
            '.act.AnswerDetail2Activity',
            'com.yfanads.ads.uw.base.inner.YdInterstitialActivity',
          ],
          matches: '[vid="iv_close"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13695874',
            'https://i.gkd.li/i/33297531',
          ],
        },
        {
          key: 1,
          activityIds: [
            '.act.HomeNewActivity',
            'com.qingxia.common.homework.ui.HomeworkRecord4Activity',
            'net.liucong.camera.ext.ScanningQrActivity',
            'com.qingxia.common.book.ui.Collection2Activity',
            'com.qingxia.common.search.ui.Search2Activity',
          ],
          matches: '[vid="ad_close"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/17265140',
            'https://i.gkd.li/i/33297507',
            'https://i.gkd.li/i/33297555',
            'https://i.gkd.li/i/33315721',
            'https://i.gkd.li/i/33372920',
          ],
          exampleUrls: 'https://e.gkd.li/b83aa566-8105-4877-abcd-800abfe7634e',
        },
      ],
    },
  ],
});
