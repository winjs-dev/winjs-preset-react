import {
  crossSpawn,
  importLazy,
  installWithNpmClient,
  logger,
  winPath,
} from '@winner-fed/utils';
import fs from 'fs';
import path from 'path';
import type { IApi } from 'win';
import { addDeps } from './depsOnDemand';

export default (api: IApi) => {
  const iconPlugin: typeof import('./esbuildIconPlugin') = importLazy(
    require.resolve('./esbuildIconPlugin'),
  );
  const svgr: typeof import('./svgr') = importLazy(require.resolve('./svgr'));

  api.describe({
    key: 'reactIcons',
    config: {
      schema({ zod }) {
        return zod
          .object({
            svgr: zod.object({}),
            svgo: zod.object({}),
            autoInstall: zod.object({}),
            defaultComponentConfig: zod.object({}),
            // e.g. alias: { home: 'fa:home' }
            alias: zod.object({}),
            include: zod.array(zod.string()),
          })
          .deepPartial();
      },
    },
    enableBy: api.EnableBy.config,
  });

  const EMPTY_ICONS_FILE = `export const __no_icons = true;`;

  const icons: Set<string> = new Set();
  api.addPrepareBuildPlugins(() => {
    return [
      iconPlugin.esbuildIconPlugin({
        icons,
        alias: api.config.reactIcons.alias || {},
      }),
    ];
  });

  api.onPrepareBuildSuccess(async () => {
    const extraIcons = api.config.reactIcons.include || [];
    const allIcons = new Set([...icons, ...extraIcons]);

    if (!allIcons.size) {
      logger.info(`[reactIcons] no icons was found`);
      return;
    }

    logger.info(`[reactIcons] generate icons ${Array.from(icons).join(', ')}`);
    const code: string[] = [];
    const { generateIconName, generateSvgr } = svgr;
    for (const iconStr of allIcons) {
      const [collect, icon] = iconStr.split(':');
      const iconName = generateIconName({ collect, icon });
      let svgr;
      try {
        svgr = await generateSvgr({
          collect,
          api,
          icon,
          iconifyOptions: {
            autoInstall:
              api.config.reactIcons.autoInstall &&
              (async (name: string) => {
                try {
                  const version = (
                    await crossSpawn.sync('npm', ['view', name, 'version'], {
                      encoding: 'utf-8',
                    }).stdout
                  ).trim();
                  addDeps({
                    pkgPath: api.pkgPath,
                    deps: [{ name, version }],
                  });
                } catch (e) {
                  throw new Error(`[reactIcons] npm package ${name} not found`);
                }
                logger.info(`[reactIcons] install ${name}...`);
                await installWithNpmClient({
                  npmClient: api.appData.npmClient,
                  cwd: api.cwd,
                });
              }),
          },
          localIconDir: getLocalIconDir(),
        });
      } catch (e) {
        logger.error(e);
      }
      if (svgr) {
        code.push(svgr!);
        code.push(`export { ${iconName} };`);
      } else {
        if (api.env === 'development') {
          icons.delete(iconStr);
          logger.error(`[reactIcons] Icon ${iconStr} not found`);
        } else {
          throw new Error(`[reactIcons] Icon ${iconStr} not found`);
        }
      }
    }
    if (code.length) {
      code.unshift("import React from 'react';");
    }
    api.writeTmpFile({
      path: 'icons.tsx',
      content: code.join('\n') || EMPTY_ICONS_FILE,
    });
  });

  api.onGenerateFiles(({ isFirstTime }) => {
    // ensure first time file exist for esbuild resolve
    if (isFirstTime) {
      api.writeTmpFile({
        path: 'icons.tsx',
        content: EMPTY_ICONS_FILE,
      });
    }
    const localIconDir = getLocalIconDir();
    const localIcons: string[] = [];

    if (fs.existsSync(localIconDir)) {
      localIcons.push(
        ...readIconsFromDir(localIconDir)
          .filter((file) => file.endsWith('.svg'))
          .map((file) => file.replace(/\.svg$/, '')),
      );
    }
    api.writeTmpFile({
      path: 'index.tsx',
      content: `
import React from 'react';
import * as iconsMap from './icons';
import './index.css';

const alias = ${JSON.stringify(api.config.reactIcons.alias || {})};
type AliasKeys = keyof typeof alias;
const localIcons = ${JSON.stringify(localIcons)} as const;
type LocalIconsKeys = typeof localIcons[number];

type IconCollections = 'academicons' |
  'akar-icons' |
  'ant-design' |
  'arcticons' |
  'basil' |
  'bi' |
  'bpmn' |
  'brandico' |
  'bx' |
  'bxl' |
  'bxs' |
  'bytesize' |
  'carbon' |
  'charm' |
  'ci' |
  'cib' |
  'cif' |
  'cil' |
  'circle-flags' |
  'circum' |
  'clarity' |
  'codicon' |
  'cryptocurrency-color' |
  'cryptocurrency' |
  'dashicons' |
  'ei' |
  'el' |
  'emblemicons' |
  'emojione-monotone' |
  'emojione-v1' |
  'emojione' |
  'entypo-social' |
  'entypo' |
  'eos-icons' |
  'ep' |
  'et' |
  'eva' |
  'fa-brands' |
  'fa-regular' |
  'fa-solid' |
  'fa' |
  'fa6-brands' |
  'fa6-regular' |
  'fa6-solid' |
  'fad' |
  'fe' |
  'feather' |
  'file-icons' |
  'flag' |
  'flagpack' |
  'flat-color-icons' |
  'flat-ui' |
  'fluent-emoji-flat' |
  'fluent-emoji-high-contrast' |
  'fluent-emoji' |
  'fluent-mdl2' |
  'fluent' |
  'fontelico' |
  'fontisto' |
  'foundation' |
  'fxemoji' |
  'gala' |
  'game-icons' |
  'geo' |
  'gg' |
  'gis' |
  'gridicons' |
  'grommet-icons' |
  'healthicons' |
  'heroicons-outline' |
  'heroicons-solid' |
  'heroicons' |
  'humbleicons' |
  'ic' |
  'icomoon-free' |
  'icon-park-outline' |
  'icon-park-solid' |
  'icon-park-twotone' |
  'icon-park' |
  'iconoir' |
  'icons8' |
  'il' |
  'ion' |
  'iwwa' |
  'jam' |
  'la' |
  'line-md' |
  'logos' |
  'ls' |
  'lucide' |
  'majesticons' |
  'maki' |
  'map' |
  'material-symbols' |
  'mdi-light' |
  'mdi' |
  'medical-icon' |
  'memory' |
  'mi' |
  'mingcute' |
  'mono-icons' |
  'nimbus' |
  'nonicons' |
  'noto-v1' |
  'noto' |
  'octicon' |
  'oi' |
  'ooui' |
  'openmoji' |
  'pajamas' |
  'pepicons-pop' |
  'pepicons-print' |
  'pepicons' |
  'ph' |
  'pixelarticons' |
  'prime' |
  'ps' |
  'quill' |
  'radix-icons' |
  'raphael' |
  'ri' |
  'si-glyph' |
  'simple-icons' |
  'simple-line-icons' |
  'skill-icons' |
  'subway' |
  'svg-spinners' |
  'system-uicons' |
  'solar' |
  'tabler' |
  'teenyicons' |
  'topcoat' |
  'twemoji' |
  'typcn' |
  'uil' |
  'uim' |
  'uis' |
  'uit' |
  'uiw' |
  'vaadin' |
  'vs' |
  'vscode-icons' |
  'websymbol' |
  'whh' |
  'wi' |
  'wpf' |
  'zmdi' |
  'zondicons';
type Icon = \`\${IconCollections}:\${string}\`;

interface IWinIconProps extends React.SVGAttributes<SVGElement> {
  icon: AliasKeys | Icon | \`local:\${LocalIconsKeys}\`;
  hover?: AliasKeys | string;
  className?: string;
  viewBox?: string;
  width?: string;
  height?: string;
  style?: any;
  spin?: boolean;
  rotate?: number | string;
  flip?: 'vertical' | 'horizontal' | 'horizontal,vertical' | 'vertical,horizontal';
}

export const getIconComponent = (icon: Pick<IWinIconProps, 'icon'>) => {
  const iconName = normalizeIconName(alias[icon] || icon);
  return iconsMap[iconName];
}

export const Icon = React.forwardRef<HTMLSpanElement, IWinIconProps>((props, ref) => {
  const { icon, hover, style, className = '' , rotate, spin, flip, ...extraProps } = props;
  const Component = getIconComponent(icon);
  if (!Component) {
    // TODO: give a error icon when dev, to help developer find the error
    return null;
  }
  const HoverComponent = hover ? iconsMap[normalizeIconName(alias[hover] || hover)] : null;
  const cls = spin ? 'winIconLoadingCircle' : undefined;
  const svgStyle = {};
  const transform: string[] = [];
  if (rotate) {
    const rotateDeg = normalizeRotate(rotate);
    transform.push(\`rotate(\${rotateDeg}deg)\`);
  }
  if (flip) {
    const flipMap = flip.split(',').reduce((memo, item) => {
      memo[item] = 1;
      return memo;
    }, {});
    if (flipMap.vertical) {
      transform.push(\`rotateY(180deg)\`);
    }
    if (flipMap.horizontal) {
      transform.push(\`rotateX(180deg)\`);
    }
  }
  if (transform.length) {
    const transformStr = transform.join('');
    svgStyle.msTransform = transformStr;
    svgStyle.transform = transformStr;
  }

  const spanClassName = HoverComponent ? 'winIconDoNotUseThis ' : '' + className;
  const spanClass = spanClassName ? { className: spanClassName } : {};

  return (
    <span role="img" ref={ref} {...spanClass} style={style}>
      <Component {...extraProps} className={cls} style={svgStyle} />
      {
        HoverComponent ? <HoverComponent {...extraProps} className={'winIconDoNotUseThisHover ' + cls} style={svgStyle} /> : null
      }
    </span>
  );
});

function normalizeRotate(rotate: number | string) {
  if (typeof rotate === 'number') {
    return rotate * 90;
  }
  if (typeof rotate === 'string') {
    if (rotate.endsWith('deg')) {
      return parseInt(rotate, 10);
    }
    if (rotate.endsWith('%')) {
      return parseInt(rotate, 10) / 100 * 360;
    }
    return 0;
  }
}

function camelCase(str: string) {
  return str.replace(/\\//g, '-').replace(/-([a-zA-Z]|[1-9])/g, (g) => g[1].toUpperCase());
}

function normalizeIconName(name: string) {
  return camelCase(name.replace(':', '-'));
}
      `,
    });
    api.writeTmpFile({
      path: 'index.css',
      content: `
.winIconDoNotUseThisHover {
  display: none;
}
.winIconDoNotUseThis:hover svg {
  display: none;
}
.winIconDoNotUseThis:hover .winIconDoNotUseThisHover {
  display: inline-block;
}
.winIconLoadingCircle {
  display: inline-block;
  -webkit-animation: loadingCircle 1s infinite linear;
  animation: winIconLoadingCircle 1s linear infinite;
}

@-webkit-keyframes winIconLoadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes winIconLoadingCircle {
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
      `,
    });
  });

  api.addTmpGenerateWatcherPaths(() => {
    return [getLocalIconDir()];
  });

  function getLocalIconDir() {
    return path.join(api.paths.absSrcPath, 'icons');
  }
};

function readIconsFromDir(dir: string) {
  const icons: string[] = [];
  const prefix = winPath(path.join(dir, './'));

  const collect = (p: string) => {
    if (fs.statSync(p).isDirectory()) {
      const files = fs.readdirSync(p);
      files.forEach((name) => {
        collect(path.join(p, name));
      });
    } else {
      const prunePath = winPath(p).replace(prefix, '');
      icons.push(prunePath);
    }
  };
  collect(dir);

  return icons;
}
