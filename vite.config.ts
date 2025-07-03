import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/metagenomics/',
  plugins: [react()],
  assetsInclude: ['**/*.worker.js'],
  optimizeDeps: {
    exclude: ['mgnify-sourmash-component'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      src: path.resolve(__dirname, './src'),
      components: path.resolve(__dirname, './src/components'),
      interfaces: path.resolve(__dirname, './src/interfaces'),
      pages: path.resolve(__dirname, './src/pages'),
      styles: path.resolve(__dirname, './src/styles'),
      utils: path.resolve(__dirname, './src/utils'),
      hooks: path.resolve(__dirname, './src/hooks'),
      images: path.resolve(__dirname, './public/images'),
      data: path.resolve(__dirname, './public/data'),
      'config.json': path.resolve(__dirname, './config.json'),
      'config.private.json': path.resolve(__dirname, './config.private.json'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  server: {
    port: 9000,
  },
});
