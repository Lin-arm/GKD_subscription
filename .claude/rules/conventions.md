# 编码规范与项目约定

## 自动提交规范

每当你完成一个独立功能的开发，或修复完一个 Bug 并验证通过后，请自动运行 `git commit` 提交代码。

**触发条件：**

- 完成一个独立功能的开发
- 修复完一个 Bug 并验证通过
- 重构完成并确认功能正常

**Commit message 格式：**

```
<摘要：一句话概括改动内容>

- 具体改动 1
- 具体改动 2
```

- 使用中文描述
- 摘要简洁明了，一句话概括
- 描述详细但简洁，列出具体做了什么

**示例：**

```
修复 Python 脚本编码问题

- 将 extractor.py 中的 UTF-8 编码声明移到文件顶部
- 修复 checker.py 中中文字符导致的 UnicodeDecodeError
- 统一所有脚本使用 utf-8 编码
```

### 提交前检查

- 提交前必须保证本地测试全部通过，禁止跳过任何测试

## PR 约束

PR 检查强制要求每次 PR **最多修改 1 个订阅源文件**（即仅允许修改一个 `src/apps/*.ts`、`src/categories.ts`、`src/globalGroups.ts` 或 `src/subscription.ts`）。

## Git 钩子

通过 `simple-git-hooks` + `lint-staged` 实现：

- **pre-commit**：对暂存的 `.ts`/`.tsx`/`.js`/`.mjs`/`.cjs` 文件执行 ESLint + Prettier；对 `.json` 文件执行 Prettier；对 `.py` 文件执行 ruff check + ruff format
- **commit-msg**：commitlint（遵循 conventional commits，详见 `commitlint.config.ts`）
- **pre-push**：`pnpm run check` + 条件运行 Python 测试（仅当 `scripts/python/` 或 `.github/workflows/` 有变更时触发 ruff check + 39 个单元测试）

## 代码风格

### TypeScript

- 遵循 ESLint + Prettier 配置
- 使用 `@gkd-kit/define` 提供的类型安全 API

### Python

- 文件使用 UTF-8 编码
- 类型注解（Python 3.10+ 语法）
- dataclass 用于数据结构
- 遵循 ruff 静态检查（规则：E/W/F/I/B/UP）
- 不使用第三方库，仅使用 Python 标准库
- YAML Step 名称使用中文

## 构建输出

| 文件                     | 说明                                              |
| ------------------------ | ------------------------------------------------- |
| `dist/gkd.json5`         | GKD 应用消费的主订阅文件                          |
| `dist/README.md`         | 自动生成的应用/规则数量摘要                       |
| `dist/gkd.version.json5` | 版本跟踪                                          |
| `dist/CHANGELOG.md`      | 自动生成的变更日志                                |
| 根目录 `README.md`       | 构建时从 `Template.md` 重新生成，包含当前统计数据 |
