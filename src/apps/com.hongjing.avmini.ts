import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.hongjing.avmini',
  name: 'Avmini',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          matches:
            '@View[clickable=true] - LinearLayout[childCount=2] > [text="广告"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/34912905',
          exampleUrls: 'https://e.gkd.li/2eb70154-559d-4637-a451-07f82145430b',
        },
      ],
    },
  ],
});
