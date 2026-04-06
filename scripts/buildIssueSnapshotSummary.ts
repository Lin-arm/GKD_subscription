import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

type ParsedArgs = {
  urlsFile: string;
  outDir: string;
};

type SnapshotRoot = Record<string, unknown>;
type SnapshotNode = Record<string, unknown>;

// 每条原始快照最终都会先规整成这一层扁平记录。
// 后续的页面汇总、环境汇总、提醒判断都只依赖这份兼容后的中间结果。
type NormalizedSnapshotRecord = {
  sourceUrl: string;
  appName: string;
  appId: string;
  appVersion: string;
  activityId: string;
  resolution: string;
  orientation: string;
  deviceInfo: string;
  androidInfo: string;
  gkdInfo: string;
  hasNodes: boolean;
  nodeCount: number | null;
  visibleNodeCount: number | null;
  clickableNodeCount: number | null;
  qualifiedIdCount: number | null;
  qualifiedTextCount: number | null;
  legacySnapshot: boolean;
  missingFields: string[];
  hasQfSignals: boolean;
};

// 页面主表和折叠技术详情都基于页面粒度聚合。
// 这里保留主表显示字段，以及生成备注和提醒需要的状态位。
type PageSummary = {
  appName: string;
  appId: string;
  appVersion: string;
  activityId: string;
  snapshotCount: number;
  nodeScaleText: string;
  fastQueryText: string;
  hasMissingNodes: boolean;
  hasMissingFields: boolean;
  hasNoFastQuery: boolean;
  hasLegacySnapshot: boolean;
  hasDataInsufficient: boolean;
  missingFieldNames: string[];
};

type EnvSummary = {
  resolution: string;
  orientation: string;
  deviceInfo: string;
  androidInfo: string;
  gkdInfo: string;
};

// summary.json 是 workflow 与脚本之间的稳定接口。
// workflow 只读取这里的结果决定是否回写 issue，以及标题前缀和概览数字。
type IssueSnapshotSummary = {
  success: boolean;
  sourceCount: number;
  parsedCount: number;
  failedCount: number;
  titlePrefix: string;
  appCount: number;
  pageCount: number;
  envCount: number;
  warningLines: string[];
};

type FetchResult =
  | { status: 'valid'; buffer: Buffer }
  | { status: 'invalid' | 'uncertain'; reason: string };

const REQUEST_TIMEOUT_MS = 20_000;
const SNAPSHOT_SHARE_RE =
  /^https?:\/\/(i\.gkd\.li|igkd\.li)\/(i|import)\/([0-9]+)(?:\?.*)?$/i;
const DIRECT_ZIP_RE = /^https?:\/\/[^\s]+\.zip(?:\?[^\s]*)?$/i;

// CLI 入口只接受 workflow 传入的 urls-file 和 out-dir。
// 这里不做业务解析，只负责把脚本输入约束成稳定参数。
const parseArgs = (argv: string[]): ParsedArgs => {
  let urlsFile = '';
  let outDir = '';

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];

    if (current === '--urls-file') {
      urlsFile = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (current === '--out-dir') {
      outDir = argv[index + 1] ?? '';
      index += 1;
    }
  }

  if (!urlsFile || !outDir) {
    throw new Error('请提供 --urls-file 和 --out-dir');
  }

  return { urlsFile, outDir };
};

