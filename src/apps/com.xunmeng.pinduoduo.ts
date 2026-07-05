import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xunmeng.pinduoduo',
  name: '拼多多',
  // 根选择器模板:'@View[id="main"] <<2 WebView[text="拼多多"] <<3 FrameLayout[vid!=null] <2 ViewGroup <2 FrameLayout <<3 [id="android:id/content"]'
  groups: [
    {
      key: 0,
      name: '开屏广告',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          fastQuery: true,
          excludeActivityIds: '.activity.NewPageActivity',
          matches:
            '[text*="跳过"][text.length<10][width<500 && height<300][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25691473',
          excludeSnapshotUrls: 'https://i.gkd.li/i/25691480',
        },
      ],
    },
    {
      key: 1,
      name: '更新提示',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          key: 1,
          activityIds: [
            '.ui.activity.HomeActivity',
            '.ui.activity.MainFrameActivity',
          ],
          matches: '@Image[clickable=true] +5 [text="立即升级"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13195645',
            'https://i.gkd.li/i/23936506',
            'https://i.gkd.li/i/24786015',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告-弹窗广告',
      rules: [
        {
          key: 3,
          fastQuery: true,
          action: 'back',
          activityIds: [
            '.ui.activity.HomeActivity',
            '.ui.activity.MainFrameActivity',
          ],
          excludeMatches:
            '[text="我的订单" || text="聊天"][bottom<650][visibleToUser=true]',
          matches:
            '[text="开心收下" || text="去抢购" || text="立即抽免单" || text="去刮奖" || text="立即领取" || text="去领大额金币" || text="送你大额现金" || text*="红包助手" || text="刮刮卡发来的消息通知" || text="立即充值" || text="打款金额"][top>600][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/13625441', //送你大额现金
            'https://i.gkd.li/i/13761182', //开心收下
            'https://i.gkd.li/i/13944165', //去领大额金币
            'https://i.gkd.li/i/14456101', //去刮奖
            'https://i.gkd.li/i/14596990', //立即领取
            'https://i.gkd.li/i/14614135', //立即抽免单
            'https://i.gkd.li/i/15360330', //开心收下
            'https://i.gkd.li/i/15032649', //去抢购
            'https://i.gkd.li/i/15076322', //去抢购
            'https://i.gkd.li/i/17564786', //红包助手向你发起一笔打款 / 打款金额
            'https://i.gkd.li/i/17585645', //来自红包助手
            'https://i.gkd.li/i/17625608', //刮刮卡发来的消息通知
            'https://i.gkd.li/i/18481318', //立即充值
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/23352586', // [text="我的订单"]
            'https://i.gkd.li/i/23607429', // [text="聊天"]
            'https://i.gkd.li/i/28929991', // [bottom<650]
          ],
        },
        {
          key: 4,
          fastQuery: true,
          activityIds: '.ui.activity.HomeActivity',
          matches:
            '@ViewGroup[clickable=true] - ViewGroup[childCount=3] >2 [text="其他"]',
          snapshotUrls: 'https://i.gkd.li/i/15103543',
        },
        {
          key: 5,
          fastQuery: true,
          activityIds: '.activity.NewPageMaskActivity',
          matches: [
            '[text="继续拼单"]',
            '@[clickable=true] > [text="先去逛逛"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/15197527',
            'https://i.gkd.li/i/15211473',
          ],
        },
        {
          key: 7,
          activityIds: [
            '.ui.activity.HomeActivity',
            '.ui.activity.MainFrameActivity',
          ],
          matches:
            'ImageView[childCount=0][width<130&&height<130] < ViewGroup[childCount=1] < @ViewGroup[childCount=1][clickable=true][visibleToUser=true] <(1,2) ViewGroup <(1,2) ViewGroup < ViewGroup < FrameLayout < FrameLayout < FrameLayout < FrameLayout < FrameLayout <(1,2,3) [parent=null]',
          exampleUrls: 'https://e.gkd.li/f74b5f58-e518-4e33-bbb4-0bf28e2b79d8',
          snapshotUrls: [
            'https://i.gkd.li/i/17528782',
            'https://i.gkd.li/i/17655498',
            'https://i.gkd.li/i/17893977',
            'https://i.gkd.li/i/22741566',
          ],
        },
        {
          key: 8,
          matchTime: 10000,
          actionMaximum: 1,
          resetMatch: 'app',
          activityIds: '.ui.activity.HomeActivity',
          matches:
            '@ViewGroup[childCount=1][clickable=true] < ViewGroup[childCount=2] < [childCount=1] < [childCount=1] < [childCount=1] < [childCount=1] < [childCount=1] < [childCount=1] < [childCount=1] <2 FrameLayout <2 [parent=null]',
          exampleUrls: 'https://e.gkd.li/e5428072-9ee3-47e9-87ad-d8b47e24f173',
          snapshotUrls: 'https://i.gkd.li/i/17773799',
        },
        {
          key: 9,
          matchTime: 10000,
          actionMaximum: 1,
          resetMatch: 'app',
          activityIds: '.ui.activity.HomeActivity',
          matches:
            '@ImageView[index=0][vid="pdd"][childCount=0][visibleToUser=true][width<120&&height<120] < RelativeLayout[childCount=2] < FrameLayout[childCount=1] < FrameLayout[childCount=1] < [parent=null]',
          exampleUrls: 'https://e.gkd.li/64f35ab7-37e1-4060-aa91-468116a42cae',
          snapshotUrls: 'https://i.gkd.li/i/18375615',
        },
        {
          key: 10,
          activityIds: '.activity.NewPageActivity',
          matches: '[desc="关闭按钮"]',
          action: 'clickCenter', // 此界面不接受无障碍事件
          snapshotUrls: [
            'https://i.gkd.li/i/23383792',
            'https://i.gkd.li/i/26264920',
          ],
        },
        {
          key: 11,
          fastQuery: true,
          activityIds: '.ui.activity.HomeActivity',
          matches:
            '@ViewGroup[width<86 && height<86][clickable=true][focusable=true][clickable=true] + ViewGroup [text="元"]',
          snapshotUrls: 'https://i.gkd.li/i/25572172',
        },
      ],
    },
    {
      key: 6,
      name: '局部广告-悬浮广告',
      desc: '点击关闭',
      activityIds: '.ui.activity.HomeActivity',
      rules: [
        {
          key: 0,
          matches:
            '@TextView[id=null][clickable=true] + Image[id=null][text="webp"]',
          exampleUrls: 'https://e.gkd.li/20f77125-b223-4d65-b61e-826871e0032b',
          snapshotUrls: 'https://i.gkd.li/i/12642058',
        },
        {
          key: 1,
          matches:
            '[id="unactive_watch_video_pendant"] > TextView[clickable=true][text=""][childCount=0]',
          snapshotUrls: 'https://i.gkd.li/i/12642058',
        },
        {
          key: 2,
          matches:
            'RelativeLayout[childCount=2] > RelativeLayout[vid="pdd"] + @FrameLayout[childCount=1][clickable=true][visibleToUser=true][text=null][vid="pdd"] > ImageView[childCount=0][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/0f850878-2b6a-46c7-86aa-28329df0993c',
          snapshotUrls: 'https://i.gkd.li/i/15140800',
        },
        {
          key: 3,
          name: '多多视频金币提示',
          matches: '[text^="看5分钟视频"] -2 Image',
          snapshotUrls: 'https://i.gkd.li/i/25088623',
        },
      ],
    },
    {
      key: 8,
      name: '局部广告-商品详情页视频讲解窗口',
      desc: '点击关闭⚠️需禁止pdd悬浮窗权限,否则无焦点导致失效',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.NewPageActivity',
          anyMatches: [
            '[vid="iv_float_window_close"]',
            '@ImageView[desc="关闭"][clickable=true] - * ->n [desc="tronplayer_view"] <<2 [childCount=1] <<2 RelativeLayout[childCount=1] <n * < [id="android:id/content"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/14549415',
            'https://i.gkd.li/i/29378452', // 形式2
          ],
          exampleUrls: [
            'https://e.gkd.li/f81a45e4-09b4-498f-be72-ca84cdd0db83',
            'https://e.gkd.li/2fca1602-25f2-4ca4-b3cf-9a6fa33396af',
          ],
        },
      ],
    },
    {
      key: 9,
      name: '功能类-多多视频每日自动签到',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      activityIds: '.ui.activity.HomeActivity',
      rules: [
        {
          key: 0,
          name: '自动签到',
          matches:
            '@[clickable=true] >2 [text="领取今日现金"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/13201422',
            'https://i.gkd.li/i/13372677',
          ],
        },
        {
          preKeys: [0],
          key: 1,
          name: '在签到后关闭弹窗',
          matches:
            '@[clickable=true] >2 [text="明日继续来领"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/13205634',
        },
      ],
    },
    {
      key: 10,
      name: '全屏广告-多多视频划到广告自动跳过',
      desc: '点击返回自动刷新，从而跳过广告',
      fastQuery: true,
      activityIds: '.ui.activity.HomeActivity',
      rules: [
        {
          key: 0,
          matches: [
            'TextView[text="正在直播"]',
            '@ImageView[desc="返回"] <4 ViewGroup < * < * < [id="android:id/content"]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/13446291',
        },
        {
          key: 1,
          matches: [
            'TextView[text="查看更多低价商品"]',
            '@ImageView[desc="返回"] <4 ViewGroup < * < * < [id="android:id/content"]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/13791119',
        },
      ],
    },
    {
      key: 11,
      name: '功能类-发送图片时自动勾选原图',
      fastQuery: true,
      rules: [
        {
          activityIds: '.app_album.album.MultiImageSelectorActivity',
          matches: '@[text="原图"][checked=false] + [text="发送"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13925378', // checked=false
            'https://i.gkd.li/i/13925380', // checked=true
          ],
        },
      ],
    },
    {
      key: 12,
      name: '全屏广告-下单后出现的弹窗',
      desc: '点击关闭',
      rules: [
        {
          key: 0,
          activityIds: [
            '.activity.NewPageMaskActivity',
            '.ui.activity.HomeActivity',
          ],
          action: 'clickCenter',
          matches:
            '@Button[text="关闭弹窗" || desc="关闭弹窗"][clickable=true] <n View[childCount>1] <<(1,2) View[id="main"] <<2 WebView[text="拼多多"] <<3 FrameLayout[vid!=null] <2 ViewGroup <2 FrameLayout <<3 [id="android:id/content"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13308175', // 老快照无vid
            'https://i.gkd.li/i/13927594',
            'https://i.gkd.li/i/14434154',
            'https://i.gkd.li/i/14456017',
            'https://i.gkd.li/i/23256823',
          ],
        },
        {
          preKeys: [0],
          name: '二级全屏推荐',
          matchTime: 10000,
          fastQuery: true,
          activityIds: '.activity.NewPageActivity',
          matches:
            '@LinearLayout[clickable=true][width<105 && height<99] + * > [text$="下单成功"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28313219',
          exampleUrls: 'https://e.gkd.li/a6d0caff-1785-4ff2-b2fb-e7bffa13502f',
        },
      ],
    },
    {
      key: 16,
      name: '青少年模式',
      desc: '点击[我知道了]',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.ui.activity.HomeActivity',
          matches:
            '[text="青少年模式"] < FrameLayout +5 ViewGroup [text="我知道了"]',
          snapshotUrls: 'https://i.gkd.li/i/13809053',
        },
      ],
    },
    {
      key: 17,
      name: '权限提示-通知权限',
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          key: 0,
          activityIds: '.ui.activity.HomeActivity',
          matches:
            'FrameLayout > ViewGroup[vid="pdd"] > ViewGroup > ViewGroup[childCount<3] > ViewGroup[childCount=3 || childCount=2] >(1,2) ImageView[clickable=true][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/14109435',
            'https://i.gkd.li/i/14549423',
            'https://i.gkd.li/i/14662202', // 避免在此页面误触
          ],
        },
        {
          key: 1,
          fastQuery: true,
          action: 'back',
          activityIds: [
            '.ui.activity.HomeActivity',
            '.activity.NewPageActivity',
            '.ui.activity.MainFrameActivity',
          ],
          matches:
            '[text="及时获取物流消息" || text="开启通知" || text="允许通知"]',
          snapshotUrls: [
            'https://i.gkd.li/i/15004580',
            'https://i.gkd.li/i/15048085',
            'https://i.gkd.li/i/16643295',
            'https://i.gkd.li/i/18371979',
          ],
        },
      ],
    },
    {
      key: 19,
      name: '全屏广告-[个性化推荐]弹窗',
      desc: '点击[取消]',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.ui.activity.HomeActivity',
          matches: ['[text="个性化推荐未开启"]', '[text="取消"]'],
          exampleUrls: 'https://e.gkd.li/816070f2-035d-4702-87e3-441cca8b5430',
          snapshotUrls: 'https://i.gkd.li/i/14964851',
        },
      ],
    },
    {
      key: 20,
      name: '其他-登录提现页面点击[跳过]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.login.LoginActivity',
          matches: ['[text="已获得现金"]', '[text="跳过"]'],
          exampleUrls: 'https://e.gkd.li/4197b363-3492-4f87-a9dd-109da67bb3bf',
          snapshotUrls: 'https://i.gkd.li/i/17450614',
        },
      ],
    },
    {
      key: 21,
      name: '功能类-关闭截图后的弹窗',
      rules: [
        {
          fastQuery: true,
          action: 'back', // 点击取消会导致 MIUI 截图悬浮窗收起
          activityIds: '.activity.NewPageActivity',
          matches: '[text="搜索图片同款商品"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/19340768',
        },
      ],
    },
    {
      key: 22,
      name: '功能类-自动处方流程',
      desc: '自动点击处方流程到支付',
      fastQuery: true,
      matchTime: 10000,
      activityIds: '.activity.NewPageActivity',
      rules: [
        {
          key: 0,
          name: '点击已确诊的疾病', // 否则无法继续
          actionMaximum: 1,
          matches:
            '@TextView[index=0] <<2 View - [text="选择已确诊的疾病"] <n [id="main"] < WebView[text!=null] <<3 FrameLayout <2 ViewGroup -2 FrameLayout >3 [text="购买处方药需填写用药信息"]',
          snapshotUrls: 'https://i.gkd.li/i/25639924',
          exampleUrls: 'https://e.gkd.li/f92b5d13-da8a-4eb2-b981-66bdc12b9c1c',
        },
        {
          key: 1,
          name: '点击提交并开药',
          preKeys: [0],
          actionCd: 800, // 等待信息加载完成
          matches:
            '@Button[text="提交并开药"][clickable=true][visibleToUser=true] <n [id="main"] < WebView[text!=null] <<3 FrameLayout <2 ViewGroup -2 FrameLayout >3 [text="购买处方药需填写用药信息"]',
          action: 'clickCenter', // 不响应无障碍事件
          snapshotUrls: 'https://i.gkd.li/i/25639924',
        },
        {
          key: 2,
          name: '点击无需补充，立即开方',
          preKeys: [1],
          matchDelay: 2600, // 等待界面稳定后再匹配
          matches:
            '@[clickable=true] >2 [text="无需补充，立即开方"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25639993',
          exampleUrls: 'https://e.gkd.li/5a9c65aa-8b3f-4076-a7d1-20b537526f5b',
        },
        {
          name: '点击立即支付',
          preKeys: [2],
          matchDelay: 3000, // 等待处方下来(时间较长?)
          matches: '@[clickable=true] >2 [text="立即支付"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25640017',
          exampleUrls: 'https://e.gkd.li/31396caf-8a11-484e-9ece-c273a05939ab',
        },
      ],
    },
    {
      key: 23,
      name: '功能类-展开更多',
      desc: '自动展开更多信息',
      activityIds: '.activity.NewPageActivity',
      rules: [
        {
          key: 0,
          name: '通用[展开]_fastQ',
          fastQuery: true,
          action: 'clickCenter', // 不响应无障碍事件
          matches: '[text="展开"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/29405868',
        },
        {
          key: 1,
          name: '[查看更多订单信息]',
          matches: 'Button[text="查看更多订单信息"]',
          action: 'clickCenter', // 不响应无障碍事件
          snapshotUrls: 'https://i.gkd.li/i/27208567',
          exampleUrls: 'https://e.gkd.li/fb06904f-b996-49a8-8db3-3e44059d704d',
        },
        {
          key: 2,
          name: '订单页',
          action: 'clickCenter', // 不响应无障碍事件
          matches:
            '@[text="展开"] <<3 View <n [id="main"] <<2 WebView[text!=null] <<3 FrameLayout <2 ViewGroup -2 FrameLayout >3 [text="交易成功"]',
          snapshotUrls: 'https://i.gkd.li/i/27208567', // [text="展开"]
        },
        {
          key: 3,
          name: '商品评论',
          fastQuery: true,
          activityIds: '.activity.NewPageActivity',
          matches:
            '@[desc="展开"][clickable=true] - FrameLayout > ViewGroup[vid="pdd"][childCount>5] >2 [text^="全部("]',
          snapshotUrls: 'https://i.gkd.li/i/29604643',
        },
      ],
    },
    {
      key: 24,
      name: '功能类-仅看此规格评价',
      desc: '快速点击[仅看当前商品规格的评价]',
      actionCd: 5000, // 防止想点举报点不了
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.NewPageActivity',
          matches:
            '[text^="发表时间"] +2 [text="仅看当前规格的评价"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/27209280',
          exampleUrls: 'https://e.gkd.li/5e17d2de-bca9-4462-8276-7269b0ea5f49',
        },
      ],
    },
    {
      key: 25,
      name: '功能类-视频评论进入自动静音',
      desc: '评论=>视频=>点击[静音]按钮',
      actionMaximum: 1,
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.NewPageMaskActivity',
          matches:
            '[desc="静音"][visibleToUser=true] < @[vid="pdd"][clickable=true] + [text^="@"]',
          snapshotUrls: 'https://i.gkd.li/i/28312056',
          exampleUrls: 'https://e.gkd.li/d584e0b4-6cf5-47a0-859a-7699da89ec39',
        },
      ],
    },
    {
      key: 26,
      name: '功能类-商品页视频自动静音',
      desc: '商品详情=>点击播放视频=>点击[静音]',
      fastQuery: true,
      actionMaximum: 1,
      rules: [
        {
          key: 0,
          activityIds: '.activity.NewPageActivity',
          matches:
            '@[desc="静音"][clickable=true] <2 [childCount=3] < FrameLayout <2 ViewPager + [text^="1/"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28312697', // 商品详情页UI
          exampleUrls: 'https://e.gkd.li/9bd17b81-9afe-4e59-98d8-2024abf760e5',
        },
        {
          key: 1,
          activityIds: '.goods.gallery.GoodsDetailGalleryActivity',
          matches:
            'LinearLayout[childCount=4] > @ImageView[clickable=true][width<66 && height<66][index=0] +2 SeekBar + [text^="00:"]',
          snapshotUrls: 'https://i.gkd.li/i/28420002', // 点进视频后UI
          exampleUrls: 'https://e.gkd.li/733ac4f0-7c2d-4a0e-80b3-6350ba229ddf',
        },
      ],
    },
    {
      key: 27,
      name: '功能类-隐藏[搜索发现]',
      desc: '自动隐藏搜索页中[搜索发现]',
      actionMaximum: 1,
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.NewPageActivity',
          matches:
            '@[desc="隐藏搜索发现"][clickable=true] - [text="搜索发现"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/29376727', // 隐藏前
            'https://i.gkd.li/i/29376724', // 隐藏后
          ],
          exampleUrls: 'https://e.gkd.li/3f03d2c0-9c40-43fe-9568-9eee4471e806',
        },
      ],
    },
    {
      key: 28,
      name: '其他-跳过登录后绑定手机号',
      desc: '登陆成功 ->请绑定手机号 ->跳过',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.NewPageActivity',
          matches:
            '[text="登录成功，请绑定手机号"] <<2 * <2 * -> @[text="跳过"] <<2 [id="bindingPage"] < [id="main"] <<4 [vid="pdd"] <2 ViewGroup <<2 [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/29377418',
          exampleUrls: 'https://e.gkd.li/5951f8ab-00e5-4e0d-9777-56b24a5a2dd1',
        },
      ],
    },
    {
      key: 29,
      name: '权限提示-相机权限',
      rules: [
        {
          fastQuery: true,
          activityIds:
            '.permission.scene_manager.ScenePermissionRequestActivity',
          matches:
            '[text$="允许拼多多访问你的相机"][visibleToUser=true] < LinearLayout +2 LinearLayout > [text="取消"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/29404575',
          exampleUrls: 'https://e.gkd.li/40505e06-9e36-45b8-a9fc-14a1ca25fea5',
        },
      ],
    },
    {
      key: 30,
      name: '其他-退出评价跳过二次确认',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.NewPageActivity',
          matches:
            '[text^="此次评价未完成"][visibleToUser=true] < [childCount=1] +2 LinearLayout[childCount=3] > [text="退出"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/29405754',
          exampleUrls: 'https://e.gkd.li/1911b664-06cd-4594-8762-190bd4aa8eb1',
        },
      ],
    },
    {
      key: 31,
      name: '功能类-下单后一键取消收藏',
      desc: '一键取消收藏购刚买的商品',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.NewPageMaskActivity',
          matches:
            '@[text="一键取消收藏以上商品"][visibleToUser=true] < View[childCount=2] - View[childCount=5] <<(1,2) View[id="main"] <<2 WebView[text="拼多多"] <<3 FrameLayout[vid!=null] <2 ViewGroup <2 FrameLayout <<3 [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/29681036',
          exampleUrls: 'https://e.gkd.li/d2a316ea-24f1-4b0b-9768-294835cbe2c7',
        },
      ],
    },
  ],
});
