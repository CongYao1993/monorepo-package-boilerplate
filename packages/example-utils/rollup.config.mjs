import { createConfig } from '../../rollup.config.base.mjs'

export default createConfig({
  name: 'example-utils'.replace(/-./g, (x) => x[1].toUpperCase()), // Simple camelCase for IIFE
  iife: true,
  globals: {},
})
