import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.duowan.kiwi',
  name: '虎牙直播',
  groups: [
    {
      key: 1,
      name: '开屏广告',
      desc: '广告画面先出现,但节点最后才加载,故触发慢实属正常',
      fastQuery: true,
      forcedTime: 10000,
      matchTime: 10000,
      actionMaximum: 1,
      actionMaximumKey: 0,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          key: 0,
          matches: '[text*="跳过"][text.length<10][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/30792623',
            'https://i.gkd.li/i/30792625',
          ],
        },
        {
          // 应该只是 [text*="跳过"] 的快查属性没来得及加载,所以 key1 大概是没有机会触发的
          key: 1,
          matches: '[visibleToUser=true][text*="跳过"][text.length<10]',
          snapshotUrls: [
            'https://i.gkd.li/i/30793734',
            'https://i.gkd.li/i/30794399',
            // 'https://i.gkd.li/i/30795405',  //开屏广告节点未加载
          ],
        },
      ],
    },
    {
      key: 2,
      name: '局部广告-直播间悬浮广告',
      fastQuery: true,
      activityIds: '.liveroom.ChannelPage',
      rules: [
        {
          key: 0,
          matches:
            '[vid="ad_close" || vid="game_header_close" || vid="iv_vertical_close"][clickable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/12901045', //旧, ad_close
            'https://i.gkd.li/i/12901044', //旧, ad_close
            'https://i.gkd.li/i/13395604', //旧, game_header_close
            'https://i.gkd.li/i/13395606', //旧, game_header_close
            'https://i.gkd.li/i/35090738', // iv_vertical_close
          ],
          exampleUrls: 'https://e.gkd.li/8a375b99-4905-476c-8ff6-c27f4ef7a613',
        },
        {
          key: 1,
          matches:
            '@[desc="关闭"] <n ViewGroup +2 FrameLayout >3 [text="广告"]',
          snapshotUrls: 'https://i.gkd.li/i/35090752',
          exampleUrls: 'https://e.gkd.li/178268bf-af87-45b2-a41b-707b3bb5461a',
        },
        {
          key: 2,
          matches: '[vid="popup_banner"] >2 [vid="ui_count_down"]',
          snapshotUrls: 'https://i.gkd.li/i/13417245',
        },
        {
          key: 3,
          activityIds: ['.liveroom.ChannelPage', '.homepage.Homepage'],
          matches:
            '@[id=null][visibleToUser=true][width<72 && height<72][right>prev.right.minus(20)] <<n [vid="miniapp_content_container"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13401266', //无vid旧快照
            'https://i.gkd.li/i/35090761',
          ],
          exampleUrls: 'https://e.gkd.li/fdb69898-e142-4bcb-be1c-408d6a9fd392',
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
