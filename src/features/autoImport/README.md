# React 自动导入功能

本模块实现了基于 `unplugin-auto-import` 的 React hooks 和 React Router 组件的自动导入。

## 功能特性

### 自动导入的 API

#### React Hooks 和组件
- `useState`, `useEffect`, `useCallback`, `useMemo`
- `useRef`, `useContext`, `useReducer`
- `useLayoutEffect`, `useImperativeHandle`
- `useDeferredValue`, `useId`, `useTransition`
- `createElement`, `Fragment`, `Suspense`, `lazy`
- `forwardRef`, `memo`, `createContext`

#### React Router（仅在非 MPA 模式下）
- `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`
- `useNavigate`, `useLocation`, `useParams`
- `useSearchParams`, `useRoutes`, `Outlet`

## 打包器支持

- ✅ Webpack
- ✅ Vite
- ✅ Rsbuild (基于 Rspack)

## 配置说明

### MPA 模式处理

在 MPA（多页应用）模式下，React Router 相关的自动导入会被自动禁用，因为 MPA 不需要客户端路由。

### 类型定义

`dts` 设置为 `false`，因为 WinJS 框架会统一处理 TypeScript 类型定义。

### ESLint 集成

`eslintrc.enabled` 设置为 `false`，避免生成额外的 ESLint 配置文件。

## 使用示例

```tsx
// 无需手动导入 React hooks
export default function Counter() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    console.log('Count changed:', count);
  }, [count]);
  
  const doubleCount = useMemo(() => count * 2, [count]);
  
  return (
    <div>
      <p>计数: {count}</p>
      <p>双倍: {doubleCount}</p>
      <button onClick={() => setCount(count + 1)}>增加</button>
    </div>
  );
}
```

## 实现细节

模块通过拦截不同打包器的配置钩子，注入 `unplugin-auto-import` 插件：

- **Webpack**: 通过 `api.chainWebpack` 注入（使用 webpack-chain 避免类型冲突）
- **Vite**: 通过 `api.modifyViteConfig` 注入
- **Rsbuild**: 通过 `api.modifyRsbuildConfig` 修改 `tools.rspack` 配置注入

每个打包器使用对应的 unplugin 入口点：
- `unplugin-auto-import/webpack`
- `unplugin-auto-import/vite`
- `unplugin-auto-import/rspack`

### 关键技术点

1. **Webpack 类型兼容性**：由于 WinJS 使用编译后的 webpack 类型，直接使用 `modifyWebpackConfig` 会导致类型冲突。因此使用 `chainWebpack` 和 webpack-chain 来添加插件，避免类型问题。

2. **自动生成文件**：启用 `dts: true` 和 `eslintrc.enabled: true` 后，会自动生成：
   - `auto-imports.d.ts` - TypeScript 全局类型声明
   - `.eslintrc-auto-import.json` - ESLint 全局变量配置

3. **动态配置**：根据 `api.userConfig.mpa` 判断是否为 MPA 模式，动态决定是否导入 React Router API。

