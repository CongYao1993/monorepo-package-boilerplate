import { createConfig } from '../../rollup.config.base.mjs'

export default createConfig({
  name: 'MyLib',
  iife: true,
  globals: {},
})
