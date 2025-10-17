# Rsbuild 适配

本模块为 preset-react 提供了对 Rsbuild 构建工具的支持。

## 功能特性

### React 插件

使用 `@rsbuild/plugin-react` 提供：

- 自动处理 React JSX 语法转换
- 使用 SWC 进行高性能编译
- 根据开发/生产环境自动配置
- Fast Refresh（热模块替换）支持

### SVGR 支持

当配置 `reactIcons.svgr` 时，自动启用 `@rsbuild/plugin-svgr`：

- 将 SVG 文件转换为 React 组件
- 支持混合导入模式（`mixedImport: true`）
- 可自定义 SVGR 选项

## 配置示例

### 基础配置

```typescript
// .winrc.ts
export default {
  react: {
    fastRefresh: true,
  },
};
```

### 启用 SVGR

```typescript
// .winrc.ts
export default {
  reactIcons: {
    svgr: {
      // 自定义 SVGR 选项
      icon: true,
      dimensions: false,
    },
  },
};
```

### 使用 SVG 组件

启用 SVGR 后，可以通过以下方式导入 SVG：

```tsx
// 方式 1: 作为 React 组件导入
import { ReactComponent as Logo } from './logo.svg';

const App = () => <Logo />;

// 方式 2: 作为 URL 导入（mixedImport 模式）
import logoUrl from './logo.svg';

const App = () => <img src={logoUrl} alt="logo" />;
```

## 技术细节

### 插件加载顺序

1. SVGR 插件（如果启用）
2. React 插件

### 环境适配

- 开发环境：启用 Fast Refresh 和开发模式优化
- 生产环境：启用生产模式优化

## 相关链接

- [@rsbuild/plugin-react](https://github.com/web-infra-dev/rsbuild/tree/main/packages/plugin-react)
- [@rsbuild/plugin-svgr](https://github.com/web-infra-dev/rsbuild/tree/main/packages/plugin-svgr)
- [Rsbuild 官方文档](https://rsbuild.rs/)
