import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5173,
    strictPort: true,
    allowedHosts: true, // Allow access from any hostname/domain (dev environment)
    watch: {
      usePolling: true,
    },
    proxy: {
      // Same-origin /api in dev, proxied server-side to the backend
      // container. Works from any client (localhost or LAN IP) with no
      // CORS and no port guessing in the client bundle.
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
