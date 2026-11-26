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
          activityIds: [
            '.mainnesting.view.MainNestingActivity',
            '.stockmodule.stockdetail.RipplingStockDetailActivity',
          ],
          matches: '[vid="ad_close"]',
          exampleUrls: [
            'https://m.gkd.li/33366298/d05d1eec-cda5-4d37-a494-8eef7b7871dd',
            'https://e.gkd.li/bc586461-bc96-4fbc-8b7c-3d65578c84d9',
            'https://e.gkd.li/004d55b4-5f93-4bae-95b3-b2404e9e5594',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/13388227',
            'https://i.gkd.li/i/35474041',
            'https://i.gkd.li/i/35474228',
          ],
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
      fastQuery: true,
      rules: [
        {
          key: 0,
          name: '首页',
          activityIds: '.mainnesting.view.MainNestingActivity',
          matchTime: 10000,
          actionMaximum: 1,
          resetMatch: 'app',
          matches: '[vid="image_cancel"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/5229142b-49d5-4985-ab75-104e46ede45e',
          snapshotUrls: 'https://i.gkd.li/i/22995479',
        },
        {
          key: 1,
          name: '小雪理财课',
          activityIds: '.community.guide.PaddyUserGuideActivity',
          matches:
            '[vid="xue_video_container"] + [vid="tv_skip"][clickable=true]',
          exampleUrls: 'https://e.gkd.li/389ced96-2385-4349-8ef3-87cb71c0cb88',
          snapshotUrls: 'https://i.gkd.li/i/35474964',
        },
      ],
    },
    {
      key: 4,
      name: '局部广告',
      desc: '卡片/横幅/AI_Tooltip',
      fastQuery: true,
      rules: [
        {
          key: 0,
          name: '首页顶部卡片',
          activityIds: '.mainnesting.view.MainNestingActivity',
          matches:
            '[text="点击领取"] <<(6-n) [vid="tv_fund_obtain"] + [vid="iv_fund_big_card_close"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35472886',
          exampleUrls: 'https://e.gkd.li/d21fab74-c83d-4ccf-9141-48fb7309023c',
        },
        {
          key: 1,
          name: '横幅',
          activityIds: [
            '.mainnesting.view.MainNestingActivity',
            '.stockmodule.stockdetail.RipplingStockDetailActivity',
            '.common.search.USearchActivity',
          ],
          anyMatches: [
            '[vid="btn_ad_bee_action"] + [vid="iv_ad_bee_close"][clickable=true]',
            '[vid="ivIcon"] +2 [vid="tvSubDesc"] + [vid="btn_go_open"] + [vid="iv_close"][clickable=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/35473208', // 首页-> 自选 顶部
            'https://i.gkd.li/i/35474651', // 股票详情页
            'https://i.gkd.li/i/35474361', // 搜索结果页
          ],
          exampleUrls: [
            'https://e.gkd.li/354a3d80-979b-40cd-a7f0-d491220ee07e',
            'https://e.gkd.li/dd3310db-e561-4ee0-aefa-f3322ca6410b',
            'https://e.gkd.li/d207e603-dfaf-4c87-9ca2-5f5271f6e3be',
          ],
        },
        {
          key: 2,
          name: 'AI_Tooltip',
          activityIds: '.mainnesting.view.MainNestingActivity',
          matches:
            '[vid="home_ai_guide_tip"][visibleToUser=true] + [vid="home_ai_guide_close_img"][clickable=true]',
          exampleUrls: 'https://e.gkd.li/f1004a22-94d9-4b8a-99e2-a572921a0ffc',
        },
        {
          key: 3,
          name: '文章尾部卡片',
          activityIds: '.community.StatusDetailActivityWithNewWeb',
          matches:
            '[vid="ad_image"][visibleToUser=true] +2 [vid="iv_close"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/35473510',
            'https://i.gkd.li/i/35474156',
          ],
          exampleUrls: 'https://e.gkd.li/707d9e43-52f9-42b7-9a37-82fb66f27e4e',
        },
        {
          key: 4,
          name: '搜索页卡片',
          activityIds: '.common.search.USearchActivity',
          matches:
            '[vid="mark_ad"][visibleToUser=true] - [vid="ib_close_ad"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35473705',
          exampleUrls: 'https://e.gkd.li/a9905b8f-109f-41ca-bd8b-a21a88a20199',
        },
      ],
    },
    {
      key: 5,
      name: '全屏广告-开通股票账户',
      desc: '进入某股票 -> 股票开通股票账户 -> x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.stockmodule.stockdetail.RipplingStockDetailActivity',
          matches:
            '[text="开通股票账户"] - [vid="image_close"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35475071',
          exampleUrls: 'https://e.gkd.li/d4323015-34d0-473c-b2a9-334f0cb6a22c',
        },
      ],
    },
    {
      key: 6,
      name: '功能类-自动点击[查看原图]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.common.imagebrowse.inner.ui.ImageBrowseActivity',
          matches: '[text="查看原图"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35474051',
          exampleUrls: 'https://e.gkd.li/b9848418-42d3-4fa7-abb5-75f363c9b7dc',
        },
      ],
    },
    {
      key: 7,
      name: '其他-关闭关注Tip',
      desc: '某人主页,底部弹出[关注TA...] -> x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.community.UserProfileActivity',
          matches:
            '[vid="designContentContainer"] > @[vid="designImageClose"][clickable=true] + [childCount=2] + [vid="designRightText"][text="关注"]',
          exampleUrls: 'https://e.gkd.li/c0f2825f-ee37-4324-a479-db705300c9f1',
          snapshotUrls: 'https://i.gkd.li/i/35475314',
        },
      ],
    },
  ],
});
