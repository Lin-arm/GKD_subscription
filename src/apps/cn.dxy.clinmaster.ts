import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'cn.dxy.clinmaster',
  name: '临床决策',
  groups: [
    {
      key: 1,
      name: '更新提示',
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          activityIds: '.home.MainActivity',
          matches:
            '@[vid="iv_close"][clickable=true][visibleToUser=true] -2 [text="立即更新"]',
          snapshotUrls: 'https://i.gkd.li/i/25459821',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-自动点击翻译',
      desc: '引用内容-翻译',
      fastQuery: true,
      activityIds: '.home.MainActivity',
      rules: [
        {
          key: 0,
          matches:
            '@[text="翻译"][visibleToUser=true] < View[index=parent.childCount.minus(1)] -n * < View <2 * - [id="root"] <<5 * - View <<4 [id="android:id/content"]',
          excludeMatches:
            '@[text="已翻译"][visibleToUser=true] < View[index=parent.childCount.minus(1)] -n * < View <2 * - [id="root"] <<5 * - View <<4 [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/26181124',
          excludeSnapshotUrls: 'https://i.gkd.li/i/26181123',
          exampleUrls: [
            'https://e.gkd.li/fdb000e8-fda4-472a-904d-56a9d7c1edd2',
            'https://e.gkd.li/27bf621f-41cd-49e1-8923-54ce66d5d4a9',
          ],
        },
      ],
    },
    {
      key: 3,
      name: '评价提示',
      rules: [
        {
          fastQuery: true,
          activityIds: '.home.MainActivity',
          matches:
            '[text="以后"][visibleToUser=true] < @View[clickable=true] <3 View[childCount=4] <<6 [id="android:id/content"]',
          snapshotUrls: 'https://i.gkd.li/i/26181264',
          exampleUrls: 'https://e.gkd.li/3bc23861-5be3-4efe-a7c0-386d91ef7de7',
        },
      ],
    },
    {
      key: 4,
      name: '功能类-上传后自动修改处方',
      desc: 'OCR识别后-修改处方(补充信息)',
      fastQuery: true,
      activityIds: '.home.MainActivity',
      rules: [
        {
          matches:
            '[text="开始点评"] - @[text="修改处方"][visibleToUser=true] -n [text="处方信息"] < * < [id="root"] <<5 * - View <<4 [id="android:id/content"]',
          excludeMatches: [
            '[text="已完成处方点评"] - [text="开始点评"] - @[text="修改处方"][visibleToUser=true] -n [text="处方信息"] < * < [id="root"] <<5 * - View <<4 [id="android:id/content"]', // 已完成处方点评
            '[text="修改处方信息"] < View[childCount=2] < * <2 * - [id="root"] <<5 * - View <<4 [id="android:id/content"]', // 遮罩层
          ],
          snapshotUrls: 'https://i.gkd.li/i/26309504',
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/26309528',
            'https://i.gkd.li/i/26309912',
          ],
          exampleUrls: [
            'https://e.gkd.li/8733fcdb-1938-4d86-bac6-0f9a7a36078c',
            'https://e.gkd.li/edb0d201-e2c2-40fc-b5ff-3ecb1d4e9737',
            'https://e.gkd.li/5e21f21d-aeb9-4184-a65d-77f3eb47e408',
          ],
        },
      ],
    },
  ],
});
