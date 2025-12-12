import { defineConfig, loadEnv } from 'vite';
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
          resolve(
            __dirname,
            'node_modules/mgnify-sourmash-component/dist/mgnify-sourmash-component.js'
          ),
          resolve(__dirname, 'dist/mgnify-sourmash-component.js')
        );
        copyFileSync(
          resolve(
            __dirname,
            'node_modules/mgnify-sourmash-component/dist/mgnify-sourmash-component.worker.js'
          ),
          resolve(
            __dirname,
            'dist/node_modules/mgnify-sourmash-component/dist/mgnify-sourmash-component.worker.js'
          )
        );
        copyFileSync(
          resolve(
            __dirname,
            'node_modules/mgnify-sourmash-component/dist/646.mgnify-sourmash-component.worker.js'
          ),
          resolve(
            __dirname,
            'dist/node_modules/mgnify-sourmash-component/dist/646.mgnify-sourmash-component.worker.js'
          )
        );
        copyFileSync(
          resolve(
            __dirname,
            'node_modules/mgnify-sourmash-component/dist/c92d2c3be4e1b9242546.module.wasm'
          ),
          resolve(
            __dirname,
            'dist/node_modules/mgnify-sourmash-component/dist/c92d2c3be4e1b9242546.module.wasm'
          )
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
      public: path.resolve(__dirname, './public'),
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

// export default defineConfig(({ mode }) => {
//   const env = loadEnv(mode, process.cwd());
//
//   return {
//     base: env.VITE_BASE_URL ?? '/metagenomics',
//     plugins: [react()],
//     resolve: {
//       alias: {
//         '@': path.resolve(__dirname, './src'),
//         src: path.resolve(__dirname, './src'),
//         components: path.resolve(__dirname, './src/components'),
//         interfaces: path.resolve(__dirname, './src/interfaces/index.tsx'),
//         pages: path.resolve(__dirname, './src/pages'),
//         styles: path.resolve(__dirname, './src/styles'),
//         utils: path.resolve(__dirname, './src/utils'),
//         hooks: path.resolve(__dirname, './src/hooks'),
//         custom: path.resolve(__dirname, './custom.d.ts'),
//         images: path.resolve(__dirname, './public/images'),
//         data: path.resolve(__dirname, './public/data'),
//         public: path.resolve(__dirname, './public'),
//         'config.json': path.resolve(__dirname, './config.json'),
//         'config.private.json': path.resolve(__dirname, './config.private.json'),
//       },
//     },
//     assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
//     server: {
//       port: 9000,
//     }
//   };
// });
