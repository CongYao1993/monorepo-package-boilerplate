const app = document.querySelector<HTMLDivElement>('#app')!

app.innerHTML = `
  <h1>Playground</h1>
  <p>在 <code>playground/package.json</code> 的 <code>dependencies</code> 中添加你的包（如 <code>"your-package": "workspace:*"</code>），然后在这里导入并调试。</p>
`
