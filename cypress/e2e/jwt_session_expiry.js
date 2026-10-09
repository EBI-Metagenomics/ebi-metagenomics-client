import { openPage } from '../util/util';
import config from 'utils/config';

const page = 'analyses/MGYA00000002/overview?test=expiry#details';
const analysisUrl = `${config.api_v2}analyses/MGYA00000002`;
const message = 'Your login has expired. You have been logged out.';
const token = 'expired-test-token';

const visitWithLogin = () =>
  openPage(page, {
    onBeforeLoad(win) {
      win.localStorage.setItem('mgnify.v2.token', token);
      win.localStorage.setItem('mgnify.v2.username', 'Webin-000');
    },
  });

const expectLoggedOut = () => {
  cy.contains('.Toastify__toast', message).should('be.visible');
  cy.contains('h2', 'Analysis MGYA00000002').should('be.visible');
  cy.window().then((win) => {
    expect(win.localStorage.getItem('mgnify.v2.token')).to.be.null;
    expect(win.localStorage.getItem('mgnify.v2.username')).to.be.null;
    expect(win.localStorage.getItem('mgnify.sessionExpired')).to.be.null;
  });
  cy.get('.Toastify__toast').should('have.length', 1);
  cy.url().should('eq', `http://localhost:9000/metagenomics/${page}`);
};

describe('JWT session expiry', () => {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/sliding/refresh', (req) => {
      req.reply({ token: req.body.token });
    });
  });

  it('logs out on an authenticated 401 and reloads public data at the same URL', () => {
    let loads = 0;
    cy.on('window:before:load', () => { loads += 1; });
    cy.intercept('GET', analysisUrl, (req) => {
      if (req.headers.authorization) {
        expect(req.headers.authorization).to.eq(`Bearer ${token}`);
        req.reply({ statusCode: 401, body: { code: 'token_not_valid' } });
      } else {
        req.reply({ fixture: 'apiv2/analyses/analysisMGYA00000002.json' });
      }
    }).as('analysis');

    visitWithLogin();
    expectLoggedOut();
    cy.then(() => { expect(loads).to.eq(2); });
    cy.reload();
    cy.contains('h2', 'Analysis MGYA00000002').should('be.visible');
    cy.get('.Toastify__toast').should('not.exist');
  });

  it('recovers once when concurrent refresh requests reject the token', () => {
    let loads = 0;
    cy.on('window:before:load', () => { loads += 1; });
    cy.intercept('POST', '**/auth/sliding/refresh', {
      statusCode: 401,
      body: { code: 'token_not_valid' },
    });
    cy.intercept('GET', analysisUrl, {
      fixture: 'apiv2/analyses/analysisMGYA00000002.json',
    });

    visitWithLogin();
    expectLoggedOut();
    cy.then(() => { expect(loads).to.eq(2); });
  });

  it('shows an anonymous 401 without reloading or showing an expiry toast', () => {
    let loads = 0;
    cy.on('window:before:load', () => { loads += 1; });
    cy.intercept('GET', analysisUrl, { statusCode: 401, body: {} });
    openPage(page);
    cy.contains('401: An error occurred.').should('be.visible');
    cy.get('.Toastify__toast').should('not.exist');
    cy.then(() => { expect(loads).to.eq(1); });
  });

  [403, 500, 'network'].forEach((failure) => {
    it(`keeps the login on a ${failure} failure`, () => {
      let loads = 0;
      cy.on('window:before:load', () => { loads += 1; });
      cy.intercept('GET', analysisUrl,
        failure === 'network'
          ? { forceNetworkError: true }
          : { statusCode: failure, body: {} });
      visitWithLogin();
      cy.contains('Error Fetching Data').should('be.visible');
      cy.get('.Toastify__toast').should('not.exist');
      cy.window().then((win) => {
        expect(win.localStorage.getItem('mgnify.v2.token')).to.eq(token);
        expect(win.localStorage.getItem('mgnify.sessionExpired')).to.be.null;
      });
      cy.then(() => { expect(loads).to.eq(1); });
    });
  });
});
