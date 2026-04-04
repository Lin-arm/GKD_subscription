import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';

type Mode = 'report' | 'enforce';
type LinkField = 'snapshotUrls' | 'excludeSnapshotUrls' | 'exampleUrls';
type LinkKind = 'snapshot' | 'example';
type ValidationStatus = 'valid' | 'invalid' | 'uncertain';

type LinkValue = string | string[] | undefined;

interface ResourceRule {
  key?: number | string;
  name?: string;
  snapshotUrls?: LinkValue;
  excludeSnapshotUrls?: LinkValue;
  exampleUrls?: LinkValue;
}

interface ResourceGroup extends ResourceRule {
  rules?: ResourceRule | ResourceRule[] | string | string[];
}

interface ResourceApp {
  id?: string;
  name?: string;
  groups?: ResourceGroup[];
}

interface LinkUsage {
  file: string;
  field: LinkField;
  url: string;
  context: string;
  kind: LinkKind;
}

interface LinkIssue extends LinkUsage {
  reason: string;
}

interface ResourceLinkReport {
  checkedFiles: string[];
  checkedLinks: number;
  invalidLinks: LinkIssue[];
  uncertainLinks: LinkIssue[];
}

interface ValidationResult {
  status: ValidationStatus;
  reason?: string;
}

interface ParsedArgs {
  mode: Mode;
  reportFile?: string;
  files: string[];
}

const SUPPORTED_FILE_RE =
  /^(src[\\/]+apps[\\/].+\.ts|src[\\/]globalGroups\.ts)$/;
const SNAPSHOT_SHARE_RE =
  /^https?:\/\/(i\.gkd\.li|igkd\.li)\/(i|import)\/([0-9]+)(?:\?.*)?$/i;
const CHENGE_SHARE_RE =
  /^https?:\/\/li\.chenge\.eu\.org\/i\/([0-9]+)(?:\?.*)?$/i;
const DIRECT_ZIP_RE = /^https?:\/\/[^\s]+\.zip(?:\?[^\s]*)?$/i;
const REPORT_TEMPLATE = {
  checkedFiles: [],
  checkedLinks: 0,
  invalidLinks: [],
  uncertainLinks: [],
} satisfies ResourceLinkReport;
const REQUEST_TIMEOUT_MS = 20_000;

const normalizeFiles = (files: string[]) =>
  Array.from(
    new Set(
      files
        .map((file) => path.normalize(file))
        .filter((file) => SUPPORTED_FILE_RE.test(file)),
    ),
  );

const toArray = (value: LinkValue) => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  return typeof value === 'string' ? [value] : [];
};

const resolveRules = (rules: ResourceGroup['rules']): ResourceRule[] => {
  if (rules === undefined) {
    return [];
  }
  const list = Array.isArray(rules) ? rules : [rules];
  return list.map((item) =>
    typeof item === 'string' ? {} : ((item ?? {}) as ResourceRule),
  );
};

const parseArgs = (argv: string[]): ParsedArgs => {
  const result: ParsedArgs = {
    mode: 'report',
    files: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === '--mode') {
      const next = argv[index + 1];
      if (next !== 'report' && next !== 'enforce') {
        throw new Error('--mode 只支持 report 或 enforce');
      }
      result.mode = next;
      index += 1;
      continue;
    }

    if (current === '--report-file') {
      const next = argv[index + 1];
      if (!next) {
        throw new Error('--report-file 缺少文件路径');
      }
      result.reportFile = next;
      index += 1;
      continue;
    }

    if (current === '--files') {
      index += 1;
      while (index < argv.length && !argv[index].startsWith('--')) {
        result.files.push(argv[index]);
        index += 1;
      }
      index -= 1;
      continue;
    }
  }

  return result;
};

const buildLabel = (
  name: string | undefined,
  key: number | string | undefined,
) => {
  if (name && key !== undefined) {
    return `${name} (key=${String(key)})`;
  }
  if (name) {
    return name;
  }
  if (key !== undefined) {
    return `key=${String(key)}`;
  }
  return '未命名';
};

