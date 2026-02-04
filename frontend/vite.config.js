import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Match the CORS origin in backend (http://localhost:3000)
    proxy: {
      // Proxy API requests to backend during development
      // This avoids CORS issues and simulates production setup
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
});
