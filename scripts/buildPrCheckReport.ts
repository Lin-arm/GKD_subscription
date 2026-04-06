import fs from 'node:fs/promises';
import path from 'node:path';

type StepOutcome = 'success' | 'failure' | 'skipped' | 'cancelled' | 'unknown';

type Args = {
  changedFilesFile: string;
  keyFilesLimitOutcome: StepOutcome;
  checkLogFile: string;
  checkOutcome: StepOutcome;
  formatLogFile: string;
  formatOutcome: StepOutcome;
  formatStatusFile: string;
  lintLogFile: string;
  lintOutcome: StepOutcome;
  dirtyStatusFile: string;
  dirtyOutcome: StepOutcome;
  hasAutofixCommit: boolean;
  outDir: string;
};

type ReportSummary = {
  shouldFail: boolean;
  sections: {
    keyFilesLimit: boolean;
    projectCheck: boolean;
    codeFormat: boolean;
    lint: boolean;
    worktreeClean: boolean;
  };
};

const parseOutcome = (value: string | undefined): StepOutcome => {
  const normalized = value?.trim();
  if (
    normalized === 'success' ||
    normalized === 'failure' ||
    normalized === 'skipped' ||
    normalized === 'cancelled'
  ) {
    return normalized;
  }

  return 'unknown';
};

// 这个脚本只负责把各检查步骤的结果整理成可读评论和统一 gate 报告，
// 不直接调用 GitHub API，也不决定 workflow 的执行顺序。
const parseArgs = (): Args => {
  const args = process.argv.slice(2);
  const getArg = (name: string) => {
    const index = args.indexOf(name);
    if (index === -1 || index === args.length - 1) {
      throw new Error(`Missing required argument: ${name}`);
    }
    return args[index + 1];
  };

  return {
    changedFilesFile: getArg('--changed-files-file'),
    keyFilesLimitOutcome: parseOutcome(getArg('--key-files-limit-outcome')),
    checkLogFile: getArg('--check-log-file'),
    checkOutcome: parseOutcome(getArg('--check-outcome')),
    formatLogFile: getArg('--format-log-file'),
    formatOutcome: parseOutcome(getArg('--format-outcome')),
    formatStatusFile: getArg('--format-status-file'),
    lintLogFile: getArg('--lint-log-file'),
    lintOutcome: parseOutcome(getArg('--lint-outcome')),
    dirtyStatusFile: getArg('--dirty-status-file'),
    dirtyOutcome: parseOutcome(getArg('--dirty-outcome')),
    hasAutofixCommit: getArg('--has-autofix-commit') === 'true',
    outDir: getArg('--out-dir'),
  };
};

const readTextIfExists = async (filePath: string) => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch {
    return '';
  }
};

const readLines = async (filePath: string) =>
  (await readTextIfExists(filePath))
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const formatStatusLabel = (passed: boolean) =>
  passed ? '✅ 通过' : '❌ 未通过';

const toBulletList = (items: string[]) =>
  items.length === 0 ? ['- 无'] : items.map((item) => `- \`${item}\``);

const toCodeBlock = (text: string) => {
  const trimmed = text.trim();
  return trimmed.length === 0 ? '' : ['```text', trimmed, '```'].join('\n');
};

const tailLog = (text: string, maxLines: number) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);

  return lines.slice(-maxLines).join('\n');
};

const parseStatusFiles = (text: string) => {
  const files = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => line.slice(3).trim())
    .map((line) => {
      if (line.includes(' -> ')) {
        return line.split(' -> ').at(-1) ?? line;
      }
      return line;
    });

  return [...new Set(files)];
};

