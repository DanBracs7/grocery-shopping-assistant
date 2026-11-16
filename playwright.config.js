import { defineConfig } from '@playwright/test';

// Smoke tests run against the production build (vite build + vite preview),
// which also proves that the multi-page build works with base: './'.
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results/raw',
  timeout: 60_000,
  use: {
    baseURL: 'https://localhost:4173',
    ignoreHTTPSErrors: true,
    launchOptions: {
      // Software WebGL so the tests also run on machines without a GPU.
      args: [
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
        '--ignore-gpu-blocklist',
      ],
    },
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'https://localhost:4173',
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
