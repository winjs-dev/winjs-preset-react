/**
 * vite
 * @Author: liwb (lwbhtml@163.com)
 * @Date: 2025-09-26 17:23
 * @LastEditTime: 2025-09-26 17:23
 * @Description: vite
 */
import reactPlugin from '@vitejs/plugin-react';
import type { IApi } from 'win';
import svgrPlugin from './svgr';

export default (api: IApi) => {
  api.describe({
    key: 'preset-react:vite',
  });

  api.modifyViteConfig((config: any) => {
    const { reactIcons } = api.userConfig;
    const { svgr, svgo = {} } = reactIcons ?? {};
    // 添加 SVGR 插件
    if (svgr) {
      config.plugins?.push(
        svgrPlugin(typeof svgr === 'object' ? svgr : {}, svgo),
      );
    }

    // 添加 React 插件
    config.plugins?.push(
      reactPlugin({
        babel: {
          plugins: api.userConfig.extraBabelPlugins,
          presets: api.userConfig.extraBabelPresets,
        },
        ...(api.userConfig?.react || {}),
      }),
    );

    return config;
  });
};
