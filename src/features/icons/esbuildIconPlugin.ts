import fs from 'node:fs';
import { logger } from '@winner-fed/utils';
import { extractIcons } from './extract';

const loaderMap = {
  js: 'tsx',
  jsx: 'tsx',
  tsx: 'tsx',
  ts: 'ts',
} as const;

export function esbuildIconPlugin(opts: {
  icons: Set<string>;
  alias: Record<string, string>;
}): any {
  return {
    name: 'esbuildCollectIconPlugin',
    setup(build: any) {
      Object.keys(loaderMap).forEach((extName) => {
        const filter = new RegExp(`\\.(${extName})$`);
        build.onLoad({ filter }, async (args: any) => {
          const contents = await fs.promises.readFile(args.path, 'utf-8');
          const icons = extractIcons(contents);
          logger.debug(`[reactIcons] ${args.path} > ${icons}`);
          icons.forEach((icon: string) => {
            // just add
            // don't handle delete for dev
            opts.icons.add(opts.alias[icon] || icon);
          });

          return {
            contents,
            loader: loaderMap[extName as keyof typeof loaderMap],
          };
        });
      });
    },
  };
}
