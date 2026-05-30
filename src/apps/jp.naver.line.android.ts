import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'jp.naver.line.android',
  name: 'LINE',
  groups: [
    {
      key: 1,
      name: '分段广告-主页信息流广告',
      fastQuery: true,
      activityIds: [
        '.activity.main.MainActivity',
        'com.linecorp.liff.impl.LiffActivity',
      ],
      rules: [
        {
          key: 0,
          name: '①點擊[更多]',
          matches:
            '[vid$="ad_view"] > [vid="content_frame"] > [vid="more_button"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28415817',
          exampleUrls: 'https://e.gkd.li/149307bc-4b5b-4069-87aa-867d3fa04d6e',
        },
        {
          preKeys: [0],
          key: 1,
          name: '②點擊[隱藏此Ad]',
          matches:
            '[text^="隱藏此" || text^="隐藏此"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28415850',
          exampleUrls: 'https://e.gkd.li/b7d09ffe-aa81-4ef5-9e68-3a08d5228d19',
        },
        {
          preKeys: [1],
          key: 2,
          name: '③點擊"任意個理由"坐標(相對)',
          actionMaximum: 1, // 防止特殊情況盲點
          position: {
            left: 'width * 0.13',
            top: 'width * 0.57',
          },
          matches:
            '[text="隱藏廣告" || text="隐藏广告" || text^="Mute"][visibleToUser=true] <<3 [vid="liff_header_view"] + [vid="liff_webview_container"]',
          snapshotUrls: 'https://i.gkd.li/i/28415926',
          exampleUrls: 'https://e.gkd.li/c3f3d067-0c33-4bf0-b42b-50731e86f8dd',
        },
        {
          preKeys: [2],
          name: '④x掉[反饋窗口]',
          matches:
            'Button -2 [text^="謝謝" || text^="谢谢"] <<7 [text="隱藏廣告" || text="隐藏广告" || text^="Mute"][visibleToUser=true] <<2 [vid="liff_webview_container"] - * >2 [vid="liff_header_close_button_img"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/28416020',
          exampleUrls: 'https://e.gkd.li/e8cc8681-b023-4319-840a-fa4674c64dad',
        },
      ],
    },
  ],
});
