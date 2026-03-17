import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 5173,
    // Allow iframe embedding - set appropriate headers
    headers: {
      // Do NOT set X-Frame-Options to allow embedding
      // Do NOT set restrictive Content-Security-Policy frame-ancestors
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 5173,
    // Allow iframe embedding in preview/production builds
    headers: {
      // Do NOT set X-Frame-Options to allow embedding
      // Do NOT set restrictive Content-Security-Policy frame-ancestors
    }
  }
})