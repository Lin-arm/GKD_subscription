import fs from 'node:fs/promises';
import path from 'node:path';

type ScopeState =
  | 'pr_files'
  | 'push_files'
  | 'no_resource_files'
  | 'unresolved';
type ScopeSource = 'pr' | 'push' | 'none';

type Args = {
  repoOwner: string;
  repoName: string;
  branch: string;
  before: string;
  current: string;
  eventFile: string;
  githubToken: string;
  outDir: string;
};

type ScopeReport = {
  scopeState: ScopeState;
  scopeSource: ScopeSource;
  resourceFiles: string[];
  scopeMessage: string;
  prNumbers: number[];
};

type PullRequest = {
  number?: number;
};

type PullRequestFile = {
  filename?: string;
};

type CompareCommitsResponse = {
  files?: Array<{
    filename?: string;
  }>;
};

type PushEventPayload = {
  commits?: Array<{
    added?: string[];
    modified?: string[];
    removed?: string[];
  }>;
};

const RESOURCE_FILE_RE = /^(src\/apps\/.+\.ts|src\/globalGroups\.ts)$/;
const PER_PAGE = 100;

const normalizeRepoPath = (value: string) =>
  value.replace(/\\/g, '/').replace(/^\.\//, '').trim();

const uniqSorted = (items: string[]) =>
  [
    ...new Set(items.map(normalizeRepoPath).filter((item) => item.length > 0)),
  ].sort();

const filterResourceFiles = (files: string[]) =>
  uniqSorted(files).filter((file) => RESOURCE_FILE_RE.test(file));

// 这个脚本只负责“识别本次 push 该检查哪些资源文件”，
// 把 PR changed files / push changed files 的优先级和回退策略固定下来，
// 让 workflow 本身只负责消费 scope.json，而不用再塞长段 github-script。
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
    repoOwner: getArg('--repo-owner'),
    repoName: getArg('--repo-name'),
    branch: getArg('--branch'),
    before: getArg('--before'),
    current: getArg('--current'),
    eventFile: getArg('--event-file'),
    githubToken: getArg('--github-token'),
    outDir: getArg('--out-dir'),
  };
};

const createGitHubHeaders = (token: string) => ({
  Accept: 'application/vnd.github+json',
  Authorization: `Bearer ${token}`,
  'User-Agent': 'gkd-push-resource-scope',
  'X-GitHub-Api-Version': '2022-11-28',
});

