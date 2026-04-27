import { createConfig } from '../../rollup.config.base.mjs'

export default createConfig({
  name: '__PACKAGE_NAME__'.replace(/^@.*\//, '').replace(/-./g, (x) => x[1].toUpperCase()), // Simple camelCase for IIFE
  iife: true,
  globals: {},
})
