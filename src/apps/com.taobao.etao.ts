import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.taobao.etao',
  name: '一淘',
  groups: [
    {
      key: 2,
      name: '全屏广告-弹窗广告',
      fastQuery: true,
      activityIds: '.app.homev4.HomeV4Activity',
      rules: [
        {
          key: 0,
          matches:
            '@ImageView[width<150 && height<150] <2 FrameLayout < [vid="dialog_container"]',
          snapshotUrls: 'https://i.gkd.li/i/30859236',
        },
        {
          key: 1,
          matches:
            'ImageView[width<150 && height<150] < @[clickable=true] + [vid="dialog_container"]',
          snapshotUrls: 'https://i.gkd.li/i/30859577',
        },
        {
          key: 2,
          matches:
            '@View[id=null][visibleToUser=true][width<150 && height<150][parent.childCount=3] <<n [vid="dialog_container"]',
          snapshotUrls: 'https://i.gkd.li/i/30859628',
        },
        {
          key: 3,
          activityIds: '.app.home.view.NewHomeActivity',
          matches:
            'ImageView[width<150 && height<150] < @RelativeLayout[clickable=true][childCount=1] <2 [childCount=2] < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/30859526', //旧快照,无快查 (已转成webp截图)
        },
      ],
    },
    {
      key: 3,
      name: '更新提示',
      desc: '点击[取消]',
      // matchTime: 10000, //从其他应用做任务跳转打开的一淘,做完任务回到一淘首页才出现更新弹窗,不止10秒
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.maintab.MainTabActivity',
          matches: [
            '[text*="更新" || text*="新版本" || text*="升级"][visibleToUser=true]',
            '[text="取消"][clickable=true]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/35125923',
        },
      ],
    },
    {
      key: 10,
      name: '权限提示-通知权限',
      desc: '点击x掉',
      actionMaximum: 3,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: [
            'com.taobao.sns.app.message.MessageActivity',
            '.mine.MetaXMineActivity',
            '.app.homev4.HomeV4Activity',
          ],
          matches:
            '@[text=null][clickable=true][width<150][childCount=0] -(1,2) [text*="开"][text*="通知"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/12684278', // 旧快照,无快查属性
            'https://i.gkd.li/i/12684351', // 旧快照
            'https://i.gkd.li/i/30634250',
          ],
        },
      ],
    },
  ],
});
