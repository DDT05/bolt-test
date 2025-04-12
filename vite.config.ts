import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/aivideoapi': {
        target: 'https://api.aivideoapi.com',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/aivideoapi/, '')
      }
    }
  }
})