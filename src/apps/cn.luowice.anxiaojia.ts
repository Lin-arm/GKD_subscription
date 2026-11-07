import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'cn.luowice.anxiaojia',
  name: '安小家',
  groups: [
    {
      key: 1,
      name: '全屏广告-弹窗广告',
      desc: '点击x掉',
      fastQuery: true,
      activityIds: 'com.example.anxiaojia.MainActivity',
      rules: [
        {
          key: 1,
          matches: '@[vid="leyou_tv_close"] - [vid="leyou_iv_ad"]',
          snapshotUrls: 'https://i.gkd.li/i/32037567',
        },
        {
          key: 2,
          matches:
            'ImageView - @FrameLayout[childCount=1] - LinearLayout[index=0] >3 [text*="跳转至"][text*="或"][text.length>10]',
          snapshotUrls: [
            'https://i.gkd.li/i/31909890',
            'https://i.gkd.li/i/31909892',
          ],
          exampleUrls: 'https://e.gkd.li/3e1be68a-42b7-4b76-8f37-5e1686131c07',
        },
        {
          key: 3,
          matches:
            '@[clickable=true][id*="close"] +n [visibleToUser=true] > [text="广告"]',
          snapshotUrls: 'https://i.gkd.li/i/32418085',
        },
        {
          key: 4,
          matches:
            '@View[id=""][text=null][clickable=true][width<107][height<107] - ImageView[width>540] < [childCount=2] < View < View < View < FrameLayout < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/27126440',
        },

        // 其他 activityId
        {
          key: 10,
          forcedTime: 10000,
          activityIds: 'com.byazt.az.Stub_Standard_Portrait_Activity',
          matches:
            '@ImageView[width<71] < [visibleToUser=true] < [childCount=1] < [childCount=1] <2 [childCount=2] >6 [text="点击到落地页或三方APP"]',
          snapshotUrls: 'https://i.gkd.li/i/32418708',
        },
        {
          key: 11,
          activityIds: [
            'com.byazt.x.Stub_Standard_Portrait_Activity',
            'com.byazt.az.Stub_Standard_Portrait_Activity',
          ],
          matches:
            '@Image[width<72] < View < View - View > [visibleToUser=true][text="反馈"]', //无快查
          snapshotUrls: [
            'https://i.gkd.li/i/30507034',
            'https://i.gkd.li/i/32418089',
          ],
        },
        {
          key: 12,
          activityIds: 'cj.mobile.fw.activity.PtgInteractionPortraitActivity',
          matches: '[vid="closeAdvertLayout"]',
          snapshotUrls: 'https://i.gkd.li/i/32036987',
        },
        {
          key: 13,
          activityIds: 'com.beizi.ad.v2.activity.BeiZiNewInterstitialActivity',
          matches: '[vid="beizi_interstitial_ad_close_container_rl"]',
          snapshotUrls: 'https://i.gkd.li/i/32038130',
        },
      ],
    },

    {
      key: 2,
      name: '更新提示',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.example.anxiaojia.MainActivity',
          matches:
            '@[desc="下次再说"] <n View < View < View < View < FrameLayout < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/28833151',
        },
      ],
    },
    {
      key: 3,
      name: '局部广告',
      desc: '点击x掉',
      fastQuery: true,
      activityIds: 'com.example.anxiaojia.MainActivity',
      rules: [
        {
          key: 1,
          matches:
            '@ImageView[clickable=true][width<91] <3 FrameLayout[childCount>4] > [text$="详情" || text="AD" || text*="了解"][text.length<10]',
          snapshotUrls: [
            'https://i.gkd.li/i/31909604', //查看详情、了解详情
            'https://i.gkd.li/i/31909610', //点击了解详情、AD
            'https://i.gkd.li/i/32036980', //了解详情
            'https://i.gkd.li/i/32037808', //点击了解详情、了解更多
          ],
          exampleUrls: 'https://e.gkd.li/48938d69-52df-4da8-b387-715fd5ee03a3',
        },
        {
          key: 2,
          matches:
            '@ImageView[clickable=true][width<91] -(1,2) TextView[text*="快手" || text*="红果" || text*="淘宝" || text*="京东" || text*="拼多多" || text*="美团" || text*="饿了么"]',
          snapshotUrls: [
            'https://i.gkd.li/i/32036977', //快手
            'https://i.gkd.li/i/32037625', //红果
          ],
        },
        {
          key: 3, //无快查
          matches:
            '[width>parent.width.minus(120)] - @ImageView[clickable=true][width<91 && height<91] -(1,2) TextView[text.length>6] <(1,2,3) FrameLayout[childCount>4][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/32418084',
            'https://i.gkd.li/i/32418087',
            'https://i.gkd.li/i/32418478',
            'https://i.gkd.li/i/34518515',
          ],
        },
      ],
    },
  ],
});
