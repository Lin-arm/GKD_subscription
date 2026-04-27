import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'cn.luowice.anxiaojia',
  name: '安小家',
  groups: [
    {
      key: 1,
      name: '全屏广告-弹窗广告',
      desc: '点击[x]掉',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.example.anxiaojia.MainActivity',
          matches:
            '@View[id=""][text=null][clickable=true][width<107][height<107] - ImageView[width>540] < [childCount=2] < View < View < View < FrameLayout < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/27126440',
        },
      ],
    },
  ],
});
