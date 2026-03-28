import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.sina.weibolite',
  name: '微博极速版',
  groups: [
    {
      key: 1,
      name: '分段广告-信息流广告',
      desc: '点击卡片广告右上角x图标,点击[不感兴趣]',
      fastQuery: true,
      activityIds: [
        'com.weico.international.activity.MainFragmentActivity',
        'com.weico.international.ui.search.SearchActivity',
        'com.weico.international.ui.detail.StatusDetailV3Activity',
      ],
      rules: [
        {
          key: 0,
          name: '点击卡片广告右上角x图标',
          matches: '[vid="item_timeline_ad_action"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12738110',
            'https://i.gkd.li/i/14996673',
            'https://i.gkd.li/i/23097171',
          ],
        },
        {
          preKeys: [0],
          name: '点击[不感兴趣]',
          matches:
            '@View[clickable=true][childCount=1] > TextView[visibleToUser=true][text="不感兴趣"||text$="interest"] <<n [vid="design_bottom_sheet"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12738132',
            'https://i.gkd.li/i/13727657',
            'https://i.gkd.li/i/14996679',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '评价提示-APP评分弹窗',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: 'com.weico.international.activity.MainFragmentActivity',
          matches: '[vid="ed_btn_negative"]',
          snapshotUrls: 'https://i.gkd.li/i/13727728',
        },
      ],
    },
    {
      key: 3,
      name: '局部广告-首页红小包',
      desc: '首页右下角红小包-x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.MainTabActivity',
          matches:
            '[vid="floating_window"] >2 [vid="complete_layout"][childCount=3][visibleToUser=true] + [vid="close"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/26148211',
          exampleUrls: 'https://e.gkd.li/eed48574-ccd7-470d-afa0-89d87e30f6e9',
        },
      ],
    },
  ],
});
