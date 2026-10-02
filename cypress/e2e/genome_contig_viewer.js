import config from 'utils/config';
import { ungzip } from 'pako';
import {
  findGenomeFasta,
  findGenomeGff,
} from 'components/Genomes/ContigViewer/downloads';
import {
  createFastaAdapter,
  createGffAdapter,
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
  it('loads the browser with legacy uncompressed files and no aliases', () => {
    const fastaUrl = `${Cypress.env('FIXTURE_BASE')}/legacy-genome.fna`;
    const gffUrl = `${Cypress.env('FIXTURE_BASE')}/legacy-genome.gff`;
    const fixtureDir = 'apiv2/analyses/contigviewer/';
    [
      [fastaUrl, `${fixtureDir}ERZ857107_filtered_contigs.fasta.gz`],
      [gffUrl, `${fixtureDir}ERZ857107_annotation_summary.gff.gz`],
    ].forEach(([url, fixture]) => {
      cy.fixture(fixture, 'binary').then((binary) => {
        const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
        cy.intercept('GET', url, {
          body: ungzip(bytes, { to: 'string' }),
          headers: { 'content-type': 'text/plain' },
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
    cy.contains('Additional GFFs shown are not searchable').should('not.exist');
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
