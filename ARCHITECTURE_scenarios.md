# 场景模板架构说明

本仓库旨在提供一个**框架无关 (Framework-Agnostic)** 的多场景 Monorepo 工程底座。通过脚手架命令 `pnpm create:package`，可以快速生成符合不同业务需求场景的基础包骨架。

当前支持以下三类核心场景：

## 1. Utils 场景 (`utils`)

**适用范围**：无 UI 的纯逻辑包（如数学库、接口请求封装、数据转换工具等）。

**核心约定**：

- **运行环境**：Node.js 或浏览器均可，纯 TypeScript 逻辑。
- **依赖策略**：极少依赖，必要时作为 `dependencies` 引入。
- **构建输出**：默认输出 ESM / CJS / .d.ts，可根据需要在 `rollup.config.mjs` 开启 IIFE 输出。
- **测试环境**：默认的 Node 测试环境。

**目录结构预案**：

```text
src/
  index.ts      # 主出口
  index.test.ts # 单元测试
```

## 2. 框架无关 Component 场景 (`component`)

**适用范围**：不依赖特定框架（React/Vue）的原生 UI 组件（原生 DOM 操作或标准 Web Components），同时也为后续项目克隆后演进成特定框架的组件库预留好底层配置和结构规范。

**核心约定**：

- **运行环境**：浏览器环境。
- **样式处理**：预留 CSS/SCSS 的导入机制和 Rollup 样式打包入口（未来按需添加对应插件）。
- **依赖策略**：因为是框架无关，本模板阶段不预置且不依赖任何第三方 UI 运行库。如果未来在业务侧引入了 React/Vue 等框架，建议将其作为 `peerDependencies`。
- **测试环境**：UI 测试需要 DOM 环境支持，建议未来在此包目录下通过 `vitest.config.ts` 或头部注释配置 `environment: 'jsdom'`。

**目录结构预案**：

```text
src/
  index.ts      # 组件主入口
  styles/       # 样式文件目录预留
  __tests__/    # DOM 相关的单元测试预留
```

## 3. 框架绑定 Component 场景 (`react` / `vue`)

**适用范围**：当业务线确定使用 React 或 Vue，并且需要将该 Monorepo 的一部分（或全部分支）用作特定框架组件库时使用。

**核心约定**：

- **运行环境**：浏览器环境。
- **构建输出**：分别使用 `@rollup/plugin-typescript` (针对 TSX) 或 `rollup-plugin-vue` (针对 SFC) 进行编译。
- **依赖策略 (绝对隔离)**：
  - 根目录**拒绝**引入任何特定框架的运行时、测试引擎或编译插件。
  - `react`/`react-dom` 或 `vue` 必须作为各自包的 `peerDependencies`。
  - 相关的构建插件和测试插件（如 `@testing-library/react`，`@vitejs/plugin-vue`）仅存在于该子包的 `devDependencies` 中。
- **测试环境**：基于 Vitest Workspaces 架构，子包拥有自己独立的 `vitest.config.ts`，自动在 `jsdom` 环境下局部运行，彻底做到不污染全局。

## 4. Cesium 二次封装场景 (`cesium`)

**适用范围**：基于 `cesium` 引擎开发的 3D 地球相关插件、标绘工具或专用业务组件库。

**核心约定**：

- **运行环境**：浏览器环境，强依赖 Cesium 运行时。
- **依赖策略**：`cesium` 核心库及其相关的特有类型必须作为 `peerDependencies` 引入，要求未来的宿主业务环境自行安装配置。
- **外部化 (External)**：在 `rollup.config.mjs` 中，必须将 `cesium` 列入 `external` 防止被重复打包，同时需要配置相应的 `globals` 映射（供 IIFE 产物使用）。
- **静态资源处理**：此类包通常带有额外的 Assets、Workers，未来建议配套使用 `rollup-plugin-copy` 将必要资源输出到产物目录，或在包的 `README` 中明确告知宿主环境如何配置拷贝策略。

**目录结构预案**：

```text
src/
  index.ts
  viewer/       # Cesium 核心封装逻辑
```
