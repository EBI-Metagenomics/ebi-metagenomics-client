import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  let base = env.VITE_BASE_URL ?? '/metagenomics';
  if (!base.startsWith('/')) base = `/${base}`;
  base = base.replace(/\/+/g, '/'); // Remove any double slashes
  if (!base.endsWith('/')) base = `${base}/`;

  return {
    base,
    plugins: [
      react(),
      {
        // Nightingale 5.11.0 bundles a Quill namespace and a nonconstructable formatter.
        name: 'nightingale-quill-compatibility',
        enforce: 'pre',
        transform(code, id) {
          if (
            id
              .split('?')[0]
              .endsWith(
                '/@nightingale-elements/nightingale-textarea-sequence/dist/index.js'
              )
          ) {
            const patchedCode = code
              .replace('const ae=c;', 'const ae=c.default;')
              .replace(
                'firstUpdated(){ae.register',
                'firstUpdated(){const component=this;ae.register'
              )
              .replace(
                'ae.register("modules/formatter",(t=>{t.on("text-change",P((()=>this.format()),200))}))',
                'ae.register("modules/formatter",(function(t){t.on("text-change",P((()=>component.format()),200))}))'
              );
            return {
              code: patchedCode,
              map: null,
              // Preserve custom element registration despite the package's sideEffects: false.
              moduleSideEffects: true,
            };
          }
        },
      },
    ],
    optimizeDeps: {
      exclude: ['@nightingale-elements/nightingale-textarea-sequence'],
    },
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
    ],
    server: {
      port: 9000,
    },
  };
});
