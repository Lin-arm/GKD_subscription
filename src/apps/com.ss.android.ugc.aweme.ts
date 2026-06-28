import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.ss.android.ugc.aweme',
  name: '抖音',
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
          excludeActivityIds: '.search.activity.SearchResultActivity',
          matches:
            '[text*="跳过"][text.length<10][width<500 && height<300][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/202942ce-259c-4b9d-b3b3-06afbac8145f',
          snapshotUrls: 'https://i.gkd.li/i/13216121',
          excludeSnapshotUrls: 'https://i.gkd.li/i/17811608',
        },
      ],
    },
    {
      key: 1,
      name: '局部广告',
      rules: [
        {
          key: 1,
          name: '直播右侧卡片广告',
          fastQuery: true,
          activityIds: '.live.LivePlayActivity',
          matches:
            '@View[clickable=true][width<80&&height<80] +2 View >4 [text="立即查看"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/7c97fdc7-9de0-403d-9817-e43da0eb8a31',
          snapshotUrls: 'https://i.gkd.li/i/22743677',
        },
      ],
    },
    {
      key: 3,
      name: '更新提示-关闭更新弹窗',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.main.MainActivity',
          matches: ['[text*="立即升级"]', '[text="以后再说"]'],
          snapshotUrls: [
            'https://i.gkd.li/i/12534016',
            'https://i.gkd.li/i/13328599',
            'https://i.gkd.li/i/15359995',
            'https://i.gkd.li/i/20139600',
          ],
        },
      ],
    },
    {
      key: 10,
      name: '权限提示-通知权限',
      desc: '点击[暂不]/[以后再说]/[禁止]',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      activityIds: [
        '.main.MainActivity',
        '.profile.ui.UserProfileActivity',
        '.detail.ui.DetailActivity',
      ],
      rules: [
        {
          key: 0,
          matches: [
            '([text^="及时" || text^="点击允许"][text$="提醒"][visibleToUser=true]) || ([text^="打开私信通知" || text="开启朋友的消息通知"][visibleToUser=true])',
            '[text="以后再说" || text="暂不开启" || text="禁止" || text="取消"][visibleToUser=true]',
          ],
          snapshotUrls: [
            // (及时 || 点击允许) && 提醒
            'https://i.gkd.li/i/13669790', // 及时获得消息提醒
            'https://i.gkd.li/i/25024525', // 点击允许，及时获得评论回复提醒
            'https://i.gkd.li/i/25063241', // 及时获取评论回复提醒
            'https://i.gkd.li/i/26240394', // 及时获得评论回复提醒
            'https://i.gkd.li/i/29402255', // 及时收到博主更新提醒
            // 其他
            'https://i.gkd.li/i/18419574', // 私信通知
            'https://i.gkd.li/i/18417891', // 朋友消息通知
          ],
        },
      ],
    },
    {
      key: 11,
      name: '功能类-自动勾选原图',
      desc: '聊天发送图片时自动勾选原图',
      actionMaximum: 1,
      rules: [
        {
          fastQuery: true,
          resetMatch: 'match', // 防止从多选图进入单选图模式又给取消勾选
          activityIds: [
            '.ecommerce.im.choosemedia.ECommerceIMMediaChooseActivity',
            '.im.business.mediaselectpage.edit.IMEditPreviewActivity',
            '.im.business.mediaselectpage.choose.MediaChooseActivity',
          ],
          anyMatches: [
            '@ImageView[clickable=true][visibleToUser=true] + [text="原图"]',
            '@[clickable=true] > TextView[text="原图"][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/18637952', // 未选中
            'https://i.gkd.li/i/18637948', // 已选中
            'https://i.gkd.li/i/25401995', // 多选图片页
            'https://i.gkd.li/i/25401998', // 单图片页
            'https://i.gkd.li/i/25402432', // 单图片页_已选中
          ],
        },
      ],
    },
    {
      key: 12,
      name: '其他-休息提醒',
      fastQuery: true,
      rules: [
        {
          key: 1,
          matches: '@[text="取消"] + [text*="提醒我"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13241564',
            'https://i.gkd.li/i/14160675',
          ],
        },
      ],
    },
    {
      key: 13,
      name: '全屏广告-小组件弹窗',
      desc: '点击x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            '.main.MainActivity',
            '.live.LiveDummyActivity',
            '.search.activity.SearchResultActivity',
          ],
          matches:
            '@ImageView[clickable=true][width<173] <2 [childCount>3] > [text^="添加" || text^="开启"][text*="桌面"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13669682', //添加抖音商城到桌面
            'https://i.gkd.li/i/14740312', //添加抖音商城到桌面
            'https://i.gkd.li/i/14325749', //开启搜索组件到桌面
            'https://i.gkd.li/i/18009276', //添加火花桌面小组件
          ],
          exampleUrls: 'https://e.gkd.li/c3980f6b-5459-45fe-b317-5bdc561319dc',
        },
      ],
    },
    {
      key: 15,
      name: '全屏广告',
      desc: '点击[不感兴趣/知道了]',
      fastQuery: true,
      activityIds: '.main.MainActivity',
      rules: [
        {
          key: 0,
          matches:
            '@[clickable=true][text="不感兴趣"] +(1,2) FlattenUIText[text="不感兴趣"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13800207',
            'https://i.gkd.li/i/13996724',
            'https://i.gkd.li/i/20035670',
          ],
        },
        {
          key: 1,
          matches: '[name!$="ImageView"] + [text="不感兴趣"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/14661956',
          excludeSnapshotUrls: 'https://i.gkd.li/i/23833191', // [name!$="ImageView"]
        },
        {
          key: 2,
          activityIds: [
            '.live.LiveDummyActivity',
            '.commerce.sdk.MallContainerActivity',
            'com.bytedance.android.shopping.store.tabkit.container.TabKitActivity',
          ],
          matches: '[text*="首页商城"] +n FlattenUIText[text="知道了"]',
          snapshotUrls: [
            'https://i.gkd.li/i/14533732',
            'https://i.gkd.li/i/14969825',
            'https://i.gkd.li/i/14969835',
          ],
        },
      ],
    },
    {
      key: 19,
      name: '权限提示-通讯录权限',
      desc: '点击[拒绝]',
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.main.MainActivity',
          matches: ['[text*="通讯录"]', '[text="拒绝"]'],
          exampleUrls:
            'https://m.gkd.li/57941037/8f70418d-92f0-4264-83fd-a680350c478e',
          snapshotUrls: [
            'https://i.gkd.li/i/14735280',
            'https://i.gkd.li/i/16171391',
          ],
        },
      ],
    },
    {
      key: 20,
      name: '青少年模式',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          key: 0,
          excludeActivityIds: '.setting.ui.SettingCommonProtocolActivity',
          matches: [
            '[text*="青少年" || text*="未成年"][text*="模式"]',
            '[text="关闭" || text="不再提醒"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/14321107',
            'https://i.gkd.li/i/14473006',
            'https://i.gkd.li/i/17726070',
            'https://i.gkd.li/i/18638030',
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/14917848',
            'https://i.gkd.li/i/17610958',
          ],
        },
      ],
    },
    {
      key: 21,
      name: '权限提示-定位权限',
      desc: '直接关闭所有类似形状窗口',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      activityIds: '.search.activity.SearchResultActivity',
      rules: [
        {
          key: 0,
          name: '弹窗',
          action: 'back',
          matches: '[vid="rootview"]',
          snapshotUrls: 'https://i.gkd.li/i/13755373',
        },
        {
          key: 1,
          name: '顶部横条',
          activityIds: '.search.activity.SearchResultActivity',
          matches: '@ImageView[clickable=true] - [text^="开启定位"]',
          snapshotUrls: 'https://i.gkd.li/i/13755718',
        },
      ],
    },
    {
      key: 22,
      name: '全屏广告-汽水音乐VIP',
      desc: '点击关闭',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: [
            '.dsp.MusicLunaActivity',
            '.dsp.playpage.singlepage.subpage.MusicDspSubPlayerActivity',
          ],
          matches:
            'ScrollView - @ImageView[index=1][childCount=0][visibleToUser=true][width<100][height<100] <2 View < View < ViewGroup < ViewGroup < [id="android:id/content"]',
          exampleUrls: 'https://e.gkd.li/4c57ee77-2189-4b3b-be0b-430fac8853c2',
          snapshotUrls: [
            'https://i.gkd.li/i/18100285',
            'https://i.gkd.li/i/18100454',
            'https://i.gkd.li/i/18100477',
          ],
        },
      ],
    },
    {
      key: 23,
      name: '其他-个性化推荐弹窗',
      desc: '点击[稍后再说]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.main.MainActivity',
          matches: [
            '[text*="个性化推荐"][visibleToUser=true]',
            '[text="稍后再说"][visibleToUser=true]',
          ],
          exampleUrls: 'https://e.gkd.li/987234ad-de0f-40d8-b7dd-d3c600609949',
          snapshotUrls: 'https://i.gkd.li/i/18633134',
        },
      ],
    },
    {
      key: 24,
      name: '功能类-刷到推广视频时[上滑]',
      desc: '广告/应用/购物/游戏/咨询/服务/预约/子薇剧场 等推广视频',
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
          activityIds: '.main.MainActivity',
          matches:
            '([visibleToUser=true] > [text$="广告" || text$="（推广）"][vid="desc" || desc="广告"]) || ([text="应用" || text="购物" || text$="游戏" || text="咨询" || text="服务" || text="预约" || text="子薇剧场"][text.length<6][index=1][visibleToUser=true])', // (选择器A) || (选择器B)
          snapshotUrls: [
            // 选择器A
            'https://i.gkd.li/i/21142063', // [text$="广告"][vid="desc"]
            'https://i.gkd.li/i/29403811', // [text$="（推广）"][vid="desc"]
            'https://i.gkd.li/i/29403704', // [text$="广告"][desc="广告"]
            'https://i.gkd.li/i/29403301', // [text$="广告"][desc="广告"] [visibleToUser=false]

            // 选择器B
            'https://i.gkd.li/i/21142589', //应用
            'https://i.gkd.li/i/21142249', //购物
            'https://i.gkd.li/i/21142871', //游戏
            'https://i.gkd.li/i/21725628', //小游戏
            'https://i.gkd.li/i/25355868', //咨询
            'https://i.gkd.li/i/29403479', //服务
            'https://i.gkd.li/i/21765934', //预约
            'https://i.gkd.li/i/21523849', //子薇剧场
          ],
        },
      ],
    },
    {
      key: 26,
      name: '功能类-自动领取别人发的红包',
      desc: '点击 ①抖音红包 ②弹窗-开红包 ③返回 ④x掉已领完弹窗',
      fastQuery: true,
      activityIds: '.fund.redpacket.RedPacketReceiveActivity',
      rules: [
        {
          key: 1,
          name: '①点击[抖音红包]',
          activityIds: '.main.MainActivity',
          matches:
            'FrameLayout[width>10] -2 @LinearLayout >3 [text="抖音红包"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/6c963e99-1a74-40a5-bf84-a9353c27acdb',
          snapshotUrls: [
            'https://i.gkd.li/i/22761277',
            'https://i.gkd.li/i/25190308',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/22849224', // (右边)自己发的不领取 [width=0]
        },
        {
          preKeys: [1],
          key: 2,
          name: '②红包弹窗-点击[开]',
          matches:
            '@FrameLayout[clickable=true][width=height] -2 [text="大吉大利"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/e8b822c1-c289-4802-85a4-994093024b24',
          snapshotUrls: 'https://i.gkd.li/i/22761510',
        },
        {
          preKeys: [2],
          key: 3,
          name: '③已领-点击[返回]',
          matches: '[vid="iv_back"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/f92c1412-8111-40bc-8188-24f2c004c55c',
          snapshotUrls: 'https://i.gkd.li/i/22761554',
        },
        {
          key: 4,
          preKeys: [1, 2, 3],
          name: '④已领完弹窗-x掉',
          matches:
            '@ImageView[clickable=true] - * > [text="红包已领完"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25190699',
        },
      ],
    },
    {
      key: 27,
      name: '功能类-自动抢口令红包',
      desc: '点击 ①口令红包 ②弹窗 ③一键发口令',
      fastQuery: true,
      rules: [
        {
          key: 1,
          name: '①点进口令红包',
          activityIds: [
            '.main.MainActivity',
            '.fund.redpacket.RedPacketReceiveActivity',
          ],
          matches: '@ImageView + [text="抖音红包「口令」"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25121991',
        },
        {
          key: 2,
          name: '②弹窗-点击红包',
          activityIds: '.fund.redpacket.RedPacketReceiveActivity',
          matches: 'ImageView < @[clickable=true] -2 [text="发口令开红包"]',
          snapshotUrls: 'https://i.gkd.li/i/25122030',
        },
        {
          key: 3,
          name: '③一键发口令',
          activityIds: '.fund.redpacket.RedPacketReceiveActivity',
          matches:
            '[text="发口令开红包"] + LinearLayout >2 [text="一键发送到聊天"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/25122077',
            'https://i.gkd.li/i/25122095',
          ],
        },
      ],
    },
    {
      key: 28,
      name: '权限提示-相机权限',
      desc: '点击[以后再说]',
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.shortvideo.ui.scan.ScanNewActivity',
          matches: ['[text*="相机权限"]', '[text="以后再说"][clickable=true]'],
          snapshotUrls: 'https://i.gkd.li/i/25183382',
        },
      ],
    },
    {
      key: 29,
      name: '功能类-评论区-自动展开评论',
      desc: '只展开一级评论，不点击展示更多',
      fastQuery: true,
      activityIds: [
        '.detail.ui.DetailActivity',
        '.main.MainActivity',
        'com.bytedance.ies.ugc.aweme.photos.detail.flow.page.FlowPageActivity',
        '.searcharticle.detail.ArticleDetailActivity',
        '.search.activity.SearchResultActivity',
      ],
      rules: [
        {
          matches: '@[clickable=true] > [text^="展开"][text$="回复"]',
          snapshotUrls: [
            'https://i.gkd.li/i/25356027',
            'https://i.gkd.li/i/26240597',
            'https://i.gkd.li/i/26240834',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/25356355', // 排除 [展开更多]
          exampleUrls: [
            'https://e.gkd.li/e9ca5fe1-a60c-4ed8-9974-9d79e32c71d7',
            'https://e.gkd.li/c58e3455-2d7e-4ce2-8c0f-a971386f5ef4', // 排除 [展开更多]
          ],
        },
      ],
    },
    {
      key: 30,
      name: '功能类-评论区-自动展开评论_全部',
      desc: '基于上面追加点击展开更多',
      fastQuery: true,
      activityIds: [
        '.detail.ui.DetailActivity',
        '.main.MainActivity',
        'com.bytedance.ies.ugc.aweme.photos.detail.flow.page.FlowPageActivity',
        '.searcharticle.detail.ArticleDetailActivity',
        '.search.activity.SearchResultActivity',
      ],
      rules: [
        {
          matches: '@[clickable=true] > [text^="展开更多"]',
          snapshotUrls: [
            'https://i.gkd.li/i/25619324',
            'https://i.gkd.li/i/25619463',
          ],
          exampleUrls: [
            'https://e.gkd.li/c9f1e163-4fa9-42bb-b5a5-4c9de6f286c2',
            'https://e.gkd.li/afea1f82-e50c-4ef0-9f0a-a2ceec00c03b',
          ],
        },
      ],
    },
    {
      key: 31,
      name: '其他-直播间-小黄车',
      desc: '关闭定时弹出的商品卡片',
      rules: [
        {
          fastQuery: true,
          activityIds: '.live.LivePlayActivity',
          matches:
            '[desc="购买"][visibleToUser=true] <n LiveMeasureOnceRelativeLayout < * -2 FrameLayout > [vid="iv_close"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/26754062',
            'https://i.gkd.li/i/29388290',
          ],
          exampleUrls: 'https://e.gkd.li/8c5e6526-83e5-4ec6-b532-367ff6045bfc',
        },
      ],
    },
    {
      key: 32,
      name: '局部广告-直播-关闭推荐直播间',
      desc: '刷到直播-> 可能喜欢这些直播 -> x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.main.MainActivity',
          matches:
            'ImageView + [text="你可能喜欢这些直播"][visibleToUser=true] + [vid="close"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/29387031',
          exampleUrls: 'https://e.gkd.li/1ee3aa97-345d-42a3-af64-262230b650be',
        },
      ],
    },
    {
      key: 33,
      name: '局部广告-评论区-评论氛围满意度',
      desc: '评论氛围满意度卡片-> x掉',
      fastQuery: true,
      activityIds: [
        '.detail.ui.DetailActivity',
        '.main.MainActivity',
        'com.bytedance.ies.ugc.aweme.photos.detail.flow.page.FlowPageActivity',
        '.searcharticle.detail.ArticleDetailActivity',
        '.search.activity.SearchResultActivity',
      ],
      rules: [
        {
          anyMatches: [
            '@[text="关闭,按钮"][clickable=true] - [text$="评论氛围是否满意？,匿名"][visibleToUser=true]', // 优先使用
            '@UIImage[clickable=true] - [text$="评论氛围是否满意？,匿名"][visibleToUser=true] < FrameLayout[childCount=7] <<4 FrameLayout[childCount=1][id=null][desc=null][text=null][clickable=false][visibleToUser=true][left=0][top!=0] + * > ViewGroup > [vid="avatar"]',
          ], // 兜底
          snapshotUrls: [
            // 快查
            'https://i.gkd.li/i/25571238',
            'https://i.gkd.li/i/29388014',
            // 无快查 (后来版本似乎)
            'https://i.gkd.li/i/29387403',
            'https://i.gkd.li/i/29388032',
          ],
          exampleUrls: 'https://e.gkd.li/f4c54b34-7d3c-499d-9ea0-f865f4cf9375',
        },
      ],
    },
    {
      key: 34,
      name: '功能类-评论区-展开部分折叠评论',
      desc: '最底部已折叠部分评论-> 点击[展开]',
      fastQuery: true,
      activityIds: [
        '.detail.ui.DetailActivity',
        '.main.MainActivity',
        'com.bytedance.ies.ugc.aweme.photos.detail.flow.page.FlowPageActivity',
        '.searcharticle.detail.ArticleDetailActivity',
        '.search.activity.SearchResultActivity',
      ],
      rules: [
        {
          matches:
            '@[text="展开"][clickable=true] - [text="已折叠部分评论"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/29389970',
          exampleUrls: 'https://e.gkd.li/020fc4d1-784a-49bd-9a50-6504e0b040ae',
        },
      ],
    },
    {
      key: 35,
      name: '权限提示-桌面快捷方式',
      desc: '添加[xxxx]到手机桌面-> x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.search.activity.SearchResultActivity',
          matches:
            '@ImageView[clickable=true][width<70 && height<70][text=null][desc=null][id!=null] + [text^="添加"][text$="到手机桌面"][visibleToUser=true]',
          snapshotUrls: [
            // 不感兴趣
            'https://i.gkd.li/i/29400201',
            // 没有不感兴趣
            'https://i.gkd.li/i/29400203',
          ],
          exampleUrls: [
            'https://e.gkd.li/9e84af6a-d174-487f-8024-f080c499922b',
            'https://e.gkd.li/33526c37-12c4-4e64-8b53-82fea09abe43',
          ],
        },
      ],
    },
    {
      key: 36,
      name: '全屏广告-视频流-是广告认可不?[上滑]',
      desc: '问你刚才是不是广告?-> 划掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.detail.ui.DetailActivity',
          matches:
            'UIText[text="你认为这个内容是【广告】吗？"][visibleToUser=true]',
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
          snapshotUrls: 'https://i.gkd.li/i/29401376',
          exampleUrls: 'https://e.gkd.li/bd652ced-a3a8-4cbc-aae7-e309dcbfeb8e',
        },
      ],
    },
    {
      key: 37,
      name: '局部广告-视频流-当前直播满意?',
      desc: '刷到直播看一段出现[你对直播满意吗]-> x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.main.MainActivity',
          matches:
            'FlattenUIText[text$="当前直播满意吗?"][visibleToUser=true] +3 LynxFlattenUI[text="关闭"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/29402787',
          exampleUrls: 'https://e.gkd.li/7eff5d8e-60ca-4a49-838c-5d5fb1d0a54d',
        },
      ],
    },
    {
      key: 38,
      name: '其他-账号详情-商品页', // test
      desc: '进入账号详情弹出的商品-> x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.main.MainActivity',
          matches: [
            'LinearLayout[childCount=3] > ImageView[vid!=null][text=null][desc=null][clickable=false][visibleToUser=true] + * -> [text="推荐"] <3 LinearLayout[childCount=3] + LinearLayout[childCount=3] > [text="直播中"]',
            '@ImageView[clickable=true][id=null][text=null][desc=null] - FrameLayout >5 LinearLayout > TextView[text^="图集"]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/29403171',
          exampleUrls: 'https://e.gkd.li/cbf081a4-4a57-4173-af3a-27334d7a2be6',
        },
      ],
    },
    {
      key: 39,
      name: '局部广告-视频流-左下角卡片',
      desc: '一些视频中途弹出卡片广告',
      rules: [
        {
          fastQuery: true,
          activityIds: '.main.MainActivity',
          matches:
            '@UIView[clickable=true][id=null][text=""][desc=""][childCount=0] + UIText[text="广告"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/29403677',
            'https://i.gkd.li/i/29403704',
          ],
          exampleUrls: 'https://e.gkd.li/ef72c43c-5fab-4b09-bbd0-bb0d754d2c12',
        },
      ],
    },
  ],
});
