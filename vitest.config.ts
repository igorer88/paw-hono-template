import { cloudflareTest } from '@cloudflare/vitest-pool-workers'
import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: {
        configPath: './wrangler.jsonc'
      }
    })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  test: {
    globals: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['text', 'html'],
      thresholds: {
        lines: 65,
        functions: 65,
        branches: 65,
        statements: 65
      }
    }
  }
})
