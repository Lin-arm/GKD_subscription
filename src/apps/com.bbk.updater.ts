import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.bbk.updater',
  name: '系统升级(VIVO)',
  groups: [
    {
      key: 1,
      name: '更新提示',
      desc: '按[返回键]',
      rules: [
        {
          fastQuery: true,
          activityIds: 'com.bbk.launcher2.Launcher',
          matches:
            '[text="下载并安装"] + [text="稍后提醒"][clickable=true][visibleToUser=true]',
          action: 'back',
          snapshotUrls: 'https://i.gkd.li/i/26644663',
          exampleUrls: 'https://e.gkd.li/bdd7cc82-a138-4f0b-b865-0be3168a319e',
        },
      ],
    },
  ],
});
