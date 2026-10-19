import config from 'utils/config';
import { openPage } from '../util/util.js';

const accession = 'MGYG000000001';
const refName = `${accession}_1`;
const fastaUrl = 'https://example.test/navigation.fna';
const gffUrl = 'https://example.test/navigation.gff';
const gff = Array.from({ length: 13 }, (_, i) =>
  `${refName}\ttest\tCDS\t${1000 + i * 1000}\t${1100 + i * 1000}\t.\t+\t0\tID=feature_${i + 1};product=TARGET;Note=TARGET;`
).join('\n');

// Import through Vite in the application window, using its IndexedDB connection.
const modules = () => cy.window().then((win) => win.eval(`Promise.all([
  import('/metagenomics/src/utils/locallyIndexedGff.ts'),
  import('/metagenomics/src/utils/gffSearchMatches.ts')
])`));

function expectRulerNear(min, max) {
  cy.get('[data-resizer="true"]')
    .filter(':has([data-testid^="refLabel-"])')
    .should(($scalebar) => {
      const bounds = $scalebar[0].getBoundingClientRect();
      const positions = [...$scalebar[0].querySelectorAll('div')]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return !element.children.length && /^[\d,]+$/.test(element.textContent) && rect.left >= bounds.left && rect.right <= bounds.right;
        })
        .map((element) => Number(element.textContent.replaceAll(',', '')));
      expect(positions.length).to.be.greaterThan(0);
      expect(Math.min(...positions)).to.be.greaterThan(min);
      expect(Math.max(...positions)).to.be.lessThan(max);
    });
}

function openBrowser(entity = 'genome', annotations = gff, indexedReference) {
  cy.intercept('GET', fastaUrl, `>${refName}\n${'N'.repeat(50000)}\n`);
  cy.intercept('GET', gffUrl, annotations);
  cy.intercept('HEAD', gffUrl, { headers: { 'content-length': String(annotations.length) } });
  const downloads = [
    { alias: `${accession}.fna`, url: fastaUrl, file_type: 'fasta', download_group: 'quality_control' },
    { alias: `${accession}.gff`, url: gffUrl, file_type: 'gff', download_group: 'annotation_summary' },
  ];
  if (indexedReference) {
    const faiUrl = `${fastaUrl}.fai`;
    const name = indexedReference.name;
    const header = `>${name}\n`;
    cy.intercept('GET', faiUrl, `${name}\t${indexedReference.length}\t${header.length}\t50\t51\n`);
    downloads[0].index_files = [{ index_type: 'fai', url: faiUrl }];
    cy.intercept('GET', fastaUrl, (request) => {
      const range = /bytes=(\d+)-(\d+)/.exec(request.headers.range || '');
      const start = range ? Number(range[1]) : 0;
      const end = range ? Number(range[2]) : header.length + 100;
      expect(end - start).to.be.lessThan(100000);
      const body = Array.from({ length: end - start + 1 }, (_, i) => {
        const position = start + i;
        return position < header.length ? header[position] : (position - header.length) % 51 === 50 ? '\n' : 'N';
      }).join('');
      request.reply({ statusCode: range ? 206 : 200, body });
    });
  }
  if (entity === 'genome') {
    cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then((genome) => {
      cy.intercept('GET', `${config.api_v2}genomes/${accession}`, { ...genome, downloads });
    });
    cy.intercept('GET', `${config.api_v2}genomes/${accession}/annotations`, {
      fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json',
    });
    openPage(`genomes/${accession}#genome-browser`);
  } else {
    cy.fixture('apiv2/analyses/analysisMGYA00000002.json').then((analysis) => {
      cy.intercept('GET', `${config.api_v2}/analyses/MGYA00000002`, { ...analysis, downloads });
    });
    openPage('analyses/MGYA00000002/contigs-viewer/search-contigs');
  }
  // A previous test may have indexed the same source.
  cy.contains('button', 'View & search contigs').click();
  cy.contains(`Indexed 1 ${entity === 'genome' ? 'genome' : 'assembly'} contigs`).should('be.visible');
}

