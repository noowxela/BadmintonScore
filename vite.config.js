import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/BadmintonScore/',
  test: {
    environment: 'node',
    setupFiles: './src/test/setup.js'
  }
})
