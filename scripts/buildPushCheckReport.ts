import fs from 'node:fs/promises';
import path from 'node:path';

type StepOutcome = 'success' | 'failure' | 'skipped' | 'cancelled' | 'unknown';
type ScopeState =
  | 'pr_files'
  | 'push_files'
  | 'no_resource_files'
  | 'unresolved';
type ScopeSource = 'pr' | 'push' | 'none';
type AutofixState =
  | 'committed'
  | 'no_changes'
  | 'skipped_due_to_failures'
  | 'commit_failed';

type ScopeReport = {
  scopeState: ScopeState;
  scopeSource: ScopeSource;
  resourceFiles: string[];
  scopeMessage: string;
  prNumbers: number[];
};

type LinkIssue = {
  file: string;
  field: string;
  url: string;
  context: string;
  kind: string;
  reason: string;
};

type ResourceLinkReport = {
  checkedFiles: string[];
  checkedLinks: number;
  invalidLinks: LinkIssue[];
  uncertainLinks: LinkIssue[];
};

type AutofixSummary = {
  state: AutofixState;
  message: string;
  commitSha?: string;
  hadChanges: boolean;
};

type Args = {
  scopeFile: string;
  resourceCheckOutcome: StepOutcome;
  resourceReportFile: string;
  checkLogFile: string;
  checkOutcome: StepOutcome;
  formatLogFile: string;
  formatOutcome: StepOutcome;
  postFormatStatusFile: string;
  lintLogFile: string;
  lintOutcome: StepOutcome;
  finalStatusFile: string;
  autofixSummaryFile: string;
  outDir: string;
};

