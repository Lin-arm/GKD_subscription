import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.onelap.bls.dear',
  name: '顽鹿运动',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      desc: '图二开屏广告出现后延迟1s点击跳过（避开广告跳过按钮就绪窗口）',
      fastQuery: true,
      matchTime: 8000,
      actionMaximum: 1,
      resetMatch: 'app',
      rules: [
        {
          // 命中真正的跳过容器：图二一开始它就存在且 clickable=true
          // 不门控 childCount，所以倒计时中（"跳过 5"）即触发 → 即"开始后跳过"
          // 图一品牌屏无此 vid，不会误触（避开之前的锁死 bug）
          matches: ['[vid="ll_skip_advertisement_splash"][clickable=true]'],
          actionDelay: 1000, // 等广告 SDK 跳过按钮进入就绪窗口再点，避免被误判异常互动而锁满 5s
          snapshotUrls: [
            'https://i.gkd.li/i/34574331', // 图一品牌屏（无跳过，作 exclude 参考）
            'https://i.gkd.li/i/34574359', // 图二真开屏广告（"跳过 5"）
          ],
        },
      ],
    },
  ],
});
