import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.chaoxing.mobile',
  name: '学习通',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      matchRoot: true,
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.SplashActivity',
          matches: '@[clickable=true] > [text^="跳过"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26644070',
          exampleUrls: 'https://e.gkd.li/42ea0ef8-e1c6-43e8-8f48-971439c19d58',
        },
      ],
    },
    {
      key: 1,
      name: '功能类-无网络时[重试/确定]',
      desc: '提示没有网络时点击[重试/确定]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.player.course.CoursePlayerWithNoteActivity',
          matches: [
            '[text^="请在有网络时进行学习"][visibleToUser=true]',
            '[text="重试" || text="确定"][visibleToUser=true]',
          ],
          exampleUrls: 'https://e.gkd.li/17573fa6-2143-4b41-9d61-e922117c9bc7',
          snapshotUrls: [
            'https://i.gkd.li/i/23046734',
            'https://i.gkd.li/i/23046852',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '功能类-[继续]使用流量播放',
      desc: '提示非WIFI环境时点击[继续]',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            '.player.course.CoursePlayerWithNoteActivity',
            'com.chaoxing.fanya.aphone.ui.chapter.detail.ui.ChapterDetailActivity',
          ],
          matches: [
            '[text^="正在使用非WiFi环境"][visibleToUser=true]',
            '[text="继续"][visibleToUser=true]',
          ],
          exampleUrls: 'https://e.gkd.li/d4a8ec6d-031f-4030-b111-51a2f37bd39d',
          snapshotUrls: [
            'https://i.gkd.li/i/23046887',
            'https://i.gkd.li/i/23046892',
          ],
        },
      ],
    },
    {
      key: 9,
      name: '通知提示-剪贴板内容已更新',
      desc: '点击[知道了]',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            '.notify.ui.NoticeBodyActivity',
            '.webapp.ui.WebAppCommonViewer',
            '.group.ui.TopicBodyActivity',
          ],
          matches: [
            '[text*="剪贴板内容已更新"][visibleToUser=true]',
            '[text="知道了"][clickable=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/33947533',
            'https://i.gkd.li/i/34332781',
            'https://i.gkd.li/i/34748077',
          ],
          exampleUrls: 'https://e.gkd.li/c5a068c5-33ee-4911-a1a8-238b73097f53',
        },
      ],
    },
    {
      key: 10,
      name: '权限提示-通知权限',
      desc: '点击关闭',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.main.ui.MainTabActivity',
          matches: '[vid="vNotificationItemClose"]',
          snapshotUrls: 'https://i.gkd.li/i/13197374', //旧快照
        },
      ],
    },
    {
      key: 11,
      name: '功能类-电脑端登录自动确认',
      rules: [
        {
          fastQuery: true,
          activityIds: '.webapp.ui.WebAppViewerActivity',
          matches:
            'TextView[text="登录"] < @View[clickable=true][desc="登录"] <(4-n)  * <2 * ->2 View[childCount=0][text="电脑端学习通登录确认"] - * <<2 * < WebView <(4-n) [vid="web_view_fragment_refresh_layout"]',
          snapshotUrls: [
            'https://i.gkd.li/i/23280198', // [childCount=2]
            'https://i.gkd.li/i/34427110', // [childCount=3][text="下次登录无需手机确认"]
          ],
          exampleUrls: 'https://e.gkd.li/cb345983-44d1-4997-9906-0ff0b8c8f50d',
        },
      ],
    },
    {
      key: 12,
      name: '功能类-自动完成普通签到',
      desc: '普通签到无任何限制，点击即完成签到',
      rules: [
        {
          fastQuery: true,
          activityIds: '.webapp.ui.WebAppCommonViewer',
          matches:
            '[childCount=0] < [childCount=1] < @View[clickable=true][childCount=1] < WebView[text="签到"][childCount=1] < WebView[childCount=1] <2 [vid="web_view_fragment_refresh_layout"]',
          snapshotUrls: 'https://i.gkd.li/i/26644134',
          exampleUrls: 'https://e.gkd.li/efd48fc1-7575-43ea-a371-585fae266947',
        },
      ],
    },
    {
      key: 13,
      name: '功能类-签到成功后自动[返回]',
      desc: '按[返回键]',
      rules: [
        {
          fastQuery: true,
          action: 'back',
          actionDelay: 300,
          activityIds: [
            '.webapp.ui.WebAppViewerActivity',
            '.webapp.ui.WebAppCommonViewer',
          ],
          matches:
            '@[text="签到成功"] <2 WebView < WebView <2 [vid="web_view_fragment_refresh_layout"]',
          snapshotUrls: [
            'https://i.gkd.li/i/33947532',
            'https://i.gkd.li/i/34723724',
          ],
          exampleUrls: 'https://e.gkd.li/3705832f-59e5-44f2-b39a-cf4878be6f4f',
        },
      ],
    },
    {
      key: 14,
      name: '功能类-签到失败后弹窗',
      desc: '点击[知道了]',
      rules: [
        {
          fastQuery: true,
          actionDelay: 300,
          activityIds: [
            '.webapp.ui.WebAppViewerActivity',
            '.webapp.ui.WebAppCommonViewer',
          ],
          matches:
            '@[text="知道了"] < ListView < View - [text*="签到失败"] < View <3 WebView < WebView <2 [vid="web_view_fragment_refresh_layout"]',
          snapshotUrls: 'https://i.gkd.li/i/34723729',
          exampleUrls: 'https://e.gkd.li/e6f3eb7a-3890-4c98-95a6-c09262a2b071',
        },
      ],
    },
  ],
});
