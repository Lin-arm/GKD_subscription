import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.kuaikan.comic',
  name: '快看漫画',
  groups: [
    {
      key: 2,
      name: '局部广告-漫画界面底部弹窗广告',
      activityIds: '.infinitecomic.view.ComicInfiniteActivity',
      rules: '[vid="adBannerClose"]',
      snapshotUrls: 'https://i.gkd.li/i/12910268',
    },
  ],
});
