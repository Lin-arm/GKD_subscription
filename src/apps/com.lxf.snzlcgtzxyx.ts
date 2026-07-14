import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.lxf.snzlcgtzxyx',
  name: '橘汁',
  groups: [
    {
      key: 1,
      name: '全屏广告',
      fastQuery: true,
      activityIds: 'com.hive.MainTabActivity',
      rules: [
        {
          key: 0,
          matches:
            '@[clickable=true][desc="top_close_button"] < * < [childCount=2] <n [childCount=2] < ViewGroup +n [childCount=2] > [text="广告"]',
          snapshotUrls: 'https://i.gkd.li/i/28220375',
          exampleUrls: 'https://e.gkd.li/3072484b-b841-4b04-b07c-9c125b153d4e',
        },
        {
          key: 1,
          matches:
            '@[getChild(0).name$="ImageView"] <2 [childCount=2] <2 [childCount=2] <2 [childCount=2] - FrameLayout > [text*="查看详情"]',
          snapshotUrls: 'https://i.gkd.li/i/28640601',
        },
        {
          key: 2,
          matches:
            '@[clickable=true][desc*="close"] < * < [visibleToUser=true] +n ViewGroup >3 [text="广告"]',
          snapshotUrls: 'https://i.gkd.li/i/29998947',
        },
        {
          key: 3,
          matches:
            'ImageView < @[width<88 && height<88] - [visibleToUser=true] >3 [text*="上滑" || text*="点击" || text*="扭动"]',
          snapshotUrls: 'https://i.gkd.li/i/29999216',
        },
      ],
    },
    {
      key: 2,
      name: '分段广告',
      fastQuery: true,
      activityIds: [
        'com.hive.MainTabActivity',
        'com.bytedance.sdk.openadsdk.core.activity.base.TTDelegateActivity',
      ],
      rules: [
        {
          key: 0,
          name: '①x掉',
          matches:
            '@Image[width<66 && height<63] < [childCount=1] - [childCount=4] <<2 * <2 WebView <<8 [vid="ad_feed_content"]',
          snapshotUrls: 'https://i.gkd.li/i/28220975',
          exampleUrls: 'https://e.gkd.li/f0b45bb2-6d8f-4368-9ba8-d5cd8ec127fa',
        },
        {
          preKeys: 0,
          name: '②点击"无法关闭"',
          matches: '@[clickable=true] > [text="无法关闭"]',
          snapshotUrls: 'https://i.gkd.li/i/28221149',
          exampleUrls: 'https://e.gkd.li/da65d359-eba0-4d76-b0fc-c01ec7063fa0',
        },
      ],
    },
  ],
});
