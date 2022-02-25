import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import config from 'config.json';
import App from './App';

Sentry.init({
  dsn: config.sentryDsn,
  environment: config.sentryEnv,
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: config.sentryTransactionRate,
});

ReactDOM.render(<App />, document.getElementById('root'));

if (module.hot) {
  module.hot.accept();
}