const cleanCell = (value: unknown) => {
  if (value === null || value === undefined) {
    return '未知';
  }

  const text = String(value)
    .replace(/\|/g, '¦')
    .replace(/[`]/g, String.fromCharCode(39))
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text || '未知';
};

const formatInlineCode = (value: unknown) => `\`${cleanCell(value)}\``;

const displayVersion = (name: unknown, code: unknown) => {
  const normalizedName =
    name === null || name === undefined ? '' : String(name).trim();

  if (normalizedName && code !== null && code !== undefined) {
    return `${normalizedName} (${String(code)})`;
  }
  if (normalizedName) {
    return normalizedName;
  }
  if (code !== null && code !== undefined) {
    return `versionCode ${String(code)}`;
  }
  return '未知';
};

const uniqKeepOrder = <T>(items: T[]) => {
  const seen = new Set<T>();
  const result: T[] = [];

  items.forEach((item) => {
    if (seen.has(item)) {
      return;
    }
    seen.add(item);
    result.push(item);
  });

  return result;
};

const rangeText = (values: number[]) => {
  if (values.length === 0) {
    return '未知';
  }

  const sorted = [...values].sort((left, right) => left - right);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  return min === max ? String(min) : `${min}~${max}`;
};

// 主表里的界面 ID 需要尽量保留原始值，同时压住横向宽度。
// 这里仅在超长时按接近阈值的点号换 1 次行，不做语义裁剪，完整值留给折叠详情。
const formatActivityIdForMainTable = (activityId: string) => {
  const normalized = cleanCell(activityId);

  if (normalized === '未知' || normalized.length <= 32) {
    return formatInlineCode(normalized);
  }

  const dotIndexes = [...normalized.matchAll(/\./g)]
    .map((match) => match.index ?? -1)
    .filter((index) => index > 0 && index < normalized.length - 1);

  if (dotIndexes.length === 0) {
    return formatInlineCode(normalized);
  }

  const bestSplitIndex = dotIndexes.reduce((bestIndex, currentIndex) => {
    const currentDistance = Math.abs(currentIndex - 32);
    const bestDistance = Math.abs(bestIndex - 32);

    if (currentDistance < bestDistance) {
      return currentIndex;
    }
    if (currentDistance === bestDistance && currentIndex > bestIndex) {
      return currentIndex;
    }
    return bestIndex;
  });

  const firstLine = normalized.slice(0, bestSplitIndex + 1);
  const secondLine = normalized.slice(bestSplitIndex + 1);

  if (!firstLine || !secondLine) {
    return formatInlineCode(normalized);
  }

  return `${formatInlineCode(firstLine)}<br>${formatInlineCode(secondLine)}`;
};

// 页面技术详情里的备注只汇总 reviewer 真正关心的状态位。
// 这一层不再重复主表已有数字，避免折叠区也变成第二个宽表。
const buildPageRemarkList = (summary: PageSummary) => {
  const remarks: string[] = [];

  if (summary.hasLegacySnapshot) {
    remarks.push('兼容模式解析');
  }
  if (summary.hasMissingNodes) {
    remarks.push('缺少 nodes');
  }
  if (summary.hasDataInsufficient) {
    remarks.push('QF 数据不足');
  }
  if (summary.hasNoFastQuery) {
    remarks.push('无可用快查');
  }
  if (summary.hasMissingFields) {
    remarks.push(`字段缺失: ${summary.missingFieldNames.join(', ')}`);
  }

  return remarks.length > 0 ? remarks.join(' / ') : '无';
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

const classifyErrorHttpStatus = (status: number): 'invalid' | 'uncertain' => {
  return status >= 500 ? 'uncertain' : 'invalid';
};

// 统一处理网络请求与超时，并把成功结果收敛成 Buffer。
// 后续无论是直接 zip 还是分享页解析出的 zip，都复用这一层下载结果。
const fetchBuffer = async (url: string): Promise<FetchResult> => {
  try {
    const response = await fetch(url, buildFetchInit());
    if (!response.ok) {
      await response.body?.cancel();
      return {
        status: classifyErrorHttpStatus(response.status),
        reason: `HTTP ${response.status}`,
      };
    }

    return {
      status: 'valid',
      buffer: Buffer.from(await response.arrayBuffer()),
    };
  } catch (error) {
    return {
      status: 'uncertain',
      reason: classifyFetchError(error),
    };
  }
};

// 公开分享链接并不直接等于 zip 地址，这里负责从分享页 HTML 中提取真实附件链接。
// 这样 i.gkd.li 分享链接和直接 zip 链接最终都能收敛到同一套解压逻辑。
const resolveZipUrlFromSharePage = async (
  url: string,
): Promise<
  | { status: 'valid'; zipUrl: string }
  | { status: 'invalid' | 'uncertain'; reason: string }
> => {
  try {
    const response = await fetch(url, buildFetchInit());
    if (!response.ok) {
      await response.body?.cancel();
      return {
        status: classifyErrorHttpStatus(response.status),
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
    return {
      status: 'uncertain',
      reason: classifyFetchError(error),
    };
  }
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

// 解压实现单独抽出来，是为了统一处理不同平台上的 zip 解压能力。
// workflow 跑在 Linux，本地调试可能在 Windows，这里把平台差异收在一处。
const extractArchive = async (zipPath: string, destination: string) => {
  if (process.platform === 'win32') {
    const escapePowerShellPath = (value: string) =>
      value.replace(/'/g, String.fromCharCode(39, 39));

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
  const result = await Promise.all(
    entries.map(async (entry) => {
      const currentPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return await walkFiles(currentPath);
      }
      return entry.isFile() ? [currentPath] : [];
    }),
  );

  return result.flat();
};

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isValidSnapshotObject = (value: unknown): value is SnapshotRoot => {
  if (!isPlainObject(value)) {
    return false;
  }

  return (
    (value.appId !== undefined && value.activityId !== undefined) ||
    value.appInfo !== undefined ||
    value.gkdAppInfo !== undefined ||
    value.device !== undefined
  );
};

// 压缩包里可能含有多个 JSON 或无效 JSON 片段。
// 这里负责找到第一个“像快照根对象”的 JSON，后面统一按快照解析。
const findSnapshotJson = async (extractDir: string) => {
  const candidateFiles = (await walkFiles(extractDir))
    .filter((file) => file.toLowerCase().endsWith('.json'))
    .sort();

  for (const candidateFile of candidateFiles) {
    try {
      const parsed = JSON.parse(await fs.readFile(candidateFile, 'utf8'));
      if (isValidSnapshotObject(parsed)) {
        return parsed;
      }
    } catch {
      // ignore invalid JSON fragments inside archive
    }
  }

  return null;
};

// 这是“公开分享链接 -> zip -> 解压 -> 找有效快照 JSON”的总入口。
// 它屏蔽了直链 zip、分享页跳转、解压失败和无效快照这些差异，最终只返回有效快照或失败原因。
const loadSnapshotFromUrl = async (
  url: string,
): Promise<
  | { status: 'valid'; snapshot: SnapshotRoot }
  | { status: 'invalid' | 'uncertain'; reason: string }
> => {
  let archiveBuffer: Buffer | null = null;

  if (DIRECT_ZIP_RE.test(url)) {
    const downloaded = await fetchBuffer(url);
    if (downloaded.status !== 'valid') {
      return {
        status: downloaded.status,
        reason: `快照压缩包下载失败: ${downloaded.reason}`,
      };
    }
    archiveBuffer = downloaded.buffer;
  } else {
    const shareMatch = url.match(SNAPSHOT_SHARE_RE);

    if (!shareMatch) {
      return {
        status: 'invalid',
        reason: '不支持的快照链接格式',
      };
    }

    if (shareMatch[2] === 'i') {
      const directAttachmentUrl = `https://github.com/user-attachments/files/${shareMatch[3]}/file.zip`;
      const directDownloaded = await fetchBuffer(directAttachmentUrl);

      if (directDownloaded.status === 'valid') {
        archiveBuffer = directDownloaded.buffer;
      } else if (directDownloaded.status === 'uncertain') {
        return {
          status: 'uncertain',
          reason: `快照压缩包下载失败: ${directDownloaded.reason}`,
        };
      }
    }

    if (!archiveBuffer) {
      const resolved = await resolveZipUrlFromSharePage(url);
      if (resolved.status !== 'valid') {
        return { status: resolved.status, reason: resolved.reason };
      }

      const fallbackDownloaded = await fetchBuffer(resolved.zipUrl);
      if (fallbackDownloaded.status !== 'valid') {
        return {
          status: fallbackDownloaded.status,
          reason: `快照压缩包下载失败: ${fallbackDownloaded.reason}`,
        };
      }

      archiveBuffer = fallbackDownloaded.buffer;
    }
  }

  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'gkd-issue-snap-'));
  const zipPath = path.join(tempRoot, 'snapshot.zip');
  const extractDir = path.join(tempRoot, 'extracted');

  try {
    await fs.writeFile(zipPath, archiveBuffer);
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
      return {
        status: 'invalid',
        reason: `压缩包无法解压: ${reason}`,
      };
    }

    const snapshot = await findSnapshotJson(extractDir);
    if (!snapshot) {
      return {
        status: 'invalid',
        reason: '压缩包中未找到有效快照 JSON',
      };
    }

    return { status: 'valid', snapshot };
  } finally {
    await fs.rm(tempRoot, { recursive: true, force: true });
  }
};

const joinUniqueText = (values: unknown[]) => {
  const items = uniqKeepOrder(
    values
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).trim())
      .filter(Boolean),
  );

  return items.length > 0 ? items.join(' / ') : '未知';
};

const toSnapshotNodes = (value: unknown) => {
  return Array.isArray(value)
    ? value.filter((item): item is SnapshotNode => isPlainObject(item))
    : [];
};

// 这里把新旧快照 JSON 统一规整成扁平记录。
// 应用/GKD 字段兼容、节点规模统计、QF 统计、缺失字段标记都在这一层完成，后面不再直接读原始 JSON。
const normalizeSnapshotRecord = (
  snapshot: SnapshotRoot,
  sourceUrl: string,
): NormalizedSnapshotRecord => {
  const appInfo = isPlainObject(snapshot.appInfo) ? snapshot.appInfo : null;
  const gkdAppInfo = isPlainObject(snapshot.gkdAppInfo)
    ? snapshot.gkdAppInfo
    : null;
  const device = isPlainObject(snapshot.device) ? snapshot.device : null;
  const nodes = toSnapshotNodes(snapshot.nodes);

  const nodeCount = nodes.length;
  const visibleNodeCount = nodes.filter((node) => {
    const attr = isPlainObject(node.attr) ? node.attr : null;
    return attr?.visibleToUser === true;
  }).length;
  const clickableNodeCount = nodes.filter((node) => {
    const attr = isPlainObject(node.attr) ? node.attr : null;
    return attr?.clickable === true;
  }).length;
  const qualifiedIdCount = nodes.filter((node) => {
    const attr = isPlainObject(node.attr) ? node.attr : null;
    return node.idQf === true && typeof attr?.id === 'string' && attr.id.trim();
  }).length;
  const qualifiedTextCount = nodes.filter((node) => {
    const attr = isPlainObject(node.attr) ? node.attr : null;
    return (
      node.textQf === true && typeof attr?.text === 'string' && attr.text.trim()
    );
  }).length;
  const hasQfSignals = nodes.some(
    (node) =>
      typeof node.idQf === 'boolean' || typeof node.textQf === 'boolean',
  );

  const missingFields = [
    snapshot.appId ? null : 'appId',
    snapshot.activityId ? null : 'activityId',
    device ? null : 'device',
    Array.isArray(snapshot.nodes) ? null : 'nodes',
  ].filter((item): item is string => Boolean(item));

  const hasNodes = nodeCount > 0;

  return {
    sourceUrl,
    appName: cleanCell(
      appInfo?.name ?? snapshot.appName ?? appInfo?.id ?? snapshot.appId,
    ),
    appId: cleanCell(appInfo?.id ?? snapshot.appId),
    appVersion: cleanCell(
      displayVersion(
        appInfo?.versionName ?? snapshot.appVersionName,
        appInfo?.versionCode ?? snapshot.appVersionCode,
      ),
    ),
    activityId: cleanCell(snapshot.activityId),

    resolution: cleanCell(
      snapshot.screenWidth !== undefined && snapshot.screenHeight !== undefined
        ? `${String(snapshot.screenWidth)}x${String(snapshot.screenHeight)}`
        : '未知',
    ),
    orientation:
      snapshot.isLandscape === true
        ? '横屏'
        : snapshot.isLandscape === false
          ? '竖屏'
          : '未知',
    deviceInfo: cleanCell(
      joinUniqueText([
        device?.brand,
        device?.manufacturer,
        device?.model,
        device?.device,
      ]),
    ),
    androidInfo: cleanCell(
      device?.release !== undefined || device?.sdkInt !== undefined
        ? `Android ${String(device?.release ?? '?')} / SDK ${String(
            device?.sdkInt ?? '?',
          )}`
        : '未知',
    ),
    gkdInfo: `${cleanCell(gkdAppInfo?.name ?? 'GKD')} ${cleanCell(
      displayVersion(
        gkdAppInfo?.versionName ??
          snapshot.gkdVersionName ??
          device?.gkdVersionName,
        gkdAppInfo?.versionCode ??
          snapshot.gkdVersionCode ??
          device?.gkdVersionCode,
      ),
    )}<br>${formatInlineCode(gkdAppInfo?.id ?? 'li.songe.gkd')}`,
    hasNodes,
    nodeCount: hasNodes ? nodeCount : null,
    visibleNodeCount: hasNodes ? visibleNodeCount : null,
    clickableNodeCount: hasNodes ? clickableNodeCount : null,
    qualifiedIdCount: hasNodes ? qualifiedIdCount : null,
    qualifiedTextCount: hasNodes ? qualifiedTextCount : null,
    legacySnapshot: !appInfo || !gkdAppInfo || (hasNodes && !hasQfSignals),
    missingFields,
    hasQfSignals,
  };
};

const sortRecords = (records: NormalizedSnapshotRecord[]) =>
  [...records].sort((left, right) => {
    return (
      left.appName.localeCompare(right.appName, 'zh-CN') ||
      left.appId.localeCompare(right.appId) ||
      left.appVersion.localeCompare(right.appVersion) ||
      left.activityId.localeCompare(right.activityId)
    );
  });

// 页面主表按 app + version + activityId 分组。
// 这样同一页面的多张快照会合并成一行，主表优先服务“快速筛单”，不让 issue 正文被重复页面撑长。
const summarizePageGroups = (records: NormalizedSnapshotRecord[]) => {
  const groups = new Map<string, NormalizedSnapshotRecord[]>();

  sortRecords(records).forEach((record) => {
    const groupKey = [
      record.appName,
      record.appId,
      record.appVersion,
      record.activityId,
    ].join('\u0000');
    const current = groups.get(groupKey);
    if (current) {
      current.push(record);
      return;
    }
    groups.set(groupKey, [record]);
  });

  const pageSummaries: PageSummary[] = [];

  groups.forEach((groupRecords) => {
    const first = groupRecords[0];
    const recordsWithNodes = groupRecords.filter((record) => record.hasNodes);
    const hasMissingNodes = groupRecords.some((record) => !record.hasNodes);
    const hasMissingFields = groupRecords.some(
      (record) => record.missingFields.length > 0,
    );
    const missingFieldNames = uniqKeepOrder(
      groupRecords.flatMap((record) => record.missingFields),
    );
    const hasQfSignals = recordsWithNodes.some((record) => record.hasQfSignals);
    const hasLegacySnapshot = groupRecords.some(
      (record) => record.legacySnapshot,
    );

    let nodeScaleText = '无节点数据';
    if (recordsWithNodes.length > 0) {
      nodeScaleText = `总 ${rangeText(
        recordsWithNodes.flatMap((record) =>
          record.nodeCount === null ? [] : [record.nodeCount],
        ),
      )} / 可见 ${rangeText(
        recordsWithNodes.flatMap((record) =>
          record.visibleNodeCount === null ? [] : [record.visibleNodeCount],
        ),
      )} / 可点 ${rangeText(
        recordsWithNodes.flatMap((record) =>
          record.clickableNodeCount === null ? [] : [record.clickableNodeCount],
        ),
      )}`;
    }

    let fastQueryText = '无节点数据';
    let hasNoFastQuery = false;
    let hasDataInsufficient = false;
    if (recordsWithNodes.length > 0) {
      if (!hasQfSignals) {
        fastQueryText = '数据不足';
        hasDataInsufficient = true;
      } else {
        const qualifiedIdValues = recordsWithNodes.flatMap((record) =>
          record.qualifiedIdCount === null ? [] : [record.qualifiedIdCount],
        );
        const qualifiedTextValues = recordsWithNodes.flatMap((record) =>
          record.qualifiedTextCount === null ? [] : [record.qualifiedTextCount],
        );
        const maxQualifiedId = Math.max(...qualifiedIdValues, 0);
        const maxQualifiedText = Math.max(...qualifiedTextValues, 0);

        if (maxQualifiedId === 0 && maxQualifiedText === 0) {
          fastQueryText = '无可用快查';
          hasNoFastQuery = true;
        } else {
          fastQueryText = `ID ${rangeText(qualifiedIdValues)} / 文本 ${rangeText(
            qualifiedTextValues,
          )}`;
        }
      }
    }

    pageSummaries.push({
      appName: first.appName,
      appId: first.appId,
      appVersion: first.appVersion,
      activityId: first.activityId,
      snapshotCount: groupRecords.length,
      nodeScaleText,
      fastQueryText,
      hasMissingNodes,
      hasMissingFields,
      hasNoFastQuery,
      hasLegacySnapshot,
      hasDataInsufficient,
      missingFieldNames,
    });
  });

  return pageSummaries;
};

// 运行环境仍按设备相关字段去重，避免同设备多快照重复占行。
// 这里与页面主表分离，是为了让 reviewer 单独看“页面差异”和“环境差异”。
const summarizeEnvGroups = (records: NormalizedSnapshotRecord[]) => {
  const groups = new Map<string, EnvSummary>();

  records.forEach((record) => {
    const groupKey = [
      record.resolution,
      record.orientation,
      record.deviceInfo,
      record.androidInfo,
      record.gkdInfo,
    ].join('\u0000');

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        resolution: record.resolution,
        orientation: record.orientation,
        deviceInfo: record.deviceInfo,
        androidInfo: record.androidInfo,
        gkdInfo: record.gkdInfo,
      });
    }
  });

  return [...groups.values()].sort((left, right) => {
    return (
      left.resolution.localeCompare(right.resolution) ||
      left.orientation.localeCompare(right.orientation, 'zh-CN') ||
      left.deviceInfo.localeCompare(right.deviceInfo, 'zh-CN') ||
      left.androidInfo.localeCompare(right.androidInfo) ||
      left.gkdInfo.localeCompare(right.gkdInfo)
    );
  });
};

