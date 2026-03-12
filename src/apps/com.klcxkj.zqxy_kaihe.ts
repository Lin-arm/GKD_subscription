import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.klcxkj.zqxy_kaihe',
  name: '悦享校园',
  groups: [
    {
      "key": 0,          
      "name": "悦享校园",
      "rules": [
        {
          "key": 1,      
          "matches": ["[vid='adv_container_layout'] > FrameLayout > ImageView[index=1]"],
          "action": "clickNode",
          "snapshotUrls": "https://i.gkd.li/i/25928092"
        },
        {
          "key": 2,      
          "matches": ["[vid='adv_container_layout'] ImageView[width=33][height=33][visibleToUser=true]"],
          "action": "clickCenter",
          "snapshotUrls": "https://i.gkd.li/i/25928209"
        },
        {
          "key": 4,
          "matches": ["[id='android:id/content'] ImageView[width=55][height=55][visibleToUser=true]"],
          "action": "clickCenter",
          "snapshotUrls": "https://i.gkd.li/i/25929002",
          "excludeMatches": ["[vid='my_account_layout']"],
          "actionCd": 1500,
          "actionDelay": 800
        },
        {
          "key": 5,
          "matches": ["[vid='beizi_interstitial_ad_close_iv']"],
          "action": "clickCenter",
          "snapshotUrls": "https://i.gkd.li/i/25929116",
          "actionCd": 1500,
          "actionDelay": 800
        },
        {
          "key": 6,
          "matches": ["[vid='adv_container_layout'] ImageView[width=32][height=33][visibleToUser=true]"],
          "action": "clickCenter",
          "snapshotUrls": "https://i.gkd.li/i/25929445",
          "actionCd": 1500
        },
        {
          "key": 7,
          "matches": ["[id='android:id/content'] [desc='top_close_button'][clickable=true]"],
          "action": "clickNode",
          "actionCd": 1500,
          "snapshotUrls": "https://i.gkd.li/i/25931841"
        },
        {
          "key": 8,
          "matches": ["[id='android:id/content'] ImageView[width=58][height=58][visibleToUser=true]"],
          "action": "clickCenter",
          "actionCd": 1500,
          "snapshotUrls": "https://i.gkd.li/i/25935365"
        }
      ]
    },
  ],
}); 