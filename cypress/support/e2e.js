// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

import '@cypress/code-coverage/support';

Cypress.on('test:before:run', () => {
  Cypress.automation('remote:debugger:protocol', {
    command: 'Emulation.setLocaleOverride',
    params: {
      locale: 'en-GB'
    }
  });
});

Cypress.on('uncaught:exception', (err, runnable) => {
  // Do not fail tests for bad Google Maps key
  if (err.message.includes('InvalidKeyMapError')) {
    return false;
  }
});

beforeEach(() => {
  cy.setCookie('cookies-accepted', 'true');
});

// import "cypress-real-events/support";
