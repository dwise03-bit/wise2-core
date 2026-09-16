import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: null,
  },
  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'ws://localhost:3030',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
  },
});
