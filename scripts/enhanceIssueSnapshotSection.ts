import fs from 'node:fs/promises';
import path from 'node:path';

type ParsedArgs = {
  bodyFile: string;
  outDir: string;
};

type ExtractedSection = {
  section: string;
  remaining: string;
};

type AttachmentLine = {
  url: string;
  tail: string;
  appName: string;
};

const SNAPSHOT_SECTION_PATTERNS = [
  /^###\s*📸\s*需要适配界面的快照\s*$/u,
  /^###\s*📸\s*请提供.*快照.*$/u,
];
const START_MARKER = '<!-- gkd-auto-parse:start -->';
const END_MARKER = '<!-- gkd-auto-parse:end -->';
const USER_ATTACHMENT_ZIP_RE =
  /^https:\/\/github\.com\/user-attachments\/files\/[^\s)]+\.zip(?:\?[^\s)]*)?$/i;
const MARKDOWN_ATTACHMENT_LINE_RE =
  /^\[([^\]]+)\]\((https:\/\/github\.com\/user-attachments\/files\/[^\s)]+\.zip(?:\?[^\s)]*)?)\)(.*)$/i;
const RAW_ATTACHMENT_LINE_RE =
  /^(https:\/\/github\.com\/user-attachments\/files\/[^\s]+\.zip(?:\?[^\s]*)?)(.*)$/i;
const AUTO_COPY_DETAILS_RE =
  /<details>\s*\n<summary>📋 复制全部链接<\/summary>[\s\S]*?<\/details>/g;

// 这个脚本只负责“原始快照区正文增强”：
// 1. 去掉旧的自动解析区块
// 2. 提取原始快照区
// 3. 为附件链接追加快捷打开入口
// 4. 按连续同应用附件链接重建“复制全部链接”折叠块
// 最终产物只给 workflow 回写时使用，不参与快照解析本身。
const parseArgs = (argv: string[]): ParsedArgs => {
  let bodyFile = '';
  let outDir = '';

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === '--body-file') {
      bodyFile = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (current === '--out-dir') {
      outDir = argv[index + 1] ?? '';
      index += 1;
    }
  }

  if (!bodyFile || !outDir) {
    throw new Error('请提供 --body-file 和 --out-dir');
  }

  return { bodyFile, outDir };
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const stripAutoParseBlock = (body: string) => {
  const blockRe = new RegExp(
    `${escapeRegExp(START_MARKER)}[\\s\\S]*?${escapeRegExp(END_MARKER)}`,
    'm',
  );
  return body.replace(blockRe, '').trim();
};

// 原始快照区始终按标题切段提取，这样 workflow 回写时可以继续保持：
// “其他正文 -> 自动解析区块 -> 原始快照区” 的稳定顺序。
const extractSection = (
  body: string,
  headingPatterns: RegExp[],
): ExtractedSection => {
  const normalized = body.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const startIndex = lines.findIndex((line) =>
    headingPatterns.some((pattern) => pattern.test(line)),
  );

  if (startIndex === -1) {
    return {
      section: '',
      remaining: normalized.trim(),
    };
  }

  let endIndex = lines.length;
  for (let index = startIndex + 1; index < lines.length; index += 1) {
    if (/^#{1,6}\s/.test(lines[index])) {
      endIndex = index;
      break;
    }
  }

  const before = lines.slice(0, startIndex).join('\n').trimEnd();
  const section = lines.slice(startIndex, endIndex).join('\n').trim();
  const after = lines.slice(endIndex).join('\n').trimStart();

  return {
    section,
    remaining: [before, after].filter(Boolean).join('\n\n').trim(),
  };
};

const buildQuickOpenLink = (url: string) =>
  `[快速打开审查工具](https://i.gkd.li/i?url=${encodeURIComponent(url)})`;

const extractAppNameFromText = (value: string) => {
  const normalized = value.trim().replace(/\.zip$/i, '');
  const candidate = normalized.split('_')[0]?.trim();
  return candidate || '';
};

const extractAppNameFromUrl = (value: string) => {
  try {
    const pathname = new URL(value).pathname;
    const filename = decodeURIComponent(pathname.split('/').pop() || '')
      .replace(/\.zip$/i, '')
      .replace(/^_+/, '')
      .trim();
    const candidate = filename.split('_')[0]?.trim();
    return candidate || '';
  } catch {
    return '';
  }
};

