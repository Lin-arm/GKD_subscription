import { defineGkdApp } from '@gkd-kit/define';

export default defineGkdApp({
  id: 'com.android.packageinstaller',
  name: '软件包安装程序',
  groups: [
    {
      key: 1,
      name: '功能类-自动安装应用',
      fastQuery: true,
      forcedTime: 10000,
      activityIds: [
        '.PackageInstallerActivity',
        '.FlymePackageInstallerActivity',
        '.PackageInterceptActivity',
        '.NewInstallInstalling',
        '.InstallSuccess',
        '.oplus.InstallAppProgress',
        '.DeleteStagedFileOnResult',
      ],
      rules: [
        {
          key: 0,
          name: '点击[继续安装]',
          matches:
            '[text="继续安装"][focusable=true || parent.focusable=true || parent.parent.focusable=true]',
          snapshotUrls: [
            'https://i.gkd.li/i/13206444',
            'https://i.gkd.li/i/14046749',
            'https://i.gkd.li/i/16550275',
            'https://i.gkd.li/i/23621117',
          ],
          excludeSnapshotUrls: 'https://i.gkd.li/i/23621105',
        },
        {
          key: 1,
          name: '点击[完成]',
          matches: '[text="完成"]',
          snapshotUrls: [
            'https://i.gkd.li/i/13206476',
            'https://i.gkd.li/i/13766420',
            'https://i.gkd.li/i/13962438',
            'https://i.gkd.li/i/14138323',
            'https://i.gkd.li/i/14471862',
            'https://i.gkd.li/i/16550273',
          ],
        },
        {
          key: 2,
          name: '点击[安装]',
          matches: '[vid="confirm_bottom_button_layout"]',
          snapshotUrls: 'https://i.gkd.li/i/14228348',
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
            'https://i.gkd.li/i/14969116',
            'https://i.gkd.li/i/17158050',
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
      name: '功能类-自动继续安装高危风险应用',
      rules: [
        {
          fastQuery: true,
          activityIds: '.PackageInterceptActivity',
          matches: [
            '[text="该应用存在高危风险"][visibleToUser=true]',
            '@[clickable=true] >2 [text="仍要继续"][visibleToUser=true]',
          ],
          exampleUrls: 'https://e.gkd.li/2961e749-6aac-4f74-b7f7-268ecc0e14f4',
          snapshotUrls: 'https://i.gkd.li/i/24540505',
        },
      ],
    },
    {
      key: 4,
      name: '功能类-勾选[已了解应用风险检测结果]',
      desc: 'VIVO/HUAWEI适配',
      fastQuery: true,
      activityIds: [
        '.PackageInterceptActivity',
        '.PackageInstallerActivity',
        '.InstallStart',
        '.NewInstallInstalling',
      ],
      rules: [
        {
          key: 0,
          name: '勾选[已了解应用风险检测结果]',
          matches:
            '[vid="checkbox" || vid="deleted_file_state_cb"][checked=false]',
          snapshotUrls: [
            'https://i.gkd.li/i/14595443', // HUAWEI
            'https://i.gkd.li/i/22870985', // VIVO
          ],
          exampleUrls: [
            'https://e.gkd.li/8ebedfcf-9d68-485c-b4b1-e8e2dc42bbd8', // HUAWEI
            'https://e.gkd.li/d197b6ad-a931-498f-b817-fb90c911d67b', // VIVO
          ],
        },
        {
          key: 1,
          name: '点击[继续安装]',
          preKeys: [0],
          matches: '@LinearLayout[clickable=true][id=null] > [text="继续安装"]',
          action: 'clickCenter', // log得知已发出点击事件，但系统未响应
          snapshotUrls: 'https://i.gkd.li/i/22870985',
          exampleUrls: 'https://e.gkd.li/d197b6ad-a931-498f-b817-fb90c911d67b',
        },
        {
          preKeys: [1],
          name: '点击[完成]',
          matches: '@[clickable=true][vid="done_button"]',
          excludeMatches: '[text^="应用未安装" || text*="安装失败"]',
          snapshotUrls: 'https://i.gkd.li/i/25816401',
          excludeSnapshotUrls: 'https://i.gkd.li/i/26314449', // 安装失败停止点击
          exampleUrls: [
            'https://e.gkd.li/00166afa-f8cb-4389-87b0-948a5a75f3d5',
            'https://e.gkd.li/e335f324-0d13-4023-8640-d6d03d8f9250', // 安装失败停止点击
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
  ],
});
