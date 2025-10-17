import { dirname } from 'path';
import type { IApi } from 'win';
import { resolveProjectDep } from '../../utils/resolveProjectDep';

export default (api: IApi) => {
  api.describe({
    key: 'forget',
    config: {
      schema({ zod }) {
        return zod.object({
          ReactCompilerConfig: zod.object({}).optional(),
        });
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onCheckConfig(() => {
    if (api.config.mfsu) {
      throw new Error(
        `React Compiler (forget) 与 mfsu 不兼容，请先禁用 mfsu。`,
      );
    }
  });

  api.onCheck(() => {
    let reactMajorVersion = api.appData.react?.version?.split('.')[0];
    if (reactMajorVersion && parseInt(reactMajorVersion) < 19) {
      throw new Error(
        `React Compiler (forget) 仅兼容 React 19 及以上版本，请升级您的 React 版本。`,
      );
    }
  });

  const BABEL_PLUGIN_NAME = `babel-plugin-react-compiler`;
  let libPath: string;

  try {
    libPath =
      resolveProjectDep({
        pkg: api.pkg,
        cwd: api.cwd,
        dep: BABEL_PLUGIN_NAME,
      }) || dirname(require.resolve(`${BABEL_PLUGIN_NAME}/package.json`));
  } catch (e) {
    // 如果找不到插件，使用内置版本
    libPath = dirname(require.resolve(`${BABEL_PLUGIN_NAME}/package.json`));
  }

  api.modifyConfig((memo) => {
    if (api.userConfig.react?.forget) {
      let ReactCompilerConfig =
        api.userConfig.react.forget.ReactCompilerConfig || {};
      return {
        ...memo,
        extraBabelPlugins: [
          ...(memo.extraBabelPlugins || []),
          [libPath, ReactCompilerConfig],
        ],
      };
    }
    return memo;
  });
};