const summarizeAppCount = (records: NormalizedSnapshotRecord[]) => {
  const appGroups = new Map<string, true>();
  records.forEach((record) => {
    appGroups.set(
      [record.appName, record.appId, record.appVersion].join('\u0000'),
      true,
    );
  });
  return appGroups.size;
};

const buildTitlePrefix = (records: NormalizedSnapshotRecord[]) => {
  const appNames = uniqKeepOrder(
    records
      .map((record) => record.appName)
      .filter((name) => name && name !== '未知'),
  );

  if (appNames.length > 0) {
    return appNames.join('/');
  }

  return uniqKeepOrder(
    records
      .map((record) => record.appId)
      .filter((appId) => appId && appId !== '未知'),
  ).join('/');
};

// 页面主表故意只保留最值得一眼扫过的信息。
// 应用列合并名称和包名，界面 ID 使用主表专用换行策略，减少横向宽度。
const renderPageRows = (pageSummaries: PageSummary[]) => {
  return pageSummaries
    .map(
      (summary, index) =>
        `| ${index + 1} | ${summary.appName}<br>${formatInlineCode(
          summary.appId,
        )} | ${formatInlineCode(summary.appVersion)} | ${formatActivityIdForMainTable(
          summary.activityId,
        )} | ${summary.snapshotCount} | ${summary.nodeScaleText} | ${summary.fastQueryText} |`,
    )
    .join('\n');
};

