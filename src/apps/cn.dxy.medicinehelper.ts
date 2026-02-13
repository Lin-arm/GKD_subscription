import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'cn.dxy.medicinehelper',
  name: '用药助手',
  groups: [
    {
      key: 1,
      name: '更新提示',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.MainComposeActivity',
          matches: [
            '[text*="新版本" || text$="更新"][visibleToUser=true]',
            '[vid="iv_close"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/25292995',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-自动领取每日叮当奖励',
      desc: '点击带有叮当+x的去学习并返回',
      rules: [
        {
          key: 0,
          activityIds: '.article.dailylearn.DailyLearnComposeActivity',
          matches:
            '@[clickable=true] > [text="去学习"] + [text^="+"][text$="丁当"]',
          snapshotUrls: 'https://i.gkd.li/i/25246837',
        },
        {
          preKeys: [0],
          activityIds:
            'cn.dxy.drugscomm.business.guide.simple.GuideSimpleComposeActivity',
          matches: 'View[childCount=5][clickable=false][visibleToUser=true]',
          action: 'back',
          snapshotUrls: 'https://i.gkd.li/i/25292779',
        },
      ],
    },
    {
      key: 3,
      name: '功能类-自动展开详细信息',
      desc: '药品说明书点击[展开]',
      activityIds: [
        '.article.dailylearn.DailyLearnComposeActivity',
        'cn.dxy.drugscomm.business.ebm.EbmContentComposeActivity',
        'cn.dxy.drugscomm.business.drug.detail.DrugDetailComposeActivity',
      ],
      rules: [
        {
          key: 0, //若有clickable则先点clickable的
          matches: '@[clickable=true] > [text="展开"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/25246982', //展开完整信息
            'https://i.gkd.li/i/25247525',
          ],
        },
        {
          key: 1,
          matches: '[text="展开"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25247361',
        },
      ],
    },
    {
      key: 4,
      name: '功能类-自动横屏观看表格',
      desc: '药品说明书表格 点击[横屏]',
      rules: [
        {
          activityIds:
            'cn.dxy.drugscomm.business.drug.detail.DrugDetailComposeActivity',
          matches: 'TextView[text="横屏"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/25247591',
        },
      ],
    },
    {
      key: 5,
      name: '全屏广告',
      rules: [
        {
          fastQuery: true,
          activityIds:
            'cn.dxy.drugscomm.business.guide.detail.GuideDetailComposeActivity',
          matches:
            '[text^="开通会员后"] -n @ImageView[clickable=true][width<100] <2 View <<4 [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/25247659',
        },
      ],
    },
    {
      key: 6,
      name: '局部广告',
      rules: [
        {
          fastQuery: true,
          activityIds:
            'cn.dxy.drugscomm.business.ebm.EbmContentComposeActivity',
          matches:
            '@ImageView[clickable=true] <2 View[index=parent.childCount.minus(1)] <n View <<2 ComposeView < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/25247624',
        },
      ],
    },
    {
      key: 7,
      name: '评价提示',
      desc: '问是否有帮助 x掉',
      rules: [
        {
          fastQuery: true,
          activityIds:
            'cn.dxy.drugscomm.business.medadviser.detail.MedAdviserDetailComposeActivity',
          matches:
            '@ImageView[clickable=true] -n TextView[text*="有帮助吗"] <2 View <<3 ComposeView < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/25247634',
        },
      ],
    },
  ],
});
