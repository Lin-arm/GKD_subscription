import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.hongjing.avmini',
  name: 'Avmini',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          matches:
            '@View[clickable=true] - LinearLayout[childCount=2] > [text="广告"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/34912905',
          exampleUrls: 'https://e.gkd.li/2eb70154-559d-4637-a451-07f82145430b',
        },
      ],
    },
    {
      key: 1,
      name: '全屏广告',
      fastQuery: true,
      activityIds: 'com.zasko.modulemain.mvpdisplay.activity.X35MainActivity',
      rules: [
        {
          key: 0,
          name: '腾讯SDK-1',
          matches:
            '@ImageView[childCount=0][text=null][desc=null][id=null][visibleToUser=true][width<90 && height<90] < FrameLayout[childCount=1][text=null][desc=null][id=null][parent.childCount>3] <n FrameLayout >(2,3) [text^="立即" || text$="详情" || text^="了解" || text="去微信看看" || text$="应用" || text="进入小程序" || text="领取优惠" || text="跳转微信"]',
          snapshotUrls: [
            'https://i.gkd.li/i/34913673',
            'https://i.gkd.li/i/34913869',
          ],
          exampleUrls: 'https://e.gkd.li/738128bb-4647-4d2e-9ccc-f7a33b39c74a',
        },
        {
          key: 1,
          name: '腾讯SDK-4',
          matches:
            '@ImageView[childCount=0][text=null][desc=null][id=null][visibleToUser=true][width<90 && height<90] < FrameLayout[childCount=1][text=null][desc=null][id=null] - FrameLayout[childCount>2] >3 [text^="立即" || text^="立刻" || text$="应用" || text="了解更多" || text="查看详情"]',
          snapshotUrls: 'https://i.gkd.li/i/34916377',
          exampleUrls: 'https://e.gkd.li/bfd5e7bd-1c11-4017-ba55-d62906883f56',
        },
      ],
    },
    {
      key: 2,
      name: '局部广告',
      fastQuery: true,
      activityIds: [
        'com.zasko.modulemain.mvpdisplay.activity.X35MainActivity',
        'com.noah.adn.huichuan.view.HCCommonActivity',
      ],
      rules: [
        {
          key: 0,
          name: '腾讯卡片1',
          matches:
            '[vid="native_ad_close_iv"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/34913988',
          exampleUrls: 'https://e.gkd.li/3ed12958-11b6-4958-acb5-83ef35db2606',
        },
        {
          key: 1,
          name: '小米米盟',
          matches:
            '[text="✕"][clickable=true][visibleToUser=true][vid$="_close"]',
          snapshotUrls: [
            'https://i.gkd.li/i/34914899',
            'https://i.gkd.li/i/34914902',
            'https://i.gkd.li/i/34914896',
          ],
          exampleUrls: 'https://e.gkd.li/dee6914b-9671-4085-ae8d-46b6328d356c',
        },
        {
          key: 2,
          name: '汇川',
          matches:
            '@[vid$="close_button"][clickable=true] < * +n * > [text^="广告"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/34915691',
          exampleUrls: 'https://e.gkd.li/b5af4052-6dbd-4194-afb6-f15e943555ae',
        },
      ],
    },
  ],
});
