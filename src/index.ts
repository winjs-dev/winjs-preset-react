import type { IApi } from '@winner-fed/winjs';

export default (api: IApi) => {
  api.describe({
    key: 'react',
    config: {
      schema({ zod }) {
        return zod.object({
          fastRefresh: zod.boolean().optional().default(true),
          forget: zod
            .object({
              ReactCompilerConfig: zod.object({}).optional(),
            })
            .optional(),
        });
      },
      default: {
        fastRefresh: true,
      },
    },
  });

  return {
    plugins: [
      // 核心特性
      require.resolve('./features/default'),
      require.resolve('./features/webpack'),
      require.resolve('./features/vite/vite'),
      require.resolve('./features/rsbuild/rsbuild'),
      require.resolve('./features/tmpFiles/tmpFiles'),

      // React特有功能
      require.resolve('./features/forget/forget'),
      require.resolve('./features/icons/icons'),
    ],
  };
};
