import config from 'utils/config';
import { openPage, waitForPageLoad } from '../util/util.js';

describe('TSV table loaders', () => {
  it('renders an ordinary TSV without requesting a BGZF index', () => {
    const accession = 'MGYG000000001';
    const tsvUrl = `${Cypress.env('FIXTURE_BASE')}/plain-tsv-table.tsv`;

    cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then(
      (genome) => {
        cy.intercept('GET', `${config.api_v2}genomes/${accession}`, {
          ...genome,
          downloads: [
            ...genome.downloads,
            {
              alias: 'MGYG000000001_kegg_pathway_completeness.tsv',
              download_group: 'pathways_and_systems.kegg_pathways',
              download_type: 'Functional analysis',
              file_type: 'tsv',
              long_description: 'KEGG pathway completeness',
              short_description: 'KEGG pathway completeness',
              url: tsvUrl,
            },
          ],
        });
      }
    );
    cy.intercept(
      'GET',
      `${config.api_v2}genomes/${accession}/annotations`,
      { fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json' }
    );
    cy.intercept('GET', tsvUrl).as('plainTsv');

    openPage(`genomes/${accession}#kegg-pathway-analysis`);
    waitForPageLoad(`Genome ${accession}`);

    cy.get('.compressed-tsv-table').should('be.visible');
    cy.get('.compressed-tsv-table thead').should(
      'contain.text',
      'Pathway Accession'
    );
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 3);
    cy.get('.compressed-tsv-table').should('contain.text', 'map00010');
    cy.wait('@plainTsv');

    cy.contains('button', 'Switch to chart view').click();
    cy.get('.compressed-tsv-table .highcharts-container').should('be.visible');
    cy.get('@plainTsv.all').should('have.length', 1);
  });
});
