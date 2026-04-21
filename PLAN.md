# monorepo-package-boilerplate 开发计划

> 一套标准化、可复用的 monorepo 组件库脚手架，与业务无关，后续开发任意组件库直接基于此模板。

---

## 技术选型

| 方向     | 选择                             | 理由                   |
| -------- | -------------------------------- | ---------------------- |
| 开发语言 | TypeScript                       | 类型安全，IDE 友好     |
| 包管理   | pnpm workspaces（monorepo）      | 多包管理，严格隔离依赖 |
| 构建工具 | Vite + Rollup                    | 开发体验好，产物灵活   |
| 代码规范 | ESLint + Prettier                | 统一代码风格           |
| 提交规范 | Husky + lint-staged + Commitlint | 提交前自动检查         |
| 测试     | Vitest                           | 单元测试               |
| 文档     | VitePress                        | 轻量文档站             |
| 版本管理 | Changesets                       | 语义化版本 + CHANGELOG |

---

## 阶段 1 — monorepo 基础设施

### 1.1 monorepo 基础

- [x] 初始化 pnpm workspaces，规划目录结构：
  ```
  packages/           # 子包目录
  playground/         # 本地调试 demo 应用
  docs/               # 文档站
  scripts/            # 构建、发布脚本
  ```
- [x] 配置根 `package.json`（scripts、engines 字段约束 node/pnpm 版本）
- [x] 配置 `.npmrc`、`.nvmrc` / `.node-version`

### 1.2 TypeScript 配置

- [x] 根目录 `tsconfig.base.json`（严格模式、路径别名）
- [x] 各子包继承基础配置，按需覆盖

### 1.3 代码规范

- [x] ESLint（`@typescript-eslint`，flat config，推荐规则集）
- [x] Prettier（与 ESLint 协同，`eslint-config-prettier`）
- [x] 统一 `.editorconfig`
- [x] VS Code 工作区配置（`.vscode/settings.json` 保存时自动格式化，`.vscode/extensions.json` 推荐插件）

### 1.4 Git 提交规范（Husky + lint-staged + Commitlint）

- [x] 安装并初始化 Husky（`husky init`）
- [x] 配置 `pre-commit` hook：执行 `lint-staged`（只检查暂存文件）
  ```json
  // lint-staged.config.mjs
  {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
  ```
- [x] 配置 `commit-msg` hook：执行 `commitlint`（约束 Conventional Commits 格式）
  ```
  feat / fix / docs / style / refactor / test / chore / perf
  ```

### 1.5 构建基础设施

- [x] Rollup 基础配置模板（输出 ESM / CJS / IIFE 三种格式 + `.d.ts`）
- [x] Vite 配置（playground 热更新开发）
- [x] 构建脚本（`scripts/build.ts`，遍历 packages 依次构建）

### 1.6 版本与发布

- [x] 配置 **Changesets**（`@changesets/cli`）管理语义化版本与 CHANGELOG
- [x] 配置发布脚本（`pnpm release`）

### 1.7 CI/CD（可选）

- [x] GitHub Actions：PR 触发 lint + test，merge 触发构建 + 发布

---

## 阶段 2 — 示例包（packages/my-lib）

> 在脚手架框架内创建一个最简示例包，验证整套基础设施可用。

### 2.1 包初始化

- [x] 创建 `packages/my-lib`，配置独立 `package.json`（name、version、exports 字段）
- [x] 继承根 TypeScript 配置，配置子包 `tsconfig.json`

### 2.2 基础源码结构

- [x] 创建 `src/index.ts` 作为入口，导出示例函数/组件
- [x] 确保构建产物包含 ESM / CJS / IIFE + `.d.ts`

### 2.3 单元测试

- [x] 配置 Vitest（继承根配置）
- [x] 编写示例测试用例，验证测试链路

### 2.4 playground 联调

- [x] `playground` 通过 `workspace:*` 引用 `my-lib`，验证本地包链接
- [x] 验证热更新（修改源码 → playground 自动刷新）

---

## 阶段 3 — 文档站

- [x] 初始化 VitePress（`docs/`）
- [x] 首页 + 快速开始文档
- [x] API 文档结构规划
- [x] 部署配置（GitHub Pages 或 Vercel）

---

## 阶段 4 — 升级为多场景脚手架系统 (进行中)

> 将单一的通用示例演进为支持快速生成多种常见包结构的模板系统，并严格保持“框架无关（Framework-Agnostic）”特性。未来特定的 React/Vue 框架将在克隆本底座后按需集成。

### 4.1 规范治理与基础架构 (P0)

- [x] 制定场景架构文档 (`ARCHITECTURE_scenarios.md`)
- [x] 明确三类场景 (`utils`, 框架无关 `component`, `cesium` 封装库) 的边界
- [x] 制定依赖分类规范 (`dependencies` vs `peerDependencies`)，新增 `docs/guide/dependency-strategy.md`

### 4.2 场景生成脚本 (P0)

- [x] 抽取文件模板到 `scripts/templates/` (包含 base, utils, component, cesium)
- [x] 开发命令行的建包脚本 (`scripts/create-package.ts`)
- [x] 在根目录 `package.json` 添加 `create:package` 命令

### 4.3 测试隔离架构升级 (P0.5)

- [x] **架构升级**：引入 `vitest.workspace.ts`，实现真正的测试解耦，确保各类专属编译和测试依赖只存在于生成的子包中。

### 4.4 场景逐一验证 (P1-P5)

- [x] **P1 - utils 验证**：生成并验证一个纯逻辑工具包的构建与测试链路。
- [x] **P2 - component 验证**：生成并验证一个原生 DOM/Web Components 组件包，完善样式构建与 `jsdom` 测试环境预案。
- [x] **P3 - react 场景验证**：生成并验证 `react` 模板包，确保 JSX 编译、`peerDependencies` 预设及子包内隔离的测试环境工作正常。
- [x] **P4 - vue 场景验证**：生成并验证 `vue` 模板包，确保 SFC 编译插件工作正常，且不污染根目录。
- [x] **P5 - cesium 验证**：生成并验证 Cesium 二次封装包，确立资源 copy 与 external 规范。

---

## 关键设计原则

1. **与业务解耦**：脚手架本身不包含任何业务逻辑，packages 下仅放示例包
2. **按模块拆分**：通过 `exports` 子路径支持按需引入
3. **完整 TypeScript 类型**：所有公开 API 有类型声明
4. **复用优先**：新组件库直接 fork/clone 此模板，零额外配置成本
