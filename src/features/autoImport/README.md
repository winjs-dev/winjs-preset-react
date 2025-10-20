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

- **Webpack**: 通过 `api.modifyWebpackConfig` 注入
- **Vite**: 通过 `api.modifyViteConfig` 注入
- **Rsbuild**: 通过 `api.modifyRsbuildConfig` 修改 `tools.rspack` 配置注入

每个打包器使用对应的 unplugin 入口点：
- `unplugin-auto-import/webpack`
- `unplugin-auto-import/vite`
- `unplugin-auto-import/rspack`

