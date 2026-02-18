## key 值规范

规则组的 `key` 属性是规则组在列表中的唯一标识，也是客户端禁用/启用此规则组的依据。

> [!TIP]
> 规则类别是通过 `name` 的前几个字符判断的，而不是 `key` 值。

项目对于单个文件中的 `key` 值有以下要求：

1. `groups` 中的规则组按照 `key` 值从上到下递增的方式排序

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

2. 新增规则组的 `key` 值使用 `之前最大的 key 值 +1`

这是因为 GKD 通过 key 值区分用户手动配置的禁用/启用状态，如果新的规则组使用以前的 key 值，会将以前配置中的禁用/启用状态覆盖到新规则组上。

### 示例

如果发现以前规则组的key值不是连续的，有缺失，如下：

```ts
groups: [
  {
    key: 1,
    // ...
  },{
    key: 2,
    // ...
  },{
    key: 4,
    // ...
  },{
    key: 5,
    // ...
  },{
    key: 6,
    // ...
  },
],
```

说明这里以前有规则组，在新版本中被移除了。新增规则组应该按照如下修改：

- ❎不符合要求
  
  ```ts
  groups: [
    {
      key: 1,
      // ...
    },{
      key: 2,
      // ...
    },{
      key: 3, // 新规则组
      // ...
    },{
      key: 4,
      // ...
    },{
      key: 5,
      // ...
    },{
      key: 6,
      // ...
    },
  ],
  ```

- ✅符合要求

  ```ts
  groups: [
    {
      key: 1,
      // ...
    },{
      key: 2,
      // ...
    },{
      key: 4,
      // ...
    },{
      key: 5,
      // ...
    },{
      key: 6,
      // ...
    },{
      key: 7, // 新规则组
      // ...
    },
  ],
  ```

相关讨论：

- https://github.com/orgs/gkd-kit/discussions/950
- https://github.com/AIsouler/GKD_subscription/discussions/1528

[相关 API](https://gkd.li/api/interfaces/RawGroupProps#key)
