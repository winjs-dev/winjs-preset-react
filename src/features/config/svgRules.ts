import { join } from 'node:path';
import type Config from '@winner-fed/bundler-webpack/compiled/webpack-5-chain';
import type { IApi } from '@winner-fed/winjs';

interface IOpts {
  config: Config;
  api: IApi;
}

export async function addSVGRules({ api, config }: IOpts) {
  const { userConfig } = api;
  const reactIcons = userConfig.reactIcons || {};
  const { svgr, svgo = {} } = reactIcons;
  if (svgr) {
    const svgrRule = config.module.rule('svgr');
    svgrRule
      .test(/\.svg$/)
      .issuer(/\.[jt]sx?$/)
      .type('javascript/auto')
      .use('svgr-loader')
      .loader(require.resolve('../../loader/svgr'))
      .options({
        svgoConfig: {
          plugins: [
            {
              name: 'preset-default',
              params: {
                overrides: {
                  removeTitle: false,
                },
              },
            },
            'prefixIds',
          ],
          ...svgo,
        },
        ...(typeof svgr === 'object' ? svgr : {}),
        svgo: !!svgo,
      })
      .end()
      .use('url-loader')
      .loader(
        require.resolve('@winner-fed/bundler-webpack/compiled/url-loader'),
      )
      .options({
        limit: userConfig.inlineLimit,
        fallback: require.resolve(
          '@winner-fed/bundler-webpack/compiled/file-loader',
        ),
      })
      .end();
  }
  if (svgo !== false) {
    const svgRule = config.module.rule('svg');
    svgRule
      .test(/\.svg$/)
      .use('svgo-loader')
      .loader(
        require.resolve('@winner-fed/bundler-webpack/compiled/svgo-loader'),
      )
      .options({ configFile: false, ...svgo })
      .end();
  }
}
