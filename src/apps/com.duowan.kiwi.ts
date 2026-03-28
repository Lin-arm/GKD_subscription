import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.duowan.kiwi',
  name: '虎牙直播',
  groups: [
    {
      key: 2,
      name: '局部广告-直播间悬浮广告',
      activityIds: '.liveroom.ChannelPage',
      rules: [
        {
          key: 0,
          fastQuery: true,
          matches: '[vid="ad_close"]',
          snapshotUrls: [
            'https://i.gkd.li/i/12901045',
            'https://i.gkd.li/i/12901044',
          ],
        },
        {
          key: 1,
          fastQuery: true,
          matches: '[vid="game_header_close"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13395604',
            'https://i.gkd.li/i/13395606',
          ],
        },
        {
          key: 2,
          fastQuery: true,
          matches: '[vid="popup_banner"] >2 [vid="ui_count_down"]',
          snapshotUrls: ['https://i.gkd.li/i/13417245'],
        },
        {
          key: 3,
          fastQuery: true,
          matches:
            '@ViewGroup[clickable=true][visibleToUser=true] <2 ViewGroup < FrameLayout <2 FrameLayout < [vid="miniapp_content_container"]',
          snapshotUrls: 'https://i.gkd.li/i/13401266',
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
      rules: [
        {
          activityIds: '.homepage.Homepage',
          matches: '@ImageView[vid="upgrade_cancel"]',
          snapshotUrls: 'https://i.gkd.li/i/13440833',
        },
      ],
    },
    {
      key: 4,
      name: '全屏广告-弹窗广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          key: 0,
          activityIds: '.homepage.Homepage',
          matches: '[vid="animation_view"] + [vid="v_close"]',
          snapshotUrls: 'https://i.gkd.li/i/13625453',
        },
      ],
    },
    {
      key: 5,
      name: '其他-root提示',
      desc: '点击确认',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.homepage.Homepage',
          matches: '[text^="您的设备已经被ROOT"] + LinearLayout [text="确认"]',
          snapshotUrls: 'https://i.gkd.li/i/13536744',
        },
      ],
    },
  ],
});
