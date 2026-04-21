# 依赖管理与分类规范

在一个 Monorepo 包管理体系中，正确区分依赖的类型不仅能有效减小最终产物体积，还能避免运行时出现多版本冲突。本脚手架对子包内依赖的分类做出以下强制规范：

## 1. dependencies

**定义**：你的包在运行时强依赖，且希望随包一起下载、打包或被解析的第三方库。

**适用场景**：

- 内部必须用到的工具函数包（如 `lodash-es`、`dayjs` 等）。
- 确保包的正常运行，且对最终使用方没有严重多版本冲突风险的底层库。

**处理策略**：

- 默认情况下，Rollup 会将 `dependencies` **打包进最终产物**中（如果不显式标记为 external）。
- 为避免体积过度膨胀，对于体积较大的库，建议酌情移入 `peerDependencies` 并标记为 external。

## 2. peerDependencies

**定义**：你的包在运行时需要，但你不希望自己打包它，而是**要求使用你的包的“宿主项目”去安装它**。

**适用场景**：

- **UI 框架核心库**：如 `vue`、`react`。这能确保整个宿主应用中只存在唯一一个框架实例。
- **大型第三方引擎**：如 `cesium`、`echarts`、`three`。
- **状态管理和路由**：如 `vue-router`、`pinia`、`react-dom`。

**处理策略**：

- 任何声明在 `peerDependencies` 中的包，**强烈建议**在子包的 `rollup.config.mjs` 中将其加入 `external` 数组，防止被意外打包进代码！

```javascript
export default createConfig({
  external: ['cesium', 'vue', 'react'],
})
```

- 为了方便本地（如在 playground）开发和测试验证你的组件，你通常还需要把相同的依赖同时加入到本包的 `devDependencies` 中。

## 3. devDependencies

**定义**：仅在本地开发、构建打包、测试环节需要的依赖包。

**适用场景**：

- 构建与类型工具：`typescript`、`rollup` 等。
- 测试相关的库：`vitest`、`jsdom`、`@vue/test-utils` 等。
- 代码规范：`eslint`、`prettier` 相关。
- **（核心）与 peerDependencies 配套的本地运行时**：如上文所述，为了能在 playground 正常联调你的 cesium 插件或 vue 组件，你需要在 dev 中安装它们，这样联调环境才能跑得起来。

**处理策略**：

- 这类依赖绝不会被 Rollup 打包进最终产物。
- 当用户从 npm 安装你的包时，这部分依赖也不会随之下载。
