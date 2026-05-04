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
          matches:
            '@View[childCount=2][index=1] >2 [text$="天体验卡" || text^="VIP"][visibleToUser=true]',
          position: {
            left: 'width * 0.90',
            top: 'width * 0.09',
          },
          snapshotUrls: 'https://i.gkd.li/i/26757915',
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
          name: '开屏自动看视频',
          key: 0,
          fastQuery: true,
          activityIds: 'com.luna.biz.main.main.MainActivity',
          actionMaximum: 1,
          priorityTime: 5000,
          resetMatch: 'app',
          matches:
            '[vid="ui"] >3 @[clickable=true] < ViewGroup +3 View > [text="今日畅听"] + [text^="第" || text$="个"]',
          snapshotUrls: 'https://i.gkd.li/i/26758188',
          exampleUrls: 'https://e.gkd.li/194773d6-a9c0-48c4-84bf-e1a57449434b',
        },
        {
          key: 1,
          name: '①x掉-坐标轮询点击',
          fastQuery: true,
          actionDelay: 8000,
          position: {
            left: 'width * 3.28',
            top: 'width * 0.2',
          },
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            'FlattenUIText[text="广告"] + [text$="声音"] + [text="反馈"][visibleToUser=true]', // [反馈]相对坐标点击成功率高大概率
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
          key: 2,
          name: '①跳过',
          activityIds:
            'com.bytedance.sdk.openadsdk.core.component.reward.activity.TTRewardVideoActivity',
          matches: '[visibleToUser=true][text="奖励已领取"]',
          snapshotUrls: 'https://i.gkd.li/i/24522627',
        },
        {
          key: 3,
          name: '①x掉-领取成功_2', // 第二种节点树形式_可直接区分非轮询(版本19.1.0以上)
          versionCode: { minimum: 100191030 },
          fastQuery: true,
          forcedTime: 560000, // (UI更新不通知)一个Ad平均40s,两个/day,七天14个Ad,9min20s
          actionDelay: 1200, //稳定节点树时间
          actionCd: 8000,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@ImageView[width<56 && height<56][visibleToUser=true] < [childCount=1] <n [childCount>6] <<(6,7) [id="android:id/content"]',
          snapshotUrls: [
            'https://i.gkd.li/i/27359402', // 领取成功
            'https://i.gkd.li/i/27363266',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/27272574', // 未领取
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
        {
          key: 99,
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
      name: '功能类-关闭广告的声音',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches: '[text="开启声音"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/24522999',
          excludeSnapshotUrls: 'https://i.gkd.li/i/24521440',
        },
        {
          key: 1,
          fastQuery: true,
          actionCd: 40000,
          versionCode: { minimum: 100191030 },
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@ImageView[width<57 && height<78][visibleToUser=true] - ScrollView <n [childCount>6] <<(6,7) [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/27365536',
          exampleUrls: 'https://e.gkd.li/7d86c22c-bbf3-419e-bd6f-eecdaf357872',
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
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.luna.biz.main.main.MainActivity',
          matches: '[vid="fl_pendant_container"] > [vid="view_close"]',
          exampleUrls:
            'https://m.gkd.li/57941037/8a427d5f-680b-4562-9cf3-90b1db82df0f',
          snapshotUrls: 'https://i.gkd.li/i/13674376',
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
          name: '开屏自动看视频',
          key: 0,
          fastQuery: true,
          activityIds: 'com.luna.biz.main.main.MainActivity',
          actionMaximum: 1,
          priorityTime: 5000,
          resetMatch: 'app',
          matches:
            '[vid="ui"] >3 @[clickable=true] < ViewGroup +3 View > [text="今日畅听"] + [text^="第" || text$="个"]',
          snapshotUrls: 'https://i.gkd.li/i/26758188',
          exampleUrls: 'https://e.gkd.li/194773d6-a9c0-48c4-84bf-e1a57449434b',
        },
        {
          name: '①x掉-坐标轮询点击', // 形式1-主要
          key: 1,
          fastQuery: true,
          actionDelay: 8000,
          position: {
            left: 'width * 3.28',
            top: 'width * 0.2',
          },
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            'FlattenUIText[text="广告"] + [text$="声音"] + [text="反馈"][visibleToUser=true]', // [反馈]相对坐标点击成功率高大概率
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
          name: '①跳过', // 形式2
          key: 2,
          activityIds:
            'com.bytedance.sdk.openadsdk.core.component.reward.activity.TTRewardVideoActivity',
          matches: '[visibleToUser=true][text="奖励已领取"]',
          snapshotUrls: 'https://i.gkd.li/i/24522627',
        },
        {
          key: 3,
          name: '①x掉-领取成功_2', // 第二种节点树形式_可直接区分非轮询(版本19.1.0以上)
          versionCode: { minimum: 100191030 },
          fastQuery: true,
          forcedTime: 88000, // (UI更新不通知)一个Ad平均40s,两个/day,+8s冗余
          actionDelay: 1200, //稳定节点树时间
          actionCd: 8000,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@ImageView[width<56 && height<56][visibleToUser=true] < [childCount=1] <n [childCount>6] <<(6,7) [id="android:id/content"]',
          snapshotUrls: [
            'https://i.gkd.li/i/27359402', // 领取成功
            'https://i.gkd.li/i/27363266',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/27272574', // 未领取
        },
        {
          name: '②没结束-继续轮询',
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
        {
          preKeys: [3],
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
        {
          key: 4,
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
        {
          preKeys: [3],
          name: '③今日结束结束^_^_2',
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
        {
          preKeys: [4],
          name: '④再看视频?-返回操作',
          fastQuery: true,
          activityIds: 'com.luna.biz.main.main.MainActivity',
          matches: '[text$="畅听"] + [text^="再看"][text$="个提前领"]',
          action: 'back',
          snapshotUrls: [
            'https://i.gkd.li/i/26411131',
            'https://i.gkd.li/i/26905455',
          ],
          exampleUrls: 'https://e.gkd.li/d3902ed0-5e8d-4c0c-b8ae-5bf3f64c84a8',
        },
        {
          key: 99, // 未知
          fastQuery: true,
          activityIds: 'com.ss.android.excitingvideo.ExcitingVideoActivity',
          matches:
            '@[clickable=true][width<120 && height<120] + LinearLayout > [text="当前无新视频"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/24522244',
        },
      ],
    },
  ],
});
