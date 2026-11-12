import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.oplus.appdetail',
  name: 'OPPO/一加应用安装器',
  groups: [
    {
      key: 1,
      name: '功能类-自动安装应用',
      desc: '点击 ①已知悉风险 ②[仍然安装] ③[继续安装] ④[完成]',
      fastQuery: true,
      activityIds: [
        '.model.guide.ui.InstallGuideActivity', //A
        '.modelv2.parsing.PackageParsingV2Activity', //B
      ],
      rules: [
        {
          key: 10,
          name: '①[勾选]已知悉风险',
          matches:
            '[text^="已知悉"][text*="风险"][checkable=true][checked=false]',
          snapshotUrls: [
            'https://i.gkd.li/i/22377327', //A
            'https://i.gkd.li/i/33898132', //B
          ],
          exampleUrls: 'https://e.gkd.li/509a2a45-c9bd-4b7e-9496-ced36ebdaaf6',
        },
        {
          key: 20,
          name: '②点击[仍然安装]',
          excludeMatches: '[text^="已知悉"][text*="风险"][checked=false]', //排除 [未勾选]已知悉风险的
          matches: '[text="仍然安装"][clickable=true]',
          snapshotUrls: 'https://i.gkd.li/i/34736203', //A
        },
        {
          key: 30,
          name: '③点击[继续安装]',
          excludeMatches:
            '[vid="view_scanning_and_tip_view_tv_title"][text^="正在扫描"]',
          matches:
            '[vid="view_bottom_guide_continue_install_btn" || text="继续安装"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13054204', //A
            'https://i.gkd.li/i/13038570', //A
            'https://i.gkd.li/i/23146291', //A
            'https://i.gkd.li/i/23146289', //B
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/13038560', //A 扫描病毒阶段不进行点击
        },
        {
          key: 31,
          name: '③坐标点击[继续安装]',
          position: {
            left: 'width * 0.6078',
            top: 'height * 0.7742',
          },
          matches: '[text$="继续安装"][text*="未通过"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/34736192', //A
        },
        {
          key: 40,
          name: '④点击[完成]',
          activityIds: '.model.finish.InstallFinishActivity',
          matches: '[text="完成"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13038664',
            'https://i.gkd.li/i/13054849',
          ],
        },
      ],
    },
    {
      key: 2,
      name: '功能类-安装中高风险应用',
      fastQuery: true,
      activityIds: '.model.guide.ui.InstallGuideActivity',
      rules: [
        {
          key: 0,
          position: {
            left: 'width * 0.726',
            top: 'height * 0.5',
          },
          matches: '[text="不建议安装此应用；若仍需安装，可查看详情"]',
          exampleUrls: 'https://e.gkd.li/8697d1e8-fa9c-4b5b-92b9-559f55672047',
          snapshotUrls: 'https://i.gkd.li/i/22377287',
        },
        {
          preKeys: [0],
          key: 1,
          matches: '[text="已知悉应用风险"][checked=false]',
          exampleUrls: 'https://e.gkd.li/45246cef-1ef5-49bf-8b7f-09377bde823a',
          snapshotUrls: 'https://i.gkd.li/i/22377327',
        },
        {
          preKeys: [1],
          matches: '[text="仍然安装"]',
          exampleUrls: 'https://e.gkd.li/45246cef-1ef5-49bf-8b7f-09377bde823a',
          snapshotUrls: 'https://i.gkd.li/i/22377327',
        },
      ],
    },
  ],
});
