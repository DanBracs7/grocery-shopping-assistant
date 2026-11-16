import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import { resolve } from 'node:path';

export default defineConfig({
  // './' makes dist/ work on any static host, also under a sub-path (GitHub Pages).
  base: './',
  // WebXR only works on https (or localhost). basicSsl makes a self-signed certificate,
  // host:true exposes the dev server on the LAN so a Quest can open https://<laptop-ip>:5173
  plugins: [basicSsl()],
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        stage1: resolve(import.meta.dirname, 'stage-1/index.html'),
        stage2: resolve(import.meta.dirname, 'stage-2/index.html'),
      },
    },
  },
});