// 折叠详情专门承接主表为了压缩宽度而挪出去的信息。
// 完整 activityId、完整快查文本和备注都放这里，避免主表再次变宽。
const renderPageDetailRows = (pageSummaries: PageSummary[]) => {
  return pageSummaries
    .map(
      (summary, index) =>
        `| ${index + 1} | ${formatInlineCode(summary.appVersion)} | ${formatInlineCode(
          summary.activityId,
        )} | ${summary.fastQueryText} | ${buildPageRemarkList(summary)} |`,
    )
    .join('\n');
};

const renderEnvRows = (envSummaries: EnvSummary[]) => {
  return envSummaries
    .map(
      (summary, index) =>
        `| ${index + 1} | ${formatInlineCode(summary.resolution)} | ${
          summary.orientation
        } | ${summary.deviceInfo} | ${formatInlineCode(
          summary.androidInfo,
        )} | ${summary.gkdInfo} |`,
    )
    .join('\n');
};

// “值得注意”只放 issue 级别的高价值提醒。
// 逐页面的细节不在这里展开，而是留给折叠技术详情，避免顶部提示过于吵闹。
const buildWarningLines = (
  records: NormalizedSnapshotRecord[],
  pageSummaries: PageSummary[],
) => {
  const warningLines: string[] = [];

  if (records.some((record) => record.legacySnapshot)) {
    warningLines.push(
      '部分快照来自旧格式，已按兼容模式解析，技术信号可能不完整。',
    );
  }

  if (pageSummaries.some((summary) => summary.hasMissingNodes)) {
    warningLines.push('某些页面缺少 `nodes`，无法提供节点规模与快查信号。');
  }

  if (pageSummaries.some((summary) => summary.hasNoFastQuery)) {
    warningLines.push(
      '某些页面未检测到可用 `idQf/textQf`，规则可能需要完全遍历。',
    );
  }

  if (records.some((record) => record.missingFields.length > 0)) {
    warningLines.push('某些页面存在关键字段缺失，部分信息已显示为“未知”。');
  }

  return warningLines;
};

