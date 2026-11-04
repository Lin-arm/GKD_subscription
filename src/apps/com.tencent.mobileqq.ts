import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.tencent.mobileqq',
  name: 'QQ',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      scopeKeys: [13], // 规则组key13也是开屏广告
      actionMaximumKey: 0, // key13-0
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          excludeActivityIds: [
            '.activity.ChatActivity', // 在聊天界面禁用
            '.search.activity.UniteSearchActivity', // 在搜索页面禁用
          ],
          excludeMatches: '[vid="root"]', // 在聊天界面禁用，若排除EditText[vid="input"]则滑动消息时会造成误触
          matches: 'TextView[text^="跳过"][text.length<=10][!(vid="title")]',
          snapshotUrls: [
            'https://i.gkd.li/i/13093155',
            'https://i.gkd.li/i/13207731',
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/13217807',
            'https://i.gkd.li/i/13856647',
            'https://i.gkd.li/i/13868177',
            'https://i.gkd.li/i/14341023',
            'https://i.gkd.li/i/15334565',
          ],
        },
      ],
    },
    {
      key: 1,
      name: '局部广告',
      desc: '点击关闭',
      rules: [
        {
          key: 0,
          name: '好友动态详情页广告',
          fastQuery: true,
          activityIds: [
            'com.qzone.reborn.base.QZoneTransparentShellActivity',
            'com.qzone.reborn.base.QZoneShellActivity',
          ],
          matches:
            '@[desc="关闭广告"][visibleToUser=true] <4 RelativeLayout <2 LinearLayout <2 LinearLayout < FrameLayout <n RecyclerView < FrameLayout - FrameLayout >2 [text="详情"]',
          exampleUrls: 'https://e.gkd.li/b78a3e44-3bd9-445d-9199-e989269c2be3',
          snapshotUrls: [
            'https://i.gkd.li/i/17009847',
            'https://i.gkd.li/i/17815694',
            'https://i.gkd.li/i/17827969',
          ],
        },
        {
          key: 1,
          name: '推荐你试试这些玩法',
          activityIds:
            'com.qzone.reborn.feedx.activity.QZoneFriendFeedXActivity',
          fastQuery: true,
          matches: '@[desc="关闭"] - [text="推荐你试试这些玩法"]',
          exampleUrls: 'https://e.gkd.li/6cf71a22-0e21-4877-86a7-69d84353ad5a',
          snapshotUrls: 'https://i.gkd.li/i/18236745',
        },
        // 消息列表页面顶部广告
        {
          key: 2,
          fastQuery: true,
          activityIds: '.activity.SplashActivity',
          matches:
            '@ImageView[desc="关闭"][clickable=true][childCount=0] -2 [text$="试用超级会员"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/23837678',
        },
        {
          key: 3,
          fastQuery: true,
          activityIds: '.activity.SplashActivity',
          matches:
            '@ImageView[clickable=true][width<100 && height<100][desc="关闭" || desc=null][index!=0] <<n FrameLayout <(2,3) * <2 [childCount=4] <2 [vid="root"]',
          snapshotUrls: [
            'https://i.gkd.li/i/24230528',
            'https://i.gkd.li/i/28426083',
            'https://i.gkd.li/i/28425887',
            'https://i.gkd.li/i/28425944',
            'https://i.gkd.li/i/29140037',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/29032927', // [index!=0]
        },
        {
          key: 4,
          activityIds: '.activity.QPublicFragmentActivity',
          matches:
            'ImageView[width<62] < [visibleToUser=true][desc="关闭广告"]',
          snapshotUrls: 'https://i.gkd.li/i/33948809',
        },
      ],
    },
    {
      key: 2,
      name: '分段广告',
      desc: '①点击[广告/更多] ②点击[关闭这条] ③点击[直接关闭]',
      fastQuery: true,
      activityIds: [
        'com.qzone.reborn.feedpro.activity.QzoneFriendFeedProActivity', //空间动态页
        'com.qzone.reborn.layer.part.QzoneFeedProGalleryActivity', //好友空间相册页
        'com.qzone.reborn.layer.part.QZoneFeedXGalleryActivity', //空间相册页2
        '.guild.base.QPublicFragmentActivityForMainWebActivity', //频道页
        'com.qzone.reborn.base.QZoneShellActivity', //空友爱看页
        '.activity.SplashActivity', //空间动态页
      ],
      rules: [
        {
          key: 0,
          name: '①点击[广告]',
          anyMatches: [
            '[text="广告"][clickable=true]', //1️⃣
            '@[clickable=true] > [text="广告"][visibleToUser=true]', //2️⃣
          ],
          snapshotUrls: [
            //选择器1️⃣
            'https://i.gkd.li/i/30876372',
            'https://i.gkd.li/i/33749525',

            //选择器2️⃣
            'https://i.gkd.li/i/21947672',
            'https://i.gkd.li/i/24404962',
            'https://i.gkd.li/i/28888622',
          ],
          exampleUrls: [
            'https://e.gkd.li/ab1f2c2a-a565-42d4-ab24-49747ad558ec',
            'https://e.gkd.li/b272a9a4-ba11-4bee-9608-123683475c68',
            'https://e.gkd.li/76ce897a-7ff5-4edb-b3de-381187bcea1a',
          ],
        },
        {
          key: 1,
          name: '①点击[更多]',
          activityIds: '.activity.SplashActivity',
          matches:
            '@[desc="更多"][clickable=true] - [desc="广告"][visibleToUser=true] - LinearLayout > [text="今天"]',
          snapshotUrls: 'https://i.gkd.li/i/33749900',
          exampleUrls: 'https://e.gkd.li/4c4b12cf-777b-4e27-92ea-f764055025a2',
        },

        // 第二段
        {
          key: 50,
          preKeys: [0, 1],
          name: '②点击[关闭]此条广告',
          matches:
            '@[clickable=true] >(1,2) [text^="关闭"][text*="条"][text.length<10]',
          snapshotUrls: [
            'https://i.gkd.li/i/21947698',
            'https://i.gkd.li/i/24381598',
            'https://i.gkd.li/i/24406932',
            'https://i.gkd.li/i/26997293', // 关闭这条
            'https://i.gkd.li/i/28888643',
            'https://i.gkd.li/i/28942736',
            'https://i.gkd.li/i/30876374',
            'https://i.gkd.li/i/33749584',
          ],
          exampleUrls: [
            'https://e.gkd.li/62772b6a-f349-4701-8c1d-5bfa08a4f6c9',
            'https://e.gkd.li/4ff2b91f-7a3a-4514-9c23-0310c499ff9e',
            'https://e.gkd.li/c26339b2-8df9-4aed-a3ba-4ec77e519574',
          ],
        },

        // 第三段
        {
          key: 100,
          preKeys: [50],
          name: '③点击[直接关闭]',
          matches: '[text="直接关闭"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/26997174',
            'https://i.gkd.li/i/28942737',
            'https://i.gkd.li/i/30876376',
            'https://i.gkd.li/i/33749791',
          ],
          exampleUrls: [
            'https://e.gkd.li/a5da537d-d1cc-4420-a9a4-3329cf4a8fad',
            'https://e.gkd.li/1fc58680-ecb3-4f8b-b204-b2d55fe20964',
          ],
        },
      ],
    },
    {
      key: 7,
      name: '功能类-设备登录授权',
      desc: '自动点击登录(登录 <设备> QQ)',
      matchRoot: true,
      actionMaximum: 3,
      actionCd: 500,
      activityIds: [
        'com.tencent.biz.qrcode.activity.QRLoginAuthActivity',
        '.activity.DevlockQuickLoginActivity', // 异常二次确认
      ],
      rules: [
        {
          key: 1,
          name: '快查',
          fastQuery: true,
          matches:
            'TextView[text^="登录 "][text$="QQ"][visibleToUser=true] +(6-n) LinearLayout > Button[text="登录" || text="确认"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/20737721',
          exampleUrls: 'https://e.gkd.li/425a34a7-d32e-4df1-9216-7276d883768a',
        },
        {
          key: 2,
          name: '无快查',
          actionMaximumKey: 1, // 共享key1的执行次数
          actionCdKey: 1, // // 共享key1的冷却状态
          matches:
            'TextView[text^="登录 "][text$="QQ"][visibleToUser=true] +(6-n) LinearLayout > Button[text="登录" || text="确认"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/12789287',
        },
        {
          preKeys: [1, 2],
          name: '异常二次确认',
          matches:
            'Button[text="允许登录QQ"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/13063027', // 无快查
          exampleUrls: 'https://e.gkd.li/821aeac0-8e87-425d-a660-139c13dc4e50',
        },
      ],
    },
    {
      key: 8,
      name: '功能类-自动[勾选]同意协议',
      desc: '✅已阅读并同意服务协议和隐私政策',
      rules: [
        {
          fastQuery: true,
          actionMaximum: 1,
          activityIds: '.activity.LoginPublicFragmentActivity',
          matches:
            '@CheckBox[checked=false] + [text="已阅读并同意服务协议和隐私政策"]',
          snapshotUrls: 'https://i.gkd.li/i/33854572',
          exampleUrls: 'https://e.gkd.li/e38854d8-4cd5-41c0-9396-b2c95ef9a788',
        },
      ],
    },
    {
      key: 10,
      name: '功能类-自动[勾选]原图',
      desc: '发送图片时自动勾选原图，可手动取消勾选',
      actionMaximum: 1,
      rules: [
        {
          fastQuery: true,
          activityIds: [
            '.activity.SplashActivity',
            'com.tencent.qqnt.qbasealbum.WinkHomeActivity',
            '.activity.photo.album.NewPhotoListActivity',
          ],
          matches: '@CheckBox[checked=false] + [text="原图"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12705556', // 未勾选原图
            'https://i.gkd.li/i/12705559', // 已勾选原图
            'https://i.gkd.li/i/13295142',
            'https://i.gkd.li/i/13476247',
          ],
        },
      ],
    },
    {
      key: 11,
      name: '功能类-自动点击查看原图',
      desc: '查看图片时自动点击原图',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.tencent.richframework.gallery.QQGalleryActivity',
          anyMatches: [
            '[text^="查看原图"][clickable=true][visibleToUser=true]',
            '@[clickable=true] > [text^="查看原图"][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/14757735',
            'https://i.gkd.li/i/24489364',
          ],
        },
      ],
    },
    {
      key: 13,
      name: '开屏广告-QQ小程序开屏广告',
      desc: '点击右下角跳过',
      fastQuery: true,
      actionMaximum: 1,
      priorityTime: 10000,
      rules: [
        {
          key: 0,
          activityIds: [
            '.mini.appbrand.ui.AppBrandUI',
            '.activity.miniaio.MiniChatActivity',
          ],
          matches: [
            '[text="广告"][visibleToUser=true]',
            '[text="跳过"][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/12877215',
            'https://i.gkd.li/i/12919195',
            'https://i.gkd.li/i/15130235',
          ],
        },
      ],
    },
    {
      key: 17,
      name: '更新提示',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      actionMaximumKey: 0,
      rules: [
        {
          key: 0,
          activityIds: [
            '.activity.SplashActivity',
            '.upgrade.ui.dialog.UpgradeActivity',
            '.upgrade.activity.UpgradeActivity',
          ],
          matches:
            '@[desc="关闭"] <2 * >2 Button[text^="立即" || text="马上升级"][text.length=4]',
          snapshotUrls: [
            'https://i.gkd.li/i/13386719',
            'https://i.gkd.li/i/13526551',
            'https://i.gkd.li/i/22455760',
            'https://i.gkd.li/i/23393647',
          ],
        },
        {
          key: 1,
          activityIds: '.upgrade.activity.UpgradeActivity',
          matches: ['[text="立即升级"]', '[text="稍后处理"]'],
          snapshotUrls: 'https://i.gkd.li/i/14724108',
        },
      ],
    },
    {
      key: 18,
      name: '更新提示-消息页面-顶部',
      fastQuery: true,
      // matchTime: 10000, // 不止刚进QQ的时候出现
      // actionMaximum: 1,
      // resetMatch: 'app',
      rules: [
        {
          key: 0,
          activityIds: '.activity.SplashActivity',
          matches:
            '@[clickable=true][text=null][visibleToUser=true] - [text*="版本更新" || text="点击下载" || text="立即安装" || text="点击更新"][text.length<15]',
          snapshotUrls: [
            'https://i.gkd.li/i/13255493',
            'https://i.gkd.li/i/13843140',
            'https://i.gkd.li/i/14138340',
            'https://i.gkd.li/i/13931212',
            'https://i.gkd.li/i/16323755',
            'https://i.gkd.li/i/17529150',
            'https://i.gkd.li/i/26159150',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/17920550',
        },
      ],
    },
    {
      key: 24,
      name: '局部广告-聊天页面广告',
      rules: [
        {
          key: 1,
          name: '关键词广告',
          fastQuery: true,
          activityIds: [
            '.profilecard.activity.FriendProfileCardActivity',
            '.activity.ChatActivity',
            '.activity.SplashActivity',
          ],
          matches:
            'FrameLayout[childCount=2] >2 FrameLayout[childCount=2] >3 FrameLayout[childCount=2] > [text="跳过" || text="关闭"][clickable=true]',
          exampleUrls:
            'https://m.gkd.li/57941037/4cf5bc02-d2c3-4ca4-833e-522a194e3131',
          snapshotUrls: [
            'https://i.gkd.li/i/14183188',
            'https://i.gkd.li/i/16549500',
            'https://i.gkd.li/i/16555184',
          ],
        },
      ],
    },
    {
      key: 27,
      name: '功能类-自动领取群聊红包',
      desc: '自己发的红包、专属红包、口令红包、私聊红包不领',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: '.activity.SplashActivity',
          matches:
            'ImageView[childCount=0] <<(1,2) RelativeLayout < FrameLayout +2 LinearLayout >3 @ViewGroup[clickable=true][!(getChild(childCount.minus(1)).text^="已")] + TextView[text="拼手气红包"]',
          exampleUrls:
            'https://m.gkd.li/57941037/7a933a7f-dc5a-4eb7-8a6f-fe3cc4e8fb5e',
          snapshotUrls: [
            'https://i.gkd.li/i/14221309',
            'https://i.gkd.li/i/18574530',
            'https://i.gkd.li/i/18725007',
            'https://i.gkd.li/i/24551887',
          ],
        },
        {
          preKeys: [0],
          key: 1,
          fastQuery: true,
          activityIds: [
            'cooperation.qwallet.plugin.QWalletToolFragmentActivity',
            'com.tencent.biz.TenpayActivity',
          ],
          anyMatches: [
            '@[desc="关闭"][clickable=true] < RelativeLayout -2 ViewGroup >4 [text^="来晚一步"][visibleToUser=true]',
            '[desc="拆红包"][visibleToUser=true]',
          ],
          exampleUrls:
            'https://m.gkd.li/57941037/61006833-9806-45b2-b3a1-55b9b248958f',
          snapshotUrls: [
            'https://i.gkd.li/i/14221242',
            'https://i.gkd.li/i/18724880',
            'https://i.gkd.li/i/24551748',
          ],
        },
        {
          preKeys: [1],
          key: 2,
          fastQuery: true,
          activityIds: [
            'cooperation.qwallet.plugin.QWalletToolFragmentActivity',
            'com.tencent.biz.TenpayActivity',
          ],
          matches: '@[desc="返回"] +n [text="红包记录"]',
          exampleUrls:
            'https://m.gkd.li/57941037/b90e6a69-ac57-41a5-bd2c-c500b92a58ba',
          snapshotUrls: [
            'https://i.gkd.li/i/14221279',
            'https://i.gkd.li/i/24551886',
          ],
        },
      ],
    },
    {
      key: 29,
      name: '功能类-申请入群后自动点击右上角关闭',
      actionMaximum: 1,
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.QQBrowserActivity',
          matches: [
            'TextView[text="入群申请中"][visibleToUser=true]',
            'TextView[text="关闭"][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/14235163',
        },
      ],
    },
    {
      key: 31,
      name: '功能类-授权登录时关闭获取QQ好友关系',
      rules: [
        {
          fastQuery: true,
          activityIds:
            'com.tencent.open.agent.PublicFragmentActivityForOpenSDK',
          matches:
            '@CompoundButton[checked=true] - RelativeLayout > [text="你的QQ好友关系"]',
          exampleUrls: 'https://e.gkd.li/4d69a243-6a57-47ca-bc25-0a5353d80179',
          snapshotUrls: 'https://i.gkd.li/i/16929347',
        },
      ],
    },
    {
      key: 32,
      name: '其他-联系人页面-顶部可能认识的人推荐',
      desc: '点击关闭',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.SplashActivity',
          matches:
            '@ImageView[childCount=0][clickable=true][visibleToUser=true] -2 [text="开启推荐，发现可能认识的人。"]',
          exampleUrls: 'https://e.gkd.li/7922ab73-cc99-4559-b18c-5ab54dd9633a',
          snapshotUrls: 'https://i.gkd.li/i/18237415',
        },
      ],
    },
    {
      key: 33,
      name: '功能类-自动解锁 Windows QQ',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      rules: [
        {
          activityIds:
            'com.tencent.biz.qrcode.activity.UnlockPCQuickVerifyActivity',
          matches: '[text="解锁"]',
          snapshotUrls: 'https://i.gkd.li/i/15360265',
        },
      ],
    },
    {
      key: 34,
      name: '功能类-关闭体验模式提醒',
      desc: '点击[我知道了]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.QPublicFragmentActivity',
          matches: [
            '[text^="当前处于"][text*="体验模式"][visibleToUser=true]',
            '[text="我知道了"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/24561058',
        },
      ],
    },
    {
      key: 35,
      name: '功能类-自动跳转第三方应用',
      desc: '点击[允许]',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            '.activity.QQBrowserActivity',
            '.filebrowser.FileBrowserActivityV2',
          ],
          matches: [
            '[text$="打开其他应用"]',
            '[text="允许"][clickable=true][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/25142977',
            'https://i.gkd.li/i/30150628',
          ],
        },
      ],
    },
    {
      key: 36,
      name: '功能类-不看或隐藏[官方Qzone]的动态',
      desc: '点击动态右上角三个点-不看此条动态-确定',
      rules: [
        {
          key: 0,
          name: '①点击右边三个点',
          fastQuery: true,
          activityIds: [
            '.activity.SplashActivity',
            'com.qzone.reborn.feedpro.activity.QzoneFriendFeedProActivity',
          ],
          matches:
            '@ImageView[clickable=true][width<160 && height<160] - * >2 [desc="官方Qzone"] <<(-n+8) ViewGroup +n * >(2,3) [text^="说点什么吧"]',
          snapshotUrls: [
            'https://i.gkd.li/i/26308400',
            'https://i.gkd.li/i/26489612',
          ],
        },
        {
          key: 1,
          preKeys: 0,
          name: '②不看or隐藏此条动态',
          fastQuery: true,
          activityIds: [
            '.activity.SplashActivity',
            'com.qzone.reborn.feedpro.activity.QzoneFriendFeedProActivity',
          ],
          matches:
            '@[clickable=true] >(1,2) [text^="不看" || text^="隐藏"][text$="动态"]',
          snapshotUrls: [
            'https://i.gkd.li/i/26308405', // 不看此条\n动态
            'https://i.gkd.li/i/26489660', // 隐藏此条动态
          ],
        },
        {
          key: 2,
          name: '③确定',
          activityIds: '.activity.QPublicTransFragmentActivity',
          matches: '[desc="确认不看此条动态吗？"] +n [desc="确定"]',
          snapshotUrls: 'https://i.gkd.li/i/26308417',
        },
        {
          key: 3,
          preKeys: [1],
          name: '④确定',
          fastQuery: true,
          activityIds: '.activity.SplashActivity',
          matches: '[childCount=2] > [text="确定"]',
          snapshotUrls: 'https://i.gkd.li/i/26489750', // 确认隐藏...吗
        },
      ],
    },
    {
      key: 37,
      name: '分段广告-QQ空间空友爱看',
      desc: '①点击右侧折叠 ②[不感兴趣/关闭推荐] ③选择原因 ④点击[提交]',
      fastQuery: true,
      activityIds:
        'com.qzone.reborn.feedpro.activity.QzoneFriendFeedProActivity',
      rules: [
        {
          key: 0,
          name: '①点击右侧折叠',
          matches:
            '@[clickable=true][index=parent.childCount.minus(1)] -2 [text="空友爱看"]',
          snapshotUrls: [
            'https://i.gkd.li/i/32656065',
            'https://i.gkd.li/i/33508601', //推荐
            'https://i.gkd.li/i/33665642',
          ],
        },
        {
          key: 1,
          preKeys: [0],
          name: '②不感兴趣/关闭推荐',
          matches: '@[clickable=true] >2 [text="不感兴趣" || text="关闭推荐"]',
          snapshotUrls: [
            'https://i.gkd.li/i/32656067', //不感兴趣 (v9.3.60)
            'https://i.gkd.li/i/33508604', //关闭推荐 (v9.2.90 旧版)
            'https://i.gkd.li/i/33665763', //不感兴趣 (v9.3.75)
          ],
        },
        {
          key: 2,
          preKeys: [1],
          name: '③选择原因',
          activityIds: '.activity.QPublicTransFragmentActivity',
          matches: '[desc="没有我想看的类型 未选中"]',
          snapshotUrls: 'https://i.gkd.li/i/32656073',
        },
        {
          key: 3,
          preKeys: [2],
          name: '④提交',
          activityIds: '.activity.QPublicTransFragmentActivity',
          matches: '[desc$="已选中"] +n * > [desc="提交"]',
          snapshotUrls: 'https://i.gkd.li/i/32656070',
        },
      ],
    },
    {
      key: 39,
      name: '局部广告-空间相册内广告',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.qzone.reborn.base.QZoneShellActivity',
          matches:
            '@ImageView[clickable=true][width<87] <2 [visibleToUser=true] - [childCount=3] >2 [text="广告"]',
          snapshotUrls: 'https://i.gkd.li/i/30869035',
        },
      ],
    },
    {
      key: 40,
      name: '功能类-App申请信息/登录授权',
      desc: 'App申请使用qq登录/用户信息',
      matchRoot: true,
      actionMaximum: 3,
      actionCd: 500,
      rules: [
        {
          key: 1,
          name: '信息授权',
          activityIds: [
            'com.tencent.open.agent.PublicFragmentActivityForOpenSDK',
            'com.tencent.open.agent.QuickLoginAuthorityActivity',
          ],
          fastQuery: true,
          matches:
            '@Button[text="同意" || text="确认"][clickable=true] < LinearLayout -(4-n) * >(4-n) [text$="申请使用"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/20737673',
            'https://i.gkd.li/i/22631619',
          ],
          exampleUrls: [
            'https://e.gkd.li/5d5e24b7-178b-4afb-b2df-2fa55c49575f',
            'https://e.gkd.li/8a79aed5-3651-40ae-a68c-f17813b03183',
          ],
        },
        {
          key: 2,
          name: '登录',
          activityIds: [
            'com.tencent.biz.qrcode.activity.QRLoginAuthActivity',
            '.activity.DevLockQuickVerifyActivity',
          ],
          fastQuery: true,
          matches:
            'TextView[text^="登录 "][visibleToUser=true] +(6-n) LinearLayout > Button[text="登录" || text="确认"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/20737651',
          exampleUrls: 'https://e.gkd.li/c1258db1-97f2-4ee5-90ed-50b73669d68d',
        },
        {
          key: 3,
          name: '登录(无快查)',
          activityIds: [
            'com.tencent.biz.qrcode.activity.QRLoginAuthActivity',
            '.activity.DevLockQuickVerifyActivity',
          ],
          actionMaximumKey: 2, // 共享key2的执行次数
          actionCdKey: 2, // // 共享key2的冷却状态
          matches:
            'TextView[text^="登录 "][visibleToUser=true] +(6-n) Button[text="登录" || text="确认"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/20737675', //QQ互联
        },
      ],
    },
  ],
});
