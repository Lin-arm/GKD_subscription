import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.android.permissioncontroller',
  name: '权限控制器',
  groups: [
    {
      key: 1,
      name: '权限提示-定位权限',
      desc: '点击不允许',
      rules: [
        {
          fastQuery: true,
          activityIds: '.permission.ui.GrantPermissionsActivity',
          matches: [
            '[text*="位置信息权限"]',
            'Button[text="不允许"][clickable=true]',
          ],
          exampleUrls: 'https://e.gkd.li/801303af-ac30-4d06-b2f8-cfea98aa847a',
          snapshotUrls: 'https://i.gkd.li/i/24759204',
        },
      ],
    },
    {
      key: 2,
      name: '权限提示-vivo-指定媒体内容',
      desc: 'app最小权限原则授予指定图片/视频',
      fastQuery: true,
      actionMaximum: 1,
      actionDelay: 400, // 等待400ms，确保节点稳定
      forcedTime: 6000, // 主动查询6s
      activityIds: '.permission.ui.GrantPermissionsActivity',
      rules: [
        {
          key: 0,
          name: '下拉菜单',
          matches:
            '[vid="picture_control_layout"] > @[vid="control_picture_click_view"][clickable=true] > [vid="access_title"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26150081',
          exampleUrls: 'https://e.gkd.li/13fa7148-f101-4bbd-a1dd-9fbae4dea109',
        },
        {
          key: 1,
          preKeys: [0],
          name: '照片访问范围',
          excludeMatches: '[vid="vivo_pictures_control_view"][childCount=2]',
          matches:
            '[vid="control_picture_click_view"] + [vid="picture_control_view"] >2 @[vid="picture_control"][clickable=true][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26150082',
          exampleUrls: 'https://e.gkd.li/95f09c34-546b-436a-ac93-a5aa1cad687b',
          excludeSnapshotUrls: 'https://i.gkd.li/i/26150524',
        },
        {
          preKeys: [1],
          name: '指定照片', // 首次授权
          matches:
            'ListView > * + @* > [vid="item_content_with_dot"] > [vid="item_content"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26150084',
          exampleUrls: 'https://e.gkd.li/2b275e04-ae32-4e0e-80c9-411a15fc1f1a',
        },
        {
          preKeys: [0],
          name: '管理指定照片', // 以后授权
          matches:
            '@[vid="picture_set"][clickable=true] <2 [vid="vivo_pictures_control_view"][visibleToUser=true]',
          snapshotUrls: 'https://i.gkd.li/i/26150524',
          exampleUrls: 'https://e.gkd.li/434e23e3-ed97-4815-8896-aa0e50833cdd',
        },
      ],
    },
  ],
});
