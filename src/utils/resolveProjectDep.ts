import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

export function resolveProjectDep(opts: {
  pkg: any;
  cwd: string;
  dep: string;
}): string | null {
  const { pkg, cwd, dep } = opts;

  // 检查项目依赖中是否存在该包
  const deps = {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };

  if (!deps[dep]) {
    return null;
  }

  // 尝试解析包路径
  try {
    const packageJsonPath = require.resolve(`${dep}/package.json`, {
      paths: [cwd],
    });
    return dirname(packageJsonPath);
  } catch {
    // 如果解析失败，尝试在node_modules中查找
    const nodeModulesPath = join(cwd, 'node_modules', dep);
    if (existsSync(nodeModulesPath)) {
      return nodeModulesPath;
    }
    return null;
  }
}

export function resolveReactPath(opts: {
  pkg: any;
  cwd: string;
  path: string;
}): string {
  const reactPath = resolveProjectDep({
    pkg: opts.pkg,
    cwd: opts.cwd,
    dep: 'react',
  });

  if (reactPath) {
    return join(reactPath, opts.path);
  }

  // 回退到内置的React
  return require.resolve(`react/${opts.path}`);
}