describe('Contig search feature navigation', { scrollBehavior: 'center' }, () => {
  beforeEach(() => {
    openPage('');
    modules().then(async ([index]) => { await index.resetDb(); });
  });

  ['genome', 'analysis'].forEach((entity) => {
    it(`navigates individual matches and pages feature lists in the ${entity} browser`, () => {
      openBrowser(entity);
      cy.get('#contig-search-all').type('TARGET');
      cy.location('search').should('contain', 'allAnnotationsSearch=TARGET');
      cy.get('.mg-feature-match').should('have.length', 10).first().should('contain.text', 'Jump to 1000–1100');
      cy.get('[data-cy="contig-search-matches"] details').should('not.exist');
      cy.contains('button', 'Previous matches').should('be.disabled');
      cy.get('.mg-feature-match').first().click();
      cy.get(`[data-testid="refLabel-${refName}"]`).should('be.visible');
      // Actual JBrowse ruler ticks must show the selected interval, rather than the full contig.
      expectRulerNear(500, 1500);
      cy.get('[data-cy="contig-search-matches"] li').should('have.length', 10);
      cy.contains('button', 'Next matches').click();
      cy.get('[data-cy="contig-search-matches"] li').should('have.length', 3);
      cy.contains('button', 'Jump to 13000–13100').click();
      expectRulerNear(12500, 13500);
      cy.contains('button', 'Next matches').should('be.disabled');
      cy.contains('button', 'Previous matches').click();
      cy.get('.mg-feature-match').should('have.length', 10).first().should('contain.text', 'Jump to 1000–1100');
      cy.contains('button', 'Jump to 1000–1100').click();
      expectRulerNear(500, 1500);
      cy.contains('button', 'Next matches').click();
      cy.get('.mg-feature-match').should('have.length', 3);
      cy.get('#contig-search-all').clear().type('feature_2');
      cy.get('[data-cy="contig-search-matches"] details').should('not.exist');
      cy.get('.mg-feature-match').should('have.length', 1).and('have.text', 'Jump to 2000–2100');
      cy.get('[data-cy="contig-search-matches"] code').should('have.text', 'ID=feature_2;');
      cy.get('.mg-feature-match code').should('not.exist');
      cy.contains('button', 'Next matches').should('not.exist');
      cy.contains('button', 'Previous matches').should('not.exist');
      cy.reload();
      cy.get('.mg-feature-match').should('have.text', 'Jump to 2000–2100');
      cy.get('#contig-search-all').clear().type(refName);
      cy.get('[data-cy="contig-search-matches"]').should('contain.text', `Contig ID=${refName};`);
      cy.get('[data-cy="contig-search-matches"] ul').should('not.exist');
    });
  });

  it('preserves feature boundaries across import batches and wide coordinates', () => {
    openBrowser();
    const rows = [
      `ID=first;Note=café TARGET;product=TARGET;`,
      `ID=second;product=TARGET;`,
      `ID=third;product=TARGETED;`,
      `ID=invalid;product=TARGET;`,
      `ID=wide;product=TARGET;`,
    ];
    const text = rows.map((attrs, i) => `${refName}\ttest\tCDS\t${i === 3 ? 0 : i === 4 ? 2 ** 32 + 1 : i * 100 + 1}\t${i === 4 ? 2 ** 32 + 100 : i * 100 + 100}\t.\t+\t0\t${attrs}`).join('\n');
    cy.intercept('GET', 'https://example.test/batches.gff', text);
    modules().then(async ([index, search]) => {
      await index.importGffToIndexedDB({ url: 'https://example.test/batches.gff', assemblyAccession: accession, attrsToIndex: [], batchSize: 2 }).start();
      const contig = await index.db.contigs.toCollection().first();
      const batches = await index.db.coordinates.toArray();
      expect(batches).to.have.length(3);
      expect(batches[0].spans.BYTES_PER_ELEMENT).to.equal(4);
      expect(batches[2].spans.BYTES_PER_ELEMENT).to.equal(8);
      expect(index.db.coordinates.schema.indexes).to.have.length(0);
      const page = await search.getFeatureMatchPage(contig, 'TARGET', true, undefined, 2);
      expect(page.matches.map((match) => match.start)).to.deep.equal([1, 101]);
      const next = await search.getFeatureMatchPage(contig, 'TARGET', true, page.next, 2);
      expect(next.matches.map((match) => match.start)).to.deep.equal([0, 2 ** 32 + 1]);
      expect(next.next).to.equal(undefined);
      expect((await search.getFeatureMatchPage(contig, 'TARGET', false)).matches).to.have.length(5);
      const controller = new AbortController();
      controller.abort();
      expect((await search.getFeatureMatchPage(contig, 'TARGET', false, undefined, 10, controller.signal)).matches).to.have.length(0);
    });
  });

  it('rejects an incomplete cached import', () => {
    openBrowser();
    modules().then(async ([index]) => {
      await index.db.meta.delete('importCompletedAt');
    });
    cy.reload();
    cy.contains('button', 'View & search contigs').should('be.visible');
  });

  it('clamps boundary navigation and preserves distinct features at the same coordinates', () => {
    const annotations = [
      `${refName}\ttest\tCDS\t1\t10\t.\t+\t0\tID=left_boundary;`,
      `${refName}\ttest\tgene\t1\t10\t.\t+\t.\tID=duplicate_boundary;`,
      `${refName}\ttest\tCDS\t49990\t50000\t.\t+\t0\tID=right_boundary;`,
      `${refName}\ttest\tCDS\t0\t10\t.\t+\t0\tID=invalid_location;`,
    ].join('\n');
    openBrowser('genome', annotations);
    cy.get('#contig-search-all').type('boundary');
    cy.get('.mg-feature-match').first().click();
    expectRulerNear(0, 300);
    cy.get('[data-cy="contig-search-matches"] li').should('have.length', 3);
    cy.contains('button', 'Jump to 49990–50000').click();
    expectRulerNear(49700, 50001);
    cy.get('#contig-search-all').clear().type('invalid_location');
    cy.get('[data-cy="contig-search-matches"]').should('contain.text', 'location unavailable');
    cy.get('.mg-feature-match').should('not.exist');
  });

  it('rejects the previous cache content version', () => {
    openBrowser();
    modules().then(async ([index]) => {
      const spec = await index.db.meta.get('indexSpec');
      const value = JSON.parse(spec.value);
      value.contentVersion = 3;
      await index.db.meta.put({ key: 'indexSpec', value: JSON.stringify(value) });
    });
    cy.reload();
    cy.contains('button', 'View & search contigs').should('be.visible');
  });

  it('keeps cancelled imports incomplete', () => {
    openBrowser();
    cy.contains('button', 'Remove contig index').click();
    cy.intercept('GET', gffUrl, { body: gff, delay: 2000 });
    cy.contains('button', 'View & search contigs').click();
    cy.contains('button', 'Cancel').click();
    cy.contains('button', 'View & search contigs').should('be.visible');
    modules().then(async ([index]) => {
      expect(await index.db.meta.get('importCompletedAt')).to.equal(undefined);
    });
    cy.reload();
    cy.contains('button', 'View & search contigs').should('be.visible');
  });

  it('navigates beyond unsigned 32-bit reference coordinates', () => {
    const start = 2 ** 32 + 1;
    const annotations = `${refName}\ttest\tCDS\t${start}\t${start + 99}\t.\t+\t0\tID=wide_feature;`;
    openBrowser('genome', annotations, { name: refName, length: 2 ** 32 + 5000 });
    cy.get('#contig-search-all').type('wide_feature');
    cy.location('search').should('contain', 'allAnnotationsSearch=wide_feature');
    cy.contains('button', `Jump to ${start}–${start + 99}`).should('be.visible');
    cy.contains('button', `Jump to ${start}–${start + 99}`).click();
    expectRulerNear(start - 300, start + 500);
  });

  it('resolves a feature reference alias through the assembly manager', () => {
    const annotations = 'chr1\ttest\tCDS\t1000\t1100\t.\t+\t0\tID=alias_feature;';
    openBrowser('genome', annotations, { name: 'Chr1', length: 50000 });
    cy.get('#contig-search-all').type('alias_feature');
    cy.get('.mg-feature-match').click();
    cy.get('[data-testid="refLabel-Chr1"]').should('be.visible');
    expectRulerNear(500, 1500);
  });
});
