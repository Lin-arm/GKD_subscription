import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.vivo.daemonService',
  name: 'VIVO服务',
  groups: [
    {
      key: 1,
      name: '功能类-自动关闭温度过低提示',
      desc: '温度过低... -> 点击确定',
      rules: [
        {
          fastQuery: true,
          matches:
            '[getChild(0).text^="温度过低"] < [id="android:id/topPanel"][visibleToUser=true] +2 * > LinearLayout[index=parent.childCount.minus(1)][childCount=1] > Button[text="确定"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/35131038',
          exampleUrls: 'https://e.gkd.li/124e048b-3ac5-4721-a357-b6bd2182c512',
        },
      ],
    },
  ],
});
