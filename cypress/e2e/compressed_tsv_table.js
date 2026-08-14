import config from 'utils/config';
import { gzip } from 'pako';
import { openPage, waitForPageLoad } from '../util/util.js';

const assertKeggModuleHeaders = () => {
  cy.get('.compressed-tsv-table thead')
    .should('contain.text', 'Module Accession')
    .and('contain.text', 'Completeness')
    .and('contain.text', 'Matching KO')
    .and('contain.text', 'Missing KO');
};

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
    assertKeggModuleHeaders();
    cy.get('.compressed-tsv-table thead').should(
      'have.css',
      'background-color',
      'rgb(241, 245, 249)'
    );
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 3);
    cy.get('.compressed-tsv-table').should('contain.text', 'M00135');
    cy.wait('@plainTsv');

    cy.contains('.compressed-tsv-table button', 'Search...').click();
    cy.get('#compressed-tsv-search-term').type('M0013');
    cy.contains('.ReactModal__Content button', 'Search').click();
    cy.contains('.compressed-tsv-table__search-status', 'Showing 3 rows');

    cy.contains('.compressed-tsv-table button', 'Search...').click();
    cy.get('.wildcard-search-input__toggle').first().click();
    cy.contains('.ReactModal__Content button', 'Search').click();
    cy.contains('.compressed-tsv-table__search-status', 'Showing 0 rows');

    cy.get('.compressed-tsv-table__search-status')
      .contains('button', 'Clear')
      .click();
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 3);

    cy.get('@plainTsv.all').then((requests) => {
      cy.contains('button', 'Switch to chart view').click();
      cy.get('.compressed-tsv-table .highcharts-container').should(
        'be.visible'
      );
      cy.get('@plainTsv.all').should('have.length', requests.length);
    });
  });

  it('applies curated KEGG module headers to an assembly analysis', () => {
    const accession = 'MGYA00000002';
    const tsvUrl = `${Cypress.env(
      'FIXTURE_BASE'
    )}/plain-tsv-table.tsv?assembly`;

    cy.fixture('apiv2/analyses/analysisMGYA00000002.json').then((analysis) => {
      cy.intercept('GET', `${config.api_v2}analyses/${accession}`, {
        ...analysis,
        accession,
        downloads: [
          ...analysis.downloads,
          {
            alias: 'ERZ857107_kegg_modules_summary.tsv',
            download_group: 'pathways_and_systems.kegg_modules',
            download_type: 'Functional analysis',
            file_type: 'tsv',
            index_files: null,
            long_description: 'Table with counts for each KEGG Module found',
            short_description: 'KEGG Modules counts',
            url: tsvUrl,
          },
        ],
      });
    });
    cy.intercept('GET', tsvUrl).as('assemblyTsv');

    openPage(`analyses/${accession}/path-systems`);
    waitForPageLoad(`Analysis ${accession}`);

    cy.get('.compressed-tsv-table').should('be.visible');
    assertKeggModuleHeaders();
    cy.wait('@assemblyTsv');
  });
});

describe('DRAM reports', () => {
  it('renders a gzipped DRAM report in an iframe', () => {
    const accession = 'MGYA00000002';
    const dramUrl = 'https://example.test/dram-report.html.gz';
    const reportHtml = '<h1>DRAM Distill report</h1>';

    cy.fixture('apiv2/analyses/analysisMGYA00000002.json').then((analysis) => {
      cy.intercept('GET', `${config.api_v2}analyses/${accession}`, {
        ...analysis,
        downloads: [
          ...analysis.downloads,
          {
            alias: 'ERZ857107_dram.html.gz',
            download_group: 'pathways_and_systems.dram_distill',
            long_description: 'DRAM Distill HTML visualization',
            short_description: 'DRAM Distill HTML report',
            url: dramUrl,
          },
        ],
      });
    });
    cy.intercept('GET', dramUrl, {
      body: gzip(reportHtml).buffer,
      headers: { 'content-type': 'application/x-gzip' },
    }).as('dramReport');

    openPage(`analyses/${accession}/path-systems`);
    waitForPageLoad(`Analysis ${accession}`);

    cy.contains('button', 'DRAM').click();
    cy.contains('DRAM (Distilling and Refining Annotations of Metabolism)');
    cy.wait('@dramReport');
    cy.get('iframe[title="DRAM Distill HTML report"]')
      .should('have.attr', 'srcdoc')
      .and('contain', reportHtml);
  });
});
