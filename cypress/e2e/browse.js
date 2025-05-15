import { openPage, waitForPageLoad } from '../util/util';

const origPage = 'browse';

describe('Browse page', function() {
  beforeEach(function() {
    cy.intercept('**/v1/studies**search=**').as('studiesSearchCall');
    cy.intercept('**/v1/studies**').as('studiesCall');
    cy.intercept('**/v1/samples**').as('samplesCall');
  });

  context('Super studies table', function() {
    beforeEach(function() {
      openPage(`${origPage }/super-studies`);
      waitForPageLoad('Browse MGnify');
    });

    it('Should contain correct number of super studies', function() {
      cy.get('.mg-table-caption').should('contain.text', 1);
      cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
      cy.get('.vf-table__body > .vf-table__row > :nth-child(1)').should('contain.text', 'Excellent');
    });

    it('Should have markdown rendered description', function() {
      cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.html', '<strong>Excellent Adventure</strong>');
    });

    it('Should be sortable by title', function() {
      cy.contains('Title').click();
      cy.url().should('contain', 'order=title');
    });

    it('Should have download button', function() {
      cy.contains('Download')
          .should('have.attr', 'href')
          .and('include', 'super-studies')
          .and('include', 'format=csv');
    });
  });
  context('Studies table', function() {
    beforeEach(function() {
      openPage(`${origPage }/studies`);
      waitForPageLoad('Browse MGnify');
    });

    it('Should contain correct number of studies', function() {
      cy.get('.mg-table-caption').should('contain.text', 1);
      cy.get('.vf-table__body > .vf-table__row').should('have.length', 1);
      cy.get('.vf-table__body > .vf-table__row > :nth-child(2)').should('contain.text', 'MGYS00000001');
    });

    it('Should make new request when search box changes', function() {
      // TODO: testing actual search requires SQLite full text search turned on
      cy.get('#searchitem').type('wow');
      cy.wait('@studiesSearchCall').its('request.url').should('include', 'search=wow');
    });

    it('Should respond to biome filtering', function() {
      cy.get('#biome-select').click();
      cy.contains('All Engineered').click();
      cy.get('.vf-table__body > .vf-table__row').should('have.length', 0);
      cy.contains('No matching data');
    });
  });
  // TODO list genome catalogues

  // TODO list biomes

  // TODO list publications

  // TODO list samples
});
