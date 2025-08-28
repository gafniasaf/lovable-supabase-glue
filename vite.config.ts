
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@lovable/expertfolio-ui': path.resolve(__dirname, 'packages/expertfolio-ui/src'),
      '@lovable/expertfolio-adapters': path.resolve(__dirname, 'packages/expertfolio-adapters/src/adapters/index.ts')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
