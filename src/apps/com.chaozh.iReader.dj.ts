import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.chaozh.iReader.dj',
  name: '得间免费小说',
  groups: [
    {
      key: 1,
      name: '局部广告',
      fastQuery: true,
      rules: [
        {
          key: 0,
          activityIds: [
            'com.qq.e.ads.PortraitADActivity',
            'com.octopus.ad.AdActivity',
            'com.zhangyue.iReader.read.ui.Activity_BookBrowser_TXT',
          ],
          matches:
            '@[id*="ad_close"] - LinearLayout >(5,6,7) [text="广告"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/24879639', //底部卡片广告
            'https://i.gkd.li/i/24879692',
            'https://i.gkd.li/i/24879766',
            'https://i.gkd.li/i/25943097',
          ],
          exampleUrls: 'https://e.gkd.li/148d8a38-a208-4a4c-8441-a908e2e1077f',
        },
        {
          key: 1,
          activityIds: 'com.zhangyue.iReader.bookshelf.ui.ActivityBookShelf',
          matches:
            '@ImageView[clickable=true][childCount=0][width<50 && height<50] < FrameLayout <2 [id="android:id/content"]',
          snapshotUrls: [
            'https://i.gkd.li/i/24880989', //首页小红包
            'https://i.gkd.li/i/24881759',
          ],
          exampleUrls: 'https://e.gkd.li/547eff98-27c2-484c-9873-57f77b5e7f66',
        },
        {
          key: 2,
          activityIds: [
            'com.zhangyue.iReader.ui.activity.ActivityContainer',
            'com.zhangyue.iReader.bookshelf.ui.ActivityBookShelf',
            'com.zhangyue.iReader.read.ui.Activity_BookBrowser_TXT',
          ],
          matches:
            '@[text="关闭"][clickable=true] <<n [id="com.zhangyue.module.ad:id/mix_ad_view" || id="com.zhangyue.module.ad:id/ad_splash_ad_layout"]',
          snapshotUrls: [
            'https://i.gkd.li/i/24884414', //听书播放器底部广告
            'https://i.gkd.li/i/24882622',
            'https://i.gkd.li/i/24883183', //京东广告_小说中途插入
          ],
          exampleUrls: [
            'https://e.gkd.li/a6490889-0795-406c-a794-a83b19a4bd5b',
            'https://e.gkd.li/47d13bd7-9a4b-4c34-9d46-0e4e264eab41',
          ],
        },
        {
          key: 3,
          activityIds: [
            'com.zhangyue.app.shortplay.player.ui.activity.EpisodesSetPlayActivity',
            'com.zhangyue.iReader.read.ui.Activity_BookBrowser_TXT',
          ],
          matches:
            '[id="com.zhangyue.module.ad:id/close_ad" || id="com.zhangyue.module.ad:id/ad_close_2"]',
          snapshotUrls: [
            'https://i.gkd.li/i/24885716', //短剧底部卡片广告
            'https://i.gkd.li/i/24888022', //章节尾部插入横幅广告
          ],
          exampleUrls: [
            'https://e.gkd.li/06ee129f-7eb8-4a51-913a-936084ac6c17',
            'https://e.gkd.li/7a540b2b-8871-4fa7-a492-7e697e76a111',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '局部广告-小说内自动划走广告',
      desc: '点击空白区域触发翻页而非关闭广告',
      fastQuery: true,
      actionDelay: 600,
      actionCd: 8000, //加cd等加载过去防止循环触发,如p2,测试如果点击后用户不再继续翻页触发节点刷新会点回来，所以说依赖用户看小说有多快
      rules: [
        {
          key: 0,
          activityIds: 'com.zhangyue.iReader.read.ui.Activity_BookBrowser_TXT',
          matches:
            '@FrameLayout - [text^="广告" || text$="赞助作者" || text$="正版内容" || text$="奖励" || text$="耕耘" || text^="助力作者"] <<(9,10) [vid="bookview"]',
          snapshotUrls: [
            'https://i.gkd.li/i/25118364',
            'https://i.gkd.li/i/25307532',
            'https://i.gkd.li/i/24882824',
          ],
          exampleUrls: 'https://e.gkd.li/39ef092b-8e25-47eb-b0b5-8bc183488ca9',
          excludeSnapshotUrls: 'https://i.gkd.li/i/25118320', //p2_循环误触-画面与结构树不匹配，估计得多翻2页才刷新
        },
        {
          key: 1,
          activityIds: 'com.qq.e.ads.PortraitADActivity',
          matches: [
            '@[text=""][visibleToUser=true][index=parent.childCount.minus(1)] <<2 View <3 WebView[childCount=4] < * - RelativeLayout >3 [text="秒后即可获得奖励"]',
            '[text^="广告" || text$="赞助作者" || text$="正版内容" || text$="奖励" || text$="耕耘" || text^="助力作者"][clickable=true][visibleToUser=true]',
            '@FrameLayout[index=parent.childCount.minus(1)] -2 FrameLayout > [text="关闭"][clickable=true][visibleToUser=true]', //兜底规则
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/25118663',
            'https://i.gkd.li/i/24909685',
            'https://i.gkd.li/i/25943380',
          ],
          exampleUrls: [
            'https://e.gkd.li/3ce04d0a-c2b9-4087-8af6-541a2178eedb',
            'https://e.gkd.li/d3f1a844-57a3-432e-b642-dbd6c751858e',
          ],
        },
        {
          key: 2,
          activityIds:
            'com.bytedance.sdk.openadsdk.stub.activity.Stub_Standard_Portrait_Activity',
          matches:
            '@FrameLayout[index=parent.childCount.minus(1)] -2 FrameLayout > [text="关闭"][clickable=true][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/25314833', //广告现行
            'https://i.gkd.li/i/25118774',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/25314831', //p3_广告预加载准备，预示着下一页就是AD
          exampleUrls: 'https://e.gkd.li/18fb3451-3c24-4351-9fe9-16be681371d5',
        },
        {
          key: 3,
          activityIds: 'com.octopus.ad.internal.activity.EndingPageActivity',
          matches:
            '[vid="ad_feedback"] + [vid="ad_close"][clickable=true][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/bb67cfcd-63b6-4398-a137-3e8c3ff2e9de',
          snapshotUrls: 'https://i.gkd.li/i/25943482',
        },
        {
          key: 4,
          activityIds: 'com.octopus.ad.AdActivity',
          matches:
            '@LinearLayout -4 [text="反馈"] + [text^="奖励将于"][clickable=true][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/ca9c2da1-d0e9-441e-b6b2-5d7b16a4f2e6',
          snapshotUrls: 'https://i.gkd.li/i/25943797',
        },
      ],
    },
    {
      key: 3,
      name: '更新提示',
      desc: '点击关闭',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.zhangyue.iReader.bookshelf.ui.ActivityBookShelf',
          matches: [
            '[text="立即升级"]',
            '[vid="dialog_public_top_bar_title_close"][clickable=true][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/25121594',
          exampleUrls: 'https://e.gkd.li/a61a7c35-67f2-4294-bd89-cd12e4cb8b6c',
        },
      ],
    },
    {
      key: 4,
      name: '全屏广告-会员广告',
      fastQuery: true,
      rules: [
        {
          key: 0,
          activityIds: 'com.zhangyue.iReader.online.ui.ActivityFee',
          matches:
            '@Image[text.length=36][visibleToUser=true] + [text="纯净阅读免广告"] <<11 [vid="online_layout"]',
          snapshotUrls: 'https://i.gkd.li/i/25243163',
          exampleUrls: 'https://e.gkd.li/11170624-a19c-4502-a982-9402a291eba6',
        },
        {
          preKeys: [0],
          actionCd: 300,
          activityIds: 'com.zhangyue.iReader.online.ui.ActivityFee',
          matches:
            '[text="别走！送你限时优惠"] - @TextView < *[childCount=8] -3 * <<2 [text="纯净阅读免广告"] <<6 [vid="online_layout"]',
          snapshotUrls: 'https://i.gkd.li/i/25243375',
          exampleUrls: 'https://e.gkd.li/422276f9-670c-450f-8fa7-33ab61e98882',
        },
      ],
    },
    {
      key: 5,
      name: '功能类-退出阅读跳过加书架提示',
      desc: '小说退出-加入书架提示-退出阅读',
      fastQuery: true,
      rules: [
        {
          activityIds: 'com.zhangyue.iReader.read.ui.Activity_BookBrowser_TXT',
          matches:
            '[text="加入书架"] + [text="退出阅读"][clickable=true][visibleToUser=true][index=parent.childCount.minus(1)]',
          snapshotUrls: 'https://i.gkd.li/i/25244345',
          exampleUrls: 'https://e.gkd.li/942bc38e-ca66-4f64-b37a-a5930b5c145a',
        },
      ],
    },
  ],
});
