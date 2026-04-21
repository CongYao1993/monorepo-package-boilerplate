import { defineProject } from 'vitest/config'

export default defineProject({
  test: {
    // 子包可以覆盖此配置，例如 environment: 'jsdom'
  },
})
