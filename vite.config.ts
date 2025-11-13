import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    base: env.VITE_BASE_URL ?? 'base-not-set',
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        src: path.resolve(__dirname, './src'),
        components: path.resolve(__dirname, './src/components'),
        interfaces: path.resolve(__dirname, './src/interfaces/index.tsx'),
        pages: path.resolve(__dirname, './src/pages'),
        styles: path.resolve(__dirname, './src/styles'),
        utils: path.resolve(__dirname, './src/utils'),
        hooks: path.resolve(__dirname, './src/hooks'),
        custom: path.resolve(__dirname, './custom.d.ts'),
        images: path.resolve(__dirname, './public/images'),
        data: path.resolve(__dirname, './public/data'),
        public: path.resolve(__dirname, './public'),
        'config.json': path.resolve(__dirname, './config.json'),
        'config.private.json': path.resolve(__dirname, './config.private.json'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif'],
    server: {
      port: 9000,
    }
  };
});
