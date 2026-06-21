import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));

// MDX must run before the React plugin so JSX inside .mdx is transformed.
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(dirname, 'src'),
    },
  },
  plugins: [{ enforce: 'pre', ...mdx({ providerImportSource: '@mdx-js/react' }) }, react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