const pushObjectLinks = (
  source: ResourceRule,
  meta: Pick<LinkUsage, 'file' | 'context'>,
  usages: LinkUsage[],
) => {
  (['snapshotUrls', 'excludeSnapshotUrls', 'exampleUrls'] as const).forEach(
    (field) => {
      toArray(source[field]).forEach((url) => {
        usages.push({
          file: meta.file,
          field,
          url,
          context: meta.context,
          kind: field === 'exampleUrls' ? 'example' : 'snapshot',
        });
      });
    },
  );
};

const collectAppLinks = (file: string, app: ResourceApp): LinkUsage[] => {
  const usages: LinkUsage[] = [];
  const appLabel = `应用 ${buildLabel(app.name, app.id)}`;

  (app.groups ?? []).forEach((group) => {
    const groupLabel = `${appLabel} -> 规则组 ${buildLabel(group.name, group.key)}`;
    pushObjectLinks(group, { file, context: groupLabel }, usages);

    resolveRules(group.rules).forEach((rule) => {
      const ruleLabel = `${groupLabel} -> 规则 ${buildLabel(rule.name, rule.key)}`;
      pushObjectLinks(rule, { file, context: ruleLabel }, usages);
    });
  });

  return usages;
};

const collectGlobalGroupLinks = (
  file: string,
  groups: ResourceGroup[],
): LinkUsage[] => {
  const usages: LinkUsage[] = [];

  groups.forEach((group) => {
    const groupLabel = `全局规则组 ${buildLabel(group.name, group.key)}`;
    pushObjectLinks(group, { file, context: groupLabel }, usages);

    resolveRules(group.rules).forEach((rule) => {
      const ruleLabel = `${groupLabel} -> 规则 ${buildLabel(rule.name, rule.key)}`;
      pushObjectLinks(rule, { file, context: ruleLabel }, usages);
    });
  });

  return usages;
};

const collectLinkUsages = async (files: string[]) => {
  const usages: LinkUsage[] = [];
  const checkedFiles: string[] = [];

  for (const file of files) {
    const absoluteFile = path.resolve(process.cwd(), file);
    try {
      await fs.access(absoluteFile);
    } catch {
      continue;
    }

    const module = await import(pathToFileURL(absoluteFile).href);
    checkedFiles.push(file);

    if (
      path.normalize(file) ===
      path.normalize(path.join('src', 'globalGroups.ts'))
    ) {
      usages.push(
        ...collectGlobalGroupLinks(
          file,
          (module.default ?? []) as ResourceGroup[],
        ),
      );
      continue;
    }

    usages.push(
      ...collectAppLinks(file, (module.default ?? {}) as ResourceApp),
    );
  }

  return { checkedFiles, usages };
};

const runCommand = async (command: string, args: string[]) => {
  return await new Promise<{ ok: boolean; stderr: string }>((resolve) => {
    const child = spawn(command, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });

    let stderr = '';
    child.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });

    child.on('error', (error) => {
      resolve({ ok: false, stderr: error.message });
    });

    child.on('close', (code) => {
      resolve({ ok: code === 0, stderr: stderr.trim() });
    });
  });
};

const extractArchive = async (zipPath: string, destination: string) => {
  if (process.platform === 'win32') {
    const escapePowerShellPath = (value: string) => value.replace(/'/g, "''");
    return await runCommand('powershell', [
      '-NoLogo',
      '-NoProfile',
      '-Command',
      [
        'Add-Type -AssemblyName System.IO.Compression.FileSystem',
        `[System.IO.Compression.ZipFile]::ExtractToDirectory('${escapePowerShellPath(
          zipPath,
        )}', '${escapePowerShellPath(destination)}')`,
      ].join('; '),
    ]);
  }

  return await runCommand('unzip', ['-qq', '-o', zipPath, '-d', destination]);
};

const walkFiles = async (dir: string): Promise<string[]> => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return await walkFiles(entryPath);
      }
      return entry.isFile() ? [entryPath] : [];
    }),
  );
  return files.flat();
};

const isValidSnapshotObject = (value: unknown) => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    (record.appId !== undefined && record.activityId !== undefined) ||
    record.appInfo !== undefined ||
    record.gkdAppInfo !== undefined ||
    record.device !== undefined
  );
};

