import {
    openPage,
    setupDefaultSearchPageRouting,
} from '../util/util';

describe('Home page', function() {
    beforeEach(function() {
        setupDefaultSearchPageRouting();
        openPage('');
    });

    context('Page structure', function() {
        it('Should show the hero search title', function() {
            cy.get('.home-hero h1').should('contain', 'Search study and sample descriptions');
        });

        it('Should show the search input with correct placeholder', function() {
            cy.get('.search-text-input')
                .should('be.visible')
                .should('have.attr', 'placeholder', 'Enter keywords, sample names, or biome types...');
        });

        it('Should show the search submit button', function() {
            cy.get('.home-search-box button[type="submit"]')
                .should('be.visible')
                .should('contain', 'Search');
        });

        it('Should show example searches section', function() {
            cy.get('.home-search-examples').should('be.visible');
            cy.get('.home-search-examples').contains('Tara oceans');
            cy.get('.home-search-examples').contains('MGYS00000410');
            cy.get('.home-search-examples').contains('Human Gut');
        });

        it('Should show the three search method cards', function() {
            cy.get('.home-search-cards').should('be.visible');
            cy.contains('Search by Text').should('be.visible');
            cy.contains('Search by Protein').should('be.visible');
            cy.contains('Search by Nucleotide').should('be.visible');
        });

        it('Should show the Latest Publications section', function() {
            cy.contains('Latest Publications').should('be.visible');
        });
    });

    context('Search form', function() {
        it('Should navigate to search page with encoded query on form submit', function() {
            const query = 'tara oceans';
            cy.get('.search-text-input').type(query);
            cy.get('.home-search-box button[type="submit"]').click();
            cy.url().should('match', /query=tara(%20|\+)oceans/);
        });

        it('Should navigate to search page on pressing Enter in the input', function() {
            cy.get('.search-text-input').type('marine bacteria{enter}');
            cy.url().should('match', /query=marine(%20|\+)bacteria/);
        });

        it('Should reflect typed text in the input field', function() {
            cy.get('.search-text-input').type('soil microbiome');
            cy.get('.search-text-input').should('have.value', 'soil microbiome');
        });

        it('Should navigate to search page even with empty query', function() {
            cy.get('.home-search-box button[type="submit"]').click();
            cy.url().should('include', '/search');
        });
    });

    context('Example search links', function() {
        it('"Tara oceans" example link should navigate with correct query', function() {
            cy.get('.home-search-examples a').contains('Tara oceans').click();
            cy.url().should('include', 'query=tara+oceans');
        });

        it('"MGYS00000410" example link should navigate with correct query', function() {
            cy.get('.home-search-examples a').contains('MGYS00000410').click();
            cy.url().should('include', 'query=MGYS00000410');
        });

        it('"Human Gut" example link should navigate with correct query', function() {
            cy.get('.home-search-examples a').contains('Human Gut').click();
            cy.url().should('include', 'query=human+gut');
        });
    });

    context('Search method cards navigation', function() {
        it('"Search by Text" card should link to /search', function() {
            cy.contains('a.vf-card__link', 'Search by Text')
                .should('have.attr', 'href')
                .and('include', '/search');
        });

        it('"Search by Protein" card should link to /proteins', function() {
            cy.contains('a.vf-card__link', 'Search by Protein')
                .should('have.attr', 'href')
                .and('include', '/proteins');
        });

        it('"Search by Nucleotide" card should link to /search-tools', function() {
            cy.contains('a.vf-card__link', 'Search by Nucleotide')
                .should('have.attr', 'href')
                .and('include', '/search-tools');
        });

      it('"Submit and/or Request" card should link to the right submissions page', function() {
        cy.contains('a.vf-card__link', 'Submit and/or Request')
          .should('have.attr', 'href')
          .and('include', 'login?from=private-request');
      });

      it('"Request Public Dataset" card should link to the right submissions page', function() {
        cy.contains('a.vf-card__link', 'Request Public Dataset')
          .should('have.attr', 'href')
          .and('include', 'login?from=public-request');
      });
    });
});
