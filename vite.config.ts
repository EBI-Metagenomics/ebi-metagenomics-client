import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import { VitePWA } from 'vite-plugin-pwa';
import { createHtmlPlugin } from 'vite-plugin-html';
import viteCompression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

const pathAliasMap = {
  '@/': path.resolve(__dirname, 'src/'),
  'components/': path.resolve(__dirname, 'src/components/'),
  'pages/': path.resolve(__dirname, 'src/pages/'),
  'public/': path.resolve(__dirname, 'public/'),
  'images/': path.resolve(__dirname, 'images/'),
  'utils/': path.resolve(__dirname, 'src/utils/'),
  'hooks/': path.resolve(__dirname, 'src/hooks/'),
  'styles/': path.resolve(__dirname, 'src/styles/'),
  'node_modules/': path.resolve(__dirname, 'node_modules/'),
  '@views/': path.resolve(__dirname, 'src/views/'),
  'config.json': path.resolve(__dirname, 'config.json'),
  'config.private.json': path.resolve(__dirname, 'config.private.json'),
};

export default defineConfig(({ mode }) => {
  const isEnvProduction = mode === 'production';

  return {
    plugins: [
      react(),
      createHtmlPlugin({
        template: path.resolve(__dirname, 'public', 'index.html'),
        inject: {
          data: {
            title: 'MGnify - EBI',
          },
        },
      }),
      viteCompression(),
      isEnvProduction && visualizer(),
      // Add other plugins as needed
    ],
    resolve: {
      alias: {
        ...pathAliasMap,
      },
      extensions: ['.tsx', '.ts', '.js'],
    },
    build: {
      outDir: 'dist',
      sourcemap: isEnvProduction ? 'source-map' : 'inline',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'src/index.tsx'),
        },
        output: {
          entryFileNames: isEnvProduction
            ? 'js/[name].[contenthash:8].js'
            : 'js/bundle.js',
          chunkFileNames: isEnvProduction
            ? 'js/[name].[contenthash:8].chunk.js'
            : 'js/[name].chunk.js',
        },
      },
    },
    server: {
      port: 9000,
      hot: true,
      open: true,
      fs: {
        strict: false,
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});