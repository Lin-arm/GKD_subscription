import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'ai.x.grok',
  name: 'Grok',
  groups: [
    {
      key: 1,
      name: '评价提示',
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.main.GrokActivity',
          matches:
            'LinearLayout > [text$="您喜欢使用 Grok 吗？"][visibleToUser=true] + [vid="rating_bar"]',
          action: 'back',
          snapshotUrls: 'https://i.gkd.li/i/26644291',
          exampleUrls: 'https://e.gkd.li/a8196954-6b3f-4af7-a4a2-b43fb04211de',
        },
      ],
    },
  ],
});
