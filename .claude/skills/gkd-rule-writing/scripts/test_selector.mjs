// 在一个或多个 GKD 快照上批量测试选择器，输出每个快照的命中节点。
//
// 用法：
//   node test_selector.mjs <快照.zip | 解压目录 | .json> [...] -- <选择器> [...]
//
// 说明：
// - 使用项目已安装的 @gkd-kit/selector（@gkd-kit/tools 的依赖），不新增依赖。
// - 只模拟普通遍历查询；快速查询是否可用，看输出的 fastQuery 列表是否为空。
import console from 'node:console';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

/** 从 @gkd-kit/tools 的依赖链解析 @gkd-kit/selector 的入口文件 */
async function loadSelectorLib() {
  const require = createRequire(path.join(process.cwd(), 'package.json'));
  const toolsDir = path.dirname(require.resolve('@gkd-kit/tools/package.json'));
  const toolsRequire = createRequire(path.join(toolsDir, 'package.json'));
  const selectorDir = path.dirname(
    toolsRequire.resolve('@gkd-kit/selector/package.json'),
  );
  const pkg = JSON.parse(
    fs.readFileSync(path.join(selectorDir, 'package.json'), 'utf8'),
  );
  return import(pathToFileURL(path.join(selectorDir, pkg.main)).href);
}

/** 从 zip 中读取第一个 .json 条目（只解析中央目录，支持 store / deflate） */
function readJsonFromZip(buf) {
  let eocd = buf.length - 22;
  while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('不是有效的 zip 文件');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    if (name.endsWith('.json')) {
      const lNameLen = buf.readUInt16LE(localOffset + 26);
      const lExtraLen = buf.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + lNameLen + lExtraLen;
      const raw = buf.subarray(start, start + compSize);
      const data = method === 0 ? raw : zlib.inflateRawSync(raw);
      return data.toString('utf8');
    }
    p += 46 + nameLen + extraLen + commentLen;
  }
  throw new Error('zip 内没有 json 文件');
}

/** 读取快照，支持 zip / 解压目录 / json 文件 */
function loadSnapshot(p) {
  const stat = fs.statSync(p);
  if (stat.isDirectory()) {
    const file = fs.readdirSync(p).find((f) => f.endsWith('.json'));
    if (!file) throw new Error(`${p} 下没有 json 文件`);
    return JSON.parse(fs.readFileSync(path.join(p, file), 'utf8'));
  }
  if (p.endsWith('.zip'))
    return JSON.parse(readJsonFromZip(fs.readFileSync(p)));
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** 把快照节点连成树（节点 id 即数组下标） */
function buildTree(snapshot) {
  const nodes = snapshot.nodes.map((n) => ({ ...n, children: [] }));
  for (const n of nodes) {
    n.parent = n.pid >= 0 ? nodes[n.pid] : null;
    if (n.parent) n.parent.children.push(n);
  }
  return nodes[0];
}

/**
 * 构建 selector 所需的 Transform。
 * 移植自官方审查工具 gkd-kit/inspect 的 src/entities/selector/parser.ts，
 * 保证 text.length、parent.childCount.minus(1)、getChild()、getPrev() 等写法与 i.gkd.li 行为一致。
 */
function buildTransform(lib) {
  const isNode = (t) => t != null && typeof t === 'object' && 'attr' in t;
  const getNodeAttr = (target, name) => {
    if (name === '_id') return target.id;
    if (name === '_pid') return target.pid;
    if (name === 'parent') return target.parent ?? null;
    return target.attr[name] ?? null;
  };
  const getNodeInvoke = (target, name, args) => {
    if (name === 'getChild') {
      return target.children[args.asJsReadonlyArrayView()[0]] ?? null;
    }
    return null;
  };
  return lib.Transform.Companion.multiplatformBuild(
    (target, name) => {
      if (typeof target === 'string') return lib.getStringAttr(target, name);
      if (target instanceof lib.QueryContext) {
        if (name === 'prev') return target.prev;
        if (name === 'current') return target.current;
        return getNodeAttr(target.current, name);
      }
      if (isNode(target)) return getNodeAttr(target, name);
      return null;
    },
    (target, name, args) => {
      if (typeof target === 'number')
        return lib.getIntInvoke(target, name, args);
      if (typeof target === 'boolean')
        return lib.getBooleanInvoke(target, name, args);
      if (typeof target === 'string')
        return lib.getStringInvoke(target, name, args);
      if (target instanceof lib.QueryContext) {
        if (name === 'getPrev') {
          const i = args.asJsReadonlyArrayView()[0];
          return Number.isSafeInteger(i) ? target.getPrev(i) : null;
        }
        return getNodeInvoke(target.current, name, args);
      }
      if (isNode(target)) return getNodeInvoke(target, name, args);
      return null;
    },
    (n) => n.attr.name,
    (n) => n.children,
    (n) => n.parent || null,
  );
}

/** 生成节点的简短描述 */
function describe(n) {
  const a = n.attr;
  const label = [
    a.vid && `vid=${a.vid}`,
    a.text && `text=${JSON.stringify(a.text)}`,
    a.desc && `desc=${JSON.stringify(a.desc)}`,
  ]
    .filter(Boolean)
    .join(' ');
  return `#${n.id} ${(a.name || '').split('.').pop()} ${label} [${a.left},${a.top},${a.right},${a.bottom}]`;
}

async function main() {
  const args = process.argv.slice(2);
  const sep = args.indexOf('--');
  if (sep <= 0 || sep === args.length - 1) {
    console.error('用法: node test_selector.mjs <快照...> -- <选择器...>');
    process.exit(1);
  }
  const snapshotPaths = args.slice(0, sep);
  const selectors = args.slice(sep + 1);
  const lib = await loadSelectorLib();
  const option = new lib.MatchOption(false);
  const transform = buildTransform(lib);
  const typeInfo = lib.initDefaultTypeInfo(true).globalType;

  const parsed = selectors.map((source) => {
    let selector;
    try {
      selector = lib.Selector.Companion.parse(source);
      // 与审查工具一致：做类型检查，属性名写错或类型不匹配会直接报错
      selector.checkType(typeInfo);
    } catch (e) {
      const msg = e instanceof lib.GkdException ? e.outMessage : String(e);
      console.error(`非法选择器: ${source}\n  ${msg}`);
      process.exit(1);
    }
    const fastQuery = selector.fastQueryList
      .asJsReadonlyArrayView()
      .map((q) => q.toString());
    return { source, selector, fastQuery };
  });
  const trees = snapshotPaths.map((p) => {
    const snapshot = loadSnapshot(p);
    return { p, snapshot, root: buildTree(snapshot) };
  });

  for (const { source, selector, fastQuery } of parsed) {
    console.log(`\n选择器: ${source}`);
    console.log(
      `  fastQuery: ${fastQuery.length ? fastQuery.join(', ') : '（无，不能快速查询）'}`,
    );
    for (const { p, snapshot, root } of trees) {
      // 与审查工具的 querySelfOrSelectorAll 一致：根节点自身也参与匹配
      const self = selector.match(root, transform, option) ? [root] : [];
      const result = self.concat(
        transform.querySelectorAllArray(root, selector, option),
      );
      console.log(
        `  [${result.length}] ${path.basename(p)} (${snapshot.activityId})`,
      );
      for (const n of result) console.log(`      ${describe(n)}`);
    }
  }
}

await main();
