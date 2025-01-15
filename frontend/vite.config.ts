import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { ConfigEnv } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => ({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    proxy: {
      '/api': {
        target: mode === 'production' 
          ? process.env.VITE_API_URL 
          : 'http://localhost:8004',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}))
