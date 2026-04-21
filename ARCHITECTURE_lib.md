# 架构设计文档

---

## 阶段 2 — 示例包（packages/my-lib）

阶段 2 的目标不是只“放一个示例包”，而是把 **一个可发布的包、一个本地联调入口、一个最小测试闭环** 串起来。当前仓库已经按这个方向落地：`packages/my-lib` 负责产出构建结果，`playground` 负责消费包并验证改动，根目录统一管理测试与构建。

### 2.1 包初始化

当前 `my-lib` 采用标准 npm 包出口设计，消费方始终通过 `dist` 使用构建产物，而不是直接引用源码。同时，子包也补充了发布到 npm 所需的基础元信息，确保包在仓库外被消费时具备完整的说明、许可证与源码仓库指向能力：

```json
{
  "name": "my-lib",
  "version": "0.0.0",
  "description": "A template library package — replace this with your own description.",
  "keywords": [],
  "author": "CongYao",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/CongYao1993/monorepo-package-boilerplate.git",
    "directory": "packages/my-lib"
  },
  "homepage": "https://github.com/CongYao1993/monorepo-package-boilerplate#readme",
  "bugs": {
    "url": "https://github.com/CongYao1993/monorepo-package-boilerplate/issues"
  },
  "private": false,
  "type": "module",
  "sideEffects": false,
  "main": "./dist/index.cjs",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.mjs",
      "require": "./dist/index.cjs",
      "default": "./dist/index.mjs"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "scripts": {
    "build": "rollup -c",
    "dev": "rollup -c -w",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  }
}
```

#### package.json 字段说明

- `name`
  - 包名。
  - 这里是 `my-lib`，因此在 `playground` 或未来外部项目里，都会通过 `import { ... } from 'my-lib'` 的方式使用它。

- `version`
  - 包版本号。
  - 当前示例阶段使用 `0.0.0`，后续正式进入发布流程后会由 Changesets 统一管理版本变更。

- `description`
  - 包的简要说明。
  - 这段内容会直接展示在 npm 包页面和搜索结果中，因此建议用一句话准确描述包的用途。

- `keywords`
  - npm 搜索关键词。
  - 模板中先保留为空数组，实际使用时应根据组件库、工具库或 Cesium 封装库的场景填入关键词，方便检索与归类。

- `author`
  - 包作者信息。
  - 这个字段主要用于包元信息展示，便于在发布后追溯维护者。

- `license`
  - 包许可证声明。
  - 这里使用 `MIT`，并要求发包内容中携带对应的 `LICENSE` 文件，确保开源协议在 npm 分发时依然完整。

- `repository`
  - 源码仓库地址。
  - 这里不仅声明了仓库 URL，还通过 `directory` 指向 monorepo 中的具体子包目录。
  - 这样 npm 页面可以更准确地把消费者引导到当前包对应的源码位置，而不是只停留在仓库根目录。

- `homepage`
  - 包主页地址。
  - 当前指向仓库 README，用于给使用者提供更完整的项目说明入口。

- `bugs`
  - 问题反馈地址。
  - 通常指向仓库 issue 页面，方便使用者在发现问题后直接反馈。

- `private`
  - 是否为私有包。
  - 这里显式写成 `false`，表示它是一个“可发布”的示例包，而不是仅供仓库内部使用的私有目录。

- `type`
  - 指定当前包的模块系统语义。
  - 这里使用 `module`，表示包内 `.js` 文件按 ESM 处理，和当前 Rollup / Vite 的 ESM 配置保持一致。

- `sideEffects`
  - 用于声明这个包是否包含具有副作用、不能被安全摇树优化移除的模块。
  - 这里设置为 `false`，表示当前示例包是纯函数式输出，没有全局副作用。
  - 这对组件库和工具库非常重要，因为它能帮助现代打包工具更激进地做 Tree-shaking，减少最终产物体积。

- `main`
  - CommonJS 默认入口。
  - 指向 `./dist/index.cjs`，主要照顾仍然使用 `require()` 的 Node 或旧工具链消费方。

