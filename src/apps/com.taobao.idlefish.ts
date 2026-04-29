import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.taobao.idlefish',
  name: '闲鱼',
  groups: [
    {
      key: 1,
      name: '权限提示-通知权限',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds:
            'com.idlefish.flutterbridge.flutterboost.boost.FishFlutterBoostTransparencyActivity',
          matches:
            '@ImageView[clickable=true][desc=null] < [desc^="开启系统通知"]',
          snapshotUrls: 'https://i.gkd.li/i/13538351',
        },
      ],
    },
    {
      key: 2,
      name: '权限提示-手机信息权限',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.maincontainer.activity.MainActivity',
          matches: ['[text*="手机信息权限"]', '[text="取消"]'],
          exampleUrls: 'https://e.gkd.li/81e3e4d8-f297-4476-b22c-73f0b97879ee',
          snapshotUrls: 'https://i.gkd.li/i/13620277',
        },
      ],
    },
    {
      key: 3,
      name: '更新提示',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      activityIds: '.maincontainer.activity.MainActivity',
      rules: [
        {
          key: 0,
          matches: '[text="立即升级"] -2 [text="暂不升级"]',
          snapshotUrls: 'https://i.gkd.li/i/13832272',
        },
        {
          key: 1,
          matches:
            '@ImageView[text=null][desc=null][clickable=true][width>84 && width<124] - View[height<158] <2 [childCount=3] < RelativeLayout - [vid="fish_layer_js_native_window_background_view"]',
          snapshotUrls: 'https://i.gkd.li/i/26053923',
        },
      ],
    },
    {
      key: 4,
      name: '全屏广告',
      desc: '点击关闭',
      rules: [
        {
          key: 0,
          activityIds: '.maincontainer.activity.MainActivity',
          matches:
            'WebView[text="Rax App"] > [id="root"] >(3,6) View[index=parent.childCount.minus(1)][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/14551046',
            'https://i.gkd.li/i/24981766',
          ],
        },
        {
          key: 1,
          fastQuery: true,
          activityIds: '.search_implement.SearchResultActivity',
          matches:
            '@[index=parent.childCount.minus(1)][clickable=true][width<250][height<250] <n View <<6 m0 <<6 [vid="fish_layer_container_id"]',
          snapshotUrls: 'https://i.gkd.li/i/23125419',
        },
        {
          key: 2,
          fastQuery: true,
          activityIds:
            'com.idlefish.flutterbridge.flutterboost.boost.FishFlutterBoostActivity',
          matches:
            '@[clickable=true][width<200] <<(4,6) View[id="root"] <<(5,8) [vid="fish_layer_container_id"]',
          snapshotUrls: [
            'https://i.gkd.li/i/23183586',
            'https://i.gkd.li/i/25796344',
          ],
        },
      ],
    },
    // 该规则可能会出现多次触发一段后才能触发二段的情况，影响正常使用
    // {
    //   key: 5,
    //   name: '分段广告-信息流广告',
    //   forcedTime: 100000,
    //   activityIds: [
    //     'com.idlefish.flutterbridge.flutterboost.boost.FishFlutterBoostTransparencyActivity',
    //     'com.idlefish.flutterbridge.flutterboost.boost.FishFlutterBoostActivity',
    //     '.search_implement.SearchResultActivity',
    //     '.maincontainer.activity.MainActivity',
    //   ],
    //   rules: [
    //     {
    //       key: 0,
    //       action: 'longClick',
    //       matches:
    //         '@View[longClickable=true][desc$="广告"][visibleToUser=true] > [desc!=null][visibleToUser=true]',
    //       snapshotUrls: 'https://i.gkd.li/i/19593497',
    //       excludeSnapshotUrls: 'https://i.gkd.li/i/19604467',
    //     },
    //     {
    //       key: 1,
    //       fastQuery: true,
    //       action: 'longClick',
    //       matches: '@[longClickable=true] >3 [text="广告"][visibleToUser=true]',
    //       exampleUrls: 'https://e.gkd.li/ca42e088-6fae-4402-a000-06418bf054cf',
    //       snapshotUrls: 'https://i.gkd.li/i/19603954',
    //     },
    //     {
    //       key: 2,
    //       fastQuery: true,
    //       action: 'longClick',
    //       activityIds: '.maincontainer.activity.MainActivity',
    //       matches:
    //         '@[longClickable=true][childCount=0][visibleToUser=true] < FrameLayout > [text="广告"][visibleToUser=true]',
    //       exampleUrls: 'https://e.gkd.li/738c623e-58fe-45a1-9a28-957f0f812c72',
    //       snapshotUrls: 'https://i.gkd.li/i/19604324',
    //     },
    //     {
    //       preKeys: [0, 1, 2],
    //       matches: '[desc="引起不适"][visibleToUser=true]',
    //       snapshotUrls: [
    //         'https://i.gkd.li/i/19593500',
    //         'https://i.gkd.li/i/19603913',
    //         'https://i.gkd.li/i/19604317',
    //       ],
    //     },
    //   ],
    // },
    {
      key: 6,
      name: '功能类-自动点击[查看原图]',
      rules: [
        {
          activityIds: [
            'com.idlefish.flutterbridge.flutterboost.boost.FishFlutterBoostTransparencyActivity',
            'com.idlefish.flutterbridge.flutterboost.boost.FishFlutterBoostActivity',
          ],
          matches: '[desc="查看原图"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/15463399',
            'https://i.gkd.li/i/27207770',
          ],
          exampleUrls:
            'https://m.gkd.li/57941037/12b60303-4fb8-4786-b636-4efef10f3d78',
        },
      ],
    },
    {
      key: 7,
      name: '功能类-关闭小额免密支付',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.alipay.android.msp.ui.views.MspContainerActivity',
          matches:
            '@CheckBox[clickable=true][checked=true] < * - [text$="免密支付"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/23455398', // 关闭前
            'https://i.gkd.li/i/23455378', // 关闭后
          ],
        },
      ],
    },
    {
      key: 8,
      name: '功能类-Web登录自动授权',
      desc: '登录确认-打勾-确认登录',
      fastQuery: true,
      activityIds: 'com.taobao.login4android.scan.QrScanActivity',
      rules: [
        {
          key: 0,
          actionMaximum: 1,
          resetMatch: 'match',
          matches: '@[clickable=true] > [vid="confirm"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/25619592', // 未打勾_纯手拍快照
            'https://i.gkd.li/i/25620240', // 未打勾
          ],
        },
        {
          key: 1, // 目的跟key0一样，只不过以弹窗的形式出现
          matches: [
            '[text="服务协议及隐私保护"]',
            '[text="同意"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/25620304',
        },
        {
          key: 2,
          matches: [
            '[text="扫码登录"]',
            '[text="确认登录"][clickable=true][visibleToUser=true]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/25619659', // 旧版,无需打勾
            'https://i.gkd.li/i/25620267', // 已打勾(节点状态无变化)
          ],
          exampleUrls: 'https://e.gkd.li/9394183f-855c-4bd3-b089-272f6e9807ff',
        },
      ],
    },
    {
      key: 9,
      name: '局部广告',
      rules: [
        {
          fastQuery: true,
          activityIds: '.maincontainer.activity.MainActivity',
          matches:
            '@ImageView[clickable=true][width<100] <(2,5) FrameLayout <<(3,4) [vid="fish_layer_container_id"]',
          snapshotUrls: [
            'https://i.gkd.li/i/25796897',
            'https://i.gkd.li/i/26184285',
          ],
        },
      ],
    },
    {
      key: 10,
      name: '局部广告-悬浮广告',
      desc: '商品详情页右侧-x掉',
      rules: [
        {
          fastQuery: true,
          activityIds: '.detail.DetailActivity',
          matches:
            'Image[width<60 && height<60] < @View <n [childCount=2] < [id="root"] <<2 * <2 WebView <<2 [vid="fish_layer_container_id"]',
          snapshotUrls: 'https://i.gkd.li/i/26837679',
          exampleUrls: 'https://e.gkd.li/d08c424f-8411-4d65-ba23-02703e328176',
        },
      ],
    },
  ],
});
