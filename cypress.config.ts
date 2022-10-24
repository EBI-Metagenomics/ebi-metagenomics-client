import { defineConfig } from 'cypress';

export default defineConfig({
  projectId: '8vc1o6',
  chromeWebSecurity: false,
  viewportWidth: 1200,
  viewportHeight: 900,
  video: false,
  videoCompression: false,
  watchForFileChanges: false,
  defaultCommandTimeout: 40000,
  retries: 3,
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);
    },
    excludeSpecPattern: '*.disabled',
    specPattern: 'cypress/e2e/**/*.{js,jsx,ts,tsx}',
  },
});
