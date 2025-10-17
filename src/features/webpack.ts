import type { IApi } from 'win';
import { getConfig } from './config/config';

export default (api: IApi) => {
  api.describe({
    key: 'preset-react:webpack',
  });

  api.chainWebpack((config) => {
    getConfig(config, api);
    return config;
  });

  // 修改webpack配置以支持React
  api.modifyWebpackConfig((config) => {
    // React相关的模块解析
    config.resolve = config.resolve || {};
    config.resolve.extensions = config.resolve.extensions || [];

    // 确保支持.jsx和.tsx文件
    if (!config.resolve.extensions.includes('.jsx')) {
      config.resolve.extensions.push('.jsx');
    }
    if (!config.resolve.extensions.includes('.tsx')) {
      config.resolve.extensions.push('.tsx');
    }

    // 添加React相关的别名
    config.resolve.alias = {
      ...config.resolve.alias,
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
      'react/jsx-dev-runtime': require.resolve('react/jsx-dev-runtime'),
    };

    // React FastRefresh配置
    if (
      api.env === 'development' &&
      api.userConfig.react?.fastRefresh !== false
    ) {
      const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
      config.plugins = config.plugins || [];
      config.plugins.push(
        new ReactRefreshWebpackPlugin({
          overlay: false,
        }),
      );
    }

    return config;
  });

  // 添加React相关的babel插件
  api.addExtraBabelPlugins(() => {
    const plugins = [];

    // 在开发环境下添加react-refresh插件
    if (
      api.env === 'development' &&
      api.userConfig.react?.fastRefresh !== false
    ) {
      plugins.push(require.resolve('react-refresh/babel'));
    }

    return plugins;
  });

  api.modifyConfig((memo) => {
    const enableMFSU = memo.mfsu && memo.mfsu !== false;
    if (enableMFSU) {
      memo.mfsu = {
        ...(memo.mfsu || {}),
        chainWebpack(config: Config) {
          getConfig(config, api);
          return config;
        },
      };
    }

    return memo;
  });
};
