# @winner-fed/preset-react

WinJS 框架的 React 预设，提供 React 19.x 的完整支持和现代工具链。

## 特性

- ✅ **React 19.x 支持** - 支持 React 19 的最新特性和并发渲染
- 🚀 **现代 JSX 转换** - 默认使用自动 JSX runtime（React 17+）
- ⚡ **Fast Refresh** - 开发环境下的 React 组件热重载
- 🛠️ **多打包器支持** - 支持 Webpack、Vite 和 Rsbuild
- 📦 **自动导入** - React hooks 和 React Router 自动导入
- 🎨 **TypeScript 支持** - 完整的 JSX/TSX TypeScript 支持
- 🔗 **React Router v7** - 最新的路由管理和数据加载能力
- 🎯 **SVG 组件化** - 将 SVG 文件作为 React 组件导入
- 🧠 **React Compiler** - 可选的 React Compiler（前称 React Forget）支持
- 🎨 **图标按需加载** - 基于 Iconify 的图标按需加载方案

## 安装

```bash
npm install @winner-fed/preset-react
```

## 基础用法

在 `win.config.ts` 中添加：

```ts
import { defineConfig } from 'win';

export default defineConfig({
  presets: ['@winner-fed/preset-react'],
  react: {
    fastRefresh: true, // 启用 Fast Refresh
  },
});
```

## 配置选项

### `react.fastRefresh`

- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否启用 Fast Refresh。开发环境下推荐启用，可实现组件级热更新。

### `react.forget`

启用 React Compiler（前称 React Forget），用于自动优化 React 组件性能。

- **类型**: `{ ReactCompilerConfig?: object }`
- **默认值**: `undefined`
- **说明**: React Compiler 配置。仅在 React 19+ 版本可用。

**使用示例：**

```ts
export default defineConfig({
  react: {
    forget: {
      ReactCompilerConfig: {
        // React Compiler 自定义配置
      },
    },
  },
});
```

**限制条件：**

- 仅支持 React 19 及以上版本
- 不能与 `mfsu` 同时使用

## 自动导入

预设会自动导入常用的 React hooks 和 React Router 组件，无需手动 import：

### React Hooks

```tsx
// 无需手动导入这些 API
const [state, setState] = useState(0);
const ref = useRef();
const navigate = useNavigate();
```

### 可用的自动导入

**React：**

- `useState`, `useEffect`, `useCallback`, `useMemo`
- `useRef`, `useContext`, `useReducer`
- `useLayoutEffect`, `useImperativeHandle`
- `useDeferredValue`, `useId`, `useTransition`
- `createElement`, `Fragment`, `Suspense`, `lazy`
- `forwardRef`, `memo`, `createContext`

**React Router：**

- `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`
- `useNavigate`, `useLocation`, `useParams`
- `useSearchParams`, `useRoutes`, `Outlet`

## SVG 支持

将 SVG 文件作为 React 组件导入：

```tsx
import Logo from './logo.svg?react';

function Header() {
  return <Logo width={100} height={50} />;
}
```

## 图标按需加载

基于 Iconify 的图标按需加载方案，支持数万个图标库：

```tsx
// 配置图标按需加载
export default defineConfig({
  icons: {
    // 自动扫描项目中使用的图标
    autoInstall: true,
  },
});

// 在代码中使用图标
import IconSearch from '~icons/carbon/search';

function SearchButton() {
  return <IconSearch style={{ fontSize: '20px' }} />;
}
```

## TypeScript 支持

预设包含以下 TypeScript 类型定义：

- CSS Modules（`.module.css`, `.module.scss` 等）
- SVG React 组件（`*.svg?react`）
- React 和 React Router 类型
- Iconify 图标类型（`~icons/*`）

## 打包器集成

### Webpack

- 自动处理 JSX/TSX
- 开发环境 React Fast Refresh
- SVG 组件支持
- React Compiler 支持

### Vite

- 使用 `@vitejs/plugin-react` 实现最佳性能
- 内置 Fast Refresh 支持
- SVG 组件支持

### Rsbuild

- 使用 `@rsbuild/plugin-react` 实现现代 React 支持
- 使用 `@rsbuild/plugin-svgr` 实现 SVG 支持
- 优化的构建性能

## 使用示例

### 基础组件

```tsx
export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>计数: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        增加
      </button>
    </div>
  );
}
```

### 使用 React Router

```tsx
function App() {
  return (
    <div>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}
```

### 使用 React Compiler

```tsx
export default defineConfig({
  react: {
    forget: {
      ReactCompilerConfig: {
        // 可选配置
      },
    },
  },
});
```

启用后，React Compiler 会自动优化你的组件，无需手动使用 `useMemo` 和 `useCallback`。

### 使用图标

```tsx
import IconLogo from '~icons/mdi/react';
import IconSearch from '~icons/carbon/search';
import IconUser from '~icons/heroicons/user-solid';

function Toolbar() {
  return (
    <div>
      <IconLogo />
      <IconSearch />
      <IconUser />
    </div>
  );
}
```

## 版本兼容性

- **React**: 19.x
- **React Router**: 7.x
- **TypeScript**: 5.x
- **Node.js**: >=18

## 依赖包

### 核心依赖

- `react` ^19.2.0
- `react-dom` ^19.2.0
- `@winner-fed/renderer-react` - React 渲染器
- `unplugin-auto-import` - 自动导入支持

### Babel 相关

- `@babel/preset-react` - React 预设
- `@babel/plugin-transform-react-jsx` - JSX 转换
- `babel-plugin-react-compiler` - React Compiler

### 打包器插件

- `@vitejs/plugin-react` - Vite React 插件
- `@rsbuild/plugin-react` - Rsbuild React 插件
- `@rsbuild/plugin-svgr` - Rsbuild SVGR 插件
- `@pmmmwh/react-refresh-webpack-plugin` - Webpack Fast Refresh

### 图标相关

- `@iconify/utils` - Iconify 工具
- `@svgr/core` - SVGR 核心
- `@svgr/plugin-jsx` - SVGR JSX 插件
- `@svgr/plugin-svgo` - SVGR SVGO 插件

## 许可证

MIT
