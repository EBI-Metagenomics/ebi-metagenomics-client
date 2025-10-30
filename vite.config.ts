import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path, { resolve } from 'path';
// import { resolve } from 'path';
import { copyFileSync } from 'fs';

const wasmContentTypePlugin = {
  name: 'wasm-content-type-plugin',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url.endsWith('.worker.js')) {
        res.setHeader('Content-Type', 'application/wasm');
      }
      next();
    });
  },
};

export default defineConfig({
  base: '/metagenomics/',
  plugins: [
    react(),
    wasmContentTypePlugin,
    {
      name: 'copy-mgnify-component',
      writeBundle() {
        // Copy the component file to dist after build
        copyFileSync(
          resolve(__dirname, 'mgnify-component/mgnify-sourmash-component.js'),
          resolve(__dirname, 'dist/mgnify-sourmash-component.js')
        );
        copyFileSync(
          resolve(
            __dirname,
            'mgnify-component/mgnify-sourmash-component.worker.js'
          ),
          resolve(__dirname, 'dist/mgnify-sourmash-component.worker.js')
        );
        copyFileSync(
          resolve(
            __dirname,
            'mgnify-component/225.mgnify-sourmash-component.worker.js'
          ),
          resolve(__dirname, 'dist/225.mgnify-sourmash-component.worker.js')
        );
        copyFileSync(
          resolve(
            __dirname,
            'mgnify-component/9495c69393edaf0e1c7c.module.wasm'
          ),
          resolve(__dirname, 'dist/9495c69393edaf0e1c7c.module.wasm')
        );
      },
    },
  ],
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
  assetsInclude: [
    '**/*.svg',
    '**/*.png',
    '**/*.jpg',
    '**/*.jpeg',
    '**/*.gif',
    '**/*.wasm',
  ],
  server: {
    port: 9000,
  },
});
