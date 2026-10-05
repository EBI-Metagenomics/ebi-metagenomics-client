import config from 'utils/config';
import { gzip } from 'pako';
import { openPage, waitForPageLoad } from '../util/util.js';

const accession = 'MGYG000000001';
const pathofactUrl =
  'https://example.test/MGYG000000001_pathofact2_combined_report.tsv.gz';
const pathofactDownload = {
  file_type: 'tsv',
  download_type: 'Genome analysis',
  download_group: 'Genome analysis',
  short_description: 'Pathofact2-style report',
  long_description:
    'Pathogenicity-related annotations at protein level in TSV format',
  alias: `${accession}_pathofact2_combined_report.tsv.gz`,
  index_files: null,
  url: pathofactUrl,
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

describe('Genome PathoFact preview', () => {
  it('keeps Search at the top right while a wide table scrolls', () => {
    mockGenome([pathofactDownload]);
    const headers = Array.from({ length: 24 }, (_, i) => `Annotation_${i}`);
    const row = headers.map((_, i) => `long_pathogenicity_annotation_${i}`);
    const tsv = [headers, ...Array.from({ length: 50 }, () => row)]
      .map((cells) => cells.join('\t'))
      .join('\n');
    cy.intercept('GET', pathofactUrl, {
      body: gzip(tsv).buffer,
      headers: { 'content-type': 'application/gzip' },
    });
    openPage(`genomes/${accession}#pathofact`);
    cy.get('[data-cy="genome-pathofact"] tbody tr').should('have.length', 50);

    const searchSelector =
      '[data-cy="genome-pathofact"] .compressed-tsv-table__toolbar-actions button';
    cy.get(searchSelector).then(($button) => {
      const before = $button[0].getBoundingClientRect();
      cy.get('[data-cy="genome-pathofact"] .tsv-table__scroll').then(
        ($scroll) => {
          const scroll = $scroll[0];
          expect(scroll.scrollWidth).to.be.greaterThan(scroll.clientWidth);
          scroll.scrollLeft = scroll.scrollWidth - scroll.clientWidth;
          scroll.scrollTop = 200;
          expect(scroll.scrollLeft).to.be.greaterThan(0);
          expect(scroll.scrollTop).to.be.greaterThan(0);
        }
      );
      cy.get(searchSelector)
        .should(($currentButton) => {
          const after = $currentButton[0].getBoundingClientRect();
          expect(after.x).to.be.closeTo(before.x, 1);
          expect(after.y).to.be.closeTo(before.y, 1);
        })
        .click();
    });
    cy.get('#compressed-tsv-search-term').should('be.visible');
  });

  it('loads the compressed PathoFact2-style report table on opening PathoFact and preserves catalogue', () => {
    const catalogueQuery = '?catalogue_id=uhgg-3.0';
    mockGenome([pathofactDownload], catalogueQuery);
    cy.intercept('GET', pathofactUrl, {
      body: gzip(
        'Protein identifier\tAMR\tVirulence\nprotein_1\tResistant\tVirulent\n'
      ).buffer,
      headers: { 'content-type': 'application/gzip' },
    }).as('pathofactFile');
    cy.intercept('GET', '**/*.gzi*').as('pathofactIndex');

    openPage(`genomes/${accession}?catalogue=uhgg-3.0`);
    waitForPageLoad(`Genome ${accession}`);
    cy.get('@pathofactFile.all').should('have.length', 0);
    cy.contains('.vf-tabs__link', /^PathoFact$/).click();
    cy.location('search').should('equal', '?catalogue=uhgg-3.0');
    cy.location('hash').should('equal', '#pathofact');
    cy.wait('@pathofactFile');
    cy.get('[data-cy="genome-pathofact"] thead')
      .should('contain.text', 'Protein identifier')
      .and('contain.text', 'AMR')
      .and('contain.text', 'Virulence');
    cy.get('[data-cy="genome-pathofact"] tbody tr')
      .should('have.length', 1)
      .and('contain.text', 'protein_1')
      .and('contain.text', 'Resistant')
      .and('contain.text', 'Virulent');
    cy.get(
      '[data-cy="genome-pathofact"] .vf-card--brand.vf-card--bordered'
    ).should('be.visible');
    cy.get('[data-cy="genome-pathofact"] .vf-card__heading').should(
      'contain.text',
      pathofactDownload.alias
    );
    cy.get('[data-cy="genome-pathofact"] .ftp-link-container a').should(
      'have.attr',
      'href',
      pathofactUrl
    );
    cy.get('@pathofactIndex.all').should('have.length', 0);
    cy.reload();
    cy.get('[data-cy="genome-pathofact"] tbody').should(
      'contain.text',
      'Resistant'
    );
  });

  [
    [],
    null,
    [
      {
        ...pathofactDownload,
        alias: 'other.tsv.gz',
        short_description: 'Other annotation',
        url: 'https://example.test/other.tsv.gz',
      },
    ],
  ].forEach((downloads) => {
    it(`hides PathoFact when downloads are ${JSON.stringify(
      downloads
    )}`, () => {
      mockGenome(downloads);
      openPage(`genomes/${accession}`);
      waitForPageLoad(`Genome ${accession}`);
      cy.contains('.vf-tabs__link', /^PathoFact$/).should('not.exist');
      cy.get('[data-cy="genome-pathofact"]').should('not.exist');
    });
  });
});
