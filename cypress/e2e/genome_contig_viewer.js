import config from 'utils/config';
import { gzip, ungzip } from 'pako';
import { parseStringSyncJBrowse } from 'gff-nostream';
import { Jexl } from '@jbrowse/jexl';
import {
  findGenomeFasta,
  findGenomeGff,
} from 'components/Genomes/ContigViewer/downloads';
import {
  createFastaAdapter,
  createGffAdapter,
  createGffTrack,
} from 'components/Analysis/ContigViewer/jbrowseConfig';
import { openPage, waitForPageLoad } from '../util/util.js';

const accession = 'MGYG000000001';
const download = (alias, file_type, extra = {}) => ({
  alias,
  file_type,
  url: `https://example.test/genome/${alias}`,
  ...extra,
});

describe('Genome browser download compatibility', () => {
  it('opens a legacy locus without indexing and preserves it on reload', () => {
    const refName = `${accession}_22`;
    const fasta = download(`${accession}.fna`, 'fasta');
    const gff = download(`${accession}.gff`, 'gff');
    cy.intercept(
      'GET',
      fasta.url,
      `>${accession}_1\n${'N'.repeat(10000)}\n>${refName}\n${'N'.repeat(10000)}\n`
    );
    cy.intercept(
      'GET',
      gff.url,
      `${refName}\ttest\tCDS\t1742\t2016\t.\t+\t0\tID=gene_1;\n`
    );
    cy.intercept('HEAD', gff.url, { headers: { 'content-length': '100' } });
    cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then(
      (genome) => {
        cy.intercept('GET', `${config.api_v2}genomes/${accession}`, {
          ...genome,
          downloads: [fasta, gff],
        });
      }
    );
    cy.intercept('GET', `${config.api_v2}genomes/${accession}/annotations`, {
      fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json',
    });
    openPage(
      `genomes/${accession}?contig_id=${refName}&start=1742&end=2016&functional-annotation=ncrna&keep=value#genome-browser`
    );
    const expectLocation = () => {
      cy.location('hash').should('equal', '#genome-browser');
      cy.location('search').should((search) => {
        const params = new URLSearchParams(search);
        expect(params.get('genomeBrowserLocation')).to.equal(`${refName}:1742-2016`);
        expect(params.get('keep')).to.equal('value');
        ['contig_id', 'start', 'end', 'functional-annotation'].forEach((param) => {
          expect(params.has(param)).to.equal(false);
        });
      });
      cy.get(`[data-testid="refLabel-${refName}"]`).should('be.visible');
      cy.get('[data-resizer="true"]')
        .filter(':has([data-testid^="refLabel-"])')
        .should(($scalebar) => {
          const bounds = $scalebar[0].getBoundingClientRect();
          const ticks = [...$scalebar[0].querySelectorAll('div')]
            .filter((element) => {
              const rect = element.getBoundingClientRect();
              return !element.children.length && /^[\d,]+$/.test(element.textContent) && rect.left >= bounds.left && rect.right <= bounds.right;
            })
            .map((element) => Number(element.textContent.replaceAll(',', '')));
          expect(ticks.length).to.be.greaterThan(0);
          expect(Math.min(...ticks)).to.be.greaterThan(1500);
          expect(Math.max(...ticks)).to.be.lessThan(2200);
        });
      cy.contains('button', 'View & search contigs').should('be.visible');
      cy.window().then((win) => win.eval(
        "import('/metagenomics/src/utils/locallyIndexedGff.ts').then(({ db }) => db.contigs.count())"
      )).should('equal', 0);
    };
    expectLocation();
    cy.reload();
    expectLocation();
  });

  it('opens, filters, clears, and toggles tracks in the track selector', () => {
    const refName = accession + '_1';
    const fasta = download(accession + '.fna', 'fasta');
    const gff = download(accession + '.gff', 'gff');
    cy.intercept(
      'GET',
      fasta.url,
      '>' + refName + '\n' + 'N'.repeat(10000) + '\n'
    );
    cy.intercept(
      'GET',
      gff.url,
      refName + '\ttest\tCDS\t100\t200\t.\t+\t0\tID=gene_1;product=test;\n'
    );
    cy.intercept('HEAD', gff.url, { headers: { 'content-length': '100' } });
    cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then(
      (genome) => {
        cy.intercept('GET', config.api_v2 + 'genomes/' + accession, {
          ...genome,
          downloads: [fasta, gff],
        });
      }
    );
    cy.intercept(
      'GET',
      config.api_v2 + 'genomes/' + accession + '/annotations',
      {
        fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json',
      }
    );
    openPage('genomes/' + accession + '#genome-browser');
    waitForPageLoad('Genome ' + accession);
    cy.get('[data-testid="refLabel-' + refName + '"]').should('be.visible');
    cy.get('[data-testid="view_menu_icon"]').click();
    cy.contains('[role="menuitem"]', 'Open track selector').click();
    cy.get('[data-testid="hierarchical_track_selector"]').should('be.visible');
    cy.contains('label', 'Filter tracks')
      .invoke('attr', 'for')
      .then((id) => {
        cy.get('input[id="' + id + '"]').as('trackFilter');
      });
    cy.get('@trackFilter').type('absent_track');
    cy.contains('label', gff.alias).should('not.exist');
    cy.get('@trackFilter').parent().find('button').click();
    cy.get('@trackFilter').should('have.value', '');
    cy.contains('label', gff.alias)
      .should('be.visible')
      .find('input[type="checkbox"]')
      .as('trackCheckbox');
    cy.get('@trackCheckbox')
      .should('be.checked')
      .uncheck()
      .should('not.be.checked');
    cy.get('@trackCheckbox').check().should('be.checked');
    cy.get('@trackFilter').type(accession);
    cy.contains('label', gff.alias).should('be.visible');
    cy.get('@trackFilter').type('{esc}');
    cy.get('[data-testid="hierarchical_track_selector"]').should('not.exist');
    cy.get('[data-testid="view_menu_icon"]').click();
    cy.contains('[role="menuitem"]', 'Open track selector').click();
    cy.get('[data-testid="hierarchical_track_selector"]').should('be.visible');
  });

  it('labels parsed GFF features with their ID and gene name', () => {
    const jexl = new Jexl();
    jexl.addFunction('get', (feature, key) => feature[key]);
    const track = createGffTrack(download('labels.gff', 'gff'), accession);
    const display = track.displays[0];
    expect(display.renderer.type).to.equal('CanvasFeatureRenderer');
    const expression = jexl.compile(
      display.renderer.labels.name.slice('jexl:'.length)
    );
    const id = 'MGYG000299377_00597';
    [
      [`ID=${id};gene=blh;Name=other;`, `${id} (blh)`],
      [`ID=${id};Name=blh;`, `${id} (blh)`],
      [`ID=${id};`, id],
      ['gene=blh;', 'blh'],
      ['Name=blh;', 'blh'],
      [`ID=${id};gene=${id};`, id],
      [`ID=${id};Name=${id};`, id],
      ['.', ''],
    ].forEach(([attributes, expected]) => {
      const [feature] = parseStringSyncJBrowse(
        `contig_1\tProdigal\tCDS\t19415\t21307\t.\t+\t0\t${attributes}\n`
      );
      expect(expression.eval({ feature }), attributes).to.equal(expected);
    });
  });

  it('indexes the real multi-block BGZF genome GFF without GZI', () => {
    const realAccession = 'MGYG000842761';
    const base = Cypress.env('FIXTURE_BASE');
    const fastaUrl = `${base}/${realAccession}.fna`;
    const gffUrl = `${base}/apiv2/genomes/${realAccession}.gff.gz`;
    cy.intercept('GET', fastaUrl, {
      body: [666371, 119726, 95728]
        .map(
          (length, i) => `>${realAccession}_${i + 1}\n${'N'.repeat(length)}\n`
        )
        .join(''),
      headers: { 'content-type': 'text/plain' },
    });
    cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then(
      (genome) => {
        cy.intercept('GET', `${config.api_v2}genomes/${realAccession}`, {
          ...genome,
          accession: realAccession,
          downloads: [
            download(`${realAccession}.fna`, 'fasta', { url: fastaUrl }),
            download(`${realAccession}.gff.gz`, 'gff', {
              url: gffUrl,
              index_files: null,
            }),
          ],
        });
      }
    );
    cy.intercept(
      'GET',
      `${config.api_v2}genomes/${realAccession}/annotations`,
      {
        fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json',
      }
    );
    openPage(`genomes/${realAccession}#genome-browser`);
    waitForPageLoad(`Genome ${realAccession}`);
    cy.get(`[data-testid="refLabel-${realAccession}_1"]`).should('be.visible');
    cy.contains('button', 'View & search contigs').click();
    cy.get('.Toastify__toast').should('contain', 'Indexed 3 genome contigs');
    cy.get('.vf-table__body > .vf-table__row').should('have.length', 3);
    cy.get('.vf-table__body').should('contain.text', `${realAccession}_1`);
  });

  beforeEach(() => {
    cy.window().then(
      (win) =>
        new Cypress.Promise((resolve, reject) => {
          const request = win.indexedDB.deleteDatabase('gffdb');
          request.onsuccess = resolve;
          request.onerror = () => reject(request.error);
          request.onblocked = resolve;
        })
    );
  });

  ['plain', 'gzip', 'bgzf'].forEach((format) => {
    it(`loads and searches ${format} GFF without a GZI index`, () => {
      const fastaUrl = `${Cypress.env('FIXTURE_BASE')}/legacy-genome.fna`;
      const gffUrl = `${Cypress.env('FIXTURE_BASE')}/legacy-genome.gff${
        format === 'plain' ? '' : '.gz'
      }`;
      const fixtureDir = 'apiv2/analyses/contigviewer/';
      [
        [fastaUrl, `${fixtureDir}ERZ857107_filtered_contigs.fasta.gz`],
        [gffUrl, `${fixtureDir}ERZ857107_annotation_summary.gff.gz`],
      ].forEach(([url, fixture]) => {
        cy.fixture(fixture, 'binary').then((binary) => {
          const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
          const text = ungzip(bytes, { to: 'string' });
          const isGff = url === gffUrl;
          const compressed = isGff && format !== 'plain';
          const body =
            isGff && format === 'bgzf'
              ? bytes.buffer
              : compressed
              ? gzip(text).buffer
              : text;
          cy.intercept('GET', url, {
            body,
            headers: {
              'content-type': compressed ? 'application/gzip' : 'text/plain',
            },
          });
        });
      });
      cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then(
        (genome) => {
          cy.intercept('GET', `${config.api_v2}genomes/${accession}`, {
            ...genome,
            downloads: genome.downloads.map((d) => ({
              ...d,
              url: d.file_type === 'fna' ? fastaUrl : gffUrl,
            })),
          });
        }
      );
      cy.intercept('GET', `${config.api_v2}genomes/${accession}/annotations`, {
        fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json',
      });
      openPage(`genomes/${accession}#genome-browser`);
      waitForPageLoad(`Genome ${accession}`);
      cy.contains('ERZ101_1').should('be.visible');
      cy.contains('File download required').should('be.visible');
      cy.contains('Additional GFFs shown are not searchable').should(
        'not.exist'
      );
      cy.contains('button', 'View & search contigs').click();
      cy.get('.Toastify__toast').should('contain', 'Indexed 6 genome contigs');
      cy.get('.vf-table__body')
        .contains('ERZ101_1')
        .closest('tr')
        .should('be.visible');
      cy.get('.vf-table__body > .vf-table__row').should('have.length', 6);
      cy.get('#contig-search-all').type('IPR003593');
      cy.get('.vf-table__body > .vf-table__row').should('have.length', 3);
    });
  });

  it('selects the main compressed files regardless of download order', () => {
    const fasta = download(`${accession}.fna.gz`, 'fasta');
    const gff = download(`${accession}.gff.gz`, 'other');
    const downloads = [
      download(`${accession}.faa.gz`, 'fasta'),
      download('pan-genome.fna.gz', 'fasta', {
        download_group: 'Pan-Genome analysis',
      }),
      download(`${accession}_rRNAs.fasta.gz`, 'fasta'),
      download(`${accession}_antismash.gff.gz`, 'other'),
      download(`${accession}_mobilome.gff.gz`, 'gff'),
      fasta,
      gff,
    ];
    expect(findGenomeFasta(downloads, accession)).to.equal(fasta);
    expect(findGenomeGff(downloads, accession)).to.equal(gff);
    expect(findGenomeFasta(downloads.slice(0, 3), accession)).to.be.undefined;
  });

  it('retains legacy uncompressed selection and singular index metadata', () => {
    cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then(
      (genome) => {
        expect(findGenomeFasta(genome.downloads, accession)).to.equal(
          genome.downloads[0]
        );
        expect(findGenomeGff(genome.downloads, accession)).to.equal(
          genome.downloads[1]
        );
      }
    );
    const fasta = download(`${accession}.fna`, 'fna', {
      index_file: { index_type: 'fai', path: `genome/${accession}.fna.fai` },
    });
    expect(createFastaAdapter(fasta)).to.deep.equal({
      type: 'IndexedFastaAdapter',
      fastaLocation: { uri: fasta.url },
      faiLocation: { uri: `${fasta.url}.fai` },
    });
    const gff = download(`${accession}.gff.gz`, 'gff', {
      index_file: { index_type: 'csi', path: `genome/${accession}.gff.gz.csi` },
    });
    expect(createGffAdapter(gff).index).to.deep.equal({
      location: { uri: `${gff.url}.csi` },
      indexType: 'CSI',
    });
  });

  it('recognises V6 groups and uses resolved index URLs', () => {
    cy.fixture('apiv2/analyses/analysisMGYA00000002.json').then((analysis) => {
      const fasta = findGenomeFasta(analysis.downloads, accession);
      const gff = findGenomeGff(analysis.downloads, accession);
      expect(fasta.download_group).to.equal('quality_control');
      expect(gff.download_group).to.equal('annotation_summary');
      const fastaAdapter = createFastaAdapter(fasta);
      expect(fastaAdapter.type).to.equal('BgzipFastaAdapter');
      expect(fastaAdapter.faiLocation.uri).to.equal(
        fasta.index_files.find((i) => i.index_type === 'fai').url
      );
      expect(fastaAdapter.gziLocation.uri).to.equal(
        fasta.index_files.find((i) => i.index_type === 'gzi').url
      );
      const gffAdapter = createGffAdapter(gff);
      expect(gffAdapter.type).to.equal('Gff3TabixAdapter');
      expect(gffAdapter.index.location.uri).to.equal(
        gff.index_files.find((i) => i.index_type === 'csi').url
      );
    });
  });

  it('loads a genome browser with BGZF files and analyses-style indexes', () => {
    cy.fixture('apiv2/analyses/analysisMGYA00000002.json').then((analysis) => {
      const fasta = findGenomeFasta(analysis.downloads, accession);
      const gff = findGenomeGff(analysis.downloads, accession);
      const additional = analysis.downloads.find(
        (d) => d.download_group === 'mobilome_annotation_pipeline'
      );
      cy.fixture('apiv2/genomes/genomeDetail_MGYG000000001.json').then(
        (genome) => {
          cy.intercept('GET', `${config.api_v2}genomes/${accession}`, {
            ...genome,
            downloads: [
              download(`${accession}.faa.gz`, 'fasta'),
              additional,
              {
                ...fasta,
                alias: `${accession}.fna.gz`,
                download_group: 'Genome analysis',
              },
              {
                ...gff,
                alias: `${accession}.gff.gz`,
                file_type: 'other',
                download_group: 'Genome analysis',
              },
            ],
          });
        }
      );
    });
    cy.intercept('GET', `${config.api_v2}genomes/${accession}/annotations`, {
      fixture: 'apiv2/genomes/genomeAnnotations_MGYG000000001.json',
    });
    openPage(`genomes/${accession}#genome-browser`);
    waitForPageLoad(`Genome ${accession}`);
    cy.contains('No annotations available').should('not.exist');
    cy.contains('File download required').should('be.visible');
    cy.contains('ERZ101_1').should('be.visible');
    cy.contains('Additional GFFs shown are not searchable').should(
      'be.visible'
    );
    cy.contains('a', 'ERZ857107_user_mobilome_full.gff.gz').should(
      'be.visible'
    );
    cy.contains('a', `${accession}.gff.gz`).should('not.exist');
  });
});
