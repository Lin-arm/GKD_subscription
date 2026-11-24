import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.dragon.read.oversea.gp',
  name: '番茄小说', // 疑似盗版?
  groups: [
    {
      key: 1,
      name: '权限提示-通知权限', // fork自`com.dragon.read`
      desc: '点击"取消"',
      fastQuery: true,
      activityIds: [
        '.widget.ConfirmDialogBuilder',
        '.pages.main.MainFragmentActivity',
        'com.dragon.read.pages.main.MainFragmentActivity',
      ],
      rules: [
        {
          key: 0,
          name: '首页',
          matchTime: 10000,
          actionMaximum: 1,
          resetMatch: 'app',
          matches: [
            '[text="开启推送提醒"][visibleToUser=true]',
            '[text="取消"][visibleToUser=true]',
          ],
        },
        {
          key: 1, // 通知权限对话框可能多次触发 https://github.com/Lin-arm/GKD_subscription/pull/135
          name: '小说阅读页',
          activityIds: '.reader.ui.ReaderActivity',
          matches: [
            '[text="开启推送通知"][visibleToUser=true]',
            '[text="取消"][visibleToUser=true]',
          ],
        },
        {
          key: 2,
          matches:
            'TextView[text="暂不开启"] < @[clickable=true] <n View < View < ComposeView < * < * < [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/35333111',
        },
      ],
    },
  ],
});
