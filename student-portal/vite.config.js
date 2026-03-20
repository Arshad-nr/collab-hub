import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/student/',   // production: assets served under /student/
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: 'localhost',
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
