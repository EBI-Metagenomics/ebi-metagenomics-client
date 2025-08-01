import {openPage} from '../util/util';
import config from 'utils/config';
const loginUrl = 'http://localhost:9000/metagenomics/login';
const homePageUrl = 'http://localhost:9000/metagenomics';
const myDataPageUrl = 'http://localhost:9000/metagenomics/mydata';
const allowedUsername = 'Webin-000';
const allowedPassword = 'secret';

describe('JWT Login', () => {
  beforeEach(() => {
    openPage('login');
    cy.intercept('POST', '**/auth/sliding', (req) => {
      const { username } = req.body;

      if (username !== allowedUsername) {
        req.reply({
          statusCode: 401,
          body: {
            detail: 'Invalid credentials.',
          },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: {
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoic2xpZGluZyIsImV4cCI6MTc1Mzk3MzA2NCwiaWF0IjoxNzUzODg2NjY0LCJqdGkiOiI5Y2Q1YWYzYzMxMDA0YzI1OWI0Mzc4MzIzODQxMzhhZSIsInJlZnJlc2hfZXhwIjoxNzUzOTczMDY0LCJ1c2VybmFtZSI6IldlYmluLTAwMCJ9.7R-kn0ruc2yHx6Sydl2KnbvZFBKDAW-jtpLqo88IwXw',
            // this JWT is for Webin-000. Signed with a placeholder secret. Expiry and signature are not checked by this web client.
            token_type: 'sliding',
          },
        });
      }
    }).as('authRequest');
    cy.intercept('POST', '**/auth/verify', (req) => {
      if (req && req.body && req.body.token && req.body.token.startsWith("ey")) {
        req.reply({
          statusCode: 200,
          body: {
            username: allowedUsername,
          },
        });
      } else {
        req.reply({
          statusCode: 401,
          body: {}
        });
      }
    }).as('authVerifyRequest');
  });

  it('should log in successfully with valid credentials and the login should be persisted', () => {
    logUserIn();
    cy.contains(`You are logged in as ${allowedUsername}`).should('be.visible');
    cy.reload();
    cy.contains(`You are logged in as ${allowedUsername}`).should('be.visible');
  });

  it('should display an error message for invalid credentials', () => {
    cy.get('#id_username').type('invalid_username');
    cy.get('#id_password').type('invalid_password');
    cy.get('#submit-id-submit').click();
    cy.get('.vf-form__helper--error').should('be.visible');
  });

  it.skip('should redirect to login when accessing an auth-protected route, then back to the original page after login', () => {
    // TODO: flakey rerender happening
    cy.intercept('GET', `${config.api_v2}/my-data/studies/**`,
      {fixture: 'apiv2/emptyList.json'});
    openPage('mydata');
    cy.url().should('eq', loginUrl);
    logUserIn();
    cy.url().should('eq', myDataPageUrl);
  });

  it.skip('should allow users to resume their private data submission after login', () => {
    openPage('');
    cy.contains('a', 'Submit and/or Request').click();
    cy.url().should('eq', (`${loginUrl}?from=private-request`));
    logUserIn();
    cy.url().should('eq', (`${homePageUrl}?from=private-request`));
    cy.get('.ReactModal__Content--after-open').should('be.visible');
  });

  const logUserIn = () => {
    cy.get('#id_username').type(allowedUsername);
    cy.get('#id_password').type(allowedPassword);
    cy.get('#submit-id-submit').click();
  }
});
