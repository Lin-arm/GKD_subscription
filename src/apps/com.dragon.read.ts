import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.dragon.read',
  name: '番茄免费小说',
  groups: [
    {
      key: -1,
      name: '开屏广告',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          fastQuery: true,
          actionDelay: 1000, // 过早点击可能导致应用闪退
          matches:
            '@[desc="跳过广告"][clickable=true] > [text*="跳过"][text.length<10][width<500 && height<300][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/e36d701f-bcee-48d5-99da-1c5301101d9e',
          snapshotUrls: 'https://i.gkd.li/i/23282793',
        },
      ],
    },
    {
      key: 1,
      name: '更新提示',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: ['.update', '.pages.main.MainFragmentActivity'],
          matches: '@[text="以后再说"] + [text="优先体验"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12716477',
            'https://i.gkd.li/i/18175292',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '局部广告-首页右侧悬浮广告',
      fastQuery: true,
      rules: [
        {
          key: 0,
          activityIds: [
            '.pages.main.MainFragmentActivity',
            '.ad.openingscreenad.OpeningScreenADActivity',
          ],
          matches:
            '@ImageView[clickable=true][childCount=0][index=0][visibleToUser=true] < [childCount=3] < RelativeLayout < FrameLayout <2 [id="android:id/content"][childCount=3]',
          snapshotUrls: [
            'https://i.gkd.li/i/12716506',
            'https://i.gkd.li/i/13318796',
          ],
        },
        {
          key: 1,
          activityIds: '.pages.main.MainFragmentActivity',
          matches:
            '@ImageView[desc="Close Button"] <2 View < View < View < View < ComposeView < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/28907537',
        },
      ],
    },
    {
      key: 3,
      name: '全屏广告',
      fastQuery: true,
      rules: [
        {
          key: 0,
          name: '电商惊喜券',
          activityIds: '.pages.main.MainFragmentActivity',
          matches:
            '@LynxFlattenUI[id=null][text=""][clickable=true] - [text="去逛商城"] -4 [text$="电商惊喜券"]',
          snapshotUrls: 'https://i.gkd.li/i/12910159',
        },
        {
          key: 1,
          name: '爆款好物一分购',
          activityIds: '.pages.main.MainFragmentActivity',
          matches:
            '@ImageView[clickable=true] <2 LinearLayout[childCount=2] < [id="android:id/content"][childCount=1]',
          snapshotUrls: 'https://i.gkd.li/i/12878266',
        },
        {
          key: 2,
          name: '抽奖赢好礼',
          activityIds: '.pages.main.MainFragmentActivity',
          matches: '@LynxFlattenUI[clickable=true] - [text="前往抽奖"]',
          exampleUrls:
            'https://m.gkd.li/57941037/77c4098a-818f-4d0f-8492-e98818d0da27',
          snapshotUrls: 'https://i.gkd.li/i/14292475',
        },
        {
          key: 3,
          name: '签到弹窗',
          activityIds: '.pages.main.MainFragmentActivity',
          matches:
            '@LynxFlattenUI[clickable=true][visibleToUser=true][text=""] -27 FlattenUIText[text^="立即签到"]',
          exampleUrls:
            'https://m.gkd.li/57941037/96afbb4f-afd5-4f64-948d-15fc7bb14075',
          snapshotUrls: 'https://i.gkd.li/i/15223416',
        },
        {
          key: 4,
          activityIds: '.reader.ui.ReaderActivity',
          matches:
            'AwemeLynxVideoUI +n FlattenUIText[text="关闭"][clickable=true][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/6d33c17b-85de-4977-aa7f-b45e2a917a12',
          snapshotUrls: 'https://i.gkd.li/i/23549149',
        },
        {
          key: 5,
          activityIds: '.reader.ui.ReaderActivity',
          matches: 'TextView[text="广告"] +2 Button[vid="close"]',
          snapshotUrls: 'https://i.gkd.li/i/13191156',
        },
        {
          key: 6,
          activityIds: '.reader.ui.ReaderActivity',
          matches:
            '@ImageView[clickable=true][visibleToUser=true] +5 [text="领取限时福利"]',
          snapshotUrls: [
            'https://i.gkd.li/i/14430326',
            'https://i.gkd.li/i/14969861',
          ],
        },
        {
          key: 7,
          name: '坐标点击[关闭]',
          position: {
            left: 'width * 0.9123',
            top: 'width * 0.067',
          },
          activityIds: '.reader.ui.ReaderActivity',
          matches:
            'View[id=null][text=null][desc=null][childCount=0] < [id="com.dragon.read.awemevideo:id/fullvideo_videoview"][childCount=1][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/c29c5647-e2ee-460f-87aa-8717779645ec',
          snapshotUrls: 'https://i.gkd.li/i/23621776',
        },
        {
          key: 8,
          name: '坐标点击[关闭]',
          activityIds: '.reader.ui.ReaderActivity',
          position: {
            left: 'width * 0.9141',
            top: 'width * 0.0687',
          },
          matches:
            '@ViewGroup[visibleToUser=true] < [childCount=2] - [childCount=1] >6 [vid="ttlive_player_render_view"]',
          snapshotUrls: 'https://i.gkd.li/i/27706770',
        },
      ],
    },
    {
      key: 4,
      name: '全屏广告-阅读页面关注作者弹窗',
      fastQuery: true,
      rules: [
        {
          key: 0,
          activityIds: '.reader.ui.ReaderActivity',
          matches: '@ImageView +2 FrameLayout >3 [text="关注"]',
          snapshotUrls: 'https://i.gkd.li/i/13399505',
        },
      ],
    },
    {
      key: 5,
      name: '分段广告-阅读页面广告',
      fastQuery: true,
      activityIds: '.reader.ui.ReaderActivity',
      rules: [
        {
          key: 0,
          matches:
            '@[(name$="ImageView" || getChild(0).name$="ImageView") && desc!="back_unfold"][clickable=true][visibleToUser=true][width<102 && height<102] <n [childCount>1] >(2,3) [text*="查看" || text$="优惠" || text^="立即" || text^="马上" || text*="参与" || text*="免费" || (text*="领" && text*="券") || (text*="返" && text*="金币")][text.length<10]',
          snapshotUrls: [
            'https://i.gkd.li/i/12908734', // 查看详情
            'https://i.gkd.li/i/18138903', // 立享优惠
            'https://i.gkd.li/i/21623147', // 立即前往
            'https://i.gkd.li/i/14622531', // 立即玩
            'https://i.gkd.li/i/25174203', // 马上参与
            'https://i.gkd.li/i/26347335', // 参与讨论
            'https://i.gkd.li/i/13520314', // 领60元券
            'https://i.gkd.li/i/24706223', // 免费观看
            'https://i.gkd.li/i/14548657', // 返1098金币
            'https://i.gkd.li/i/14810480', // 返780金币
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/28821485', // 用 [name$="ImageView" || getChild(0).name$="ImageView"][visibleToUser=false] 排除
            'https://i.gkd.li/i/31111672', // 添加 desc!="back_unfold" 条件排除
          ],
          exampleUrls: 'https://e.gkd.li/3de0d5d9-0c02-4fe7-b5e8-b9fdb6688f8e',
        },
        {
          key: 1,
          matches:
            '@ImageView[clickable=true][childCount=0][visibleToUser=true] < FrameLayout - LinearLayout >2 [text="广告"]',
          exampleUrls: 'https://e.gkd.li/c172db67-a489-488b-a5f5-35aa9657c444',
          snapshotUrls: 'https://i.gkd.li/i/18724040',
        },
        {
          key: 2,
          matches:
            '@[id=null][visibleToUser=true][width<121 && height<121][childCount<2][left>prev.width.div(10).times(9)][top>prev.height.div(8).times(7)] <<n [vid="root_view"]',
          /*
           ** 从选择器右侧 [vid="root_view"] 节点获取屏幕宽高, 要求目标节点位于屏幕右下角
           ** [left>prev.width.div(10).times(9)] 表示目标节点的 left 要大于屏幕宽度的 9/10
           ** [top>prev.height.div(8).times(7)] 表示目标节点的 top 要大于屏幕高度的 7/8
           */
          snapshotUrls: [
            'https://i.gkd.li/i/28781063',
            'https://i.gkd.li/i/28781061',
            'https://i.gkd.li/i/24189900',
            'https://i.gkd.li/i/24205810',
            'https://i.gkd.li/i/28800387', // 目标节点 [clickable=false]
          ],
          exampleUrls: 'https://e.gkd.li/1f431aef-3464-4f53-90e4-3f1bd9cca922', // 限制范围示意图
        },
        {
          key: 3,
          name: '坐标点击[反馈]',
          position: {
            top: 'width * 0.0617',
            left: 'width * 0.7885',
          },
          matches:
            '@ViewGroup[visibleToUser=true][height<150][width=prev.width] < [childCount=2] <3 FrameLayout[childCount=3] >7 [vid="ttlive_player_render_view"]',
          snapshotUrls: 'https://i.gkd.li/i/28834344',
          exampleUrls: 'https://e.gkd.li/aef38288-d84b-4e13-8161-ebebc27b822b',
        },
        {
          key: 4,
          name: '点击[反馈]',
          actionCd: 3500, // 同类型广告有“当前可点击”与“3秒后可点击”两种状态
          actionDelay: 200,
          matches:
            '[text="反馈" || desc="反馈"][visibleToUser=true][name$="UIText" || name$="ViewGroup"]',
          exampleUrls: [
            'https://e.gkd.li/3837a70f-30e3-42d1-9354-696dcda598b7',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/13520160',
            'https://i.gkd.li/i/13816453',
            'https://i.gkd.li/i/24128141',
          ],
        },

        // 第二段
        {
          key: 50,
          preKeys: [0, 1, 2, 3, 4],
          name: '②点击[不感兴趣/关闭此广告]',
          anyMatches: [
            '@[clickable=true] > [text="不感兴趣" || text^="关闭此"]',
            '[text="不感兴趣" || text^="关闭此"][clickable=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/13816454', //不感兴趣
            'https://i.gkd.li/i/14913207', //不感兴趣
            'https://i.gkd.li/i/24128392', //不感兴趣
            'https://i.gkd.li/i/24189605', //关闭此广告
            'https://i.gkd.li/i/14540281', //关闭此条广告
          ],
          exampleUrls: 'https://e.gkd.li/e04bcb90-ad61-43d9-97e9-b4f6e3873320',
        },
      ],
    },
    {
      key: 6,
      name: '评价提示-请求好评弹窗',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.pages.main.MainFragmentActivity',
          matches: '@ImageView[clickable=true] +3 * > [text="五星好评"]',
          snapshotUrls: 'https://i.gkd.li/i/14395093',
        },
      ],
    },
    {
      key: 10,
      name: '权限提示-通知权限',
      desc: '点击"取消"',
      fastQuery: true,
      rules: [
        {
          key: 0,
          name: '首页',
          matchTime: 10000,
          actionMaximum: 1,
          resetMatch: 'app',
          activityIds: [
            '.widget.ConfirmDialogBuilder',
            '.pages.main.MainFragmentActivity',
          ],
          matches: [
            '[text="开启推送提醒"][visibleToUser=true]',
            '[text="取消"][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/12716592',
            'https://i.gkd.li/i/21589667',
          ],
        },
        {
          key: 1, // 通知权限对话框可能多次触发 https://github.com/Lin-arm/GKD_subscription/pull/135
          name: '小说阅读页',
          activityIds: '.reader.ui.ReaderActivity',
          matches: [
            '[text="开启推送通知"][visibleToUser=true]',
            '[text="取消"][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/27190449',
        },
      ],
    },
    {
      key: 15,
      name: '功能类-误入直播后自动[退出]',
      desc: '配合 看广告自动领奖励 使用',
      fastQuery: true,
      activityIds: 'com.bytedance.mira.stub.p0.StubSingleTaskActivity1',
      rules: [
        {
          key: 1501, // key 在 功能类-观看广告自动静音 有关联
          name: '①已进直播间-按[返回键]',
          action: 'back',
          actionDelay: 500,
          matches:
            '[id="com.dragon.read.live:id/swipe_refresh"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28906839',
        },
        {
          key: 1502,
          name: '②点击确认[退出]',
          matches: '[text="退出"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/28906845',
        },
      ],
    },
    {
      key: 16,
      name: '功能类-看广告自动领奖励',
      fastQuery: true,
      activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
      rules: [
        {
          key: 0,
          name: '①隔10秒点击右上角x掉',
          actionDelay: 10000,
          matches:
            '@ImageView[width<40 && height<40] <n ViewGroup <(4,5) ViewGroup < FrameLayout < FrameLayout < FrameLayout < FrameLayout < FrameLayout < [id="android:id/content"]',
          exampleUrls: 'https://e.gkd.li/c3e53a6c-cc60-413d-8464-2b4a1259c038',
          snapshotUrls: [
            'https://i.gkd.li/i/24689154',
            'https://i.gkd.li/i/24688948',
            'https://i.gkd.li/i/24689141',
            'https://i.gkd.li/i/24689202',
          ],
        },
        {
          key: 1,
          name: '②已得奖励-点击x掉',
          matches: '@ImageView < ViewGroup[desc*="关闭" && desc!*="秒"]',
          position: {
            left: 'width * 0.5',
            top: 'width * 0.5',
          },
          exampleUrls: 'https://e.gkd.li/9cd91c80-9cba-48e8-97cd-dac5968694e4',
          snapshotUrls: [
            'https://i.gkd.li/i/26530262',
            'https://i.gkd.li/i/26530263',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/26528931',
        },
        {
          key: 20,
          preKeys: [0, 1],
          name: '③坐标点击[继续观看]',
          actionDelay: 500,
          position: {
            left: 'width * 0.5',
            bottom: 'width * 0.3182', // 从底部计算纵坐标位置
          },
          matches:
            'ImageView - @ViewGroup[childCount=1][width>600 && height>600][getChild(0).name$="ImageView"] -(1,2) ScrollView',
          exampleUrls: 'https://e.gkd.li/f2859af8-7ca7-40d3-9737-7be8b0200bae',
          snapshotUrls: [
            'https://i.gkd.li/i/24689140',
            'https://i.gkd.li/i/24689143',
            'https://i.gkd.li/i/24689393',
            'https://i.gkd.li/i/28378131', // 可能重复触发 子key1 , 已加 preKeys 解决
          ],
        },
        {
          key: 99,
          name: '④已无新视频-退出',
          matches:
            '@[clickable=true][width<120 && height<120] + LinearLayout > [text="当前无新视频"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/24689246',
        },
      ],
    },
    {
      key: 17,
      name: '评价提示-点评此书弹窗',
      desc: '点击[取消]',
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.reader.ui.ReaderActivity',
          matches: ['[text="点评此书"]', '[text="取消"][clickable=true]'],
          snapshotUrls: 'https://i.gkd.li/i/21589381',
        },
      ],
    },
    {
      key: 18,
      name: '功能类-观看广告自动静音',
      desc: '点击1次, activity刷新后会重置',
      fastQuery: true,
      actionDelay: 300,
      actionMaximum: 1,
      actionMaximumKey: 0,
      scopeKeys: [15], // 关联规则 功能类-误入直播后自动[退出]
      activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
      rules: [
        {
          key: 0,
          preKeys: [1501, 1502], // 关联规则 key15 的两条 子key
          name: '刚退出直播间-不点击[静音]',
          action: 'none', // 无操作,仅作消耗 actionMaximum 次数用
          matches: '[parent=null]',
        },
        {
          key: 1,
          name: '①点击[静音]',
          matches:
            '@ImageView[visibleToUser=true][width>20 && width<93 && height>20 && height<108][right<prev.width.div(3)][bottom<prev.height.div(10)] <<n [id="android:id/content"]',
          /*
           ** 从选择器右侧 [id="android:id/content"] 节点获取屏幕宽高, 限制目标节点位于屏幕左上角
           ** [right<prev.width.div(3)] 表示目标节点的 right 要小于屏幕宽度的 1/3
           ** [bottom<prev.height.div(10)] 表示目标节点的 bottom 要小于屏幕高度的 1/10
           */
          snapshotUrls: 'https://i.gkd.li/i/28907595',
        },
        {
          key: 2,
          name: '②坐标点击[静音]',
          position: {
            left: 'width * 0.5',
            top: 'width * 0.8730',
          },
          matches:
            '@ImageView[width>20 && width<93 && height<0][right<prev.width.div(3)][bottom<prev.height.div(10)] <<n [id="android:id/content"]',
          exampleUrls: 'https://e.gkd.li/d8949efa-e2f7-49d2-a8d7-4837ed349aef',
          snapshotUrls: 'https://i.gkd.li/i/26528931', // [height<0]
        },
      ],
    },
    {
      key: 19,
      name: '其他-添加桌面小组件',
      desc: '点击[取消]',
      rules: [
        {
          fastQuery: true,
          activityIds:
            '.social.ugc.topic.topicdetail.NewUgcTopicDetailActivity',
          matches:
            '[text^="添加到"] +n [childCount=2] > [text="取消"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/28784392',
          exampleUrls: 'https://e.gkd.li/b4cb96bd-0ced-4228-bd4a-a1be162bb75a',
        },
      ],
    },
  ],
});
