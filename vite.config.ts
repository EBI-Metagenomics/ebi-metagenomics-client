import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const pathAliasMap = {
  '@/': '/src/',
  'components/': '/src/components/',
  'pages/': '/src/pages/',
  'public/': '/public/',
  'images/': '/images/',
  'utils/': '/src/utils/',
  'hooks/': '/src/hooks/',
  'styles/': '/src/styles/',
  'node_modules/': '/node_modules/',
  '@views/': '/src/views/',
  'config.json': path.resolve(__dirname, 'config.json'),
  'config.private.json': path.resolve(__dirname, 'config.private.json'),
};

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ...pathAliasMap,
    },
  },
  server: {
    port: 9000,
  },
});