// 评论分为固定的几个检查段落：
// 文件数量、项目检查、代码格式、静态检查、处理建议。
// 每段都给出状态、必要的定位信息，以及对新人友好的下一步操作提示。
const buildComment = async (args: Args) => {
  const changedFiles = await readLines(args.changedFilesFile);
  const checkLog = await readTextIfExists(args.checkLogFile);
  const formatLog = await readTextIfExists(args.formatLogFile);
  const lintLog = await readTextIfExists(args.lintLogFile);
  const formatChangedFiles = parseStatusFiles(
    await readTextIfExists(args.formatStatusFile),
  );
  const dirtyFiles = parseStatusFiles(
    await readTextIfExists(args.dirtyStatusFile),
  );

  const keyFilesLimitPassed = args.keyFilesLimitOutcome === 'success';
  const projectCheckPassed = args.checkOutcome === 'success';
  const codeFormatPassed =
    args.formatOutcome === 'success' && formatChangedFiles.length === 0;
  const lintPassed = args.lintOutcome === 'success';
  const worktreeClean =
    args.dirtyOutcome === 'success' && dirtyFiles.length === 0;

  const shouldFail =
    !keyFilesLimitPassed ||
    !projectCheckPassed ||
    !codeFormatPassed ||
    !lintPassed ||
    !worktreeClean;

  const sections: string[] = [
    '<!-- gkd-pr-check -->',
    '## PR 检查结果',
    '',
    '本流程用于 **PR 合并门禁与指引**，会告诉你哪里没过，但**不会自动改仓库或替你推送修复**。',
    '',
    '### 关键文件数量',
    `- 状态：${formatStatusLabel(keyFilesLimitPassed)}`,
    '- 规则：以下关键文件在单个 PR 中最多改动 1 个：`src/apps/*.ts`、`src/categories.ts`、`src/globalGroups.ts`、`src/subscription.ts`',
    '- 命中文件：',
    ...toBulletList(changedFiles),
  ];

  if (!keyFilesLimitPassed) {
    sections.push(
      `- 当前共命中 **${changedFiles.length}** 个关键文件，已超过上限，请拆分 PR 后重试。`,
    );
  }

  sections.push(
    '',
    '### 项目检查',
    `- 状态：${formatStatusLabel(projectCheckPassed)}`,
    '- 命令：`pnpm run check`',
  );

  if (!projectCheckPassed) {
    const checkSnippet = toCodeBlock(tailLog(checkLog, 40));
    sections.push(
      '- 摘要：',
      checkSnippet ||
        '```text\n未能读取到有效的检查输出，请打开 Actions 日志查看完整报错。\n```',
    );
  }

  sections.push(
    '',
    '### 代码格式',
    `- 状态：${formatStatusLabel(codeFormatPassed)}`,
    '- 命令：`pnpm run format`',
  );

  if (formatChangedFiles.length > 0) {
    sections.push(
      '- 本地仍需提交的格式化文件：',
      ...toBulletList(formatChangedFiles),
    );
  } else {
    sections.push('- 本地仍需提交的格式化文件：', '- 无');
  }

  if (args.formatOutcome === 'failure') {
    const formatSnippet = toCodeBlock(tailLog(formatLog, 30));
    sections.push(
      '- 摘要：',
      formatSnippet ||
        '```text\n格式化步骤执行失败，请打开 Actions 日志查看完整报错。\n```',
    );
  }

  sections.push(
    '',
    '### 静态检查',
    `- 状态：${formatStatusLabel(lintPassed && worktreeClean)}`,
    '- 命令：`pnpm run lint`',
  );

  if (!lintPassed) {
    const lintSnippet = toCodeBlock(tailLog(lintLog, 40));
    sections.push(
      '- 摘要：',
      lintSnippet ||
        '```text\n未能读取到有效的 lint 输出，请打开 Actions 日志查看完整报错。\n```',
    );
  }

  if (dirtyFiles.length > 0) {
    sections.push('- 当前工作区仍有未提交改动：', ...toBulletList(dirtyFiles));
  } else {
    sections.push('- 当前工作区仍有未提交改动：', '- 无');
  }

  sections.push('', '### 处理建议');

  const suggestions = [
    '`pnpm run check`：先修复订阅结构、issue form 或脚本校验错误',
    '`pnpm run format`：同步本地格式化结果并重新提交',
    '`pnpm run lint`：处理剩余静态检查错误并重新提交',
  ];

  if (args.hasAutofixCommit) {
    suggestions.push(
      '检测到 push 流水线自动修复提交，请先同步分支最新提交后再重新查看 PR 检查结果',
    );
  } else {
    suggestions.push(
      '如分支后续收到 bot 的 `chore(actions): check_format_lint` 提交，请先同步分支最新提交',
    );
  }

  sections.push(...suggestions.map((item) => `- ${item}`));

  return {
    comment: sections.join('\n').trim(),
    summary: {
      shouldFail,
      sections: {
        keyFilesLimit: keyFilesLimitPassed,
        projectCheck: projectCheckPassed,
        codeFormat: codeFormatPassed,
        lint: lintPassed,
        worktreeClean,
      },
    } satisfies ReportSummary,
  };
};

// 主入口只产出两个文件：
// 1. comment.md：给 GitHub comment 直接使用
// 2. summary.json：给 workflow 最后统一决定 pass / fail
const main = async () => {
  const args = parseArgs();
  const { comment, summary } = await buildComment(args);

  await fs.mkdir(args.outDir, { recursive: true });
  await fs.writeFile(
    path.join(args.outDir, 'comment.md'),
    `${comment}\n`,
    'utf8',
  );
  await fs.writeFile(
    path.join(args.outDir, 'summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );
};

await main();
