import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xueqiu.android',
  name: '雪球',
  groups: [
    {
      key: 1,
      name: '局部广告-信息流广告',
      rules: [
        {
          fastQuery: true,
          activityIds: '.mainnesting.view.MainNestingActivity',
          matches: '[vid="ad_close"]',
          exampleUrls:
            'https://m.gkd.li/33366298/d05d1eec-cda5-4d37-a494-8eef7b7871dd',
          snapshotUrls: 'https://i.gkd.li/i/13388227',
        },
      ],
    },
    {
      key: 2,
      name: '局部广告-评论区广告',
      rules: [
        {
          fastQuery: true,
          activityIds: '.community.StatusDetailActivity',
          matches: '[vid="ad_card_close" || vid="ad_banner_close"]',
          exampleUrls: [
            'https://m.gkd.li/33366298/b223cc74-fd4f-45a2-89ab-4a18ddffc01c',
            'https://e.gkd.li/f1004a22-94d9-4b8a-99e2-a572921a0ffc',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/13388361',
            'https://i.gkd.li/i/35473004',
          ],
        },
      ],
    },
    {
      key: 3,
      name: '全屏广告',
      desc: '点击关闭',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.mainnesting.view.MainNestingActivity',
          matches: '[vid="image_cancel"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/5229142b-49d5-4985-ab75-104e46ede45e',
          snapshotUrls: 'https://i.gkd.li/i/22995479',
        },
      ],
    },
    {
      key: 4,
      name: '局部广告',
      desc: '卡片/横幅/AI_Tooltip',
      fastQuery: true,
      activityIds: '.mainnesting.view.MainNestingActivity',
      rules: [
        {
          key: 0,
          name: '首页顶部卡片',
          matches:
            '[text="点击领取"] <<(6-n) [vid="tv_fund_obtain"] + [vid="iv_fund_big_card_close"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35472886',
          exampleUrls: 'https://e.gkd.li/d21fab74-c83d-4ccf-9141-48fb7309023c',
        },
        {
          key: 1,
          name: '横幅',
          matches:
            '[vid="btn_ad_bee_action"] + [vid="iv_ad_bee_close"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35473208',
          exampleUrls: 'https://e.gkd.li/354a3d80-979b-40cd-a7f0-d491220ee07e',
        },
        {
          key: 2,
          name: 'AI_Tooltip',
          matches:
            '[vid="home_ai_guide_tip"][visibleToUser=true] + [vid="home_ai_guide_close_img"][clickable=true]',
          exampleUrls: 'https://e.gkd.li/f1004a22-94d9-4b8a-99e2-a572921a0ffc',
        },
      ],
    },
  ],
});
