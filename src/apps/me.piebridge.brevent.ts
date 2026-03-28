import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'me.piebridge.brevent',
  name: '黑阈',
  groups: [
    {
      key: 1,
      name: '权限提示-权限不足弹窗',
      desc: '点击取消',
      fastQuery: true,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          activityIds: '.ui.BreventActivity',
          matches: ['[text^="黑阈服务权限不足"]', '[text="取消"]'],
          snapshotUrls: 'https://i.gkd.li/i/13218439',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-已黑阈无法打开app',
      desc: '每次打开弹窗-取消',
      rules: [
        {
          fastQuery: true,
          activityIds: '.ui.BreventActivity',
          matches:
            'LinearLayout[childCount=3] >2 *[childCount=2] > [text="取消"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26143603',
          exampleUrls: 'https://e.gkd.li/9a61e111-6285-41bd-b5fd-ec64a0e2675e',
        },
      ],
    },
  ],
});
