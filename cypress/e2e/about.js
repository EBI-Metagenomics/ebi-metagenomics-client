import { openPage } from '../util/util';

describe('About page', { retries: 3 }, function() {
  context('Dropdown citations view', function() {
    it('Contains all the about sections', function() {
      openPage('');
      cy.get(`.mg-main-menu`).contains('About').click();
      const content = '.about-page';
      cy.get(content).contains('The MGnify resource');
      cy.get(content).contains('Staying informed');
      cy.get(content).contains('Cite us');
      cy.get(content).contains('Latest publications');
      cy.get(content).contains('Funding');
    });
    it('Clicking button should display / hide publications', function() {
      openPage('');
      cy.get(`.mg-main-menu`).contains('About').click();
      const citationDiv = '.mg-pub-section';
      const button = '.mg-pub-section button';
      console.log('button', button);
      cy.get(`${citationDiv} article`).should('have.length', 3);
      cy.get(button).click();
      cy.get(`${citationDiv} article`).should('have.length', 9);
      cy.get(button).click();
      cy.get(`${citationDiv} article`).should('have.length', 3);
    });
  });
});
