/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    // Most of our tests are pure-logic — no DOM required. The few that
    // do (CSV parsing, etc.) opt into jsdom via the `// @vitest-environment jsdom`
    // directive at the top of the file.
    environment: 'node',
    globals: false,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'html'],
      exclude: ['**/*.test.*', 'src/main.tsx', 'src/router/**', 'src/types/**'],
    },
  },
})
