
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@lovable/expertfolio-ui': path.resolve(__dirname, 'packages/expertfolio-ui/src/index.tsx'),
      '@lovable/expertfolio-ui/integration': path.resolve(__dirname, 'packages/expertfolio-ui/src/integration.tsx'),
      '@lovable/expertfolio-adapters': path.resolve(__dirname, 'packages/expertfolio-adapters/src/adapters/index.ts')
    }
  },
  server: {
    port: 8080,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
