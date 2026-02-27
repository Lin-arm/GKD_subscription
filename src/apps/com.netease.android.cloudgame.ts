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
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/25573743',
            'https://i.gkd.li/i/25573674',
            'https://i.gkd.li/i/25574104',
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
