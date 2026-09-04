import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cspNoncePlugin } from './scripts/vite-plugin-csp-nonce.ts';

const dirname = fileURLToPath(new URL('.', import.meta.url));

// MDX must run before the React plugin so JSX inside .mdx is transformed.
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(dirname, 'src'),
    },
  },
  plugins: [
    cspNoncePlugin({ enableInDev: false }),
    { enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) },
    react(),
    // Machine-readable bundle stats, emitted on every build: the input for the
    // bundle-size gate (ADR-0018, `npm run bundle:check`). Cheap to produce,
    // and a build without stats cannot be reviewed against the budget.
    visualizer({
      filename: 'dist/stats.json',
      template: 'raw-data',
      gzipSize: true,
      brotliSize: true,
    }),
    ...(process.env.ANALYZE
      ? [
          visualizer({
            filename: 'dist/stats.html',
            gzipSize: true,
            brotliSize: true,
          }) as PluginOption,
        ]
      : []),
  ],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
