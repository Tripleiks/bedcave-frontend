import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // Exclude Next.js app directory — only test pure utility modules
    include: ['src/lib/**/__tests__/**/*.test.ts'],
  },
})
