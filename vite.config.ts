import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

function normalizeViteBasePath(raw?: string): string {
  const cleaned = (raw || '').trim();
  if (!cleaned || cleaned === '/') return '/';
  const withoutEdgeSlashes = cleaned.replace(/^\/+|\/+$/g, '');
  return withoutEdgeSlashes ? `/${withoutEdgeSlashes}/` : '/';
}

const DEFAULT_GITHUB_PAGES_BASE = '/talib-al3lm/';

export default defineConfig(({command, mode}) => {
  const env = loadEnv(mode, '.', 'VITE_');
  const explicitBase = (process.env.VITE_BASE_PATH || env.VITE_BASE_PATH || '').trim();
  const isPagesBuild =
    command === 'build' &&
    (process.env.GITHUB_PAGES === 'true' ||
      process.env.GITHUB_ACTIONS === 'true' ||
      Boolean((process.env.VITE_API_BASE_URL || env.VITE_API_BASE_URL || '').trim()));

  const base = normalizeViteBasePath(explicitBase || (isPagesBuild ? DEFAULT_GITHUB_PAGES_BASE : '/'));

  return {
    base,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('pdfjs-dist')) {
                return 'vendor-pdf';
              }
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
