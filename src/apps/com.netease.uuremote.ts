import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.netease.uuremote',
  name: 'UU远程',
  groups: [
    {
      key: 1,
      name: '权限提示-通知提示',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.remote.app.ui.activity.MainActivity',
          matches: [
            '[text="开启消息通知"]',
            '[text="以后再说"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/23787454',
        },
      ],
    },
    {
      key: 2,
      name: '更新提示',
      desc: '点击[暂不更新]',
      matchTime: 20000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.remote.app.ui.activity.ComposeMainActivity',
          matches:
            '@View[getChild(0).text$="不更新"][clickable=true][visibleToUser=true] -n TextView[text$="更新"] < [childCount=4] < * <2 View < ComposeView < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/35130030',
          exampleUrls: 'https://e.gkd.li/427b504d-30f3-4e18-b525-5be6a6787801',
        },
      ],
    },
  ],
});