const requestGitHubJson = async <T>(
  pathname: string,
  params: Record<string, string | number | undefined>,
  token: string,
): Promise<T> => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const url = `https://api.github.com${pathname}${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    headers: createGitHubHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`${pathname} returned HTTP ${response.status}`);
  }

  return (await response.json()) as T;
};

const paginateGitHubJson = async <T>(
  pathname: string,
  params: Record<string, string | number | undefined>,
  token: string,
) => {
  const items: T[] = [];
  let page = 1;

  while (true) {
    const currentPage = await requestGitHubJson<T[]>(
      pathname,
      {
        ...params,
        per_page: PER_PAGE,
        page,
      },
      token,
    );

    items.push(...currentPage);

    if (currentPage.length < PER_PAGE) {
      break;
    }

    page += 1;
  }

  return items;
};

const listOpenPullRequests = async (
  owner: string,
  repo: string,
  branch: string,
  token: string,
) =>
  await paginateGitHubJson<PullRequest>(
    `/repos/${owner}/${repo}/pulls`,
    {
      state: 'open',
      head: `${owner}:${branch}`,
    },
    token,
  );

const listPullRequestFiles = async (
  owner: string,
  repo: string,
  pullNumber: number,
  token: string,
) =>
  await paginateGitHubJson<PullRequestFile>(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
    {},
    token,
  );

const compareCommitFiles = async (
  owner: string,
  repo: string,
  before: string,
  current: string,
  token: string,
) => {
  const response = await requestGitHubJson<CompareCommitsResponse>(
    `/repos/${owner}/${repo}/compare/${before}...${current}`,
    {},
    token,
  );

  return (response.files ?? [])
    .map((file) => file.filename)
    .filter((file): file is string => typeof file === 'string');
};

const readPushEventFiles = async (eventFile: string) => {
  try {
    const payload = JSON.parse(
      await fs.readFile(path.resolve(process.cwd(), eventFile), 'utf8'),
    ) as PushEventPayload;

    const files: string[] = [];
    for (const commit of payload.commits ?? []) {
      files.push(
        ...(commit.added ?? []),
        ...(commit.modified ?? []),
        ...(commit.removed ?? []),
      );
    }

    return uniqSorted(files);
  } catch {
    return [];
  }
};

// 范围识别优先级固定为：
// 1. 当前分支已有 open PR -> 用 PR changed files
// 2. 无 PR -> 用本次 push 的 compare 或事件 payload
// 3. 两者都拿不到 -> 明确标记 unresolved，并安全跳过资源链接检查
const resolveScope = async (args: Args): Promise<ScopeReport> => {
  let prNumbers: number[] = [];

  try {
    const pulls = await listOpenPullRequests(
      args.repoOwner,
      args.repoName,
      args.branch,
      args.githubToken,
    );

    prNumbers = pulls
      .map((pull) => pull.number)
      .filter((number): number is number => typeof number === 'number');

    if (prNumbers.length > 0) {
      const prFiles: string[] = [];

      for (const pullNumber of prNumbers) {
        const files = await listPullRequestFiles(
          args.repoOwner,
          args.repoName,
          pullNumber,
          args.githubToken,
        );
        prFiles.push(
          ...files
            .map((file) => file.filename)
            .filter((file): file is string => typeof file === 'string'),
        );
      }

      const resourceFiles = filterResourceFiles(prFiles);
      if (resourceFiles.length > 0) {
        return {
          scopeState: 'pr_files',
          scopeSource: 'pr',
          resourceFiles,
          scopeMessage: `资源链接检查来源：PR 文件集（命中 ${resourceFiles.length} 个资源文件）。`,
          prNumbers,
        };
      }

      return {
        scopeState: 'no_resource_files',
        scopeSource: 'pr',
        resourceFiles: [],
        scopeMessage:
          '资源链接检查已跳过：当前分支已有 open PR，但 PR 改动未触碰 src/apps/*.ts 或 src/globalGroups.ts。',
        prNumbers,
      };
    }
  } catch (error) {
    console.log(
      `获取 open PR 文件集失败，回退到 push 文件集：${String(error)}`,
    );
  }

  let pushFiles: string[] = [];

  if (args.before && !/^0+$/.test(args.before)) {
    try {
      pushFiles = await compareCommitFiles(
        args.repoOwner,
        args.repoName,
        args.before,
        args.current,
        args.githubToken,
      );
    } catch (error) {
      console.log(
        `compare commits 失败，回退到 push 事件文件列表：${String(error)}`,
      );
    }
  }

  if (pushFiles.length === 0) {
    pushFiles = await readPushEventFiles(args.eventFile);
  }

  if (pushFiles.length > 0) {
    const resourceFiles = filterResourceFiles(pushFiles);
    if (resourceFiles.length > 0) {
      return {
        scopeState: 'push_files',
        scopeSource: 'push',
        resourceFiles,
        scopeMessage: `资源链接检查来源：本次 push 文件集（命中 ${resourceFiles.length} 个资源文件）。`,
        prNumbers,
      };
    }

    return {
      scopeState: 'no_resource_files',
      scopeSource: 'push',
      resourceFiles: [],
      scopeMessage:
        '资源链接检查已跳过：本次 push 未触碰 src/apps/*.ts 或 src/globalGroups.ts。',
      prNumbers,
    };
  }

  return {
    scopeState: 'unresolved',
    scopeSource: 'none',
    resourceFiles: [],
    scopeMessage:
      '资源链接检查已跳过：当前没有可用 PR 文件集，也无法从本次 push 事件恢复精确文件列表。',
    prNumbers,
  };
};

const main = async () => {
  const args = parseArgs();
  const report = await resolveScope(args);

  await fs.mkdir(args.outDir, { recursive: true });
  await fs.writeFile(
    path.join(args.outDir, 'scope.json'),
    `${JSON.stringify(report, null, 2)}\n`,
    'utf8',
  );

  console.log(report.scopeMessage);
  if (report.prNumbers.length > 0) {
    console.log(`关联 open PR：${report.prNumbers.join(', ')}`);
  }
  if (report.resourceFiles.length > 0) {
    console.log(`资源文件列表：${report.resourceFiles.join(', ')}`);
  }
};

await main();