- `module`
  - ESM 入口。
  - 指向 `./dist/index.mjs`，主要给现代打包工具识别使用。
  - 严格说现代解析更依赖 `exports`，但保留 `module` 能增强兼容性。

- `types`
  - TypeScript 类型声明入口。
  - 指向 `./dist/index.d.ts`，让 TS 用户在导入 `my-lib` 时能拿到完整类型提示。

- `exports`
  - 包的显式导出映射表，也是现代 Node / bundler 最重要的解析入口。
  - 当前只暴露了根出口 `.`，表示外部只能消费包根路径。
  - 其中各字段含义如下：
    - `types`：类型声明入口
    - `import`：ESM 环境入口
    - `require`：CommonJS 环境入口
    - `default`：默认回退到 ESM 入口
  - 这样可以让不同消费环境命中最合适的构建产物。

- `files`
  - 控制发包时实际包含哪些文件。
  - 这里写成 `[`dist`, `README.md`, `LICENSE`]`，表示 npm 发布时会带上构建产物、包级说明文档和许可证文件。
  - 这样既能避免把 `src`、测试文件和本地配置一起发出去，也能保证 npm 页面上有可读说明，并且发布内容带有完整协议声明。

- `scripts`
  - 当前子包的本地命令集合。
  - 这里的每个脚本分别负责：
    - `build`：执行一次正式构建，输出 `dist`
    - `dev`：以 watch 模式持续构建，供 playground 联调
    - `test`：运行该包相关测试
    - `typecheck`：只做类型检查，不输出文件

这样设计有四个目的：

1. **与真实发布行为一致**：`playground` 联调时消费的是和未来 npm 用户一致的包入口。
2. **同时兼容 ESM / CJS / 类型声明**：浏览器构建工具、Node 环境和 TS 编辑器都能命中对应出口。
3. **控制发布内容**：通过 `files` 精确限制发包内容，避免源码和临时文件进入 npm 包。
4. **补齐发布元信息**：通过 `description`、`license`、`repository`、`homepage`、`bugs` 等字段，让包在 npm 页面、源码仓库和问题反馈链路上都具备完整信息。

#### tsconfig.json 设计

