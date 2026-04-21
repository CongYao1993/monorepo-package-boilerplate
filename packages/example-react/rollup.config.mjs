import { createConfig } from '../../rollup.config.base.mjs'

export default createConfig({
  input: 'src/index.tsx',
  name: 'example-react'.replace(/-./g, (x) => x[1].toUpperCase()),
  iife: false,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  globals: {
    react: 'React',
    'react-dom': 'ReactDOM',
    'react/jsx-runtime': 'jsxRuntime'
  },
})
