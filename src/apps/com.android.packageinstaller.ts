import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.android.packageinstaller',
  name: '软件包安装程序',
  groups: [
    {
      key: 1,
      name: '功能类-自动安装应用',
      desc: '点击[安装/继续安装/完成]',
      fastQuery: true,
      forcedTime: 10000,
      activityIds: [
        '.PackageInstallerActivity', //A
        '.FlymePackageInstallerActivity', //B
        '.PackageInterceptActivity', //C
        '.NewInstallInstalling', //D
        '.InstallSuccess', //E
        '.oplus.InstallAppProgress', //F
        '.DeleteStagedFileOnResult', //G
      ],
      rules: [
        {
          key: 0,
          name: '点击[继续安装]',
          anyMatches: [
            '[text="继续安装"][clickable=true][focusable=true]',
            '@[clickable=true][focusable=true] >(1,2,4) [text="继续安装"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/13206444', //A
            'https://i.gkd.li/i/14046749', //A
            'https://i.gkd.li/i/16550275', //B
            'https://i.gkd.li/i/23621117', //C
            'https://i.gkd.li/i/34127356', //C
          ],
          excludeSnapshotUrls: [
            'https://i.gkd.li/i/23621105', //C   [focusable=false]
            'https://i.gkd.li/i/22870985', //C
          ],
        },
        {
          key: 1,
          name: '点击[完成]',
          excludeMatches: '[text^="应用未安装" || text*="安装失败"]',
          anyMatches: [
            '[text="完成"][clickable=true][focusable=true]',
            '@[clickable=true][focusable=true] >(1,2,4) [text="完成"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/13206476', //D
            'https://i.gkd.li/i/13766420', //D
            'https://i.gkd.li/i/13962438', //null
            'https://i.gkd.li/i/14138323', //E
            'https://i.gkd.li/i/14471862', //F
            'https://i.gkd.li/i/16550273', //B
            'https://i.gkd.li/i/25816401', //D
            'https://i.gkd.li/i/33746542', //D
            'https://i.gkd.li/i/34127373', //D
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/26314449', // 安装失败停止点击
          exampleUrls: 'https://e.gkd.li/00166afa-f8cb-4389-87b0-948a5a75f3d5',
        },
        {
          key: 2,
          name: '点击[安装]',
          matches: '[vid="confirm_bottom_button_layout"]',
          snapshotUrls: 'https://i.gkd.li/i/14228348', //G
        },
        {
          key: 4,
          position: {
            left: 'width * 1.5394',
            top: 'height * 0.5',
          },
          excludeMatches: '[text="继续安装" || text="完成"]',
          matches:
            'LinearLayout[childCount=1] > Button[text="取消"][childCount=0]',
          snapshotUrls: [
            'https://i.gkd.li/i/14969116', //A
            'https://i.gkd.li/i/17158050', //G
          ],
        },
      ],
    },
    {
      key: 2,
      name: '功能类-授权本次安装',
      rules: [
        {
          fastQuery: true,
          position: {
            left: 'width * 0.4609',
            top: 'height * 0.75',
          },
          activityIds: '.PackageInterceptActivity',
          matches:
            '[vid="tv_install_guide"][text*="授权本次安装"][visibleToUser=true]',
          exampleUrls: 'https://e.gkd.li/6ad6e4c6-3cb7-41b2-a37b-bcaa3c06de34',
          snapshotUrls: 'https://i.gkd.li/i/24465121',
        },
      ],
    },
    {
      key: 3,
      name: '功能类-继续安装高风险应用',
      desc: '点击[仍要继续/无视风险安装]',
      rules: [
        {
          fastQuery: true,
          activityIds: '.PackageInterceptActivity', //C
          matches: [
            '[text*="风险"][text*="发现" || text*="存在"][visibleToUser=true]',
            '@[clickable=true][focusable=true] >2 [text="仍要继续" || text="无视风险安装"]',
          ],
          snapshotUrls: [
            'https://i.gkd.li/i/24540505',
            'https://i.gkd.li/i/31602264',
          ],
          exampleUrls: [
            'https://e.gkd.li/2961e749-6aac-4f74-b7f7-268ecc0e14f4',
            'https://e.gkd.li/f23d301b-22d0-4c9f-b208-c1d9b6425b9d',
          ],
        },
      ],
    },
    {
      key: 4,
      name: '功能类-勾选[已了解应用风险检测结果]',
      desc: '配合 自动安装应用 规则使用',
      order: -1, // 优先于 key1
      rules: [
        {
          fastQuery: true,
          forcedTime: 10000,
          activityIds: [
            '.PackageInstallerActivity', //A
            '.PackageInterceptActivity', //C
            '.NewInstallInstalling', //D
            '.InstallStart',
          ],
          matches:
            'CheckBox[vid="checkbox" || vid="deleted_file_state_cb"][checked=false]',
          snapshotUrls: [
            'https://i.gkd.li/i/14595443', //A 未勾选
            'https://i.gkd.li/i/22870985', //C 未勾选
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/23621117', //C 已勾选 [checked=true]
          exampleUrls: [
            'https://e.gkd.li/8ebedfcf-9d68-485c-b4b1-e8e2dc42bbd8', // HUAWEI
            'https://e.gkd.li/d197b6ad-a931-498f-b817-fb90c911d67b', // VIVO
          ],
        },
      ],
    },
    {
      key: 5,
      name: '功能类-InstallerX自动安装',
      desc: 'InstallerX无特权情况下自动确认',
      rules: [
        {
          name: '点击[安装/更新]',
          fastQuery: true,
          matches:
            '[id="android:id/button1"][text="更新" || text="安装"][visibleToUser=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/29594607',
            'https://i.gkd.li/i/29594599',
          ],
          activityIds: '.PackageInstallerActivity',
        },
      ],
    },
    {
      key: 6,
      name: '功能类-确认[未查询到此应用的 ICP 核准信息]',
      matchTime: 10000,
      resetMatch: 'app',
      rules: [
        {
          fastQuery: true,
          matches: [
            'TextView[text*="未查询到此应用的 ICP 核准信息"]',
            '@Button[text="知道了"] -n Button[text="取消安装"]',
          ],
          snapshotUrls: 'https://i.gkd.li/i/34431696',
          activityIds: '.PackageInstallerActivity',
        },
      ],
    },
  ],
});
