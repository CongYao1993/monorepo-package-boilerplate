# 快速开始

## 环境要求

- Node.js `>=20`
- pnpm `>=9`

## 安装依赖

```bash
pnpm install
```

## 常用命令

```bash
pnpm dev
pnpm build
pnpm test
pnpm docs:dev
pnpm docs:build
```

## 新建一个库包

您可以使用内置的自动化脚手架来一键生成包，而不需要手动配置：

```bash
# 交互式提示创建（或者直接带参数执行）
pnpm create:package
```

支持快速生成 `utils`、`component`、`react`、`vue`、`cesium` 等多种模板，更多细节请参阅侧边栏的 **多场景包开发** 指南。

## 文档维护建议

- 首页用于说明模板目标与能力边界
- `guide/` 放接入与开发指南
- `api/` 放对外导出的 API 总览和子模块说明
- 每新增一个公开包，都应补充对应文档

## 后续开发工作流

生成一个新包之后，标准的开发和测试流程如下：

### 1. 挂载依赖

因为这是一个 Monorepo 项目，虽然生成了新包，但需要让 `pnpm` 识别它：

```bash
# 在项目根目录执行
pnpm install
```

### 2. 本地联调 (Playground)

开发组件时，我们需要一个实时预览环境。

- 打开 `playground/package.json`，在 `dependencies` 中添加你的新包：`"你的新包名": "workspace:*"`，并执行 `pnpm install`。
- 在 `playground/src/App.vue` 或业务代码中导入它。
- **开启监听**：建议双开终端，一个终端执行 `pnpm dev:playground` 运行网页，另一个终端使用 `pnpm -F <包名> build --watch` 监听源码构建。每次保存代码，网页都会热更新。

### 3. 单元测试

新包内置了测试环境。只需在根目录执行以下命令，Vitest 就会穿透到你的包里并运行它独立的测试配置：

```bash
pnpm test
```

### 4. 发布代码 (Changesets)

当功能开发完毕准备发版：

- 运行 `pnpm changeset` 并根据提示选择刚才修改的包，填写本次的更新日志。
- 这会生成一个变更文件，将其随你的代码一起提交。
- PR 合并到主分支后，CI 工作流（以及 `pnpm version-packages` 和 `pnpm release`）会自动接管，完成打 tag、修改 `CHANGELOG.md` 及发布 npm 的全部流程。
