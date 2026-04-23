import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.google.android.gm',
  name: 'Gmail',
  groups: [
    {
      key: 2,
      name: '分段广告-信息流广告',
      desc: '右滑删除⚠️该规则需v1.12.0及以上版本可使用',
      fastQuery: true,
      rules: [
        {
          key: 1,
          matches:
            '@[childCount=7][vid$="ad_teaser_item"] >2 [vid="ad_badge_text"]',
          action: 'swipe',
          swipeArg: {
            start: {
              left: 'width * 0.15',
              top: 'width * 0.08',
            },
            end: {
              left: 'width * 0.64',
              top: 'width * 0.08',
            },
            duration: 114,
          },
          snapshotUrls: [
            'https://i.gkd.li/i/13255698', // 旧快照 节点还未引进 vid 属性
            'https://i.gkd.li/i/25542293',
          ],
        },
      ],
    },
  ],
});
