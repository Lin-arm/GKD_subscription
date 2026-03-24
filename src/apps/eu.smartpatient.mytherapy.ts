import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'eu.smartpatient.mytherapy',
  name: 'MyTherapy',
  groups: [
    {
      key: 1,
      name: '全屏广告',
      rules: [
        {
          key: 0,
          activityIds: 'com.google.android.gms.ads.AdActivity',
          matches:
            'View[childCount=3] + View > Button[clickable=true][index=parent.childCount.minus(1)][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/26159508',
            'https://i.gkd.li/i/26159509',
          ],
          exampleUrls: 'https://e.gkd.li/012e3aca-4d19-46e4-8873-5e4b15cec187',
        },
        {
          key: 1,
          activityIds: 'com.google.android.gms.ads.AdActivity',
          matches:
            'View[childCount=2] > TextView + View > Button[clickable=true][index=parent.childCount.minus(1)][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26159510',
          exampleUrls: 'https://e.gkd.li/631c83f3-097b-43e2-a05a-b5349ef211fc',
        },
      ],
    },
    {
      key: 2,
      name: '功能类-快速添加按需药物',
      desc: '添加一次性条目-按需要(第一个)',
      activityIds: '.feature.mainactivity.MainActivity',
      actionMaximum: 1,
      rules: [
        {
          key: 0,
          matches:
            'ScrollView >2 @[clickable=true] > [id="logOneTimeEntry"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26223457',
          exampleUrls: 'https://e.gkd.li/6cef22b5-89f0-4a39-ab01-4df740d1556b',
        },
        {
          preKeys: [0],
          matches:
            'ScrollView > TextView + @View[clickable=true] > TextView[visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26223492',
          exampleUrls: 'https://e.gkd.li/a1fa2f0b-a011-42bc-b6f4-d520007cf036',
        },
      ],
    },
  ],
});
