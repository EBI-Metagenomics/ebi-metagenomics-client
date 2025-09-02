import {openPage, waitForPageLoad} from '../util/util';
import config from 'utils/config';

describe('Publication page', function() {
  beforeEach(function() {
    cy.intercept('GET', `${config.api_v2}/publications/1`,
      {fixture: 'apiv2/publications/publication1.json'});
    cy.intercept('GET', `${config.api_v2}/publications/1/annotations`,
      {fixture: 'apiv2/publications/publication1Annotations.json'});
    cy.intercept('GET', `**/rest/article/MED/1**`,
      {fixture: 'europepmc/publicationArticle1.json'});
  })
  const publicationId = "1";
  const origPage = 'publications/' + publicationId;
  const pageTitle = 'Publication';

  context('General info', function() {
    beforeEach(function() {
      openPage(origPage);
      waitForPageLoad(pageTitle);
    });

    it('Verify elements are present', function() {
      cy.get('h2').should('contain', 'Publication: The Origin of Species');
      cy.get('h4')
        .should('contain', 'Charles Darwin');
      cy.contains("Cambridge University Press").should('be.visible');
      cy.contains("1859").should('be.visible');
    });

    it('Shows Europe PMC Abstract', function() {
      cy.contains("such an unerring power at work on natural selection").should('be.visible');
    });
  });

  context('Related Projects table', function() {
    beforeEach(function() {
      openPage(origPage);
      waitForPageLoad(pageTitle);
    });

    it('Should show related study', function() {
      cy.contains('Associated studies').should('be.visible');
      cy.contains('Project 1').should('be.visible');
    });
  });

  context('Error handling', function() {
    it('Should display error message if invalid Publication Id passed in URL', function() {
      const pubmedId = '99';
      const origPage = 'publications/' + pubmedId;
      openPage(origPage);
      cy.contains('Error Fetching Data');
    });
  });
});