const inspectSnapshotArchive = async (
  buffer: Buffer,
): Promise<ValidationResult> => {
  const tempRoot = await fs.mkdtemp(
    path.join(os.tmpdir(), 'gkd-resource-links-'),
  );
  const zipPath = path.join(tempRoot, 'snapshot.zip');
  const extractDir = path.join(tempRoot, 'extracted');

  try {
    await fs.writeFile(zipPath, buffer);

    const extraction = await extractArchive(zipPath, extractDir);
    if (!extraction.ok) {
      const reason = extraction.stderr || '压缩包无法解压';
      if (
        /not found|is not recognized|找不到|无法将|Expand-Archive/i.test(reason)
      ) {
        return {
          status: 'uncertain',
          reason: `运行环境缺少解压能力: ${reason}`,
        };
      }
      return { status: 'invalid', reason: `压缩包无法解压: ${reason}` };
    }

    const files = (await walkFiles(extractDir)).filter((file) =>
      file.toLowerCase().endsWith('.json'),
    );

    for (const file of files) {
      try {
        const parsed = JSON.parse(await fs.readFile(file, 'utf8'));
        if (isValidSnapshotObject(parsed)) {
          return { status: 'valid' };
        }
      } catch {
        // ignore invalid json fragments inside archive
      }
    }

    return { status: 'invalid', reason: '压缩包中未找到有效快照 JSON' };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
};

const buildFetchInit = () => ({
  redirect: 'follow' as const,
  signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
});

const classifyFetchError = (error: unknown) => {
  if (error instanceof Error) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return '请求超时';
    }
    return `网络异常: ${error.message}`;
  }
  return '网络异常';
};

const classifyHttpStatus = (status: number): ValidationStatus => {
  if (status >= 500) {
    return 'uncertain';
  }
  if (status >= 400) {
    return 'invalid';
  }
  return 'valid';
};

