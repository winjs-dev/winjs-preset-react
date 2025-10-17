/**
 * rsbuild
 * @Author: liwb (lwbhtml@163.com)
 * @Date: 2025-10-17 15:30
 * @LastEditTime: 2025-10-17 15:30
 * @Description: rsbuild
 */
import { pluginReact } from '@rsbuild/plugin-react';
import { pluginSvgr } from '@rsbuild/plugin-svgr';
import type { IApi } from 'win';

export default (api: IApi) => {
  api.describe({
    key: 'preset-react:rsbuild',
  });

  api.modifyRsbuildConfig((config) => {
    const { reactIcons } = api.userConfig;
    const { svgr } = reactIcons ?? {};

    // 添加 SVGR 插件
    if (svgr) {
      config.plugins?.push(
        pluginSvgr({
          mixedImport: true,
          svgrOptions: typeof svgr === 'object' ? svgr : {},
        }),
      );
    }

    // 添加 React 插件
    const reactOptions = {
      swcReactOptions: {
        development: api.env === 'development',
      },
      ...(api.userConfig?.react || {}),
    };

    config.plugins?.push(pluginReact(reactOptions));
    return config;
  });
};
