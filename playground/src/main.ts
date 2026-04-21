import { hello } from 'example-utils'

const app = document.querySelector<HTMLDivElement>('#app')!
const message = hello()

app.innerHTML = `
  <h1>Playground</h1>
  <p>本地包输出：<code>${message}</code></p>
  <p>修改 <code>packages/example-utils/src/index.ts</code> 后可在这里验证联调效果。</p>
`
