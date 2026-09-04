import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(dirname, 'src'),
    },
  },
  plugins: [
    // vitest.config.ts fully replaces vite.config.ts, so the MDX pipeline
    // (enforced pre-react, same as the build) must be mirrored here — without
    // it a real .mdx body loaded in a test is served as raw JS and dies in
    // vite:import-analysis. Registry loader tests only revealed this when the
    // first un-mocked draft body landed.
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
  ],
  test: {
    environment: 'jsdom',
    globals: false,
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test-setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test-setup.ts',
        'src/vite-env.d.ts',
        'src/mdx.d.ts',
        'src/main.tsx',
        'src/types/**',
      ],
      thresholds: {
        statements: 98.5,
        branches: 95.8,
        functions: 99,
        lines: 99,
      },
    },
  },
});
