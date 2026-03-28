import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.lingan.seeyou',
  name: '美柚',
  groups: [
    {
      key: 1,
      name: '局部广告-评论区上方卡片广告',
      desc: '点击关闭',
      rules: [
        {
          fastQuery: true,
          activityIds: '.ui.activity.community.topicdetail.TopicDetailActivity',
          matches: '[vid="v_close"]',
          snapshotUrls: 'https://i.gkd.li/i/14034770',
        },
      ],
    },
  ],
});