const fetchBuffer = async (
  url: string,
): Promise<{ status: ValidationStatus; reason?: string; buffer?: Buffer }> => {
  try {
    const response = await fetch(url, buildFetchInit());
    if (!response.ok) {
      await response.body?.cancel();
      return {
        status: classifyHttpStatus(response.status),
        reason: `HTTP ${response.status}`,
      };
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    return { status: 'valid', buffer };
  } catch (error) {
    return { status: 'uncertain', reason: classifyFetchError(error) };
  }
};

const resolveZipUrlFromSharePage = async (
  url: string,
): Promise<{
  status: ValidationStatus;
  reason?: string;
  zipUrl?: string;
}> => {
  try {
    const response = await fetch(url, buildFetchInit());
    if (!response.ok) {
      await response.body?.cancel();
      return {
        status: classifyHttpStatus(response.status),
        reason: `分享页返回 HTTP ${response.status}`,
      };
    }

    const html = (await response.text()).replace(/&amp;/g, '&');
    const zipUrl = html.match(/https?:\/\/[^"'\s]+\.zip[^"'\s]*/i)?.[0];
    if (!zipUrl) {
      return {
        status: 'invalid',
        reason: '分享页中未找到可下载的 zip 链接',
      };
    }

    return { status: 'valid', zipUrl };
  } catch (error) {
    return { status: 'uncertain', reason: classifyFetchError(error) };
  }
};

const validateSnapshotArchiveUrl = async (
  url: string,
): Promise<ValidationResult> => {
  const downloaded = await fetchBuffer(url);
  if (downloaded.status !== 'valid' || !downloaded.buffer) {
    return {
      status: downloaded.status,
      reason:
        downloaded.reason && downloaded.reason.startsWith('HTTP')
          ? `快照压缩包下载失败: ${downloaded.reason}`
          : downloaded.reason,
    };
  }

  return await inspectSnapshotArchive(downloaded.buffer);
};

const validateSnapshotUrl = async (url: string): Promise<ValidationResult> => {
  if (DIRECT_ZIP_RE.test(url)) {
    return await validateSnapshotArchiveUrl(url);
  }

  const snapshotMatch = url.match(SNAPSHOT_SHARE_RE);
  if (snapshotMatch?.[2] === 'i') {
    const directAttachmentUrl = `https://github.com/user-attachments/files/${snapshotMatch[3]}/file.zip`;
    const directAttachmentResult =
      await validateSnapshotArchiveUrl(directAttachmentUrl);

    if (directAttachmentResult.status === 'valid') {
      return directAttachmentResult;
    }

    if (directAttachmentResult.status === 'uncertain') {
      return directAttachmentResult;
    }
  }

  if (!SNAPSHOT_SHARE_RE.test(url) && !CHENGE_SHARE_RE.test(url)) {
    return { status: 'invalid', reason: '不支持的快照链接格式' };
  }

  const resolved = await resolveZipUrlFromSharePage(url);
  if (resolved.status !== 'valid' || !resolved.zipUrl) {
    return { status: resolved.status, reason: resolved.reason };
  }

  return await validateSnapshotArchiveUrl(resolved.zipUrl);
};

const validateExampleUrl = async (url: string): Promise<ValidationResult> => {
  try {
    const response = await fetch(url, buildFetchInit());
    if (!response.ok) {
      await response.body?.cancel();
      return {
        status: classifyHttpStatus(response.status),
        reason: `示例链接返回 HTTP ${response.status}`,
      };
    }

    await response.body?.cancel();
    return { status: 'valid' };
  } catch (error) {
    return { status: 'uncertain', reason: classifyFetchError(error) };
  }
};

const validateUsage = async (
  usage: LinkUsage,
  cache: Map<string, ValidationResult>,
) => {
  const cacheKey = `${usage.kind}:${usage.url}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const result =
    usage.kind === 'snapshot'
      ? await validateSnapshotUrl(usage.url)
      : await validateExampleUrl(usage.url);
  cache.set(cacheKey, result);
  return result;
};

const buildReport = async (files: string[]): Promise<ResourceLinkReport> => {
  const { checkedFiles, usages } = await collectLinkUsages(files);
  const invalidLinks: LinkIssue[] = [];
  const uncertainLinks: LinkIssue[] = [];
  const cache = new Map<string, ValidationResult>();

  for (const usage of usages) {
    const result = await validateUsage(usage, cache);
    if (result.status === 'invalid') {
      invalidLinks.push({
        ...usage,
        reason: result.reason ?? '链接不可用',
      });
    }
    if (result.status === 'uncertain') {
      uncertainLinks.push({
        ...usage,
        reason: result.reason ?? '链接状态待确认',
      });
    }
  }

  return {
    checkedFiles,
    checkedLinks: usages.length,
    invalidLinks,
    uncertainLinks,
  };
};

const writeReport = async (
  reportFile: string | undefined,
  report: ResourceLinkReport,
) => {
  if (!reportFile) {
    return;
  }
  const absolutePath = path.resolve(process.cwd(), reportFile);
  await fs.mkdir(path.dirname(absolutePath), { recursive: true });
  await fs.writeFile(
    absolutePath,
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );
};

const printSummary = (report: ResourceLinkReport) => {
  console.log(`已检查文件: ${report.checkedFiles.length}`);
  console.log(`已检查链接: ${report.checkedLinks}`);
  console.log(`明确失效: ${report.invalidLinks.length}`);
  console.log(`待人工确认: ${report.uncertainLinks.length}`);

  if (report.invalidLinks.length > 0) {
    console.log('\n[明确失效]');
    report.invalidLinks.forEach((item) => {
      console.log(
        `- ${item.file} | ${item.field} | ${item.context} | ${item.url} | ${item.reason}`,
      );
    });
  }

  if (report.uncertainLinks.length > 0) {
    console.log('\n[网络异常 / 待人工确认]');
    report.uncertainLinks.forEach((item) => {
      console.log(
        `- ${item.file} | ${item.field} | ${item.context} | ${item.url} | ${item.reason}`,
      );
    });
  }
};

const args = parseArgs(process.argv.slice(2));
const report = args.files.length
  ? await buildReport(normalizeFiles(args.files))
  : REPORT_TEMPLATE;

await writeReport(args.reportFile, report);
printSummary(report);

if (args.mode === 'enforce' && report.invalidLinks.length > 0) {
  process.exitCode = 1;
}
