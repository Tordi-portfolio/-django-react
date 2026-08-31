import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server proxies /api to the Django backend so the browser only ever
// talks to one origin (avoids CORS entirely in local dev). In production,
// point VITE_API_URL at your deployed API instead — see .env.example.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
