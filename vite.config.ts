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
  optimizeDeps: {
    // GSAP is only referenced through the dynamic import in gsap-loader.ts,
    // which the startup dep scanner does not crawl: without this, the first
    // dynamic import races on-demand optimization and intermittently 404s,
    // dropping the tonal engine into its static-gradient fallback (and
    // failing the signature e2e harness). Pre-bundle it so dev serves it
    // from the first request. Build chunking is unaffected (manualChunks).
    include: ['gsap', 'gsap/ScrollTrigger'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('gsap') || id.includes('ScrollTrigger')) return 'gsap-engine';
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor';
          if (id.includes('@mdx-js/react')) return 'mdx-runtime';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
});
