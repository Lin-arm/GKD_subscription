import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.netease.android.cloudgame',
  name: '网易云游戏',
  groups: [
    {
      key: 1,
      name: '全屏广告',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.MainActivity',
          matches:
            '@[vid="guide_close_btn"][clickable=true][visibleToUser=true] - [vid="content_container"]',
          snapshotUrls: 'https://i.gkd.li/i/25573586',
        },
      ],
    },
    {
      key: 2,
      name: '局部广告',
      rules: [
        {
          key: 0,
          fastQuery: true,
          activityIds: '.activity.MainActivity',
          anyMatches: [
            '@ImageView[clickable=true][visibleToUser=true] -n RelativeLayout > [text*="广告"]',
            'ViewGroup[childCount=2] > [vid="banner_content"] + [vid="close_btn"][clickable=true][visibleToUser=false]',
            '@ImageView[clickable=true][visibleToUser=true] -2 ImageView < RelativeLayout[childCount=3] <<n [vid="sign_ad_card"]',
            'ImageView < * -2 * >n @ImageView[visibleToUser=true] < * -2 * < FrameLayout[childCount=3] <<n [vid="sign_ad_card"]',
            'ImageView -3 @ImageView[clickable=true][visibleToUser=true] - * < RelativeLayout[childCount=5] <<n [vid="mine_ui_ad_layout"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/25573743',
            'https://i.gkd.li/i/25573674',
            'https://i.gkd.li/i/25574104',
            'https://i.gkd.li/i/25619258',
          ],
          exampleUrls: [
            'https://e.gkd.li/91afc489-ac6e-452c-9b75-d15336e11989',
            'https://e.gkd.li/217312d8-5dd5-48c3-a6c2-448608674957',
            'https://e.gkd.li/b1194340-db45-4ece-85a5-04447b12a2e9',
          ],
        },
      ],
    },
    {
      key: 3,
      name: '功能类-自动签到',
      desc: '自动点击签到领时长',
      fastQuery: true,
      activityIds: '.activity.MainActivity',
      rules: [
        {
          key: 0,
          matches:
            '[vid="sign_btn"][text="签到"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25574104',
        },
        {
          preKeys: [0],
          matches: '[vid="sign_title"] + [vid="sign_acquire_title"]',
          action: 'back',
          snapshotUrls: 'https://i.gkd.li/i/25574182',
        },
      ],
    },
  ],
});