type ReportSummary = {
  shouldFail: boolean;
  shouldDeleteComment: boolean;
  sections: {
    resourceLinks: boolean;
    projectCheck: boolean;
    codeFormat: boolean;
    lint: boolean;
    autofix: boolean;
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

// 这个脚本把 push 侧零散的检查结果收口成两份产物：
// 1. comment.md：给固定 PR 评论直接使用
// 2. summary.json：给 workflow 最后统一决定 pass / fail
const parseArgs = (): Args => {
  const argv = process.argv.slice(2);
  const getArg = (name: string) => {
    const index = argv.indexOf(name);
    if (index === -1 || index === argv.length - 1) {
      throw new Error(`Missing required argument: ${name}`);
    }
    return argv[index + 1];
  };

  return {
    scopeFile: getArg('--scope-file'),
    resourceCheckOutcome: parseOutcome(getArg('--resource-check-outcome')),
    resourceReportFile: getArg('--resource-report-file'),
    checkLogFile: getArg('--check-log-file'),
    checkOutcome: parseOutcome(getArg('--check-outcome')),
    formatLogFile: getArg('--format-log-file'),
    formatOutcome: parseOutcome(getArg('--format-outcome')),
    postFormatStatusFile: getArg('--post-format-status-file'),
    lintLogFile: getArg('--lint-log-file'),
    lintOutcome: parseOutcome(getArg('--lint-outcome')),
    finalStatusFile: getArg('--final-status-file'),
    autofixSummaryFile: getArg('--autofix-summary-file'),
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

const readJsonIfExists = async <T>(filePath: string, fallback: T) => {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as T;
  } catch {
    return fallback;
  }
};

const parseStatusFiles = (text: string) => [
  ...new Set(
    text
      .split(/\r?\n/)
      .map((line) => line.trimEnd())
      .filter((line) => line.length > 0)
      .map((line) => line.slice(3).trim())
      .map((line) => {
        if (line.includes(' -> ')) {
          return line.split(' -> ').at(-1) ?? line;
        }
        return line;
      }),
  ),
];

const toBulletList = (items: string[]) =>
  items.length === 0 ? ['- 无'] : items.map((item) => `- \`${item}\``);

const toCodeBlock = (text: string) => {
  const trimmed = text.trim();
  return trimmed.length === 0 ? '' : ['```text', trimmed, '```'].join('\n');
};

const tailLog = (text: string, maxLines: number) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0)
    .slice(-maxLines)
    .join('\n');

const formatStatusLabel = (passed: boolean) =>
  passed ? '✅ 通过' : '❌ 未通过';

const formatScopeSource = (scopeSource: ScopeSource) => {
  if (scopeSource === 'pr') {
    return 'PR 文件集';
  }
  if (scopeSource === 'push') {
    return '本次 push 文件集';
  }
  return '无';
};

const formatAutofixState = (state: AutofixState) => {
  if (state === 'committed') {
    return '✅ 已自动提交';
  }
  if (state === 'no_changes') {
    return '✅ 无需自动修复';
  }
  if (state === 'skipped_due_to_failures') {
    return '⚠️ 已跳过';
  }
  return '❌ 自动提交失败';
};

const formatLinkIssue = (item: LinkIssue) =>
  `\`${item.file}\` | \`${item.field}\` | ${item.context} | [链接](${item.url}) | ${item.reason}`;

// 评论会把“资源范围、资源链接、常规检查、自动修复”四块信息统一放在一条固定评论里，
// 这样 push 侧既能补直接反馈，又不会和 PR 门禁评论互相覆盖。
const buildComment = async (args: Args) => {
  const scope = await readJsonIfExists<ScopeReport>(args.scopeFile, {
    scopeState: 'unresolved',
    scopeSource: 'none',
    resourceFiles: [],
    scopeMessage: '未读取到资源链接检查范围信息。',
    prNumbers: [],
  });

  const resourceReport = await readJsonIfExists<ResourceLinkReport>(
    args.resourceReportFile,
    {
      checkedFiles: [],
      checkedLinks: 0,
      invalidLinks: [],
      uncertainLinks: [],
    },
  );

  const autofixSummary = await readJsonIfExists<AutofixSummary>(
    args.autofixSummaryFile,
    {
      state: 'no_changes',
      message: '未读取到自动修复结果，默认按无需自动修复处理。',
      hadChanges: false,
    },
  );

  const checkLog = await readTextIfExists(args.checkLogFile);
  const formatLog = await readTextIfExists(args.formatLogFile);
  const lintLog = await readTextIfExists(args.lintLogFile);
  const postFormatFiles = parseStatusFiles(
    await readTextIfExists(args.postFormatStatusFile),
  );
  const dirtyFiles = parseStatusFiles(
    await readTextIfExists(args.finalStatusFile),
  );

  const resourceCheckRan =
    scope.scopeState === 'pr_files' || scope.scopeState === 'push_files';
  const resourceLinksPassed =
    !resourceCheckRan || args.resourceCheckOutcome === 'success';
  const projectCheckPassed = args.checkOutcome === 'success';
  const formatCommandPassed = args.formatOutcome === 'success';
  const lintPassed = args.lintOutcome === 'success';
  const autofixPassed =
    autofixSummary.state !== 'commit_failed' &&
    (dirtyFiles.length === 0 || autofixSummary.state === 'committed');

  const shouldFail =
    !resourceLinksPassed ||
    !projectCheckPassed ||
    !formatCommandPassed ||
    !lintPassed ||
    !autofixPassed;

  const shouldDeleteComment =
    !shouldFail &&
    scope.scopeState !== 'no_resource_files' &&
    scope.scopeState !== 'unresolved' &&
    autofixSummary.state === 'no_changes';

  const sections: string[] = [
    '<!-- gkd-push-check -->',
    '## Push 检查结果',
    '',
    '当前流程用于 **push 侧直接反馈**：如果当前分支已有 open PR，会在 PR 中维护这条固定评论。',
    '资源链接检查只在 push 流水线执行，PR 门禁不会重复检查这一项。',
    '',
    '### 资源文件范围',
    `- 状态：${formatStatusLabel(scope.scopeState !== 'unresolved')}`,
    `- 来源：${formatScopeSource(scope.scopeSource)}`,
    `- 说明：${scope.scopeMessage}`,
    '- 命中文件：',
    ...toBulletList(scope.resourceFiles),
  ];

  if (scope.prNumbers.length > 0) {
    sections.push(
      '- 关联 open PR：',
      ...scope.prNumbers.map((number) => `- #${number}`),
    );
  }

  sections.push(
    '',
    '### 资源链接检查',
    `- 状态：${
      !resourceCheckRan ? '⚠️ 已跳过' : formatStatusLabel(resourceLinksPassed)
    }`,
  );

  if (!resourceCheckRan) {
    sections.push('- 说明：当前未进入资源链接检查分支。');
  } else {
    sections.push(
      `- 已检查文件：${resourceReport.checkedFiles.length}`,
      `- 已检查链接：${resourceReport.checkedLinks}`,
      `- 明确失效：${resourceReport.invalidLinks.length}`,
      `- 网络异常 / 待人工确认：${resourceReport.uncertainLinks.length}`,
    );

    if (resourceReport.invalidLinks.length > 0) {
      sections.push(
        '- 明确失效：',
        ...resourceReport.invalidLinks.map(
          (item) => `- ${formatLinkIssue(item)}`,
        ),
      );
    }

    if (resourceReport.uncertainLinks.length > 0) {
      sections.push(
        '- 网络异常 / 待人工确认：',
        ...resourceReport.uncertainLinks.map(
          (item) => `- ${formatLinkIssue(item)}`,
        ),
      );
    }

    if (
      args.resourceCheckOutcome !== 'success' &&
      resourceReport.invalidLinks.length === 0 &&
      resourceReport.uncertainLinks.length === 0
    ) {
      sections.push(
        '- 摘要：',
        '```text\n资源链接检查步骤失败，但未读取到结构化报告，请打开 Actions 日志查看完整输出。\n```',
      );
    }
  }

  sections.push(
    '',
    '### 常规检查',
    `- 项目检查：${formatStatusLabel(projectCheckPassed)} \`pnpm run check\``,
    `- 代码格式：${formatStatusLabel(formatCommandPassed)} \`pnpm run format\``,
    `- 静态检查：${formatStatusLabel(lintPassed)} \`pnpm run lint\``,
  );

  if (!projectCheckPassed) {
    sections.push(
      '- 项目检查摘要：',
      toCodeBlock(tailLog(checkLog, 40)) ||
        '```text\n未能读取到有效的项目检查输出，请打开 Actions 日志查看完整报错。\n```',
    );
  }

  if (!formatCommandPassed) {
    sections.push(
      '- 代码格式摘要：',
      toCodeBlock(tailLog(formatLog, 30)) ||
        '```text\n格式化步骤执行失败，请打开 Actions 日志查看完整报错。\n```',
    );
  }

  sections.push(
    '- 格式化后检测到的工作区改动：',
    ...toBulletList(postFormatFiles),
  );

  if (!lintPassed) {
    sections.push(
      '- 静态检查摘要：',
      toCodeBlock(tailLog(lintLog, 40)) ||
        '```text\n未能读取到有效的 lint 输出，请打开 Actions 日志查看完整报错。\n```',
    );
  }

  sections.push('- 最终工作区改动：', ...toBulletList(dirtyFiles));

  sections.push(
    '',
    '### 自动修复状态',
    `- 状态：${formatAutofixState(autofixSummary.state)}`,
    `- 说明：${autofixSummary.message}`,
  );

  if (autofixSummary.commitSha) {
    sections.push(`- 自动修复提交：\`${autofixSummary.commitSha}\``);
  }

  sections.push('', '### 处理建议');

  const suggestions = new Set<string>();

  if (resourceReport.invalidLinks.length > 0) {
    suggestions.add('修复已失效的资源链接后重新 push。');
  }
  if (resourceReport.uncertainLinks.length > 0) {
    suggestions.add(
      '请人工确认网络异常或待确认的资源链接是否真实可用，再重新 push。',
    );
  }
  if (!projectCheckPassed) {
    suggestions.add('先执行 `pnpm run check`，修复订阅结构或脚本校验错误。');
  }
  if (!formatCommandPassed || postFormatFiles.length > 0) {
    suggestions.add('执行 `pnpm run format` 并把格式化结果一起提交。');
  }
  if (!lintPassed) {
    suggestions.add('执行 `pnpm run lint`，修复剩余静态检查错误。');
  }
  if (autofixSummary.state === 'committed') {
    suggestions.add('检测到 push 流水线已自动提交修复，请先同步分支最新提交。');
  }
  if (autofixSummary.state === 'commit_failed') {
    suggestions.add('自动修复提交失败，请手动同步本地修复结果并重新 push。');
  }
  if (suggestions.size === 0) {
    suggestions.add('本次 push 检查通过，无需额外处理。');
  }

  sections.push(...[...suggestions].map((item) => `- ${item}`));

  return {
    comment: sections.join('\n').trim(),
    summary: {
      shouldFail,
      shouldDeleteComment,
      sections: {
        resourceLinks: resourceLinksPassed,
        projectCheck: projectCheckPassed,
        codeFormat: formatCommandPassed,
        lint: lintPassed,
        autofix: autofixPassed,
      },
    } satisfies ReportSummary,
  };
};

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
