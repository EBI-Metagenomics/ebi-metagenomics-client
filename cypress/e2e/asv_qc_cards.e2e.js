// eslint-disable-next-line import/extensions
import { openPage, waitForPageLoad } from '../util/util';
import config from 'utils/config';

const stubAmpliconAnalysis = (accession, statsUrl) => {
  cy.intercept('GET', `${config.api_v2}analyses/${accession}*`, {
    statusCode: 200,
    body: {
      accession,
      study_accession: 'MGYS0000001',
      experiment_type: 'amplicon',
      pipeline_version: 'V6.1',
      run: { accession: 'SRR1111111' },
      sample: { accession: 'ERS000001' },
      read_run: {
        instrument_model: 'Illumina HiSeq 2000',
        instrument_platform: 'ILLUMINA',
      },
      assembly: null,
      downloads: [
        {
          alias: 'SRR1111111_dada2_stats.tsv',
          download_type: 'Quality control',
          file_type: 'tsv',
          long_description: 'Amplicon ASV statistics',
          short_description: 'DADA2 stats',
          download_group: 'asv.stats',
          file_size_bytes: null,
          index_files: null,
          url: statsUrl,
        },
      ],
      quality_control_summary: {},
      metadata: {},
      results_dir: 'https://www.ebi.ac.uk/metagenomics/results/1',
    },
  }).as('analysis-details');
};

const getMetricCard = (label) =>
  cy.contains('.vf-card__heading', label).parents('.vf-card').first();

describe('Amplicon ASV quality-control cards', () => {
  it('renders the reads-with-ASVs card from the explicit matched proportion', () => {
    const accession = 'MGYA01001001';
    const statsUrl = 'https://example.test/SRR1111111_dada2_stats.tsv';

    stubAmpliconAnalysis(accession, statsUrl);
    cy.intercept(
      'GET',
      statsUrl,
      [
        'initial_number_of_reads\t1000',
        'final_number_of_reads\t180',
        'proportion_reads_matched\t0.18',
        'proportion_reads_chimeric\t0.08',
      ].join('\n')
    ).as('dada2-stats');

    openPage(`analyses/${accession}/asv`);
    waitForPageLoad(`Analysis ${accession}`);
    cy.wait('@analysis-details');
    cy.wait('@dada2-stats');

    getMetricCard('Reads with ASVs').within(() => {
      cy.get('.vf-card__subheading')
        .should('contain.text', '18.00%')
        .and('have.css', 'color', 'rgb(34, 197, 94)');
      cy.contains(
        '.vf-card__text',
        'At least 10% of the initial reads contain ASVs'
      );
    });
  });

  it('derives the reads-with-ASVs proportion from renamed count fields', () => {
    const accession = 'MGYA01001002';
    const statsUrl = 'https://example.test/SRR2222222_dada2_stats.tsv';

    stubAmpliconAnalysis(accession, statsUrl);
    cy.intercept(
      'GET',
      statsUrl,
      [
        'initial_read_count\t1000',
        'final_nonchimeric_read_count\t50',
        'proportion_reads_chimeric\t0.32',
      ].join('\n')
    ).as('dada2-stats');

    openPage(`analyses/${accession}/asv`);
    waitForPageLoad(`Analysis ${accession}`);
    cy.wait('@analysis-details');
    cy.wait('@dada2-stats');

    getMetricCard('Reads with ASVs').within(() => {
      cy.get('.vf-card__subheading')
        .should('contain.text', '5.00%')
        .and('have.css', 'color', 'rgb(239, 68, 68)');
      cy.contains(
        '.vf-card__text',
        'Less than 10% of the initial reads contain ASVs'
      );
    });

    getMetricCard('Final Reads').within(() => {
      cy.get('.vf-card__subheading').should('contain.text', '50');
      cy.contains('.vf-card__text', '95.0% reduction after processing');
    });
  });
});
