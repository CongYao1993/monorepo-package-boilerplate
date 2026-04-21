# 多场景包开发指南

本脚手架系统不仅仅是一个单体的包模板，更是一个**“多场景组合器”**。通过预设的多种代码模板和依赖策略，您可以快速生成适应不同业务上下文的包，并确保它们在同一个 Monorepo 中完全解耦、互不污染。

## 使用方法

在项目根目录下，使用以下命令来生成不同类型的包：

```bash
pnpm create:package --name <包名> --template <模板类型>
```

目前系统内置了以下 5 种模板类型及其对应生成的示例包（您可以在 `packages/` 目录下找到它们作为参考）：

---

### 1. 纯逻辑工具包 (`utils`)

**示例生成：**

```bash
pnpm create:package -n example-utils -t utils -d "Example utility package"
```

**适用场景：** 处理纯数据逻辑、状态管理、网络请求封装等。
**特点：** 运行在 Node.js 或浏览器的通用环境，极简的 Rollup 编译和无 DOM 测试环境。

---

### 2. 框架无关组件包 (`component`)

**示例生成：**

```bash
pnpm create:package -n example-component -t component -d "Example framework-agnostic component"
```

**适用场景：** 原生 DOM 操作组件、Web Components 等。
**特点：** 使用 `jsdom` 进行测试，不绑定任何视图框架。

---

### 3. React 组件包 (`react`)

**示例生成：**

```bash
pnpm create:package -n example-react -t react -d "Example React component"
```

**适用场景：** 特定业务线的 React UI 组件库。
**特点：**

- 预置 `react` 和 `react-dom` 作为 PeerDependencies。
- 使用 `@testing-library/react` 配合 jsdom 隔离测试。
- TSX 编译支持。

---

### 4. Vue 组件包 (`vue`)

**示例生成：**

```bash
pnpm create:package -n example-vue -t vue -d "Example Vue component"
```

**适用场景：** 特定业务线的 Vue UI 组件库。
**特点：**

- 预置 `vue` 作为 PeerDependencies。
- 引入了 `rollup-plugin-vue` 和 `@vitejs/plugin-vue`，但这两种插件**被严格限制在该子包自己的目录内**，决不污染根目录。
- Vue SFC (`.vue`) 测试与编译支持。

---

### 5. Cesium 插件/封装包 (`cesium`)

**示例生成：**

```bash
pnpm create:package -n example-cesium -t cesium -d "Example Cesium plugin"
```

**适用场景：** WebGL 3D 地球插件、Cesium API 二次封装库。
**特点：**

- `cesium` 被配置在 PeerDependencies 中。
- Rollup 构建已预配置 `external` 和 `globals` 映射，确保庞大的 Cesium 核心引擎不会被打包进最终产物中。

## 完全隔离的测试架构 (Vitest Workspaces)

无论您生成何种模板，都不用担心测试环境冲突。本项目采用了 **Vitest Workspaces**：
当您在根目录执行 `pnpm test` 时，Vitest 会自动下发任务到各个包中，每个包使用其自己目录下的 `vitest.config.ts` 和隔离依赖（如 React、Vue 专属环境）来运行测试。您可以在上述生成的 example 包中查看具体的配置细节。
