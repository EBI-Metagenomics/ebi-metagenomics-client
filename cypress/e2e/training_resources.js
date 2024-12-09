import {openPage} from '../util/util';
describe('Training Courses Component', () => {
  context('Main functionality', () => {
    beforeEach(() => {
      openPage('#training__section--1')
      cy.intercept('GET', '**/ebisearch/ws/rest/ebiweb_training_events*').as('getLiveTraining');
      cy.intercept('GET', '**/ebisearch/ws/rest/ebiweb_training_online*').as('getOnDemandTraining');
    });

    it('should display and switch between tabs', () => {
      cy.get('.vf-tabs__list').should('be.visible');
      cy.get('.vf-tabs__link').should('have.length', 2);
      cy.get('.vf-tabs__link').first().should('contain', 'On-demand training');
      cy.get('.vf-tabs__link').last().should('contain', 'Live training');

      cy.get('.vf-tabs__link').last().click();
      cy.hash().should('eq', '#training__section--2');
      cy.get('.vf-tabs__link').first().click();
      cy.hash().should('eq', '#training__section--1');
    });

    // it('should handle loading states', () => {
    //   cy.contains('Loading live training sessions...').should('be.visible');
    //   cy.wait('@getLiveTraining');
    //   cy.contains('Loading live training sessions...').should('not.exist');
    // });

    it('should display training content when loaded', () => {
      cy.get('.vf-tabs__link').first().click();
      cy.get('#training__section--1').within(() => {
        cy.get('.vf-summary--event').should('have.length.at.least', 1);
        cy.get('.vf-summary__title').first().should('be.visible');
        cy.get('.vf-summary__text').first().should('be.visible');
      });
    });

    it('should handle empty states', () => {
      cy.intercept('GET', '**/ebisearch/ws/rest/ebiweb_training_events*', { entries: [] }).as('emptyLive');
      cy.reload();
      cy.wait('@emptyLive');
      cy.get('.vf-tabs__link').last().click();
      cy.contains('Currently there are no upcoming events').should('be.visible');
    });

    it('should have working "View all" link', () => {
      cy.get('#view-all-on-demand-training-link')
        .should('have.attr', 'href')
        .and('include', '/training/services/mgnify/on-demand');
    });

    it('should maintain tab state on page refresh', () => {
      cy.get('.vf-tabs__link').last().click();
      cy.hash().should('eq', '#training__section--2');
      cy.reload();
      cy.hash().should('eq', '#training__section--2');
      cy.get('#training__section--2').should('be.visible');
    });
  });
});