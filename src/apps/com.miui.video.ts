import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.miui.video',
  name: '小米视频',
  groups: [
    {
      key: 1,
      name: '分段广告-卡片广告',
      desc: '该广告的第二段需开启[智能服务]的对应规则才能关闭',
      fastQuery: true,
      rules: [
        {
          key: 0,
          activityIds: '.feature.detail.NewShortVideoDetailActivity',
          matches:
            '[vid="pause_ad_close_img" || vid="iv_ad" || vid="v_banner_bottom_right"][clickable=true][visibleToUser=true]',
          exampleUrls:
            'https://m.gkd.li/57941037/cd25f4a5-64db-4471-8eea-3d84a34ffb72',
          snapshotUrls: [
            'https://i.gkd.li/i/16044569',
            'https://i.gkd.li/i/16044569',
          ],
        },
      ],
    },
  ],
});
