import config from 'utils/config';
import { openPage, waitForPageLoad } from '../util/util.js';

describe('Genome KEGG subtabs', () => {
  const accession = 'MGYG000000001';
  const catalogue = 'uhgg-3.0';

  beforeEach(() => {
    cy.intercept('GET', `${config.api_v2}genomes/${accession}*`, {
      fixture: 'apiv2/genomes/genomeDetail_MGYG000000001.json',
    });
    cy.intercept('GET', `${config.api_v2}genomes/${accession}/annotations*`, {
      fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json',
    });
  });

  it('uses a second tier of KEGG tabs and preserves catalogue on selection and reload', () => {
    openPage(`genomes/${accession}?catalogue=${catalogue}`);
    waitForPageLoad(`Genome ${accession}`);
    cy.contains('button.mg-button-as-tab', 'KEGG classes').should('not.exist');
    cy.contains('a.vf-tabs__link', /^KEGG$/).click();
    cy.contains('button.mg-button-as-tab', 'KEGG classes').should(
      'have.class',
      'is-active'
    );
    cy.get('[data-cy="genome-kegg-analysis"]').should('be.visible');
    cy.contains('button.mg-button-as-tab', 'KEGG modules').click();
    cy.get('[data-cy="genome-kegg-module-analysis"]').should('be.visible');
    cy.contains('button.mg-button-as-tab', 'KEGG pathways').click();
    cy.location('hash').should('equal', '#kegg');
    cy.location('search')
      .should('contain', `catalogue=${catalogue}`)
      .and('contain', 'keggTab=pathways');
    cy.reload();
    cy.contains('button.mg-button-as-tab', 'KEGG pathways').should(
      'have.class',
      'is-active'
    );
    cy.contains('a.vf-tabs__link', /^KEGG$/).should('have.class', 'is-active');
    cy.contains('button.mg-button-as-tab', 'KEGG classes').click();
    cy.get('[data-cy="genome-kegg-analysis"]').should('be.visible');
    cy.contains('a.vf-tabs__link', 'Overview').click();
    cy.contains('button.mg-button-as-tab', 'KEGG classes').should('not.exist');
  });
});
