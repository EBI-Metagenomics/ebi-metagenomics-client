import { openPage } from '../util/util.js';

describe('ELIXIR banner', () => {
  it('renders the banner content on initial page load', () => {
    openPage('help');

    cy.get('[data-vf-js-banner-elixir]').should('be.visible').within(() => {
      cy.contains('a', 'MGnify is part of the ELIXIR infrastructure')
        .should('be.visible')
        .and('have.attr', 'href', 'http://www.elixir-europe.org');
      cy.contains('p', 'MGnify is an ELIXIR Core Data Resource')
        .should('be.visible');
      cy.get('img').should('have.attr', 'src',
        'https://ebi.emblstatic.net/web_guidelines/EBI-Framework/v1.4/images/logos/ELIXIR/elixir-cdr.gif');
    });
  });
});
