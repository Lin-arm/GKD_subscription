import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.klcxkj.zqxy_kaihe',
  name: '悦享校园',
  groups: [
    {
      key: 1,
      name: '局部广告',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: '.ui.MainUserActivity',
          anyMatches: [
            '@ImageView[visibleToUser=true] < FrameLayout -3 ImageView < FrameLayout[childCount=4] <<n [vid="adv_container_layout"]',
            'LinearLayout[childCount=2] - @ImageView[clickable=true][visibleToUser=true] <2 FrameLayout[childCount=3] < [vid="adv_container_layout"]',
            'ImageView[index=parent.childCount.minus(1)] < @[clickable=true] <<n ViewGroup <3 ViewGroup - ViewGroup >3 [text="广告"][visibleToUser=true] <<n [vid="adv_container_layout"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/25928209',
            'https://i.gkd.li/i/25928092',
            'https://i.gkd.li/i/25929445',
          ],
          exampleUrls: [
            'https://e.gkd.li/526e700e-018e-4642-a89e-e7936b17dd2a',
            'https://e.gkd.li/341cfc8b-b625-4ee0-9928-f4a302f491fe',
            'https://e.gkd.li/22de1939-c412-40ce-a979-4aeb3f7f5923',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '全屏广告',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: '.ui.ConsumeActivity',
          anyMatches: [
            'ImageView[visibleToUser=true] < @[clickable=true] < ViewGroup + *[childCount=2] > [text="广告"]',
            '@ImageView[visibleToUser=true] < * <<n FrameLayout[childCount=3] < * +7 ImageView -3 * > [text$="查看详情"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/25931841',
            'https://i.gkd.li/i/25929002',
          ],
          exampleUrls: [
            'https://e.gkd.li/578f3304-96d8-4e43-bfa9-07cd85ca6f8d',
            'https://e.gkd.li/06e41609-81a1-4b71-bd32-d83b66afe247',
          ],
        },
        {
          key: 1,
          fastQuery: true,
          activityIds:
            'com.bytedance.sdk.openadsdk.stub.activity.Stub_Standard_Activity_T',
          matches:
            '@ImageView[index=parent.childCount.minus(1)] < FrameLayout <n * + * > ImageView - * > [text^="应​用​名​称​"]',
          snapshotUrls: 'https://i.gkd.li/i/25935365',
          exampleUrls: 'https://e.gkd.li/029e1258-ef6c-4474-991b-7925d9e73e9e',
        },
        {
          key: 2,
          fastQuery: true,
          activityIds: 'com.beizi.ad.v2.activity.BeiZiNewInterstitialActivity',
          matches: '@[clickable=true] > [vid="beizi_interstitial_ad_close_iv"]',
          snapshotUrls: 'https://i.gkd.li/i/25929116',
          exampleUrls: 'https://e.gkd.li/cca3f65f-1441-4bd6-88da-e61c325f6340',
        },
      ],
    },
  ],
});
