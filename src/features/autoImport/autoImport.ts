import type { IApi } from '@winner-fed/winjs';
import AutoImportRspack from 'unplugin-auto-import/rspack';
import AutoImportVite from 'unplugin-auto-import/vite';
import AutoImportWebpack from 'unplugin-auto-import/webpack';

export default (api: IApi) => {
  api.describe({
    key: 'preset-react:autoImport',
  });

  // 根据是否为 MPA 模式动态生成配置
  const getAutoImportConfig = () => {
    const imports: any[] = [
      // React hooks 和 API
      {
        react: [
          'useState',
          'useEffect',
          'useCallback',
          'useMemo',
          'useRef',
          'useContext',
          'useReducer',
          'useLayoutEffect',
          'useImperativeHandle',
          'useDeferredValue',
          'useId',
          'useTransition',
          'createElement',
          'Fragment',
          'Suspense',
          'lazy',
          'forwardRef',
          'memo',
          'createContext',
        ],
      },
    ];

    // MPA 模式不需要 React Router
    if (!api.userConfig.mpa) {
      imports.push({
        'react-router': [
          'BrowserRouter',
          'Routes',
          'Route',
          'Link',
          'NavLink',
          'useNavigate',
          'useLocation',
          'useParams',
          'useSearchParams',
          'useRoutes',
          'Outlet',
        ],
      });
    }

    return {
      imports,
      dts: './auto-imports.d.ts',
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
      },
    };
  };

  // Webpack 集成 - 使用 chainWebpack 避免类型冲突
  api.chainWebpack((config) => {
    config.plugin('auto-import').use(AutoImportWebpack(getAutoImportConfig()));
    return config;
  });

  // Vite 集成
  api.modifyViteConfig((config: any) => {
    config.plugins = config.plugins || [];
    config.plugins.push(AutoImportVite(getAutoImportConfig()));
    return config;
  });

  // Rsbuild 集成 (基于 Rspack)
  api.modifyRsbuildConfig((config: any) => {
    config.tools = config.tools || {};

    // 保存之前的配置函数
    const prevRspack = config.tools.rspack;

    config.tools.rspack = (rspackConfig: any, context: any) => {
      // 先执行之前的配置（如果存在）
      let resultConfig = rspackConfig;
      if (typeof prevRspack === 'function') {
        resultConfig = prevRspack(rspackConfig, context);
      }

      // 使用 appendPlugins 添加插件
      if (context && context.appendPlugins) {
        context.appendPlugins(AutoImportRspack(getAutoImportConfig()));
      }

      return resultConfig;
    };

    return config;
  });
};
