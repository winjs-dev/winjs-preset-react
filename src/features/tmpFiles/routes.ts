import { componentToChunkName } from '@winner-fed/core';
import { winPath } from '@winner-fed/utils';
import { isAbsolute, join } from 'path';
import type { IApi } from 'win';

const IMPORT_EMPTY_ROUTE_CJS = `() => Promise.resolve(require('./EmptyRoute'))`;
const IMPORT_EMPTY_ROUTE_ESM = `() => import('./EmptyRoute')`;

export async function getRouteComponents(opts: {
  routes: Record<string, any>;
  prefix: string;
  api: IApi;
}) {
  const imports = Object.keys(opts.routes)
    .map((key) => {
      const route = opts.routes[key];
      const useCjsModule = opts.api.config.routeLoader?.moduleType === 'cjs';
      if (!route.file) {
        // 测试环境还不支持 import ，所以用 require
        if (process.env.NODE_ENV === 'test') {
          return `'${key}': require('./EmptyRoute').default,`;
        }
        const importEmptyRoute = useCjsModule
          ? IMPORT_EMPTY_ROUTE_CJS
          : IMPORT_EMPTY_ROUTE_ESM;
        return `'${key}': React.lazy(${importEmptyRoute}),`;
      }
      if (route.hasClientLoader) {
        route.file = join(
          opts.api.paths.absTmpPath,
          'pages',
          route.id.replace(/[\/\-]/g, '_') + '.js',
        );
      }
      // e.g.
      // component: () => <h1>foo</h1>
      // component: (() => () => <h1>foo</h1>)()
      if (route.file.startsWith('(')) {
        // Compatible with none default route exports
        // e.g. https://github.com/umijs/umi/blob/0d40a07bf28b0760096cbe2f22da4d639645b937/packages/plugins/src/qiankun/master.ts#L55
        return `'${key}': React.lazy(
              () => Promise.resolve(${route.file}).then(e => e?.default ? e : ({ default: e }))
            ),`;
      }

      const path =
        isAbsolute(route.file) || route.file.startsWith('@/')
          ? route.file
          : `${opts.prefix}${route.file}`;

      const webpackChunkName = componentToChunkName(path, opts.api.cwd);

      // 测试环境还不支持 import ，所以用 require
      if (process.env.NODE_ENV === 'test') {
        return `'${key}': require('${winPath(path)}').default,`;
      }

      // ref: https://github.com/umijs/umi/issues/11466
      if (useCjsModule) {
        return `'${key}': React.lazy(() => Promise.resolve(require('${winPath(
          path,
        )}'))),`;
      }
      return `'${key}': React.lazy(() => import(/* webpackChunkName: "${webpackChunkName}" */'${winPath(
        path,
      )}')),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}
