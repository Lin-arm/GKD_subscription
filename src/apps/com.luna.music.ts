import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.luna.music',
  name: '汽水音乐',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      actionMaximumKey: 0,
      priorityTime: 10000,
      rules: [
        {
          key: 0,
          fastQuery: true,
          anyMatches: [
            '@View[text=null][clickable=true][childCount=0][visibleToUser=true][width<200&&height<200] +(1,2) TextView[index=parent.childCount.minus(1)][childCount=0] <n FrameLayout[childCount>2][text=null][desc=null] >(n+6) [text*="第三方应用" || text*="扭动手机" || text*="点击或上滑" || text*="省钱好物" || text*="扭一扭"][visibleToUser=true]',
            'FrameLayout > FrameLayout[childCount>2][text=null][desc=null] > @View[text=null][clickable=true][childCount=0][visibleToUser=true][width<200&&height<200] +(1,2) TextView[index=parent.childCount.minus(1)][childCount=0][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/14232395',
        },
        {
          key: 1,
          fastQuery: true,
          matches: '[text^="跳过"][text.length<10][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/15087528',
            'https://i.gkd.li/i/15148298', // 避免误触
          ],
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
          activityIds: [
            'com.luna.biz.ad.AdActivity',
            'com.luna.biz.main.main.MainActivity',
          ],
          matches: '@[text="稍后再说"] + [text="立即升级"]',
          snapshotUrls: [
            'https://i.gkd.li/i/14790279',
            'https://i.gkd.li/i/21427972',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告-VIP弹窗',
      desc: '直接关闭所有底部半屏弹窗',
      fastQuery: true,
      activityIds: [
        'com.luna.biz.main.main.MainActivity',
        'com.luna.biz.ad.AdActivity',
      ],
      rules: [
        {
          key: 0,
          name: '底部半屏弹窗',
          action: 'back', // 使用点击方式有概率无效
          excludeMatches:
            'FlattenUIText[text="立得全天畅听" || text="立即解锁 今日畅听"][visibleToUser=true]',
          matches:
            'FlattenUIText[text="开会员听整月" || text="购买汽水会员" || text*="免费听"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/43099439-a0ab-4da0-a686-5c960df92607',
          snapshotUrls: [
            'https://i.gkd.li/i/13533795',
            'https://i.gkd.li/i/13660652',
            'https://i.gkd.li/i/13533797',
            'https://i.gkd.li/i/14767233',
            'https://i.gkd.li/i/16280954',
            'https://i.gkd.li/i/16342691',
            'https://i.gkd.li/i/17580823',
            'https://i.gkd.li/i/18183749',
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/13613296',
            'https://i.gkd.li/i/14237527',
            'https://i.gkd.li/i/18242457',
          ],
        },
        {
          key: 2,
          name: '全屏弹窗',
          matches:
            '@LynxFlattenUI[clickable=true] -2 FlattenUIText[text="立即抢购"]',
          snapshotUrls: 'https://i.gkd.li/i/16278152',
        },
        {
          key: 3,
          name: '0.01开通7天VIP',
          action: 'clickCenter', // 无障碍点击无效
          anyMatches: [
            '@View[childCount=2][index=1] >2 [text$="天体验卡" || text^="VIP"][visibleToUser=true]', // 优先使用自身快查
            '@[text$="天体验卡" || text^="VIP" || desc$="天体验卡" || desc^="VIP"][visibleToUser=true] < [index=parent.childCount.minus(1)] <n * <2 [childCount=2] <<5 [id="android:id/content"]', // 退而求其次
          ],
          position: {
            left: 'width * 0.90',
            top: 'width * 0.09',
          },
          snapshotUrls: [
            'https://i.gkd.li/i/26757915',
            'https://i.gkd.li/i/28302150',
          ],
          exampleUrls: 'https://e.gkd.li/4cefa02b-b83e-4f68-b861-d377ea427514',
        },
      ],
    },
    {
      key: 8,
      name: '功能类-全自动看广告领VIP',
      desc: '⚠️二选一,广告一直看下去直到手动干预退出,适合需要领多天vip的用户,与单日规则互斥',
      rules: [
        {
          // 主页界面
          name: '开屏自动看视频',
          key: 0,
          fastQuery: true,
          activityIds: 'com.luna.biz.main.main.MainActivity',
          actionMaximum: 1,
          priorityTime: 5000,
          resetMatch: 'app',
          anyMatches: [
            '[vid="ui"] >3 @[clickable=true] < ViewGroup +3 View > [text="今日畅听"] + [text^="第" || text$="个"]',
            '@[childCount=0][left!=0] < ViewGroup[childCount=1] <n FrameLayout[childCount=5] <<6 FrameLayout <<4 [id="android:id/content"]',
          ],
          excludeMatches:
            'FrameLayout > ViewGroup[text=null][text.length=null][desc$="畅听"]',
          snapshotUrls: [
            'https://i.gkd.li/i/26758188',
            'https://i.gkd.li/i/28299711', // 新UI_2026.05.27
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/28378061', //观看ad回主页后出现
            'https://i.gkd.li/i/28907374', // FrameLayout[childCount=5]
          ],
          exampleUrls: [
            'https://e.gkd.li/194773d6-a9c0-48c4-84bf-e1a57449434b',
            'https://e.gkd.li/9cd0c931-5ae8-4739-8a1a-481d2d5731f4',
          ],
        },
        // 视频播放界面
        // 1. 旧版节点树(轮询法)
        {
          key: 1,
          name: '①x掉-坐标轮询点击', // 反复点击x来判断是否已领取奖励
          fastQuery: true,
          actionDelay: 8000,
          position: {
            left: 'width * 3.28',
            top: 'width * 0.2',
          },
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            'FlattenUIText[text="广告"] + [text$="声音"] + [text="反馈"][visibleToUser=true]', // [反馈]相对坐标点击成功率高
          snapshotUrls: [
            'https://i.gkd.li/i/24521440', // 18s后可领取奖励
            'https://i.gkd.li/i/26401083', // 38s后？？？
            'https://i.gkd.li/i/24521423', // 设备1
            'https://i.gkd.li/i/26401058', // 设备2
            'https://i.gkd.li/i/26401097', // 设备3
          ],
          exampleUrls: 'https://e.gkd.li/87c7201a-f413-4d82-9198-2dc9455c4f23',
        },
        {
          key: 2, // 老UI(遗弃?)
          name: '①跳过',
          activityIds:
            'com.bytedance.sdk.openadsdk.core.component.reward.activity.TTRewardVideoActivity',
          matches: '[visibleToUser=true][text="奖励已领取"]',
          snapshotUrls: 'https://i.gkd.li/i/24522627',
        },
        {
          preKeys: [1, 2], // 轮询判断是否已领取
          name: '②没结束-继续轮询',
          fastQuery: true,
          actionDelay: 500,
          activityIds: [
            'com.bytedance.sdk.openadsdk.core.component.reward.activity.TTRewardVideoActivity',
            'com.bytedance.sdk.openadsdk.stub.activity.Stub_Standard_Portrait_Activity',
            'com.ss.android.excitingvideo.ExcitingVideoActivity',
          ],
          matches:
            '[text="领取奖励" || text^="再看一个" || text="继续观看"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/15140816',
            'https://i.gkd.li/i/24521416',
            'https://i.gkd.li/i/24521446',
            'https://i.gkd.li/i/24521516',
          ],
          exampleUrls: 'https://e.gkd.li/3b2a0948-3b77-419b-8acf-2166e1cd445c',
        },
        // 2. 新版本节点树(可直接识别状态领取奖励)
        {
          key: 3,
          name: '①x掉-领取成功', // 节点树可直接区分状态(版本19.1.0以上)
          versionCode: { minimum: 100191030 },
          fastQuery: true,
          matchRoot: true,
          actionDelay: 1200, //稳定节点树时间
          actionCd: 8000,
          activityIds: [
            'com.ss.android.excitingvideo.ExcitingVideoActivity',
            'com.luna.biz.ad.adns.luna.LunaRewardActivity',
          ],
          anyMatches: [
            '@ImageView[width<56 && height<56][visibleToUser=true] < [childCount=1] <n [childCount>6] <<(6,7) [id="android:id/content"]',
            '@[desc="领取成功，关闭，按钮"] <<3 [index=parent.childCount.minus(1)] <n ViewGroup < ViewGroup <3 FrameLayout <<5 [id="android:id/content"]',
            '@TextView[clickable=true] - [text="领取成功"][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/27359402', // 领取成功
            'https://i.gkd.li/i/27363266',
            'https://i.gkd.li/i/28018493', // UI2
            'https://i.gkd.li/i/28300641', // UI3_2026.05.27
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/27272574', // 未领取
        },
        // 2026_05_01 新UI
        {
          preKeys: [3],
          name: '②领取奖励_2',
          versionCode: { minimum: 100191030 },
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '[desc="领取奖励" || desc^="再看一个" || desc="继续观看"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28021222',
        },
        // 3. 旧版
        // 领取奖励继续看视频(到第14个Ad后由order1接管)
        {
          preKeys: [3],
          name: '②领取奖励',
          versionCode: { minimum: 100191030 },
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          actionMaximum: 13, // 限制次数
          order: 0,
          matches:
            '@[childCount=2] + ImageView[index=parent.childCount.minus(1)] <n [childCount=5] <<5 [id="android:id/content"]',
          position: {
            left: 'width * 0.50',
            top: 'width * 0.85',
          },
          snapshotUrls: 'https://i.gkd.li/i/27359717',
        },
        // 接管最后一个Ad观看点击结束
        {
          preKeys: [3],
          name: '③结束^_^',
          versionCode: { minimum: 100191030 },
          order: 1,
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@[childCount=2] + ImageView[index=parent.childCount.minus(1)] <n [childCount=5] <<5 [id="android:id/content"]',
          position: {
            left: 'width * 0.50',
            top: 'width * 1.00',
          },
          snapshotUrls: 'https://i.gkd.li/i/27359717',
        },
        //视频内二级全屏Ad
        {
          key: 98, // 这个UI太多了,用排除法只匹配x吧
          name: '视频内二级全屏Ad',
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            'ViewGroup[index=parent.childCount.minus(1)][width<60 && height<60][text=null][id=null][desc=null][visibleToUser=true][childCount=0]',
          excludeMatches: [
            '[desc$="日免费听"][visibleToUser=true]',
            '[desc="领取奖励" || desc^="再看一个" || desc="继续观看"][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/28302996',
          exampleUrls: 'https://e.gkd.li/e55793b3-e443-4cd1-80b5-aaa6cd7f88aa',
        },
        //其他情况-无视频
        {
          key: 99,
          name: '无视频',
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@[clickable=true][width<120 && height<120] + LinearLayout > [text="当前无新视频"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/24522244',
        },
      ],
    },
    {
      key: 9,
      name: '功能类-看广告自动[静音]',
      desc: '点击1次, activity刷新后会重置',
      fastQuery: true,
      actionDelay: 300,
      activityIds: [
        'com.ss.android.excitingvideo.ExcitingVideoActivity',
        'com.luna.biz.ad.adns.luna.LunaRewardActivity',
      ],
      rules: [
        {
          key: 0,
          matches: '[text="开启声音"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/24522999',
          excludeSnapshotUrls: 'https://i.gkd.li/i/24521440',
        },
        {
          key: 1,
          actionMaximum: 1,
          matches:
            '@ImageView[visibleToUser=true][width<57 && height<78] -2 [text="广告"]',
          snapshotUrls: 'https://i.gkd.li/i/28300641',
        },
        {
          key: 2,
          actionMaximum: 1,
          actionMaximumKey: 1,
          matches:
            '@ImageView[width<57 && height<78][visibleToUser=true] - ScrollView <n [childCount>6] <<(6,7) [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/27365536',
          exampleUrls: 'https://e.gkd.li/7d86c22c-bbf3-419e-bd6f-eecdaf357872',
        },
        {
          key: 3,
          name: '坐标点击[静音]',
          actionMaximum: 1,
          actionMaximumKey: 1,
          position: {
            left: 'width * 0.5',
            top: 'width * 0.8889',
          },
          matches:
            '@ImageView[width>20 && width<93 && height<0][right<prev.width.div(3)][bottom<prev.height.div(10)] <<n [id="android:id/content"]',
          /*
           ** 从选择器右侧 [id="android:id/content"] 节点获取屏幕宽高, 限制目标节点位于屏幕左上角
           ** [right<prev.width.div(3)] 表示目标节点的 right 要小于屏幕宽度的 1/3
           ** [bottom<prev.height.div(10)] 表示目标节点的 bottom 要小于屏幕高度的 1/10
           */
          snapshotUrls: [
            // [height<0]
            'https://i.gkd.li/i/28018493',
            'https://i.gkd.li/i/28557156',
          ],
        },
      ],
    },
    {
      key: 10,
      name: '评价提示-评分弹窗',
      desc: '使用返回关闭弹窗',
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          action: 'back',
          matches: '[text="为汽水音乐评分"]',
          exampleUrls:
            'https://m.gkd.li/57941037/a7e53af0-8b84-4619-b369-69b949ab2ce4',
          snapshotUrls: 'https://i.gkd.li/i/14720841',
        },
      ],
    },
    {
      key: 11,
      name: '局部广告-悬浮窗广告',
      desc: '点击关闭',
      fastQuery: true,
      activityIds: 'com.luna.biz.main.main.MainActivity',
      rules: [
        {
          key: 0,
          matches: '[vid="fl_pendant_container"] > [vid="view_close"]',
          exampleUrls:
            'https://m.gkd.li/57941037/8a427d5f-680b-4562-9cf3-90b1db82df0f',
          snapshotUrls: 'https://i.gkd.li/i/13674376',
        },
        {
          key: 1,
          matches:
            '@View[clickable=true][width<126 && height<60] < [childCount=3] <n [childCount>=4] < FrameLayout[childCount>=3] <2 [childCount=2] <2 ViewPager <<3 [vid="navigation_container_under_bottom_bar"]',
          exampleUrls: 'https://e.gkd.li/42a3884a-6888-4d5b-aa61-7ff5159a5228',
          snapshotUrls: [
            'https://i.gkd.li/i/28298866',
            'https://i.gkd.li/i/28436303',
          ],
        },
      ],
    },
    {
      key: 12,
      name: '其他-关闭[更多直播]推荐',
      desc: '直播间出现[更多直播]时点击右上角关闭',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.luna.biz.live.plugin.LunaDefaultLivePlayerActivity',
          matches:
            '@[desc="关闭"][clickable=true] <n RelativeLayout + FrameLayout >4 [text="更多直播"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/148466b5-9769-4b79-b648-f2cf7719e3e7',
          snapshotUrls: 'https://i.gkd.li/i/22922565',
        },
      ],
    },
    {
      key: 13,
      name: '功能类-全自动看广告领VIP_单日',
      desc: '⚠️二选一,领到今天vip收手退出,适合只想领一天vip的用户,与多日规则互斥',
      rules: [
        {
          // 主页界面
          name: '开屏自动看视频',
          key: 0,
          fastQuery: true,
          activityIds: 'com.luna.biz.main.main.MainActivity',
          actionMaximum: 1,
          priorityTime: 5000,
          resetMatch: 'app',
          anyMatches: [
            '[vid="ui"] >3 @[clickable=true] < ViewGroup +3 View > [text="今日畅听"] + [text^="第" || text$="个"]',
            '@[childCount=0][left!=0] < ViewGroup[childCount=1] <n FrameLayout[childCount=5] <<6 FrameLayout <<4 [id="android:id/content"]',
          ],
          excludeMatches:
            'FrameLayout > ViewGroup[text=null][text.length=null][desc$="畅听"]',
          snapshotUrls: [
            'https://i.gkd.li/i/26758188',
            'https://i.gkd.li/i/28299711', // 新UI_2026.05.27
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/28378061', //观看ad回主页后出现
            'https://i.gkd.li/i/28907374', // FrameLayout[childCount=5]
          ],
          exampleUrls: [
            'https://e.gkd.li/194773d6-a9c0-48c4-84bf-e1a57449434b',
            'https://e.gkd.li/9cd0c931-5ae8-4739-8a1a-481d2d5731f4',
          ],
        },
        // 视频播放界面
        // 1.旧版节点树(轮询法)
        {
          name: '①x掉-坐标轮询点击', // 反复点击x来判断是否已领取奖励
          key: 1,
          fastQuery: true,
          actionDelay: 8000,
          position: {
            left: 'width * 3.28',
            top: 'width * 0.2',
          },
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            'FlattenUIText[text="广告"] + [text$="声音"] + [text="反馈"][visibleToUser=true]', // [反馈]相对坐标点击成功率高
          snapshotUrls: [
            'https://i.gkd.li/i/24521440', // 18s后可领取奖励
            'https://i.gkd.li/i/26401083', // 38s后？？？
            'https://i.gkd.li/i/24521423', // 设备1
            'https://i.gkd.li/i/26401058', // 设备2
            'https://i.gkd.li/i/26401097', // 设备3-领取成功
          ],
          exampleUrls: 'https://e.gkd.li/87c7201a-f413-4d82-9198-2dc9455c4f23',
        },
        {
          name: '①跳过', // 老UI(遗弃?)
          key: 2,
          activityIds:
            'com.bytedance.sdk.openadsdk.core.component.reward.activity.TTRewardVideoActivity',
          matches: '[visibleToUser=true][text="奖励已领取"]',
          snapshotUrls: 'https://i.gkd.li/i/24522627',
        },
        {
          name: '②没结束?继续轮询',
          preKeys: [1, 2], // 轮询判断是否已领取
          fastQuery: true,
          actionDelay: 500,
          activityIds: [
            'com.bytedance.sdk.openadsdk.core.component.reward.activity.TTRewardVideoActivity',
            'com.bytedance.sdk.openadsdk.stub.activity.Stub_Standard_Portrait_Activity',
            'com.ss.android.excitingvideo.ExcitingVideoActivity',
          ],
          matches:
            '[text="领取奖励" || text^="再看一个" || text="继续观看"][visibleToUser=true]',
          excludeMatches: '[text$="提前得"]', // 今日已领取-排除
          snapshotUrls: [
            'https://i.gkd.li/i/15140816',
            'https://i.gkd.li/i/24521416',
            'https://i.gkd.li/i/24521446',
            'https://i.gkd.li/i/24521516',
          ],
          exampleUrls: 'https://e.gkd.li/3b2a0948-3b77-419b-8acf-2166e1cd445c',
          excludeSnapshotUrls: 'https://i.gkd.li/i/24521416',
        },
        // 完成目标:今日畅听vip
        {
          key: 3,
          name: '③今日结束退出',
          fastQuery: true,
          actionDelay: 500,
          activityIds: [
            'com.bytedance.sdk.openadsdk.core.component.reward.activity.TTRewardVideoActivity',
            'com.bytedance.sdk.openadsdk.stub.activity.Stub_Standard_Portrait_Activity',
            'com.ss.android.excitingvideo.ExcitingVideoActivity',
          ],
          matches: '[text$="提前得"] +n [text="坚持退出"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/24521416',
          exampleUrls: 'https://e.gkd.li/8cc22cd9-f48e-4aaa-8c5c-a04a752e6df6',
        },
        // 2.新版本节点树(可直接识别状态领取奖励)
        {
          key: 4,
          name: '①x掉-领取成功_2', // 第二种节点树形式_可直接区分非轮询(版本19.1.0以上)
          versionCode: { minimum: 100191030 },
          fastQuery: true,
          matchRoot: true,
          actionDelay: 1200, //稳定节点树时间
          actionCd: 8000,
          activityIds: [
            'com.ss.android.excitingvideo.ExcitingVideoActivity',
            'com.luna.biz.ad.adns.luna.LunaRewardActivity',
          ],
          anyMatches: [
            '@ImageView[width<56 && height<56][visibleToUser=true] < [childCount=1] <n [childCount>6] <<(6,7) [id="android:id/content"]',
            '@[desc="领取成功，关闭，按钮"] <<3 [index=parent.childCount.minus(1)] <n ViewGroup < ViewGroup <3 FrameLayout <<5 [id="android:id/content"]',
            '@TextView[clickable=true] - [text="领取成功"][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/27359402', // 领取成功
            'https://i.gkd.li/i/27363266',
            'https://i.gkd.li/i/28018493', // UI2
            'https://i.gkd.li/i/28300641', // UI3_2026.05.27
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/27272574', // 未领取
        },
        // 2025_05_19 新UI
        {
          preKeys: [4],
          key: 5,
          name: '②领取奖励_2',
          versionCode: { minimum: 100191030 },
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '[desc="领取奖励" || desc^="再看一个" || desc="继续观看"][visibleToUser=true]',
          excludeMatches: [
            '[desc^="第" && desc$="日免费听"][visibleToUser=true]',
            '[desc="明日免费听" || desc="后日免费听"][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/28377268',
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/28301078', // 明日免费听
            'https://i.gkd.li/i/28021222', // 第x日免费听
          ],
        },
        {
          preKeys: [4, 5],
          key: 6,
          name: '③今日结束结束^_^_2',
          versionCode: { minimum: 100191030 },
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches: [
            '[desc$="提前得"][visibleToUser=true]',
            '[desc$="日免费听"]',
            '[desc="坚持退出"][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/28020902',
        },
        // 3.旧版
        // 领取奖励继续看视频(到第2个Ad后由order1接管)
        {
          preKeys: [4],
          name: '②领取奖励',
          versionCode: { minimum: 100191030 },
          actionMaximum: 1, // 限制次数
          order: 0,
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@[childCount=2] + ImageView[index=parent.childCount.minus(1)] <n [childCount=5] <<5 [id="android:id/content"]',
          position: {
            left: 'width * 0.50',
            top: 'width * 0.85',
          },
          snapshotUrls: 'https://i.gkd.li/i/27359717',
        },
        // 接管最后一个Ad观看点击结束
        {
          preKeys: [4],
          name: '③今日结束结束^_^',
          versionCode: { minimum: 100191030 },
          order: 1,
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@[childCount=2] + ImageView[index=parent.childCount.minus(1)] <n [childCount=5] <<5 [id="android:id/content"]',
          position: {
            left: 'width * 0.50',
            top: 'width * 1.00',
          },
          snapshotUrls: 'https://i.gkd.li/i/27359717',
        },
        // 回到主界面
        {
          // preKeys: [3, 4],
          preKeys: [3, 6],
          name: '④再看视频?-返回操作',
          fastQuery: true,
          activityIds: 'com.luna.biz.main.main.MainActivity',
          anyMatches: [
            '[text^="再看" || desc^="再看"][text$="个提前领" || desc$="个提前领"]',
            '@ViewGroup[childCount=0] <<2 [childCount=4] <<6 FrameLayout <<4 [id="android:id/content"]',
          ],
          action: 'back',
          snapshotUrls: [
            'https://i.gkd.li/i/26411131',
            'https://i.gkd.li/i/26905455',
            'https://i.gkd.li/i/28299305', // 新UI_2026.05.27
          ],
          exampleUrls: 'https://e.gkd.li/6fedf579-d3bc-46eb-b29f-679f469dcfea', //'https://e.gkd.li/d3902ed0-5e8d-4c0c-b8ae-5bf3f64c84a8',
        },
        //视频内二级全屏Ad
        {
          key: 98, // 这个UI太多了,用排除法只匹配x吧
          name: '视频内二级全屏Ad',
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            'ViewGroup[index=parent.childCount.minus(1)][width<60 && height<60][text=null][id=null][desc=null][visibleToUser=true][childCount=0]',
          excludeMatches: [
            '[desc$="日免费听"][visibleToUser=true]',
            '[desc="领取奖励" || desc^="再看一个" || desc="继续观看"][visibleToUser=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/28302996',
          exampleUrls: 'https://e.gkd.li/e55793b3-e443-4cd1-80b5-aaa6cd7f88aa',
        },
        //其他情况-无视频
        {
          key: 99,
          name: '无视频',
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@[clickable=true][width<120 && height<120] + LinearLayout > [text="当前无新视频"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/24522244',
        },
      ],
    },
    {
      key: 14,
      name: '局部广告-抖音看过视频提示浮窗',
      desc: '播放器右侧浮窗[xx视频已看: Int %]=> x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.luna.biz.main.main.MainActivity',
          matches:
            '[text^="抖音看过"][visibleToUser=true] <2 LinearLayout + TextView[text=""][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/28436303',
          exampleUrls: 'https://e.gkd.li/43510c30-15f5-4368-a7e6-f7e57587b51d',
        },
      ],
    },
    {
      key: 15,
      name: '功能类-误入直播后自动[退出]',
      desc: '配合 全自动看广告领VIP 使用',
      rules: [
        {
          name: '点击[右上角x]掉直播间',
          fastQuery: true,
          actionDelay: 500,
          activityIds: 'com.luna.biz.live.plugin.LunaDefaultLivePlayerActivity',
          matches:
            '@Button[desc="关闭"] -n [visibleToUser=true] >(4,5) [vid="name_layout"][childCount=2]',
          snapshotUrls: [
            'https://i.gkd.li/i/30159254',
            'https://i.gkd.li/i/30266403',
          ],
        },
      ],
    },
  ],
});
