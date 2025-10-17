import { dirname, join } from 'path';
import type { IApi } from 'win';
import { resolveProjectDep } from '../utils/resolveProjectDep';

export default (api: IApi) => {
  api.describe({
    key: 'preset-react:default',
  });
  const { userConfig } = api;
  api.modifyDefaultConfig((config) => {
    // React和React-DOM别名配置
    const reactPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'react',
      }) || dirname(require.resolve('react/package.json'));

    const reactDomPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'react-dom',
      }) || dirname(require.resolve('react-dom/package.json'));

    const reactRouterPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: 'react-router',
      }) || dirname(require.resolve('react-router/package.json'));

    config.alias = {
      ...config.alias,
      react: reactPath,
      'react-dom': reactDomPath,
      // mpa don't need to use react-router
      ...(userConfig.mpa
        ? {}
        : {
            'react-router': reactRouterPath,
          }),
    };

    return config;
  });

  api.modifyConfig((memo) => {
    // 启用React FastRefresh
    if (api.userConfig.react?.fastRefresh !== false) {
      memo.fastRefresh = true;
    }

    return memo;
  });

  api.modifyAppData((memo) => {
    memo.react = {
      version: require(join(api.config.alias.react, 'package.json')).version,
      path: api.config.alias.react,
    };
    memo['react-dom'] = {
      version: require(join(api.config.alias['react-dom'], 'package.json'))
        .version,
      path: api.config.alias['react-dom'],
    };

    memo.framework = 'react';
    return memo;
  });

  // used in esmi and vite
  api.register({
    key: 'updateAppDataDeps',
    async fn() {
      // FIXME: force include react & react-dom
      if (api.appData.deps['react']) {
        api.appData.deps['react'].version = api.appData.react.version;
      }
      api.appData.deps['react-dom'] = {
        version: api.appData.react.version,
        matches: ['react-dom'],
        subpaths: [],
      };
    },
  });

  // 设置React渲染器
  api.modifyRendererPath(() =>
    dirname(require.resolve('@winner-fed/renderer-react/package.json')),
  );

  // 配置Babel预设
  api.modifyBabelPresetOpts((memo) => {
    memo.presetReact = {
      runtime: 'automatic',
      development: api.env === 'development',
    };

    memo.presetTypeScript = {
      isTSX: true,
      allExtensions: true,
    };

    return memo;
  });

  // 添加运行时插件键
  // api.addRuntimePluginKey(() => [
  //   'patchClientRoutes',
  //   'patchRoutes',
  //   'render',
  //   'onRouteChange',
  //   'modifyContextOpts',
  //   'modifyRendererProps',
  //   'modifyRouterProps',
  //   'modifyAppRenderProps',
  //   'rootContainer',
  // ]);
};
