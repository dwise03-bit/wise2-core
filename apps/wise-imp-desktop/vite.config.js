import { defineConfig } from 'vite';

export default defineConfig({
  clearScreen: false,
  css: {
    postcss: { plugins: [] }
  },
  server: {
    port: 1420,
    strictPort: true,
    watch: { ignored: ['**/src-tauri/**'] }
  },
  envPrefix: ['VITE_', 'TAURI_'],
  base: process.env.TAURI_ENV_PLATFORM ? '/' : (process.env.IMP_BASE || '/'),
  build: { target: process.env.TAURI_ENV_PLATFORM === 'windows' ? 'chrome105' : 'safari13' }
});
