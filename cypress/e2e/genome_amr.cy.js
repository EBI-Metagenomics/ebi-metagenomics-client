import config from 'utils/config';
import { gzip } from 'pako';
import { openPage, waitForPageLoad } from '../util/util.js';

const accession = 'MGYG000000001';
const amrUrl = 'https://example.test/MGYG000000001_amrfinderplus.tsv.gz';
const amrDownload = {
  file_type: 'tsv',
  download_type: 'Genome analysis',
  download_group: 'Genome analysis',
  short_description: 'Genome AMRFinderPlus Annotation',
  long_description:
    'Result for antimicrobial resistance annotation of genes and proteins in TSV format',
  alias: `${accession}_amrfinderplus.tsv.gz`,
  index_files: null,
  url: amrUrl,
};

const mockGenome = (downloads, catalogueQuery = '') => {
  cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then((genome) => {
    cy.intercept(
      'GET',
      `${config.api_v2}genomes/${accession}${catalogueQuery}`,
      {
        ...genome,
        downloads,
      }
    ).as('genome');
  });
  cy.intercept(
    'GET',
    `${config.api_v2}genomes/${accession}/annotations${catalogueQuery}`,
    { fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json' }
  );
};

describe('Genome AMR preview', () => {
  it('charts Class frequencies across every page without refetching the file', () => {
    mockGenome([amrDownload]);
    const rows = [
      ...Array.from(
        { length: 101 },
        (_, i) => `protein_${i}\tBETA-LACTAM\tblaTEM`
      ),
      ...Array.from({ length: 3 }, (_, i) => `tet_${i}\tTETRACYCLINE\ttetA`),
      'unknown\t\tunknown',
    ];
    cy.intercept('GET', amrUrl, {
      body: gzip(['Protein identifier\tClass\tGene symbol', ...rows].join('\n'))
        .buffer,
      headers: { 'content-type': 'application/gzip' },
    }).as('amrFile');
    openPage(`genomes/${accession}#amr`);
    cy.get('[data-cy="genome-amr"] tbody tr').should('have.length', 100);
    cy.get('@amrFile.all').its('length').as('initialAmrRequestCount');
    cy.contains('button', 'Switch to chart view').click();
    cy.get('[data-cy="genome-amr"] .highcharts-container').should('be.visible');
    cy.get('[data-cy="genome-amr"] .highcharts-xaxis-labels')
      .should('contain.text', 'BETA-LACTAM')
      .and('contain.text', 'TETRACYCLINE')
      .and('contain.text', 'Unclassified');
    cy.get('[data-cy="genome-amr"] .highcharts-series-0 .highcharts-point')
      .should('have.length', 3)
      .first()
      .trigger('mouseover', { force: true });
    cy.get('[data-cy="genome-amr"] .highcharts-tooltip')
      .should('contain.text', 'BETA-LACTAM')
      .and('contain.text', '101');
    cy.get('@amrFile.all').then((requests) => {
      cy.get('@initialAmrRequestCount').should('equal', requests.length);
    });
    cy.contains('button', 'Switch to table view').click();
    cy.get('[data-cy="genome-amr"] tbody tr').should('have.length', 100);
  });

  it('loads the compressed AMRFinderPlus table on opening AMR and preserves catalogue', () => {
    const catalogueQuery = '?catalogue_id=uhgg-3.0';
    mockGenome([amrDownload], catalogueQuery);
    cy.intercept('GET', amrUrl, {
      body: gzip(
        'Protein identifier\tGene symbol\tClass\nprotein_1\tblaTEM\tBETA-LACTAM\n'
      ).buffer,
      headers: { 'content-type': 'application/gzip' },
    }).as('amrFile');
    cy.intercept('GET', '**/*.gzi*').as('amrIndex');

    openPage(`genomes/${accession}?catalogue=uhgg-3.0`);
    waitForPageLoad(`Genome ${accession}`);
    cy.get('@amrFile.all').should('have.length', 0);
    cy.contains('.vf-tabs__link', /^AMR$/).click();
    cy.location('search').should('equal', '?catalogue=uhgg-3.0');
    cy.location('hash').should('equal', '#amr');
    cy.wait('@amrFile');
    cy.get('[data-cy="genome-amr"] thead')
      .should('contain.text', 'Protein identifier')
      .and('contain.text', 'Gene symbol')
      .and('contain.text', 'Class');
    cy.get('[data-cy="genome-amr"] tbody tr')
      .should('have.length', 1)
      .and('contain.text', 'protein_1')
      .and('contain.text', 'blaTEM')
      .and('contain.text', 'BETA-LACTAM');
    cy.get('[data-cy="genome-amr"] .vf-card--brand.vf-card--bordered').should(
      'be.visible'
    );
    cy.get('[data-cy="genome-amr"] .vf-card__heading').should(
      'contain.text',
      amrDownload.alias
    );
    cy.get('[data-cy="genome-amr"] .ftp-link-container a').should(
      'have.attr',
      'href',
      amrUrl
    );
    cy.get('@amrIndex.all').should('have.length', 0);
    cy.reload();
    cy.get('[data-cy="genome-amr"] tbody').should('contain.text', 'blaTEM');
  });

  [
    [],
    null,
    [
      {
        ...amrDownload,
        alias: 'other.tsv.gz',
        short_description: 'Other annotation',
        url: 'https://example.test/other.tsv.gz',
      },
    ],
  ].forEach((downloads) => {
    it(`hides AMR when downloads are ${JSON.stringify(downloads)}`, () => {
      mockGenome(downloads);
      openPage(`genomes/${accession}`);
      waitForPageLoad(`Genome ${accession}`);
      cy.contains('.vf-tabs__link', /^AMR$/).should('not.exist');
      cy.get('[data-cy="genome-amr"]').should('not.exist');
    });
  });
});
