// MIT: https://github.com/gregberge/svgr/blob/main/packages/webpack/src/index.ts
// TODO: prebuild @svgr/core @svgr/plugin-jsx @svgr/plugin-svgo

import { normalize } from 'node:path';
import { callbackify } from 'node:util';
import { type Config, type State, transform } from '@svgr/core';
import jsx from '@svgr/plugin-jsx';
import svgo from '@svgr/plugin-svgo';
import { transform as defaultEsbuildTransform } from '@winner-fed/bundler-utils/compiled/esbuild';
import type { LoaderContext } from '@winner-fed/bundler-webpack/compiled/webpack';

const tranformSvg = callbackify(
  async (contents: string, options: Config, state: Partial<State>) => {
    const jsCode = await transform(contents, options, state);
    const result = await defaultEsbuildTransform(jsCode, {
      loader: 'tsx',
      target: 'es2015',
    });
    if (!result?.code) {
      throw new Error(`Error while transforming using Esbuild`);
    }
    return result.code;
  },
);

function svgrLoader(this: LoaderContext<Config>, contents: string): void {
  this.cacheable?.();
  const callback = this.async();

  const options = this.getOptions();

  const previousExport = (() => {
    if (contents.startsWith('export ')) return contents;
    const exportMatches = contents.match(/^module.exports\s*=\s*(.*)/);
    return exportMatches ? `export default ${exportMatches[1]}` : null;
  })();

  const state = {
    caller: {
      name: 'svgr-loader',
      previousExport,
      defaultPlugins: [svgo, jsx] as any,
    },
    filePath: normalize(this.resourcePath),
  };

  if (!previousExport) {
    tranformSvg(contents, options, state, callback);
  } else {
    this.fs.readFile(this.resourcePath, (err, result) => {
      if (err) {
        callback(err);
        return;
      }
      tranformSvg(String(result), options, state, callback);
    });
  }
}

export default svgrLoader;
