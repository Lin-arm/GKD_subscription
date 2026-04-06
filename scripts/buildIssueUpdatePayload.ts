import fs from 'node:fs/promises';
import path from 'node:path';

type ParsedArgs = {
  issueTitleFile: string;
  issueBodyFile: string;
  blockFile: string;
  remainingBodyFile: string;
  snapshotSectionFile: string;
  outDir: string;
  prefix: string;
};

// 这个脚本只负责“回写前的文本拼装”：
// 1. 根据解析结果和原标题生成新标题
// 2. 根据增强后的正文片段重组新 body
// 3. 输出给 workflow / github-script 直接读取的 title.txt 与 body.md
// GitHub API 调用、reopen、移除标签等副作用仍留在 workflow 中处理。
const parseArgs = (argv: string[]): ParsedArgs => {
  let issueTitleFile = '';
  let issueBodyFile = '';
  let blockFile = '';
  let remainingBodyFile = '';
  let snapshotSectionFile = '';
  let outDir = '';
  let prefix = '';

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === '--issue-title-file') {
      issueTitleFile = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (current === '--issue-body-file') {
      issueBodyFile = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (current === '--block-file') {
      blockFile = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (current === '--remaining-body-file') {
      remainingBodyFile = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (current === '--snapshot-section-file') {
      snapshotSectionFile = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (current === '--out-dir') {
      outDir = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (current === '--prefix') {
      prefix = argv[index + 1] ?? '';
      index += 1;
    }
  }

  if (
    !issueTitleFile ||
    !issueBodyFile ||
    !blockFile ||
    !remainingBodyFile ||
    !snapshotSectionFile ||
    !outDir
  ) {
    throw new Error(
      '请提供 --issue-title-file、--issue-body-file、--block-file、--remaining-body-file、--snapshot-section-file 和 --out-dir',
    );
  }

  return {
    issueTitleFile,
    issueBodyFile,
    blockFile,
    remainingBodyFile,
    snapshotSectionFile,
    outDir,
    prefix,
  };
};

const cleanInline = (value: string) =>
  (value || '')
    .replace(/^\uFEFF/, '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripLeadingTitleSeparator = (value: string) =>
  (value || '').replace(/^[-:：|/\\\s_]+/, '').trim();

const stripBom = (value: string) => value.replace(/^\uFEFF/, '');

const detectIssueTag = (body: string) => {
  const normalizedBody = body.replace(/\r\n/g, '\n');

  const bugPatterns = [
    /请说明是哪一条规则\s*误触\/出现问题/u,
    /📸请提供\s*误触界面\/出现问题界面/u,
    /明确标注了是哪一条规则误触\/出现问题/u,
  ];
  if (bugPatterns.some((pattern) => pattern.test(normalizedBody))) {
    return '[Bug]';
  }

  const featurePatterns = [
    /我已阅读\s*\[不予适配情况合集/u,
    /我已\*\*开启全局规则\*\*/u,
    /需要适配界面的快照/u,
  ];
  if (featurePatterns.some((pattern) => pattern.test(normalizedBody))) {
    return '[Feature]';
  }

  return '';
};

// 自动生成的 App 前缀只在“前缀本体”或“前缀 + 分隔符 + 用户标题”这种形态下清理。
// 如果用户标题只是恰好以相同文本开头，但没有使用生成分隔符，则按用户原意保留。
const extractGeneratedSuffix = (value: string, prefix: string) => {
  const normalizedValue = cleanInline(value);
  if (!normalizedValue) {
    return '';
  }
  if (normalizedValue === prefix) {
    return '';
  }
  if (!normalizedValue.startsWith(prefix)) {
    return normalizedValue;
  }

  const remainder = normalizedValue.slice(prefix.length);
  if (!remainder) {
    return '';
  }

  const separatorRe = /^(?:\s*_\s*|\s*-\s*|\s*[:：|/\\]\s*|\s+)/;
  if (!separatorRe.test(remainder)) {
    return normalizedValue;
  }

  return stripLeadingTitleSeparator(remainder);
};

const stripGeneratedPrefixRecursively = (value: string, prefix: string) => {
  let current = cleanInline(value);

  while (current) {
    const next = extractGeneratedSuffix(current, prefix);
    if (next === current) {
      return current;
    }
    current = next;
  }

  return '';
};

// 标题策略单独放在脚本里，方便 review 时只关注“文本怎么拼”，
// 不必在 workflow 的 github-script 中来回寻找字符串处理细节。
const buildUpdatedTitle = (
  oldTitle: string,
  oldBody: string,
  prefix: string,
): string => {
  if (!prefix) {
    return oldTitle;
  }

  const normalizedPrefix = prefix.trim();
  const normalizedOldTitle = cleanInline(oldTitle);
  const tagMatch = normalizedOldTitle.match(/^(\[[^\]]+\])\s*(.*)$/);
  const rawTitleCore = tagMatch ? tagMatch[2] : normalizedOldTitle;
  const userTitleSuffix = stripGeneratedPrefixRecursively(
    rawTitleCore,
    normalizedPrefix,
  );

  const mergedTitle = userTitleSuffix
    ? `${normalizedPrefix}_${userTitleSuffix}`
    : normalizedPrefix;

  let finalTag = '';
  if (tagMatch) {
    finalTag = tagMatch[1];
  } else {
    finalTag = detectIssueTag(oldBody);
  }

  return finalTag ? `${finalTag} ${mergedTitle}`.trim() : mergedTitle;
};

// 正文结构已经稳定为：
// “去掉原始快照区和旧自动区块后的正文 -> 新自动解析区块 -> 增强后的原始快照区”
// 这里不再关心正文增强细节，只负责把三个片段按最终顺序拼起来。
const buildUpdatedBody = (
  remainingBody: string,
  newBlock: string,
  enhancedSnapshotSection: string,
) => {
  return [remainingBody, newBlock, enhancedSnapshotSection]
    .filter(Boolean)
    .join('\n\n')
    .trimEnd();
};

// 最终产物只有两份，专门给 workflow 回写 issue 用：
// 1. title.txt
// 2. body.md
const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const outDir = path.resolve(process.cwd(), args.outDir);

  await fs.mkdir(outDir, { recursive: true });

  const [
    rawTitle,
    rawBody,
    rawBlock,
    rawRemainingBody,
    rawEnhancedSnapshotSection,
  ] = await Promise.all([
    fs.readFile(path.resolve(process.cwd(), args.issueTitleFile), 'utf8'),
    fs.readFile(path.resolve(process.cwd(), args.issueBodyFile), 'utf8'),
    fs.readFile(path.resolve(process.cwd(), args.blockFile), 'utf8'),
    fs.readFile(path.resolve(process.cwd(), args.remainingBodyFile), 'utf8'),
    fs.readFile(path.resolve(process.cwd(), args.snapshotSectionFile), 'utf8'),
  ]);

  const oldTitle = stripBom(rawTitle);
  const oldBody = stripBom(rawBody);
  const newBlock = stripBom(rawBlock);
  const remainingBody = stripBom(rawRemainingBody);
  const enhancedSnapshotSection = stripBom(rawEnhancedSnapshotSection);

  const nextTitle = buildUpdatedTitle(oldTitle, oldBody, args.prefix);
  const nextBody = buildUpdatedBody(
    remainingBody.trim(),
    newBlock.trim(),
    enhancedSnapshotSection.trim(),
  );

  await Promise.all([
    fs.writeFile(path.join(outDir, 'title.txt'), nextTitle, 'utf8'),
    fs.writeFile(path.join(outDir, 'body.md'), nextBody, 'utf8'),
  ]);
};

await main();
