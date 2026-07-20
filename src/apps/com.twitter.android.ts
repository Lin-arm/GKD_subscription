import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.twitter.android',
  name: 'X(推特)',
  groups: [
    {
      key: 1,
      name: '分段广告-主页信息流广告',
      desc: '①点击右上角操作 ②点击[我不喜欢/屏蔽...]',
      actionCd: 3000, // https://github.com/gkd-kit/subscription/issues/832
      fastQuery: true,
      activityIds: [
        'com.twitter.app.main.MainActivity',
        'com.twitter.app.profiles.ProfileActivity',
      ],
      rules: [
        {
          key: 0,
          name: '①点击右上角操作',
          matches:
            '@[id$="_action"] <2 * + * >(1,3) [text$="广告后播放" || text$="推荐"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12798795',
            'https://i.gkd.li/i/14782884',
            'https://i.gkd.li/i/12813235',
            'https://i.gkd.li/i/14782897',
            'https://i.gkd.li/i/17182889',
          ],
        },
        {
          key: 1,
          matches:
            '@[vid="tweet_curation_action"] - [vid="tweet_ad_badge_top_right"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/705dd827-ff04-4233-af38-60d92439e1f3',
          snapshotUrls: 'https://i.gkd.li/i/24359526',
        },
        {
          key: 2, //无快查
          activityIds: 'com.x.android.main.MainActivity',
          matches:
            '@ImageView[desc="发帖选项"] - [visibleToUser=true][text="Ad"]',
          snapshotUrls: 'https://i.gkd.li/i/29085434',
        },

        // 第二段
        {
          key: 10,
          preKeys: [0, 1],
          matches:
            '@[clickable=true] > [text^="我不喜" || text^="屏蔽" || text^="封鎖" || text^="Block"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/14782902', // 我不喜欢这个广告、屏蔽
            'https://i.gkd.li/i/28415651', // 我不喜歡這個廣告、封鎖
            'https://i.gkd.li/i/20239421', // 屏蔽
          ],
        },
        {
          key: 11, //无快查
          preKeys: [2],
          activityIds: 'com.x.android.main.MainActivity',
          matches:
            '@[clickable=true] > [visibleToUser=true][text^="我不喜" || text^="屏蔽" || text^="封鎖" || text^="Block"]',
          snapshotUrls: 'https://i.gkd.li/i/29085445',
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
            '@ViewGroup > [vid="action_sheet_item_title"][text^="屏蔽" || text^="Block" || text^="隐藏 @" || text^="Mute @"||text^="Unblock @"||text^="Unmute @"]',
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
            '@ViewGroup > [vid="action_sheet_item_title"][text="我不喜欢这个广告" || text="我不喜歡這個廣告"]',
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
            '[vid="translation_link" || vid="grok_translation_link"][index=parent.childCount.minus(1)][index!=2]',
          exampleUrls: [
            'https://e.gkd.li/ced46989-9c6a-4626-b027-7953e0fdc2c6',
            'https://m.gkd.li/57941037/40ece44f-883f-429a-aa0c-17dac15a50e4',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/14189817',
            'https://i.gkd.li/i/14615911',
            'https://i.gkd.li/i/25461468',
            'https://i.gkd.li/i/25461607', // Grok translate
            'https://i.gkd.li/i/26642877',
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/25537171', // 已翻译, 加 [index=parent.childCount.minus(1)] 排除
            'https://i.gkd.li/i/26642826', // 已翻译, 加 [index!=2] 排除
          ],
        },
      ],
    },
    {
      key: 7,
      name: '功能类-自动[显示更多帖子]',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: 'com.twitter.app.main.MainActivity',
          matches: '@FrameLayout[clickable=true] > [text="显示更多帖子"]',
          exampleUrls:
            'https://m.gkd.li/57941037/7efa8af7-90d3-42b4-bf5d-3d83775f175a',
          snapshotUrls: 'https://i.gkd.li/i/14189847',
        },
        {
          key: 1,
          activityIds: 'com.x.android.main.MainActivity',
          matches:
            '@[clickable=true] > [visibleToUser=true][text="显示更多帖子"][left>300]',
          snapshotUrls: 'https://i.gkd.li/i/30151597',
          excludeSnapshotUrls: 'https://i.gkd.li/i/30175825', // [left=186]
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
    {
      key: 11,
      name: '功能类-网络错误自动重试',
      desc: '无法获取帖子=> 点击[重试]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.twitter.tweetdetail.TweetDetailActivity',
          matches:
            '[text^="现在无法获取帖子"] + [text="重试"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28419788',
          exampleUrls: 'https://e.gkd.li/5f532b57-1811-437f-bca2-d60c35aeda29',
        },
      ],
    },
    {
      key: 12,
      name: '功能类-进入视频自动静音',
      desc: '点击视频帖子=> 进入详情后自动静音',
      actionMaximum: 1,
      rules: [
        {
          fastQuery: true,
          activityIds:
            'com.twitter.explore.immersivemediaplayer.ui.activity.ImmersiveMediaPlayerActivity',
          matches:
            '[vid="video_mute_toggle"][clickable=true][visibleToUser=true]',
          excludeMatches:
            '[vid="video_mute_toggle"][desc="隐藏"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28436423',
          excludeSnapshotUrls: 'https://i.gkd.li/i/28436424',
          exampleUrls: 'https://e.gkd.li/f0996ce1-5376-4b80-9353-1384eb6e615c',
        },
      ],
    },
    {
      key: 13,
      name: '功能类-查看潜在敏感内容的个人页面',
      desc: '点某些账号详情页-警告!-> 是,查看个人资料',
      matchTime: 8000,
      actionMaximum: 1,
      resetMatch: 'match',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.twitter.app.profiles.ProfileActivity',
          matches:
            '[vid="warning_header"][visibleToUser=true] +2 [vid="primary_button"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/29404879',
          exampleUrls: 'https://e.gkd.li/dbdaffed-e1ca-4487-85a1-3a5466e3ff61',
        },
      ],
    },
    {
      key: 14,
      name: '局部广告-账号详情-小蓝标认证',
      desc: '点击[以后再说]',
      matchTime: 8000,
      actionMaximum: 1,
      resetMatch: 'match',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.twitter.app.profiles.ProfileActivity',
          matches:
            '[text="以后再说"] < @View[clickable=true] -2 [text^="认证标识很"][visibleToUser=true] <3 View[childCount=6] <<2 [vid="profile_upsell_compose"]',
          snapshotUrls: 'https://i.gkd.li/i/29405012',
          exampleUrls: 'https://e.gkd.li/6196a859-31ce-4d04-9f53-b9346bee25d6',
        },
      ],
    },
  ],
});
