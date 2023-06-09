import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 10 * 60 * 1000,
    threads: false,
    maxThreads: 1,
    minThreads: 1,
  },
})