// block.md 是 workflow 回写 issue 正文时直接插入的完整区块。
// 这里统一组装概览、提醒、主表、折叠详情和环境表，确保渲染结构只在一处维护。
const buildMarkdownBlock = (params: {
  summary: IssueSnapshotSummary;
  pageRows: string;
  pageDetailRows: string;
  envRows: string;
}) => {
  const { summary, pageRows, pageDetailRows, envRows } = params;

  const sections = [
    '<!-- gkd-auto-parse:start -->',
    '## 📦 快照自动解析详情',
    '',
    '### 概览',
    '',
    `- 成功解析 ${summary.parsedCount}/${summary.sourceCount} 个快照`,
    `- 应用去重后 ${summary.appCount} 项，页面去重后 ${summary.pageCount} 项，环境去重后 ${summary.envCount} 项`,
  ];

  if (summary.warningLines.length > 0) {
    sections.push('', '### 值得注意', '');
    summary.warningLines.forEach((warningLine) => {
      sections.push(`- ${warningLine}`);
    });
  }

  sections.push(
    '',
    '### 页面快照汇总',
    '',
    '| # | 📱应用 | 🏷️应用版本 | 🧩界面ID | 🧾快照数 | 🌲节点规模 | ⚡快查 |',
    '| :-- | :--- | :--- | :--- | :--- | :--- | :--- |',
    pageRows,
    '',
    '### 页面技术详情',
    '',
    '<details>',
    '<summary>展开查看完整界面 ID 与技术备注</summary>',
    '',
    '| # | 🏷️应用版本 | 🧩完整界面ID | ⚡快查信号 | 📝备注 |',
    '| :-- | :--- | :--- | :--- | :--- |',
    pageDetailRows,
    '',
    '</details>',
    '',
    '### 运行环境汇总',
    '',
    '| # |📐分辨率 |🧭方向 |📱设备信息 |🤖Android |⚙️GKD |',
    '| :-- | :--- | :--- | :--- | :--- | :--- |',
    envRows,
    '<!-- gkd-auto-parse:end -->',
  );

  return `${sections.join('\n')}\n`;
};

