import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local development the API is proxied to the backend so the browser can
// talk to it through a same-origin /api path (no CORS, no hardcoded ports).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:3004',
        changeOrigin: true,
      },
    },
  },
});
