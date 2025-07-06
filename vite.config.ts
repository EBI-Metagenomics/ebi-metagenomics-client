import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path, { resolve } from 'path';
// import { resolve } from 'path';
import { copyFileSync } from 'fs';

export default defineConfig({
  base: '/metagenomics/',
  plugins: [
    react(),
    // {
    //   name: 'copy-mgnify-component',
    //   writeBundle() {
    //     // Copy the component file to dist after build
    //     // copyFileSync(
    //     //   resolve(
    //     //     __dirname,
    //     //     'node_modules/mgnify-sourmash-component/dist/mgnify-sourmash-component.js'
    //     //   ),
    //     //   resolve(__dirname, 'dist/mgnify-sourmash-component.js')
    //     // );
    //   },
    // },
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
  assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
  server: {
    port: 9000,
  },
});
