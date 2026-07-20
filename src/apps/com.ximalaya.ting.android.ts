import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.ximalaya.ting.android',
  name: '喜马拉雅',
  groups: [
    {
      key: 1,
      name: '局部广告-播放页广告',
      fastQuery: true,
      activityIds: '.host.activity.MainActivity',
      rules: [
        {
          key: 3,
          matches:
            '@[visibleToUser=true] < ViewGroup[childCount=1] - ViewGroup[childCount=6] > [text="广告"]',
          exampleUrls: 'https://e.gkd.li/bbf93e2c-08b8-4155-b82c-89a629a62737',
          snapshotUrls: 'https://i.gkd.li/i/18500523',
        },
        {
          key: 4,
          actionCd: 300,
          matches:
            '[vid="main_buy_view_yellow_zone_btn_close" || vid="main_play_ad_close_real" || vid="main_card_close" || vid="x_play_ad_banner_close_real"][clickable=true]',
          exampleUrls: 'https://e.gkd.li/bf820eed-00ad-47a0-9581-8cdb3d76bde5',
          snapshotUrls: [
            'https://i.gkd.li/i/18683999',
            'https://i.gkd.li/i/24330967',
            'https://i.gkd.li/i/27471367', // 有2处广告,调短一点cd
          ],
        },
      ],
    },
    {
      key: 4,
      name: '分段广告-信息流广告',
      desc: '点击关闭-点击屏蔽',
      fastQuery: true,
      activityIds: [
        '.host.activity.MainActivity',
        '.adsdk.view.DislikeDialog.DislikeBottomDialog',
      ],
      rules: [
        {
          key: 0,
          matches:
            '[vid="xm_ad_close_real" || vid="main_close_layout"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/17112326',
            'https://i.gkd.li/i/17112313',
          ],
        },
        {
          preKeys: [0],
          matches:
            '@[clickable=true] > [text="屏蔽" || text="直接关闭" || text="不喜欢此内容"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13260487',
            'https://i.gkd.li/i/13275928',
            'https://i.gkd.li/i/17111444',
            'https://i.gkd.li/i/17111452',
            'https://i.gkd.li/i/24589005',
          ],
        },
      ],
    },
    {
      key: 7,
      name: '青少年模式',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.host.activity.MainActivity',
          matches: [
            '[text*="青少年模式"][vid="host_btn_set"]',
            '[vid="host_dialog_close"]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/12506209',
        },
      ],
    },
    {
      key: 11,
      name: '全屏广告-弹窗广告',
      fastQuery: true,
      activityIds: '.host.activity.MainActivity',
      rules: [
        {
          key: 0,
          matches: '[vid="main_iv_close"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13251713', //你可能感兴趣的专辑
            'https://i.gkd.li/i/29967591', //会员弹窗
            'https://i.gkd.li/i/30176023', //赠给好友免费听
          ],
          exampleUrls: [
            'https://e.gkd.li/8efcd568-13f2-4ac4-872a-fe6fc4affaec',
            'https://e.gkd.li/f82ca167-35a0-42b4-b955-c5ef6e5d94dd',
          ],
        },
        {
          key: 1,
          matches:
            '@[vid="host_close_firework"] +2 [vid="host_firework_ad_tag"]',
          snapshotUrls: 'https://i.gkd.li/i/13263421',
          exampleUrls: 'https://e.gkd.li/4f9a66b8-3bf5-4a8e-8ca6-db35625df270',
        },
      ],
    },
    {
      key: 12,
      name: '权限提示-通知权限',
      desc: '取消推送通知',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.host.activity.MainActivity',
          matches: [
            '[text*="通知权限"][visibleToUser=true]',
            '[text="取消" || text="暂不开启"][visibleToUser=true]',
          ],
          exampleUrls: 'https://e.gkd.li/ab40c096-d024-4b7c-9c6f-245beafd373a',
          snapshotUrls: [
            'https://i.gkd.li/i/13389145',
            'https://i.gkd.li/i/18391977',
            'https://i.gkd.li/i/20499323',
          ],
        },
      ],
    },
    {
      key: 13,
      name: '全屏广告-免流提示',
      desc: '关闭[开免流送会员]弹窗',
      rules: [
        {
          fastQuery: true,
          activityIds: '.host.activity.MainActivity',
          matches: '[vid="host_iv_close"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/2a7e189b-b935-4bbd-9672-c18f2bf454e9',
          snapshotUrls: 'https://i.gkd.li/i/18326083',
        },
      ],
    },
    {
      key: 15,
      name: '全屏广告-签到弹窗',
      rules: [
        {
          fastQuery: true,
          activityIds: '.host.activity.MainActivity',
          matches:
            'ImageView < @[clickable=true] < [visibleToUser=true] >3 [text="立即签到"]',
          snapshotUrls: 'https://i.gkd.li/i/30167710',
          exampleUrls: 'https://e.gkd.li/8b93b8fb-1d31-42d2-95a1-c76dc0186e96',
        },
      ],
    },
  ],
});
