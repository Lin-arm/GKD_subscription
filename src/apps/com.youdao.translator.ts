import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.youdao.translator',
  name: '有道翻译官',
  groups: [
    {
      key: 1,
      name: '局部广告-翻译界面-结果下方广告',
      desc: '点击关闭',
      rules: [
        {
          fastQuery: true,
          activityIds: '.activity.trans.TransResultActivity',
          matches: '@ImageView[vid="close_iv"] + [vid="native_ad_flag_tv"]',
          snapshotUrls: 'https://i.gkd.li/i/13259910',
        },
      ],
    },
  ],
});
