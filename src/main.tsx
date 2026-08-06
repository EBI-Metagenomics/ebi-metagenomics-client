import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { MatomoProvider, createInstance } from '@jonkoops/matomo-tracker-react';
import config from '@/utils/config';
import App from './App';

Sentry.init({
  dsn: config.sentryDsn,
  environment: config.sentryEnv,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: config.sentryTransactionRate,
  tracePropagationTargets: [/api/],
});

const matomo = createInstance(config.matomo);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MatomoProvider value={matomo}>
      <App />
    </MatomoProvider>
  </React.StrictMode>
);
