import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

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
