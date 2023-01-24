import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { MatomoProvider, createInstance } from '@jonkoops/matomo-tracker-react';
import config from 'utils/config';
import App from './App';

Sentry.init({
  dsn: config.sentryDsn,
  environment: config.sentryEnv,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: config.sentryTransactionRate,
});

const matomo = createInstance(config.matomo);

ReactDOM.render(
  <MatomoProvider value={matomo}>
    <App />
  </MatomoProvider>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept();
}
