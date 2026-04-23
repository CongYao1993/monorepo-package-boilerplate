import { defineConfig } from 'vitest/config'
import { globSync } from 'tinyglobby'

const packageDirs = globSync('packages/*/vitest.config.*', { onlyFiles: true })
const hasPackages = packageDirs.length > 0

export default defineConfig(
  hasPackages
    ? {
        test: {
          projects: ['packages/*'],
          coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'json-summary'],
            reportsDirectory: './coverage',
            include: ['packages/*/src/**/*.{ts,tsx,vue}'],
            exclude: ['packages/*/src/**/*.test.{ts,tsx}', 'packages/*/src/**/*.d.ts'],
            thresholds: {
              lines: 80,
              functions: 80,
              branches: 70,
              statements: 80,
            },
          },
        },
      }
    : {
        test: {
          passWithNoTests: true,
          exclude: ['scripts/**', 'node_modules/**'],
        },
      },
)
