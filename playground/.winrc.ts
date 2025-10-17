export default {
  npmClient: 'pnpm',
  presets: ['../dist'],
  reactIcons: {
    svgr: {}, // 启用 SVGR
  },
  routes: [
    { path: '/', component: 'index' },
    { path: '/docs', component: 'docs' },
  ],
  // vite: {},
  // rsbuild: {},
};
