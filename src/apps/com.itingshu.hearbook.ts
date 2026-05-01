import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.itingshu.hearbook',
  name: '爱听书',
  groups: [
    {
      key: 1,
      name: '全屏广告',
      rules: [
        {
          fastQuery: true,
          activityIds: 'io.dcloud.PandoraEntryActivity',
          matches:
            '[vid="fl_app_info_bar"] - [vid="xml_interstitial_fl_show_container"] > [text="关闭"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/27268355',
          exampleUrls: 'https://e.gkd.li/4fc8c584-746d-44d4-b3aa-a45eb4ddf792',
        },
      ],
    },
  ],
});
