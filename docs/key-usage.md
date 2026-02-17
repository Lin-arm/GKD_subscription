## key 值规范

项目对于单个文件中的 key 值有以下要求：

1. 规则组 (groups) 按照 key 值从上到下增加的方式排序

    ```ts
    groups: [
      {
        key: 1,
        // ...
      },{
        key: 2,
        // ...
      },
    ],
    ```

2. 新增规则组的 key 值使用以前的规则组中最大的 key 值 +1

这是因为 GKD 通过 key 值区分用户手动配置的规则开关状态等，如果新的规则组使用以前的 key 值，会将以前配置的开关状态等覆盖到新规则上。

相关讨论：

- https://github.com/orgs/gkd-kit/discussions/950
- https://github.com/AIsouler/GKD_subscription/discussions/1528

