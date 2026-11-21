import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.kuaishou.nebula',
  name: '快手极速版',
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
          matches: '[vid="splash_skip_text"]',
          exampleUrls: 'https://e.gkd.li/5d393b9b-c327-4429-9759-8c18a097453a',
          snapshotUrls: 'https://i.gkd.li/i/17631261',
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告-朋友推荐弹窗',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: 'com.yxcorp.gifshow.HomeActivity',
          matches:
            '[vid="popup_view" || vid="content_wrapper"] > [vid="close_btn"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/14310639',
            'https://i.gkd.li/i/15061832',
          ],
        },
      ],
    },
    {
      key: 3,
      name: '全屏广告',
      fastQuery: true,
      activityIds: [
        'com.yxcorp.gifshow.HomeActivity',
        'com.yxcorp.plugin.search.SearchActivity',
      ],
      rules: [
        {
          key: 0,
          matches:
            '@[clickable=true][width<128][index=parent.childCount.minus(1)] -(1,2) ViewGroup > [text="点击立得奖励" || text^="邀请" || text="红包"][visibleToUser=true]',
          exampleUrls:
            'https://m.gkd.li/101449500/f7bbd1db-f519-4ff9-96cb-4cb5b2f483a2',
          snapshotUrls: [
            'https://i.gkd.li/i/14879912', //点击立得奖励
            'https://i.gkd.li/i/15061662', //邀请4个新用户
            'https://i.gkd.li/i/25200787', //邀请新用户
            'https://i.gkd.li/i/26675794', //新人 红包
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/26678562', // 加 [width<128][index=parent.childCount.minus(1)] 排除
        },
        {
          key: 1,
          matches:
            '@ImageView[clickable=true][width<107 && height<107][index=0] + TextView[text$="红包"][text.length<10]',
          snapshotUrls: [
            'https://i.gkd.li/i/26678562', //邀好友得大额红包
            'https://i.gkd.li/i/28514398', //恭喜获得免费红包
          ],
        },
        {
          key: 2,
          position: {
            left: 'width * 1.0557',
            top: 'height * -0.0569',
          },
          matches:
            '[height=0] < @ViewGroup[childCount=4] >3 [text="口令已复制"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/35203973',
          exampleUrls: 'https://e.gkd.li/6030f5cb-9d9d-4b0c-81f6-8b3912f90842',
        },
      ],
    },
    {
      key: 4,
      name: '全屏广告-个人主页弹窗',
      fastQuery: true,
      activityIds: 'com.yxcorp.gifshow.HomeActivity',
      rules: [
        {
          key: 1,
          matches: '[text*="挂件"] - [vid="dialog_close"]',
          snapshotUrls: 'https://i.gkd.li/i/30645708',
          exampleUrls: 'https://e.gkd.li/5379291d-3f11-46a9-a4a3-ccba8cc5a7d6',
        },
        {
          key: 2,
          matches: '[text^="恭喜"] -n [text="不再提醒"]',
          snapshotUrls: 'https://i.gkd.li/i/30645964',
          exampleUrls: 'https://e.gkd.li/381e4649-718e-40e7-9d5f-4d2dd7ad8255',
        },
      ],
    },
    {
      key: 5,
      name: '分段广告-悬浮广告',
      desc: '①点击x掉 ②点击[确定]',
      fastQuery: true,
      activityIds: 'com.yxcorp.gifshow.HomeActivity',
      rules: [
        {
          key: 0,
          name: '①点击x掉',
          matches:
            '[vid="close_icon" || vid="close_pendant"][visibleToUser=true]',
          exampleUrls:
            'https://m.gkd.li/57941037/12059549-21c2-47b7-9acf-ec221cc14f25',
          snapshotUrls: [
            'https://i.gkd.li/i/15747381',
            'https://i.gkd.li/i/23431963',
          ],
        },
        {
          key: 1,
          preKeys: [0, 1], // 刚打开app可能有点卡, key0 连着触发两次, 导致key1 需点击两次[确定]
          name: '②点击[确定]',
          matches: '[text="确定"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/89294dbb-4398-4561-91b7-4943ec7c98c7',
          snapshotUrls: [
            'https://i.gkd.li/i/23431964',
            'https://i.gkd.li/i/29888736', // 第二次出现的弹窗
          ],
        },
      ],
    },
    {
      key: 6,
      name: '评价提示',
      desc: 'x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.yxcorp.gifshow.HomeActivity',
          matches: '@[vid="close"][clickable=true] +2 * > [text*="给个好评吧"]',
          snapshotUrls: 'https://i.gkd.li/i/22851896',
        },
      ],
    },
    {
      key: 7,
      name: '功能类-刷到推广视频时[上滑]',
      desc: '广告/购物/游戏/汽车/咨询/应用/一键出片/品牌活动/测一测 等推广视频',
      rules: [
        {
          fastQuery: true,
          actionCd: 300,
          actionDelay: 200, //完整显示需要时间
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
          activityIds: 'com.yxcorp.gifshow.HomeActivity',
          anyMatches: [
            '[vid="ad_detail_content_layout"][visibleToUser=true]', //1️⃣
            '[vid="plc_tv_tag_label"][text$="元" || text$="人买过"][visibleToUser=true]', //2️⃣
            '[vid="plc_tv_biz_text"][text="游戏" || text="小游戏" || text="购物" || text="购买" || text="汽车" || text="咨询" || text="应用" || text="品牌活动" || text="一键出片" || text="测一测"][visibleToUser=true]', //3️⃣
          ],
          snapshotUrls: [
            //选择器1️⃣
            'https://i.gkd.li/i/29213590', // 广告 i   [vid="ad_detail_content_layout"]

            //选择器2️⃣
            'https://i.gkd.li/i/33927176', // 已省10元
            'https://i.gkd.li/i/33969241', // 600+人买过

            //选择器3️⃣
            'https://i.gkd.li/i/29029850', //购物
            'https://i.gkd.li/i/29029852', //游戏
            'https://i.gkd.li/i/32701451', //小游戏
            'https://i.gkd.li/i/29029853', //购买
            'https://i.gkd.li/i/29030087', //汽车
            'https://i.gkd.li/i/29031982', //咨询
            'https://i.gkd.li/i/30466714', //应用
            'https://i.gkd.li/i/29031736', //品牌活动
            'https://i.gkd.li/i/29031815', //一键出片
            'https://i.gkd.li/i/30347040', //测一测
          ],
          exampleUrls: 'https://e.gkd.li/629b0f6b-49e7-4ca9-8487-5df7d530756f',
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/29032024', //城市定位
            'https://i.gkd.li/i/29032119', //剪同款
          ],
        },
      ],
    },
    {
      key: 8,
      name: '局部广告-用户资料页广告',
      desc: '①点击x掉 ②点击[不感兴趣] ③选一个[理由]',
      fastQuery: true,
      activityIds: 'com.yxcorp.gifshow.profile.activity.UserProfileActivity', //用户资料页
      rules: [
        {
          key: 1,
          name: '①点击x掉',
          matches:
            '@ImageView[clickable=true] < [index=3] - [visibleToUser=true] > [text="下载" || text="打开" || text="查看"]',
          snapshotUrls: [
            'https://i.gkd.li/i/30548229', //下载
            'https://i.gkd.li/i/30548766', //打开
            'https://i.gkd.li/i/30548907', //查看
          ],
          exampleUrls: 'https://e.gkd.li/bce8277d-c2d7-4e5b-8b15-84c7338acfa3',
        },
        {
          key: 2,
          preKeys: [1],
          name: '②点击[不感兴趣]',
          matches: '@[clickable=true] >2 [text="不感兴趣"]',
          snapshotUrls: 'https://i.gkd.li/i/30548232',
          exampleUrls: 'https://e.gkd.li/640b5e7b-2960-4791-add6-a07d6cf84fea',
        },
        {
          key: 3,
          preKeys: [2],
          name: '③选一个[理由]',
          matches: '@[clickable=true] >2 [text="不喜欢该位置展示广告"]',
          snapshotUrls: 'https://i.gkd.li/i/30548235',
          exampleUrls: 'https://e.gkd.li/efe7800d-896d-4503-8b41-52c5d18775a6',
        },
      ],
    },
    {
      key: 9,
      name: '功能类-刷到直播时[上滑]',
      desc: '不想看直播,划掉',
      rules: [
        {
          fastQuery: true,
          matchRoot: true,
          actionCd: 300,
          actionDelay: 200, //完整直播显示需要时间
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
          activityIds: 'com.yxcorp.gifshow.HomeActivity',
          matches:
            '[vid="layout_root_hot_live_play" || text="直播中" || text="直播卖货"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/29029433',
            'https://i.gkd.li/i/29211656',
            'https://i.gkd.li/i/30167631',
          ],
        },
      ],
    },
    {
      key: 10,
      name: '权限提示-通讯录权限',
      desc: '点击[以后再说]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.yxcorp.gifshow.HomeActivity',
          matches: [
            '[text*="通讯录"][visibleToUser=true]',
            '[text="以后再说"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/35119491',
          exampleUrls: 'https://e.gkd.li/3c25da6d-bc0d-420d-9362-c8bb1edf322b',
        },
      ],
    },
  ],
});
