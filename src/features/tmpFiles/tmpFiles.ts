import { getRoutes } from '@winner-fed/core';
import { lodash, winPath } from '@winner-fed/utils';
import { basename, dirname, join } from 'path';
import type { IApi } from 'win';
import { TEMPLATES_DIR } from '../../constants';
import { getRouteComponents } from './routes';

export default (api: IApi) => {
  api.describe({
    key: 'preset-react:tmpFiles',
  });

  api.onGenerateFiles(async (opts) => {
    const rendererPath = winPath(
      await api.applyPlugins({
        key: 'modifyRendererPath',
        initialValue: dirname(
          require.resolve('@winner-fed/renderer-react/package.json'),
        ),
      }),
    );

    const { historyWithQuery } = api.config;
    const historyPath = historyWithQuery
      ? winPath(dirname(require.resolve('@umi/history/package.json')))
      : rendererPath;
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/history.ts',
      tplPath: join(TEMPLATES_DIR, 'history.tpl'),
      context: {
        historyPath,
      },
    });
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/historyIntelli.ts',
      tplPath: join(TEMPLATES_DIR, 'historyIntelli.tpl'),
      context: {
        historyPath,
      },
    });

    // EmptyRoute.tsx
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/EmptyRoute.tsx',
      // https://github.com/umijs/umi/issues/8782
      // Empty <Outlet /> needs to pass through outlet context, otherwise nested route will not get context value.
      content: `
import React from 'react';
import { Outlet, useOutletContext } from 'winjs';
export default function EmptyRoute() {
  const context = useOutletContext();
  return <Outlet context={context} />;
}
      `,
    });

    // route.ts
    let routes: any;
    if (opts.isFirstTime) {
      routes = api.appData.routes;
    } else {
      routes = await getRoutes({
        api,
      });
      // refresh route data, prevent route data outdated
      // this can immediately get the latest `icon`... props in routes config
      api.appData.routes = routes;
    }

    const hasSrc = api.appData.hasSrcDir;
    // @/pages/
    const pages = basename(
      api.config.conventionRoutes?.base || api.paths.absPagesPath,
    );
    const prefix = hasSrc ? `../../../src/${pages}/` : `../../${pages}/`;
    const clonedRoutes = lodash.cloneDeep(routes);
    for (const id of Object.keys(clonedRoutes)) {
      for (const key of Object.keys(clonedRoutes[id])) {
        const route = clonedRoutes[id];
        // Remove __ prefix props, absPath props and file props
        if (key.startsWith('__') || ['absPath', 'file'].includes(key)) {
          delete route[key];
        }
      }
    }

    // header imports
    const headerImports: string[] = [];

    // trim quotes
    let routesString = JSON.stringify(clonedRoutes);
    if (api.config.clientLoader) {
      // "clientLoaders['foo']" > clientLoaders['foo']
      routesString = routesString.replace(/"(clientLoaders\[.*?)"/g, '$1');
      // import: client loader
      headerImports.push(`import clientLoaders from './loaders.js';`);
    }
    // routeProps is enabled for conventional routes
    // e.g. dumi 需要用到约定式路由但又不需要 routeProps
    if (!api.userConfig.routes && api.isPluginEnable('routeProps')) {
      // routeProps":"routeProps['foo']" > ...routeProps['foo']
      routesString = routesString.replace(
        /"routeProps":"(routeProps\[.*?)"/g,
        '...$1',
      );
      // import: route props
      headerImports.push(`import routeProps from './routeProps';`);
      // prevent override internal route props
      headerImports.push(`
if (process.env.NODE_ENV === 'development') {
  Object.entries(routeProps).forEach(([key, value]) => {
    const internalProps = ['path', 'id', 'parentId', 'isLayout', 'isWrapper', 'layout', 'clientLoader'];
    Object.keys(value).forEach((prop) => {
      if (internalProps.includes(prop)) {
        throw new Error(
          \`[WinJS] route '\${key}' should not have '\${prop}' prop, please remove this property in 'routeProps'.\`
        )
      }
    })
  })
}
`);
    }

    // import: react
    headerImports.push(`import React from 'react';`);

    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/route.tsx',
      tplPath: join(TEMPLATES_DIR, 'route.tpl'),
      context: {
        headerImports: headerImports.join('\n'),
        routes: routesString,
        routeComponents: await getRouteComponents({
          routes,
          prefix,
          api,
        }),
      },
    });
  });
};
