import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.twitter.android',
  name: 'X(推特)',
  groups: [
    {
      key: 1,
      name: '分段广告-主页信息流广告',
      desc: '点击右上角关闭,点击我不喜欢',
      actionCd: 3000, // https://github.com/gkd-kit/subscription/issues/832
      fastQuery: true,
      activityIds: [
        'com.twitter.app.main.MainActivity',
        'com.twitter.app.profiles.ProfileActivity',
      ],
      rules: [
        {
          key: 0,
          name: '视频广告-点击右上角关闭',
          matches:
            '@[vid="tweet_curation_action"] <2 * + * >3 [text="视频将在广告后播放"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12798795',
            'https://i.gkd.li/i/14782884',
          ],
        },
        {
          key: 1,
          name: '推荐广告-点击右上角关闭',
          matches: '@[vid="tweet_curation_action"] <2 * + * > [text$="推荐"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12813235',
            'https://i.gkd.li/i/14782897',
            'https://i.gkd.li/i/17182889',
          ],
        },
        {
          key: 2,
          matches:
            '@[vid="tweet_curation_action"] - [vid="tweet_ad_badge_top_right"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/705dd827-ff04-4233-af38-60d92439e1f3',
          snapshotUrls: 'https://i.gkd.li/i/24359526',
        },
        {
          preKeys: [0, 1, 2],
          key: 10,
          name: '点击[我不喜欢这个广告]',
          matches:
            '@ViewGroup[clickable=true] > [text="我不喜欢这个广告" || text^="屏蔽"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/12798810',
            'https://i.gkd.li/i/14782902',
            'https://i.gkd.li/i/20239421',
            'https://i.gkd.li/i/24359537',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '分段广告-帖子详情页、搜索页信息流广告',
      desc: '右上角关闭-屏蔽用户-确认屏蔽.点击[我不喜欢]会返回主页,因此点击[屏蔽]',
      fastQuery: true,
      activityIds: [
        'com.twitter.tweetdetail.TweetDetailActivity',
        '.search.implementation.results.SearchActivity',
      ],
      actionCd: 3000,
      rules: [
        {
          name: '点击右上角关闭-1',
          key: 0,
          matches:
            '@[vid="tweet_curation_action"] +n [vid="tweet_promoted_badge_bottom"][text="推荐"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12825969',
            'https://i.gkd.li/i/12847584',
          ],
        },
        {
          name: '点击右上角关闭-2',
          key: 1,
          matches:
            '@[vid="tweet_curation_action"] <2 * + [vid="tweet_auto_playable_content_parent"] > [vid="tweet_promoted_badge_bottom"][text$="推荐"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12882676',
            'https://i.gkd.li/i/12904603',
          ],
        },
        {
          name: '点击右上角关闭-英文',
          key: 2,
          matches:
            '[vid="tweet_ad_badge_top_right"] + [vid="tweet_curation_action"]',
          snapshotUrls: ['https://i.gkd.li/i/13680756'],
        },
        {
          preKeys: [0, 1, 2],
          key: 3,
          name: '点击屏蔽/隐藏,如果机会全用完需要取消遍再屏蔽',
          matches:
            '@ViewGroup > [vid="action_sheet_item_title"][text^="屏蔽"||text^="Block"||text^="隐藏 @"||text^="Mute @"||text^="Unblock @"||text^="Unmute @"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12828815',
            'https://i.gkd.li/i/12847600',
            'https://i.gkd.li/i/12904602',
            'https://i.gkd.li/i/13680783',
            'https://i.gkd.li/i/25089665', // 屏蔽已用
            'https://i.gkd.li/i/25461007', // 隐藏已用
            'https://i.gkd.li/i/25461077', // En-Mute
            'https://i.gkd.li/i/25461050', // En-Unmute
          ],
        },
        {
          preKeys: [3],
          matches:
            '[text="取消"||text^="Cancel"] + [text="屏蔽"||text^="Block"||text="是的，我确定"||text^="Yes"||text^="屏蔽"||text^="Mute"||text^="Unmute"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12828832',
            'https://i.gkd.li/i/12904601',
            'https://i.gkd.li/i/13680798',
            'https://i.gkd.li/i/25089666',
            'https://i.gkd.li/i/25461062', // En-Unmute
          ],
        },
      ],
    },
    {
      key: 3,
      name: '分段广告-用户资料页信息流广告',
      desc: '点击右上角关闭,点击我不喜欢',
      fastQuery: true,
      activityIds: 'com.twitter.app.profiles.ProfileActivity',
      actionCd: 3000,
      rules: [
        {
          name: '点击右上角关闭-1',
          key: 0,
          matches:
            '@[vid="tweet_curation_action"] +n [vid="tweet_promoted_badge_bottom"][text="推荐"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12825969',
            'https://i.gkd.li/i/12847584',
          ],
        },
        {
          name: '点击右上角关闭-2',
          key: 1,
          matches:
            '@[vid="tweet_curation_action"] <2 * + [vid="tweet_auto_playable_content_parent"] > [vid="tweet_promoted_badge_bottom"][text$="推荐"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12882676',
            'https://i.gkd.li/i/12904603',
          ],
        },
        {
          preKeys: [0, 1],
          key: 10,
          name: '点击[我不喜欢这个广告]',
          matches:
            '@ViewGroup > [vid="action_sheet_item_title"][text="我不喜欢这个广告"]',
          snapshotUrls: 'https://i.gkd.li/i/12798810',
        },
      ],
    },
    {
      key: 4,
      name: '评价提示',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: 'com.twitter.app.main.MainActivity',
          matches: '[vid="app_rating_button_never"]',
          snapshotUrls: 'https://i.gkd.li/i/13774150',
        },
      ],
    },
    {
      key: 5,
      name: '权限提示-通知权限',
      desc: '点击"Not now"',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: 'com.twitter.app.main.MainActivity',
          matches:
            '@[clickable=true] > [visibleToUser=true][text="Not now" || text="暂时不用"] <<n [vid="half_cover_recycler_view_holder"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13930126', // 英文
            'https://i.gkd.li/i/25903854', // 中文
          ],
        },
      ],
    },
    {
      key: 6,
      name: '功能类-自动点击翻译',
      rules: [
        {
          fastQuery: true,
          actionCd: 2000, //防止[译文]节点未加载完导致重复点击 [翻译]
          activityIds: 'com.twitter.tweetdetail.TweetDetailActivity',
          matches:
            '[vid="translation_link" || vid="grok_translation_link"][clickable=true][index=parent.childCount.minus(1)]',
          exampleUrls: [
            'https://e.gkd.li/ced46989-9c6a-4626-b027-7953e0fdc2c6',
            'https://m.gkd.li/57941037/40ece44f-883f-429a-aa0c-17dac15a50e4',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/14189817',
            'https://i.gkd.li/i/14615911',
            'https://i.gkd.li/i/25537171',
            'https://i.gkd.li/i/25461468',
            'https://i.gkd.li/i/25461607', // Grok translate
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/25537171', // 已翻译, 加 [index=parent.childCount.minus(1)] 排除
        },
      ],
    },
    {
      key: 7,
      name: '功能类-自动点击[显示更多帖子]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.twitter.app.main.MainActivity',
          matches: '@FrameLayout[clickable=true] > [text="显示更多帖子"]',
          exampleUrls:
            'https://m.gkd.li/57941037/7efa8af7-90d3-42b4-bf5d-3d83775f175a',
          snapshotUrls: 'https://i.gkd.li/i/14189847',
        },
      ],
    },
    {
      key: 8,
      name: '其他-关闭[开启个性化广告]弹窗',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.twitter.app.main.MainActivity',
          matches:
            '[vid="secondary_button"][clickable=true][getChild(0).getChild(0).getChild(0).text="保留更少相关广告"]',
          snapshotUrls: 'https://i.gkd.li/i/25150279',
        },
      ],
    },
    {
      key: 9,
      name: '功能类-自动显示可能的垃圾信息',
      desc: '有时(大部分时候)误杀太大',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.twitter.tweetdetail.TweetDetailActivity',
          matches: 'RelativeLayout > [vid="content"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25461441',
        },
      ],
    },
    {
      key: 10,
      name: '功能类-[保存]图片帖子',
      desc: '展开菜单自动点击保存图片',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.twitter.app.gallery.GalleryActivity',
          matches:
            '@LinearLayout[clickable=true] >3 [text="保存" || text="Save"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26303860',
          exampleUrls: 'https://e.gkd.li/552c4889-e994-4082-8229-d5c5b37e4c6b',
        },
      ],
    },
  ],
});