当前 `my-lib` 的 `tsconfig.json` 如下：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": "src",
    "outDir": "dist",
    "types": ["vitest/globals"]
  },
  "include": ["src"]
}
```

#### tsconfig.json 字段说明

- `$schema`
  - 给编辑器提供 JSON Schema 提示。
  - 不影响构建结果，但能让 IDE 在编辑 `tsconfig.json` 时提供补全和校验。

- `extends`
  - 继承根目录公共 TypeScript 配置。
  - 这样所有子包都能共享同一套基础规则，例如模块解析、严格模式、目标版本等，避免每个包重复维护。

- `compilerOptions`
  - 当前子包对 TS 编译行为的局部覆盖配置。
  - 在这个包里主要补充了构建目录和测试类型环境。

- `compilerOptions.rootDir`
  - 指定源码根目录。
  - 这里是 `src`，表示编译器默认把 `src/` 视为输入源目录，有助于保持输出目录结构稳定。

- `compilerOptions.outDir`
  - 指定编译输出目录。
  - 这里是 `dist`，和 `package.json` 中声明的导出目录保持一致。

- `compilerOptions.types`
  - 显式注入需要的全局类型包。
  - 这里是 `vitest/globals`，这样测试文件里才能直接使用 `describe`、`it`、`expect` 等全局 API 而不报类型错误。

- `include`
  - 指定当前 tsconfig 要纳入处理的文件范围。
  - 这里写成 `["src"]`，表示只关注当前包源码和测试文件所在目录，避免把无关文件带进来。

这种 `tsconfig` 设计体现的是“根配置统一、子包最小覆写”的原则：

- 公共规则放到根目录
- 子包只声明自己额外需要的最少字段
- 新增子包时几乎可以直接复制这份配置

这种拆分方式的重点是：**子包只声明自己是什么，构建策略由根目录统一维护**。这样后续新增 `packages/button`、`packages/utils` 等包时，可以复用同一套模板。

### 2.2 源码与构建结构

当前示例包的最小结构如下：

```text
packages/my-lib/
├── src/
│   ├── index.ts
│   └── index.test.ts
├── package.json
├── rollup.config.mjs
└── tsconfig.json
```

各文件职责明确：

- `src/index.ts`：公开 API 入口，放对外导出的函数或组件。
- `src/index.test.ts`：与入口能力配套的最小单元测试。
- `tsconfig.json`：继承根目录 `tsconfig.base.json`，仅补充子包自身的 `rootDir`、`outDir` 等配置。
- `rollup.config.mjs`：复用根目录 `rollup.config.base.mjs`，避免每个包重复写一份完整构建逻辑。

#### 构建产物策略

示例包当前通过 Rollup 输出四类文件：

- `dist/index.mjs`：给 ESM 消费方使用
- `dist/index.cjs`：给 CommonJS 消费方使用
- `dist/index.iife.js`：给浏览器 `<script>` 场景使用
- `dist/index.d.ts`：给 TypeScript 类型系统使用

这些产物共同组成了一个“可发布包”的最小交付面：既能被现代 bundler 消费，也能兼容 CommonJS，同时保留完整类型信息。

### 2.3 单元测试

当前仓库的 Vitest 采用根目录统一配置，测试文件匹配规则为 `packages/*/src/**/*.test.ts`。这意味着：

- 每个子包都可以把测试和源码放在一起维护
- 根目录运行 `pnpm test` 时可以一次性执行所有子包测试
- 子包内部也保留独立 `test` 脚本，便于按包调试

这种模式适合模板仓库早期阶段：

- 配置简单
- 心智负担低
- 扩展到多包时不需要重新设计测试入口

### 2.4 playground 联调机制

`playground` 通过 `workspace:*` 依赖本地包：

```json
{
  "dependencies": {
    "my-lib": "workspace:*"
  }
}
```

这里有一个非常关键的实现细节：**联调不是靠 Vite alias 直连源码，而是靠 pnpm workspace 链接 + 包的 `dist` 出口完成的**。

也就是说，正确链路是：

1. 在仓库根目录执行 `pnpm install`，由 pnpm 建立 workspace 链接
2. `playground` 通过包名 `my-lib` 解析到本地 workspace 包
3. `my-lib` 的 `exports` 再把入口指向 `dist/index.mjs`
4. 开发时由 `rollup -w` 持续刷新 `dist`
5. `playground` 作为真实 consumer 感知更新

这样设计比直接 alias 到 `src/index.ts` 更合理，因为它验证的是完整的“包消费链路”，而不是仅验证源码能否被 Vite 编译。

### 2.5 本地开发流程

#### 首次初始化或依赖变更后

```bash
pnpm install
```

#### 第一次启动某个包时

```bash
pnpm build:my-lib
```

#### 日常联调时

终端 1：

```bash
pnpm dev:my-lib
```

终端 2：

```bash
pnpm dev:playground
```

其中：

- `dev:my-lib` 会执行 `rollup -c -w`，持续输出最新 `dist`
- `dev:playground` 会启动 Vite playground，用真实包名导入组件/工具函数

因此开发者修改 `packages/my-lib/src/*` 后，不需要重新安装依赖，只需要保持 watch 进程运行即可。

### 2.6 阶段 2 的价值

这一阶段完成后，仓库已经具备了一个组件库模板最重要的基础能力：

- **能写包**：有清晰的子包结构
- **能测包**：有统一测试入口
- **能构建包**：有稳定的多格式产物输出
- **能联调包**：有基于 workspace 的本地消费链路

这意味着后续新增任何真实业务组件包时，不需要重新讨论工程底座，只需要复制 `my-lib` 的模式并填入具体实现即可。

---
