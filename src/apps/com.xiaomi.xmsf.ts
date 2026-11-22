import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.xiaomi.xmsf',
  name: '小米服务框架',
  groups: [
    {
      key: 1,
      name: '权限提示-b站申请通知权限',
      desc: '(⚠️仅限哔哩哔哩app) 点击[拒绝]',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds:
            'com.xiaomi.xms.subscribe_remind.dialog.SubscribeDialogActivity',
          matches:
            '[text*="哔哩哔哩"] + [text*="通知"] +n [text="拒绝"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35232368',
          exampleUrls: 'https://e.gkd.li/d8b8754f-d66f-483a-b424-75951d782623',
        },
      ],
    },
  ],
});
