import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.ss.android.ugc.aweme.lite',
  name: '抖音极速版',
  /**
   *  示例快照: https://i.gkd.li/i/30647148  界面: 'com.ss.android.ugc.aweme.main.MainActivity'
   *  一般此界面的节点较多,节点树加载很慢,截个快照都要等十几 二十秒
   *  所以对于该界面,不支持快查的规则不要写,
   *  也尽量别用 << 关系操作符,因为它会 get 所有节点 （ https://github.com/orgs/gkd-kit/discussions/299 ）
   */
  groups: [
    {
      key: 1,
      name: '更新提示',
      // matchTime: 10000, //不确定是否在前10秒内出现弹窗
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
          matches: [
            '[text*="更新" || text*="下载" || text*="安装" || text*="升级"][visibleToUser=true]',
            '[text$="再说" || text^="忽略" || text^="取消"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/30620547',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-功能体验邀请弹窗',
      rules: [
        {
          key: 0,
          name: '[首页商城]体验邀请弹窗',
          fastQuery: true,
          activityIds:
            'com.ss.android.ugc.aweme.commerce.sdk.MallContainerActivity',
          matches: [
            'UIText[text^="立即体验"]',
            'FlattenUIText[text="不再提示"][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/13684791',
        },
      ],
    },
    {
      key: 3,
      name: '局部广告-打招呼表情',
      desc: '聊天界面,朋友在线,打个招呼... 点击x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
          matches: '@[desc="关闭"][clickable=true] - [text*="打个招呼"]',
          snapshotUrls: 'https://i.gkd.li/i/31596787',
          exampleUrls: 'https://e.gkd.li/0e381602-a24a-45fa-839d-e20999ad30f9',
        },
      ],
    },
    {
      key: 8,
      name: '全屏广告-朋友推荐弹窗',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
          matches: '[text="朋友推荐"] +2 [vid="close"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/13650523',
        },
      ],
    },
    {
      key: 9,
      name: '权限提示-通知权限',
      desc: '点击暂不开启',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      activityIds: [
        '.com.ss.android.ugc.aweme.main.MainActivity',
        '.detail.ui.DetailActivity',
        '.profile.ui.UserProfileActivity',
        '.com.ss.android.ugc.aweme.main.MainActivity',
        '.setting.serverpush.ui.PushSettingManagerActivity',
      ],
      rules: [
        {
          matches: [
            'TextView[text$="提醒" || text$="通知"][text.length>5][visibleToUser=true]',
            '[text="以后再说" || text="暂不开启" || text="禁止" || text="取消" || text="保持现状"][clickable=true]',
          ],
          snapshotUrls: [
            //及时获得xx提醒
            'https://i.gkd.li/i/13888485', //消息
            'https://i.gkd.li/i/32760384',
            'https://i.gkd.li/i/32754778', //评论回复(平板)
          ],
          exampleUrls: 'https://e.gkd.li/3916c33e-f0dc-45c3-8d81-db4bddf761ed',
        },
      ],
    },
    {
      key: 10,
      name: '功能类-选择图片时自动勾选原图',
      rules: [
        {
          fastQuery: true,
          activityIds:
            'com.ss.android.ugc.aweme.im.sdk.media.choose.MediaChooseActivity',
          matches: '[text="原图"][desc^="未选中"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13946092', //未勾选原图
            'https://i.gkd.li/i/13946033', //已勾选原图
          ],
        },
      ],
    },
    {
      key: 11,
      name: '全屏广告',
      rules: [
        {
          key: 0,
          activityIds:
            'com.ss.android.ugc.aweme.live.LiveDummyHybridTransparentActivity',
          matches:
            '@Image[clickable=true][text!=null][width<100 && height<100] +4 View >2 [text="同意协议并查看额度"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/23558501',
        },
        {
          key: 1,
          fastQuery: true,
          activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
          matches:
            '@UIView[text="不感兴趣"][clickable=true] +2 FlattenUIText[text="不感兴趣"]',
          snapshotUrls: 'https://i.gkd.li/i/24123937',
        },
        {
          key: 2,
          fastQuery: true,
          matchRoot: true,
          activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
          matches:
            '@ImageView[id=null][text=null][width<100][height<100] < ViewGroup[childCount>1] <2 LinearLayout < HorizontalScrollView < ScrollView < [childCount=1] < [childCount=1] < [childCount=1] < [childCount=1] < [childCount=1] < [childCount=1] < [childCount=1] < [vid="action_bar_root"]',
          snapshotUrls: [
            'https://i.gkd.li/i/25547227',
            'https://i.gkd.li/i/28449818',
          ],
        },
      ],
    },
    {
      key: 12,
      name: '全屏广告-添加桌面小组件',
      desc: 'x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
          matches: '@ImageView[clickable=true] - [text$="桌面小组件"]',
          snapshotUrls: 'https://i.gkd.li/i/25208769',
        },
      ],
    },
    {
      key: 13,
      name: '功能类-刷到推广视频时[上滑]',
      desc: '广告/应用/购物/游戏/咨询/预约/子薇剧场 等推广视频',
      rules: [
        {
          fastQuery: true,
          actionCd: 300,
          actionDelay: 200, //刷视频时,让下一个视频完整显示才触发[上滑]
          swipeArg: {
            start: {
              x: 'screenWidth/2',
              y: 'screenHeight * 0.6',
            },
            end: {
              x: 'screenWidth/2',
              y: 'screenHeight * 0.3',
            },
            duration: 200, //滑动时长
          },
          activityIds: [
            'com.ss.android.ugc.aweme.main.MainActivity',
            'com.ss.android.ugc.aweme.detail.ultra.ui.UltraDetailActivity',
            'com.ss.android.ugc.aweme.detail.ui.DetailActivity',
          ],
          matches:
            '([text$="广告 展开" || text$="广告 收起" || text$="广告 "][vid="desc"][visibleToUser=true]) || ([text="应用" || text="购物" || text$="游戏" || text="咨询" || text="子薇剧场" || text="预约"][text.length<6][index=1][visibleToUser=true])',
          snapshotUrls: [
            'https://i.gkd.li/i/29214101', // [text$="广告 展开"][vid="desc"]
            'https://i.gkd.li/i/29579093', // [text$="广告 展开"][vid="desc"]
            'https://i.gkd.li/i/29686900', // [text$="广告 收起"][vid="desc"]
            'https://i.gkd.li/i/32619091', // [text$="广告 "][vid="desc"]
            'https://i.gkd.li/i/29214002', //游戏

            // 选择器参数大部分参考以下抖音快照:
            // 'https://i.gkd.li/i/21142589', //应用
            // 'https://i.gkd.li/i/21142249', //购物
            // 'https://i.gkd.li/i/25355868', //咨询
            // 'https://i.gkd.li/i/21523849', //子薇剧场
            // 'https://i.gkd.li/i/21725628', //小游戏
            // 'https://i.gkd.li/i/21765934', //预约
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/29686899', // [text*="广告"][vid="desc"] 误触
        },
      ],
    },
    {
      key: 14,
      name: '局部广告-商品卡片',
      desc: '点击x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
          matches:
            '@ImageView[clickable=true] + [focusable=true] >4 [text="购买"][index=1][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/30344666',
          exampleUrls: 'https://e.gkd.li/b7f062ff-1bff-4990-bb67-72bd0818e5d8',
        },
      ],
    },
    {
      key: 15,
      name: '分段广告-搜索结果页广告',
      desc: '①点击[反馈] ②选一个[理由]',
      fastQuery: true,
      activityIds:
        'com.ss.android.ugc.aweme.search.activity.SearchResultActivity',
      rules: [
        {
          key: 1,
          name: '①点击[反馈]',
          matches:
            '@[desc="广告反馈"] <3 [childCount=3] + [visibleToUser=true] >5 [text="广告"]',
          snapshotUrls: [
            'https://i.gkd.li/i/30505021',
            'https://i.gkd.li/i/30505027',
          ],
          exampleUrls: 'https://e.gkd.li/35d4bb61-f1d7-46cb-a7df-2a9fdf2136cd',
        },
        {
          key: 20,
          preKeys: [1],
          name: '②选一个[理由]',
          position: {
            // 点击[该作者]
            left: 'width * 0.2646',
            top: 'width * 0.1972',
          },
          matches:
            'ImageView[childCount=0] < @ViewGroup <<(7,8) [id="android:id/content"]',
          snapshotUrls: [
            'https://i.gkd.li/i/30505023',
            'https://i.gkd.li/i/32619430',
          ],
          exampleUrls: 'https://e.gkd.li/c1314e68-d89a-42e3-af74-c50303f5546a',
        },
      ],
    },
    {
      key: 16,
      name: '功能类-自动切换到[作品]列表',
      desc: '在用户主页时,若存在[橱窗/商品/服务],则点击[作品]',
      rules: [
        {
          fastQuery: true,
          actionCd: 10000,
          // actionMaximum: 1,
          activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
          matches:
            '[visibleToUser=false] < ViewPager[childCount>1] - ViewGroup >3 @[desc^="作品"][clickable=true] +n [name$="ActionBar$Tab"] >3 [text="橱窗" || text="商品" || text="服务"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/30619207', // [橱窗]
            'https://i.gkd.li/i/30619569',
            'https://i.gkd.li/i/30621467', // [商品]
            'https://i.gkd.li/i/30621712', // [服务]
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/30619208', //已显示[作品]
            'https://i.gkd.li/i/30619506', //视频页,存在[橱窗]、[作品]的节点,但未显示
          ],
          exampleUrls: 'https://e.gkd.li/966b01bd-3c89-4f19-83af-7e9429ab25ed',
        },
      ],
    },
    {
      key: 17,
      name: '功能类-评论区-自动展开评论',
      desc: '只展开一级评论，不点击展示更多',
      fastQuery: true,
      activityIds: [
        '.detail.ui.DetailActivity',
        '.com.ss.android.ugc.aweme.main.MainActivity',
        '.com.bytedance.ies.ugc.aweme.photos.detail.flow.page.FlowPageActivity',
        '.searcharticle.detail.ArticleDetailActivity',
        '.search.activity.SearchResultActivity',
        '.detail.ultra.ui.UltraDetailActivity',
        '.playlet.videodetail.PlayletVideoPlayActivity',
      ],
      rules: [
        {
          key: 0,
          matches: '@[clickable=true] > [text^="展开"][text$="回复"]',
          snapshotUrls: 'https://i.gkd.li/i/32755488',
          excludeSnapshotUrls: 'https://i.gkd.li/i/32755811', // 排除 [展开更多]
          exampleUrls: [
            'https://e.gkd.li/a2be5c9e-afe9-4992-8c83-bbe191d68d76',
            'https://e.gkd.li/1609405d-5a20-445d-bb2f-5de5a9b1237d', // 排除 [展开更多]
          ],
        },
        // {
        //   key: 1,
        //   matches:
        //     '[text^="展开"][text$="回复"] <2 @[clickable=true][childCount=3] <<n ViewPager <(3,4) LinearLayout + [childCount=2] > [desc$="评论区"] + [vid="back_btn"]',
        //   snapshotUrls: 'null', // 此情况勘查未遇到,碰上再说
        // },
      ],
    },
    {
      key: 18,
      name: '功能类-评论区-自动展开评论_全部',
      desc: '基于上面追加点击展开更多',
      fastQuery: true,
      activityIds: [
        '.detail.ui.DetailActivity',
        '.com.ss.android.ugc.aweme.main.MainActivity',
        '.com.bytedance.ies.ugc.aweme.photos.detail.flow.page.FlowPageActivity',
        '.searcharticle.detail.ArticleDetailActivity',
        '.search.activity.SearchResultActivity',
        '.detail.ultra.ui.UltraDetailActivity',
        '.playlet.videodetail.PlayletVideoPlayActivity',
      ],
      rules: [
        {
          key: 0,
          matches: '@[clickable=true] > [text^="展开更多"]',
          snapshotUrls: 'https://i.gkd.li/i/32755811',
          exampleUrls: 'https://e.gkd.li/1609405d-5a20-445d-bb2f-5de5a9b1237d',
        },
        // {
        //   key: 2,
        //   matches:
        //     '[text^="展开更多"] <2 @[clickable=true][childCount=3] <<n ViewPager <(3,4) LinearLayout + [childCount=2] > [desc$="评论区"] + [vid="back_btn"]',
        //   snapshotUrls: 'null',
        // },
      ],
    },
    {
      key: 19,
      name: '功能类-自动开启[自动连播]',
      desc: '仅在刚进抖极时第1个视频生效, ①[长按]视频 ②开启[自动联播]',
      fastQuery: true,
      matchRoot: true,
      // actionDelay: 500,
      actionMaximum: 1,
      resetMatch: 'app',
      activityIds: 'com.ss.android.ugc.aweme.main.MainActivity',
      rules: [
        {
          key: 1,
          name: '①[长按]视频',
          action: 'longClickCenter',
          matches:
            '[vid="viewpager"][desc="视频"][childCount=2][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/34420783', //刚打开抖音,未上滑过视频 [childCount=2]
          excludeSnapshotUrls: 'https://i.gkd.li/i/34418998', //已经上滑刷过视频了 [childCount=3]
        },
        {
          key: 2,
          preKeys: [1],
          name: '②开启[自动联播]',
          matches: '@Switch[clickable=true][checked=false] - [text="自动连播"]',
          snapshotUrls: [
            'https://i.gkd.li/i/34423078', // [visibleToUser=false]
            'https://i.gkd.li/i/34419001',
          ],
        },
        {
          key: 3,
          preKeys: [1],
          name: '③已开-按[返回键]', //下拉任务栏规则key14重置,增加[返回]操作
          action: 'back',
          actionMaximumKey: 2,
          matches: '@Switch[clickable=true][checked=true] - [text="自动连播"]',
          snapshotUrls: 'https://i.gkd.li/i/34421280',
        },
      ],
    },
  ],
});
