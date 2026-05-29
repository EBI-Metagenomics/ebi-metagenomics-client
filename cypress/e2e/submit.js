import {openPage} from '../util/util';

const allowedUsername = 'Webin-000';
const allowedPassword = 'secret';

describe('Submit page - Request Analysis', function() {
  beforeEach(() => {
    cy.intercept('POST', '**/auth/sliding', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0b2tlbl90eXBlIjoic2xpZGluZyIsImV4cCI6MTc1Mzk3MzA2NCwiaWF0IjoxNzUzODg2NjY0LCJqdGkiOiI5Y2Q1YWYzYzMxMDA0YzI1OWI0Mzc4MzIzODQxMzhhZSIsInJlZnJlc2hfZXhwIjoxNzUzOTczMDY0LCJ1c2VybmFtZSI6IldlYmluLTAwMCJ9.7R-kn0ruc2yHx6Sydl2KnbvZFBKDAW-jtpLqo88IwXw',
          // this JWT is for Webin-000. Signed with a placeholder secret. Expiry and signature are not checked by this web client.
          token_type: 'sliding',
        },
      });
    }).as('authRequest');
    cy.intercept('POST', '**/utils/token/verify', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          data: {
            token: req.body.token,
          }
        },
      });
    }).as('authVerifyRequest');
    cy.intercept('POST', '**/my-data/request', {
      statusCode: 200,
      body: {
        message: 'Analysis request for [ERP123456] was succesfully submitted.',
      },
    }).as('requestAnalysis');
  });

  it('should allow a logged in user to request analysis of a public dataset', () => {
    openPage('login?from=public-request');

    cy.get('#id_username').type(allowedUsername);
    cy.get('#id_password').type(allowedPassword);
    cy.get('#submit-id-submit').click();

    // After login, it should redirect to home with the modal open
    cy.get('.ReactModal__Content--after-open').should('be.visible');
    cy.contains('Request an analysis of a public dataset').should('be.visible');

    const accession = 'ERP123456';
    cy.get('#study-accession').type(accession);
    cy.get('input[name="analysis-option"]').first().check();
    cy.get('textarea[name="reason"]').type('This is a test comment');

    cy.contains('button', 'Submit request').click();

    cy.wait('@requestAnalysis').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        study_accession: accession,
        comments: 'This is a test comment',
        analysis_type: 'Analysis (provides taxonomic profile) of Amplicon/metabarcoding raw-reads data.',
        request_type: 'Public',
      });
    });

    cy.contains(`Analysis request for [${accession}] was succesfully submitted.`).should('be.visible');
  });

  it('should allow a logged in user to request analysis of a private dataset', () => {
    openPage('login?from=private-request');

    cy.get('#id_username').type(allowedUsername);
    cy.get('#id_password').type(allowedPassword);
    cy.get('#submit-id-submit').click();

    // After login, it should redirect to home with the modal open
    cy.get('.ReactModal__Content--after-open').should('be.visible');
    cy.contains('Request an analysis of your data').should('be.visible');

    // Select "Yes" for "Has your data already been submitted?"
    cy.get('input[name="dataSubmitted"][value="Yes"]').check();

    const accession = 'ERP123456';
    cy.get('#study-accession').type(accession);
    cy.get('input[name="analysis-option"]').eq(2).check();
    cy.get('textarea[name="reason"]').type('This is a test comment for private data');

    cy.contains('button', 'Submit request').click();

    cy.wait('@requestAnalysis').then((interception) => {
      expect(interception.request.body).to.deep.equal({
        study_accession: accession,
        comments: 'This is a test comment for private data',
        analysis_type: 'Assembly and analysis (generates and submits contig sequences, provides taxonomic and functional profile) of Metagenomic/metatranscriptomic raw-reads data.',
        request_type: 'Private',
      });
    });

    cy.contains(`Analysis request for [${accession}] was succesfully submitted.`).should('be.visible');
  });
});
