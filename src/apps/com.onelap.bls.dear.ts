import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.onelap.bls.dear',
  name: '顽鹿运动',
  groups: [
    {
      key: 0,
      name: '开屏广告',
      desc: '延迟1s点击跳过,避免太早点击被误判异常互动而锁满 5s',
      fastQuery: true,
      matchTime: 10000,
      actionMaximum: 1,
      resetMatch: 'app',
      priorityTime: 10000,
      rules: [
        {
          key: 0,
          actionDelay: 1000, // 等广告 SDK 跳过按钮进入就绪窗口再点，避免被误判异常互动而锁满 5s
          matches: '[vid="ll_skip_advertisement_splash"][clickable=true]',
          snapshotUrls: [
            // 'https://i.gkd.li/i/34574331', // 启动屏-->开屏广告
            'https://i.gkd.li/i/34618778', // 开屏广告
          ],
        },
      ],
    },
  ],
});