// 这是脚本内部真正的业务主入口：逐个加载快照、规整、聚合，然后产出 summary 和 markdown block。
// 如果一个有效快照都没有，这里直接返回 success=false，让 workflow 继续沿用现有 invalid 提醒链路。
const buildSummary = async (sourceUrls: string[]) => {
  const records: NormalizedSnapshotRecord[] = [];
  let parsedCount = 0;

  for (const sourceUrl of sourceUrls) {
    const loadedSnapshot = await loadSnapshotFromUrl(sourceUrl);
    if (loadedSnapshot.status !== 'valid') {
      continue;
    }

    records.push(normalizeSnapshotRecord(loadedSnapshot.snapshot, sourceUrl));
    parsedCount += 1;
  }

  if (parsedCount === 0) {
    return {
      summary: {
        success: false,
        sourceCount: sourceUrls.length,
        parsedCount: 0,
        failedCount: sourceUrls.length,
        titlePrefix: '',
        appCount: 0,
        pageCount: 0,
        envCount: 0,
        warningLines: [],
      } satisfies IssueSnapshotSummary,
      block: '',
    };
  }

  const pageSummaries = summarizePageGroups(records);
  const envSummaries = summarizeEnvGroups(records);

  const summary: IssueSnapshotSummary = {
    success: true,
    sourceCount: sourceUrls.length,
    parsedCount,
    failedCount: sourceUrls.length - parsedCount,
    titlePrefix: buildTitlePrefix(records),
    appCount: summarizeAppCount(records),
    pageCount: pageSummaries.length,
    envCount: envSummaries.length,
    warningLines: buildWarningLines(records, pageSummaries),
  };

  return {
    summary,
    block: buildMarkdownBlock({
      summary,
      pageRows: renderPageRows(pageSummaries),
      pageDetailRows: renderPageDetailRows(pageSummaries),
      envRows: renderEnvRows(envSummaries),
    }),
  };
};

// 脚本最终只产出两个文件：
// 1. summary.json：给 workflow 读取状态、标题前缀和概览数字
// 2. block.md：给 workflow 原样回写到 issue 正文
const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  const urlsFile = path.resolve(process.cwd(), args.urlsFile);
  const outDir = path.resolve(process.cwd(), args.outDir);
  await fs.mkdir(outDir, { recursive: true });

  const sourceUrls = JSON.parse(await fs.readFile(urlsFile, 'utf8')) as unknown;
  if (!Array.isArray(sourceUrls)) {
    throw new Error('urls-file 必须是字符串数组 JSON');
  }

  const normalizedUrls = uniqKeepOrder(
    sourceUrls
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim())
      .filter(Boolean),
  );

  const { summary, block } = await buildSummary(normalizedUrls);

  await fs.writeFile(
    path.join(outDir, 'summary.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );
  await fs.writeFile(path.join(outDir, 'block.md'), block, 'utf8');
};

await main();
