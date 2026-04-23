import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xingin.xhs',
  name: '小红书',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      actionMaximumKey: 0,
      priorityTime: 10000,
      rules: [
        {
          key: 0,
          excludeActivityIds: [
            'com.xingin.alioth.search.GlobalSearchActivity',
            'com.xingin.growth.ob.FloatingObPageActivity',
            'com.xingin.matrix.notedetail.NoteDetailActivity',
          ],
          excludeMatches:
            '[text="首页" || text="选择兴趣推荐更精准"][visibleToUser=true]',
          matches:
            '[text*="跳过" || text^="Skip Ad"][text.length<10][!(vid="tv_user_name")][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/9733ada7-4961-4a9f-b48d-3398ecd05508',
          snapshotUrls: [
            'https://i.gkd.li/i/17452158',
            'https://i.gkd.li/i/22951606', // 英语版
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/19035037',
            'https://i.gkd.li/i/20585457',
            'https://i.gkd.li/i/21937254',
          ],
        },
        {
          key: 1,
          matches: '[vid="splash_count_down_view"]',
          exampleUrls: 'https://e.gkd.li/6ed22307-ce1d-479e-8a8d-a6fe4ffa614c',
          snapshotUrls: [
            'https://i.gkd.li/i/17109105',
            'https://i.gkd.li/i/17108010', // 全局规则在此误触
          ],
        },
      ],
    },
    {
      key: 1,
      name: '权限提示-通知权限',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          key: 0,
          activityIds: [
            '.index.v2.IndexActivityV2',
            '.notification.NotificationAuthorizationTranslucentActivity',
            'com.xingin.matrix.notedetail.r10.comment.r10.NoteCommentActivity',
            'com.xingin.authorization.NotificationAuthorizationTranslucentActivity',
          ],
          matches:
            '@ImageView[clickable=true][visibleToUser=true] - LinearLayout > [text^="打开通知" || text^="Enable notifications"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13195753',
            'https://i.gkd.li/i/13222356',
            'https://i.gkd.li/i/13255627',
            'https://i.gkd.li/i/16918033',
            'https://i.gkd.li/i/18417785',
          ],
        },
        {
          key: 1,
          activityIds: '.index.v2.IndexActivityV2',
          matches: '@ImageView <2 FrameLayout - [text^="打开通知"]',
          snapshotUrls: 'https://i.gkd.li/i/13250418',
        },
      ],
    },
    {
      key: 2,
      name: '更新提示',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      actionMaximumKey: 0,
      activityIds: [
        '.index.v2.IndexActivityV2',
        'com.xingin.update.UpdateDialogActivity',
      ],
      rules: [
        {
          key: 0,
          matches: '@ImageView <2 * + * > [text="NEW"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13246890',
            'https://i.gkd.li/i/13741680',
            'https://i.gkd.li/i/14445193',
          ],
        },
        {
          key: 1,
          matches: 'Button[text="立即安装"] + Button[text="稍后再说"]',
          exampleUrls: 'https://e.gkd.li/7064a569-fcdd-44e2-b4d1-c55e093f4a02',
          snapshotUrls: [
            'https://i.gkd.li/i/15283162',
            'https://i.gkd.li/i/18289347',
          ],
        },
      ],
    },
    {
      key: 3,
      name: '分段广告-信息流广告',
      desc: '①长按[赞助/广告]卡片 ②点击[不喜欢]',
      fastQuery: true,
      activityIds: '.index.v2.IndexActivityV2',
      rules: [
        {
          key: 0,
          action: 'longClick',
          name: '①长按[赞助/广告]卡片',
          excludeMatches: 'RecyclerView > LinearLayout > [text^="不喜欢"]',
          matches:
            '@[longClickable=true] >(1,3) TextView[text="赞助" || text="广告"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/13455503',
            'https://i.gkd.li/i/13470690',
            'https://i.gkd.li/i/27015032',
            'https://i.gkd.li/i/27015306',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/14392171', // 防止反复触发规则
          exampleUrls: [
            'https://e.gkd.li/728542d5-d6fe-44ab-91b2-a96ee34abdf8',
            'https://e.gkd.li/a5d7871e-05e1-4a77-b0f5-3d94d7fd7663',
          ],
        },
        {
          preKeys: [0],
          name: '②点击[不喜欢]',
          matches:
            '@[clickable=true] > TextView[text^="不喜欢"][text!*="作者"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/13455500',
            'https://i.gkd.li/i/14392187', // [text!*="作者"]
            'https://i.gkd.li/i/26647708',
          ],
          exampleUrls: [
            'https://e.gkd.li/cbf948c2-8a78-42a2-911d-c2369aaeff7d',
            'https://e.gkd.li/09f8f42b-ed78-4cd1-9d77-8327ca91e1e0',
          ],
        },
      ],
    },
    {
      key: 4,
      name: '全屏广告-优惠券弹窗',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: 'com.xingin.reactnative.ui.XhsReactTranslucentActivity',
          matches:
            '@ImageView[visibleToUser=true] < * -2 * > [text="你有新人券待领取"]',
          snapshotUrls: 'https://i.gkd.li/i/14391484',
        },
      ],
    },
    {
      key: 5,
      name: '评价提示-评分弹窗',
      desc: '返回关闭弹窗',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          action: 'back',
          activityIds: 'com.xingin.lurker.appscore.ui.AppScoreDialogActivity',
          matches: '[text="您对小红书的评分如何?"]',
          exampleUrls:
            'https://m.gkd.li/57941037/9727815d-b881-4904-bbdc-19ade426977e',
          snapshotUrls: 'https://i.gkd.li/i/15281458',
        },
      ],
    },
    {
      key: 6,
      name: '功能类-评论区-自动展开回复', // 重构，因为没完没了的展开，更多展开在key17
      desc: '自动展开x条回复,更多展开在下面',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            'com.xingin.matrix.notedetail.NoteDetailActivity',
            'com.xingin.matrix.detail.activity.DetailFeedActivity',
          ],
          matches:
            '@[clickable=true] > [vid="loadMoreTV"][text^="展开"][text$="条回复"]',
          snapshotUrls: [
            'https://i.gkd.li/i/25048251',
            'https://i.gkd.li/i/25823242',
          ],
          exampleUrls: [
            'https://e.gkd.li/a211ebb1-2177-4264-9a60-280a5f8e2777',
          ],
        },
      ],
    },
    {
      key: 7,
      name: '局部广告-你可能感兴趣的人',
      desc: '点击[关闭]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.index.v2.IndexActivityV2',
          matches:
            '[text="你可能感兴趣的人"] +2 Button[text="关闭"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/25244655',
        },
      ],
    },
    {
      key: 8,
      name: '局部广告-首页信息流中推荐博主',
      desc: 'x掉 (关注xx的人也关注TA)',
      rules: [
        {
          fastQuery: true,
          activityIds: '.index.v2.IndexActivityV2',
          matches:
            '[vid="recommend_close"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25245325',
        },
      ],
    },
    {
      key: 9,
      name: '局部广告-直播间右下角卡片',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.xingin.alpha.audience.v2.AlphaAudienceActivityV2',
          matches:
            'ImageView < @[clickable=true] <n ViewGroup <<3 [vid="canvasLayout"]',
          snapshotUrls: 'https://i.gkd.li/i/25245250',
        },
      ],
    },
    {
      key: 10,
      name: '功能类-自动倍速⏩x0.75⚠️五选一',
      desc: '适合观看细节场景需求',
      fastQuery: true,
      actionMaximum: 1,
      actionCd: 1000, // 界面稳定后执行
      activityIds: 'com.xingin.matrix.detail.activity.DetailFeedActivity',
      rules: [
        {
          key: 0,
          matches: '[vid="layer_player"][visibleToUser=true]',
          action: 'longClick',
          snapshotUrls: 'https://i.gkd.li/i/25854264',
          exampleUrls: 'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54',
        },
        {
          preKeys: [0],
          matches:
            '[vid="video_speed_setting_ll"] > [vid="speed_selection_1"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25854394',
          exampleUrls: [
            'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54', // 倍速弹窗
            'https://e.gkd.li/65ae2f11-3412-4f0a-a255-ffa5916bd9d9', // 成功点击后提示
          ],
        },
      ],
    },
    {
      key: 11,
      name: '功能类-自动倍速⏩x1.25⚠️五选一',
      desc: '适合日常效率需求',
      fastQuery: true,
      actionMaximum: 1,
      actionCd: 1000, // 界面稳定后执行
      activityIds: 'com.xingin.matrix.detail.activity.DetailFeedActivity',
      rules: [
        {
          key: 0,
          matches: '[vid="layer_player"][visibleToUser=true]',
          action: 'longClick',
          snapshotUrls: 'https://i.gkd.li/i/25854264',
          exampleUrls: 'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54',
        },
        {
          preKeys: [0],
          matches:
            '[vid="video_speed_setting_ll"] > [vid="speed_selection_3"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25854394',
          exampleUrls: [
            'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54', // 倍速弹窗
            'https://e.gkd.li/65ae2f11-3412-4f0a-a255-ffa5916bd9d9', // 成功点击后提示
          ],
        },
      ],
    },
    {
      key: 12,
      name: '功能类-自动倍速⏩x1.5⚠️五选一',
      fastQuery: true,
      actionMaximum: 1,
      actionCd: 1000, // 界面稳定后执行
      activityIds: 'com.xingin.matrix.detail.activity.DetailFeedActivity',
      rules: [
        {
          key: 0,
          matches: '[vid="layer_player"][visibleToUser=true]',
          action: 'longClick',
          snapshotUrls: 'https://i.gkd.li/i/25854264',
          exampleUrls: 'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54',
        },
        {
          preKeys: [0],
          matches:
            '[vid="video_speed_setting_ll"] > [vid="speed_selection_4"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25854394',
          exampleUrls: [
            'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54', // 倍速弹窗
            'https://e.gkd.li/65ae2f11-3412-4f0a-a255-ffa5916bd9d9', // 成功点击后提示
          ],
        },
      ],
    },
    {
      key: 13,
      name: '功能类-自动倍速⏩x2.0⚠️五选一',
      fastQuery: true,
      actionMaximum: 1,
      actionCd: 1000, // 界面稳定后执行
      activityIds: 'com.xingin.matrix.detail.activity.DetailFeedActivity',
      rules: [
        {
          key: 0,
          matches: '[vid="layer_player"][visibleToUser=true]',
          action: 'longClick',
          snapshotUrls: 'https://i.gkd.li/i/25854264',
          exampleUrls: 'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54',
        },
        {
          preKeys: [0],
          matches:
            '[vid="video_speed_setting_ll"] > [vid="speed_selection_5"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25854394',
          exampleUrls: [
            'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54', // 倍速弹窗
            'https://e.gkd.li/65ae2f11-3412-4f0a-a255-ffa5916bd9d9', // 成功点击后提示
          ],
        },
      ],
    },
    {
      key: 14,
      name: '功能类-自动倍速⏩x3.0⚠️五选一',
      desc: 'Max效率需求',
      fastQuery: true,
      actionMaximum: 1,
      actionCd: 1000, // 界面稳定后执行
      activityIds: 'com.xingin.matrix.detail.activity.DetailFeedActivity',
      rules: [
        {
          key: 0,
          matches: '[vid="layer_player"][visibleToUser=true]',
          action: 'longClick',
          snapshotUrls: 'https://i.gkd.li/i/25854264',
          exampleUrls: 'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54',
        },
        {
          preKeys: [0],
          matches:
            '[vid="video_speed_setting_ll"] >2 [vid="speed_selection_6"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25854394',
          exampleUrls: [
            'https://e.gkd.li/3d621ea3-af7b-49cf-95bb-4fd54fcc5b54', // 倍速弹窗
            'https://e.gkd.li/65ae2f11-3412-4f0a-a255-ffa5916bd9d9', // 成功点击后提示
          ],
        },
      ],
    },
    {
      key: 15,
      name: '分段广告-直播卡片Ad',
      desc: '长按"直播中"标识的卡片-点"不喜欢"',
      fastQuery: true,
      activityIds: '.index.v2.IndexActivityV2',
      rules: [
        {
          key: 0,
          action: 'longClick',
          name: '长按"直播中"卡片',
          matches:
            '[text="直播中"] <<3 [vid="liveTagLottieLayout"] + [vid="liveDescLayout"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25873879',
        },
        {
          preKeys: [0],
          name: '点"不喜欢"',
          matches: '@[clickable=true] > [text="不喜欢"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25874144',
          exampleUrls: 'https://e.gkd.li/6a32974d-ea39-4f85-9f76-2d8b8a3fc679',
        },
      ],
    },
    {
      key: 16,
      name: '功能类-设备登入自动确认',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.xingin.reactnative.ui.XhsReactActivity',
          matches:
            'ViewGroup > [text="登录确认"] +6 @[clickable=true] > [text="确认登录"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26029586',
          exampleUrls: 'https://e.gkd.li/dfc35798-6ab3-4941-bf23-572de9f3a19c',
        },
      ],
    },
    {
      key: 17,
      name: '功能类-评论区-展开更多回复',
      desc: '自动展开更多回复',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            'com.xingin.matrix.notedetail.NoteDetailActivity',
            'com.xingin.matrix.detail.activity.DetailFeedActivity',
          ],
          matches:
            '@[clickable=true] > [vid="loadMoreTV"][text="展开更多回复"]',
          snapshotUrls: [
            'https://i.gkd.li/i/25048251',
            'https://i.gkd.li/i/25823242',
          ],
          exampleUrls: [
            'https://e.gkd.li/a211ebb1-2177-4264-9a60-280a5f8e2777',
          ],
        },
      ],
    },
    {
      key: 18,
      name: '功能类-评论自动翻译',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.xingin.matrix.notedetail.NoteDetailActivity',
          matches: '[text$="回复 翻译"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26643975',
          exampleUrls: 'https://e.gkd.li/fc8d70d4-f743-45df-a9d2-f343e419ccd9',
        },
      ],
    },
  ],
});