// 这里同时兼容两种常见写法：
// 1. [文件名](附件链接)
// 2. 裸附件链接
// 只有 GitHub user-attachments zip 会继续参与后续增强。
const parseAttachmentLine = (line: string): AttachmentLine | null => {
  const markdownMatch = line.match(MARKDOWN_ATTACHMENT_LINE_RE);
  if (markdownMatch) {
    const [, label, url, tail = ''] = markdownMatch;
    return {
      url,
      tail,
      appName: extractAppNameFromText(label) || extractAppNameFromUrl(url),
    };
  }

  const rawMatch = line.match(RAW_ATTACHMENT_LINE_RE);
  if (rawMatch) {
    const [, url, tail = ''] = rawMatch;
    return {
      url,
      tail,
      appName: extractAppNameFromUrl(url),
    };
  }

  return null;
};

// 每个 GitHub 附件 zip 行后面都补一个快捷打开入口。
// 已存在同 URL 的快捷入口时跳过，保证多次运行结果幂等。
const enhanceSnapshotLinks = (section: string) => {
  return section
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => {
      const attachment = parseAttachmentLine(line);
      if (!attachment || !USER_ATTACHMENT_ZIP_RE.test(attachment.url)) {
        return line;
      }

      const quickOpenLink = buildQuickOpenLink(attachment.url);
      if (attachment.tail.includes(quickOpenLink)) {
        return line;
      }

      return `${line} ${quickOpenLink}`;
    })
    .join('\n');
};

const renderCopyDetailsBlock = (urls: string[]) => {
  return [
    '<details>',
    '<summary>📋 复制全部链接</summary>',
    '',
    '```',
    ...urls,
    '```',
    '',
    '</details>',
  ].join('\n');
};

// “复制全部链接”按连续同应用附件块重建，而不是做局部增量追加。
// 这样正文顺序变化、分组变化、链接数量变化时，都不会留下陈旧 details。
const rebuildSnapshotCopyGroups = (section: string) => {
  const normalized = section
    .replace(/\r\n/g, '\n')
    .replace(AUTO_COPY_DETAILS_RE, '')
    .replace(/\n{3,}/g, '\n\n')
    .trimEnd();
  const lines = normalized.split('\n');
  const result: string[] = [];
  let currentGroup: { appName: string; urls: string[] } | null = null;

  const flushGroup = () => {
    if (!currentGroup || currentGroup.urls.length < 2) {
      currentGroup = null;
      return;
    }

    if (result.length > 0 && result[result.length - 1].trim() !== '') {
      result.push('');
    }

    result.push(renderCopyDetailsBlock(currentGroup.urls));
    result.push('');
    currentGroup = null;
  };

  lines.forEach((line) => {
    const attachment = parseAttachmentLine(line);
    if (
      !attachment ||
      !USER_ATTACHMENT_ZIP_RE.test(attachment.url) ||
      !attachment.appName
    ) {
      flushGroup();
      result.push(line);
      return;
    }

    if (currentGroup && currentGroup.appName !== attachment.appName) {
      flushGroup();
    }

    if (!currentGroup) {
      currentGroup = {
        appName: attachment.appName,
        urls: [attachment.url],
      };
    } else {
      currentGroup.urls.push(attachment.url);
    }

    result.push(line);
  });

  flushGroup();
  return result.join('\n').trimEnd();
};

const enhanceSnapshotSection = (section: string) => {
  if (!section) {
    return section;
  }

  return rebuildSnapshotCopyGroups(enhanceSnapshotLinks(section));
};

// 输出文件只有两份：
// 1. remaining.md：去掉自动解析区块和原始快照区后的正文
// 2. snapshot-section.md：增强后的原始快照区
// workflow 只负责把它们重新拼回 issue body。
const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const bodyFile = path.resolve(process.cwd(), args.bodyFile);
  const outDir = path.resolve(process.cwd(), args.outDir);
  await fs.mkdir(outDir, { recursive: true });

  const body = await fs.readFile(bodyFile, 'utf8');
  const bodyWithoutBlock = stripAutoParseBlock(body);
  const extracted = extractSection(bodyWithoutBlock, SNAPSHOT_SECTION_PATTERNS);
  const enhancedSection = enhanceSnapshotSection(extracted.section);

  await fs.writeFile(
    path.join(outDir, 'remaining.md'),
    extracted.remaining,
    'utf8',
  );
  await fs.writeFile(
    path.join(outDir, 'snapshot-section.md'),
    enhancedSection,
    'utf8',
  );
};

await main();
