import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.qidian.QDReader',
  name: '起点读书',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      actionMaximumKey: 0,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          key: 0,
          matches: '[vid="splash_skip_button"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/33750455',
        },
        {
          key: 1,
          matches:
            '[text*="跳过"][text.length<10][clickable=true][width<500 && height<300]',
          snapshotUrls: 'https://i.gkd.li/i/33750485',
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/33630317', //用 [clickable=true] 排除 跳过福利激励视频
            'https://i.gkd.li/i/33750400', //用 [clickable=true] 排除 找书时可跳过详情页
          ],
          exampleUrls: 'https://e.gkd.li/2c5cc57a-1e92-4e83-b31e-9342aa75034c',
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
          key: 1,
          activityIds: '.framework.widget.dialog.judian',
          matches: '[text$="新版本"] +2 * >2 [vid="cancel"]',
          snapshotUrls: 'https://i.gkd.li/i/12641026',
        },
        {
          key: 2,
          activityIds: 'com.tencent.upgrade.ui.UpgradeDialogActivity',
          matches: '[vid="upgrade_dialog_close_btn"]',
          snapshotUrls: 'https://i.gkd.li/i/33833374',
        },
      ],
    },
    {
      key: 2,
      name: '青少年模式',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: [
            '.bll.helper.z0',
            '.ui.activity.MainGroupActivity',
            '.framework.widget.dialog.judian',
          ],
          matches: '[vid="btnEnterTeen"] + [vid="btnCancel"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12640241',
            'https://i.gkd.li/i/12905817',
            'https://i.gkd.li/i/31594056',
          ],
        },
      ],
    },
    {
      key: 3,
      name: '全屏广告-弹窗广告',
      desc: '点击x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            '.ui.activity.MainGroupActivity', //A
            '.framework.widget.dialog.judian', //B
            '.ui.activity.BookLastPageNewActivity', //C
            'com.tencent.mm.plugin.webview.ui.tools.SDKOAuthUI', //D
          ],
          matches: '[vid="imgClose" || vid="btnClose"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/12640158', //D
            'https://i.gkd.li/i/12818198', //B
            'https://i.gkd.li/i/13469004', //C
            'https://i.gkd.li/i/23210736', //A
            'https://i.gkd.li/i/23249358', //A   btnClose
          ],
          exampleUrls: 'https://e.gkd.li/79947364-3b02-4113-a7de-2c26cca14286',
        },
      ],
    },
    {
      key: 4,
      name: '权限提示-通知权限',
      desc: 'x掉',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          key: 1,
          activityIds: 'com.afollestad.materialdialogs.MaterialDialog',
          matches: '@[vid="ivClose"] + [text^="开启推送"]',
          snapshotUrls: 'https://i.gkd.li/i/12640242',
        },
        {
          key: 2,
          activityIds: '.ui.activity.MainGroupActivity',
          matches: 'ImageView < [vid="ivUpdateNoticeClose"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/24913610',
        },
      ],
    },
    {
      key: 5,
      name: '局部广告-悬浮广告',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            '.ui.activity.QDBookDetailActivity',
            '.ui.activity.MainGroupActivity',
          ],
          matches: '[vid="ivAdClose"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/12717032',
            'https://i.gkd.li/i/31591781',
          ],
        },
      ],
    },
    {
      key: 6,
      name: '评价提示',
      desc: '点击x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.ui.activity.CircleHomePageActivity',
          matches:
            '@[vid="fClose"] - [visibleToUser=true] > [text*="给个好评"]',
          snapshotUrls: 'https://i.gkd.li/i/31592429',
          exampleUrls: 'https://e.gkd.li/4a4e064a-742b-41d3-8cce-8fc9ab54528c',
        },
      ],
    },
    {
      key: 7,
      name: '功能类-自动[展开]书籍简介',
      desc: '书单列表页/书籍详情页',
      fastQuery: true,
      rules: [
        {
          key: 1,
          actionCd: 500,
          activityIds: [
            '.ui.activity.RecomBookListDetailActivity',
            '.ui.activity.QDBookDetailActivity',
          ],
          matches:
            '[vid="etvBookRecomWord" || vid="tvIntro"][text$="...展开"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/31593523',
            'https://i.gkd.li/i/31593865',
          ],
          exampleUrls: [
            'https://e.gkd.li/48250906-5ae1-448e-84f8-900cdfbff970',
            'https://e.gkd.li/7f933b03-487c-48ad-825a-bb3a1ff08154',
          ],
        },
        {
          key: 2,
          actionCd: 2000,
          forcedTime: 5000, //防止刚进书籍详情页时不触发
          activityIds: '.flutter.QDBookDetailFlutterActivity',
          matches:
            '@ImageView[clickable=true] < View[desc.length>30] <n ScrollView < View < View < View < View < View < FrameLayout < [id="android:id/content"]',
          snapshotUrls: [
            'https://i.gkd.li/i/33534760',
            'https://i.gkd.li/i/33535207',
            'https://i.gkd.li/i/33535541',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/33534953', //已展开
          exampleUrls: 'https://e.gkd.li/c44b8465-e586-4dd7-8957-7e3c90097564',
        },
      ],
    },
    {
      key: 8,
      name: '功能类-自动[收起]书架上方推广',
      desc: '点击1次[收起]',
      rules: [
        {
          fastQuery: true,
          matchTime: 10000,
          actionMaximum: 1,
          resetMatch: 'app',
          activityIds: '.ui.activity.MainGroupActivity',
          matches: '@[vid="operationItemCloseIcon"] - [text="收起"]',
          snapshotUrls: 'https://i.gkd.li/i/33534248',
          exampleUrls: 'https://e.gkd.li/d8f0794f-2cc4-463f-ae76-55a417ad4a5a',
        },
      ],
    },
    {
      key: 10,
      name: '功能类-扫描自动确认[登录]',
      desc: '点击[登录]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.ui.activity.QDBrowserActivity',
          matches: '@[id="scanLogin"] <<(7,9) [vid="webViewContainer"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12903081', //无vid 旧快照
            'https://i.gkd.li/i/28999743',
          ],
        },
      ],
    },
    {
      key: 11,
      name: '局部广告-信息流广告',
      desc: '每日导读页-游戏广告',
      rules: [
        {
          activityIds: '.flutter.DailyReadingMainPageActivity',
          matches: '@ImageView[clickable=true] < [desc^="游戏广告"]',
          snapshotUrls: 'https://i.gkd.li/i/31592925',
          exampleUrls: 'https://e.gkd.li/84123bd4-a6d5-4186-88fe-e35320a241cb',
        },
      ],
    },
    {
      key: 12,
      name: '功能类-福利中心看完广告-知道了',
      desc: '点击[知道了]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.ui.activity.QDBrowserActivity',
          matches:
            '@TextView[text$="知道了"][visibleToUser=true] < [index=parent.childCount.minus(1)] <n View < View - [id="app"] <<4 [vid="webViewContainer"]',
          exampleUrls: 'https://e.gkd.li/54f41a5a-1c71-4618-bdab-5335172ab7f5',
          snapshotUrls: [
            // 'https://i.gkd.li/i/13606901', //v7.9.318 已失效，该版本的起点已无法看福利中心广告
            'https://i.gkd.li/i/22909666', //422
            'https://i.gkd.li/i/24339296', //428
          ],
        },
      ],
    },
    {
      key: 13,
      name: '全屏广告-红包弹窗',
      desc: '点击x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            '.ui.activity.hongbao_square.NewHongBaoSquareActivity',
            '.ui.activity.MainGroupActivity',
            '.flutter.HongBaoSquareActivity',
          ],
          matches: '[vid="rootView"] > [vid="btnHongbaoClose"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13918466', // 326
            'https://i.gkd.li/i/23291755', // 422
            'https://i.gkd.li/i/28931164', // 428
          ],
          exampleUrls: 'https://e.gkd.li/a11d58b2-70fd-420c-86f1-7a11a8603ee7',
        },
      ],
    },
    {
      key: 14,
      name: '功能类-移动网络下自动点击播放视频',
      rules: [
        {
          fastQuery: true,
          activityIds: '.ui.activity.QDBrowserActivity',
          matches: [
            '[text^="当前处于移动网络"]',
            '@[clickable=true] >2 [text="播放"]',
          ],
          exampleUrls:
            'https://m.gkd.li/57941037/ea612e44-12a9-405f-aa03-60a19cebef57',
          snapshotUrls: 'https://i.gkd.li/i/15857381',
        },
      ],
    },
    {
      key: 15,
      name: '功能类-自动签到',
      desc: '①点击[签到] ②退出福利中心',
      fastQuery: true,
      rules: [
        {
          key: 0,
          name: '①点击[签到]',
          activityIds: '.ui.activity.MainGroupActivity',
          excludeMatches: '[vid="tvTipNum"][text="--"][visibleToUser=true]',
          matches: '@[vid="btnCheckIn"] >2 [text="签到"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/22634962',
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/23210761', // 已签到
            'https://i.gkd.li/i/23211622', // 未加载完?
          ],
        },
        {
          // 有时签完到会跳转福利中心页
          preKeys: [0],
          name: '②退出福利中心',
          activityIds: '.ui.activity.QDBrowserActivity',
          matches:
            '@View[id=null][childCount=0][clickable=true] < View < View < WebView[text="福利中心"] < WebView < FrameLayout < [vid="webViewContainer"]',
          snapshotUrls: 'https://i.gkd.li/i/24012947',
        },
      ],
    },
    {
      key: 16,
      name: '功能类-订阅后续章节后自动[返回]',
      desc: '返回小说正文页 (对于自定义订阅不可用)',
      fastQuery: true,
      activityIds: [
        '.ui.activity.QDDirectoryActivity',
        '.ui.activity.SplashActivity',
        '.ui.activity.QDReaderActivity',
      ],
      rules: [
        {
          key: 10,
          name: '①未订最新章-待后续',
          action: 'none',
          actionMaximum: 1, //不点击,防止触发记录过多
          matches: '[text^="订阅后续付费章"]',
          snapshotUrls: 'https://i.gkd.li/i/26221300',
        },
        {
          key: 11,
          name: '①未订后续章',
          action: 'none',
          forcedTime: 5000,
          actionMaximum: 1, //不点击,防止触发记录过多
          activityIds: '.flutter.BatchOrderDialogActivity',
          matches:
            '@[desc^="订阅后续付费章"] <2 View < View < View < View < FrameLayout < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/33536620', //起点480
        },
        {
          key: 20,
          preKeys: [10],
          name: '②已订最新章-返回键',
          action: 'back',
          matches: '[text="已订阅至最新章节"]',
          snapshotUrls: [
            'https://i.gkd.li/i/26220488',
            'https://i.gkd.li/i/27051045',
            'https://i.gkd.li/i/27156111', // 小说正文页
          ],
          exampleUrls: 'https://e.gkd.li/40df3df2-a5a5-4044-bf82-8622396bf39a',
        },
        {
          key: 21,
          preKeys: [11],
          name: '②提示已订阅n章',
          action: 'none', //仅有订阅提示,无需操作
          forcedTime: 10000,
          activityIds: '.flutter.BatchOrderDialogActivity',
          matches:
            '@ImageView[desc^="已订阅"] <2 View < View < View < View < FrameLayout < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/33537343',
        },
        {
          key: 30,
          preKeys: [20, 21],
          name: '③退出目录',
          forcedTime: 10000,
          matches:
            '@[vid="btnBack"][clickable=true] + * >6 [vid="layoutTitle"][text="目录"]',
          snapshotUrls: 'https://i.gkd.li/i/26221238',
        },
      ],
    },
    {
      key: 17,
      name: '功能类-书友圈自动[打卡]',
      rules: [
        {
          fastQuery: true,
          actionDelay: 300,
          forcedTime: 10000, //偶尔进了界面但不触发
          actionMaximum: 1,
          resetMatch: 'match',
          activityIds: '.ui.activity.CircleHomePageActivity',
          matches: '[text="打卡"] < [vid="layoutTopButton"]',
          snapshotUrls: 'https://i.gkd.li/i/31843604',
          exampleUrls: 'https://e.gkd.li/a1fe7a7d-3863-4e5f-befc-47eae3a505f0',
        },
      ],
    },
    {
      key: 18,
      name: '全屏广告-追更至最新章节弹窗',
      desc: '①[取消勾选]提醒 ②x掉弹窗',
      fastQuery: true,
      actionMaximum: 1,
      activityIds: '.ui.activity.QDReaderActivity',
      rules: [
        {
          key: 1,
          name: '①[取消勾选]提醒',
          matches: '[vid="switchUpdate"][checkable=true][checked=true]',
          snapshotUrls: 'https://i.gkd.li/i/34316607',
        },
        {
          key: 2,
          name: '②x掉弹窗',
          matches:
            '@[vid="ivClose"] +2 [visibleToUser=true] >2 [text="追更至最新章节"]',
          snapshotUrls: 'https://i.gkd.li/i/34316605', // [checked=false] 已取消勾选
          exampleUrls: 'https://e.gkd.li/f969ad39-da92-458f-95f6-e2939857c808',
        },
      ],
    },
  ],
});
