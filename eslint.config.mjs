import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.vitepress/dist/**',
      '**/.vitepress/cache/**',
      'playground/public/cesium/**',
      'docs/public/cesium/**',
    ],
  },
  tseslint.configs.recommended,
  eslintConfigPrettier,
)
