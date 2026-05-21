import config from 'utils/config';

function stubAssemblyDetails(accession, overrides = {}) {
  cy.intercept('GET', `**/assemblies/${accession}/genome-links`, {
    statusCode: 200,
    body: {
      items: [],
      ...overrides
    }
  }).as('assembly-details');
}

function stubAssemblyAnalyses(accession, fixture) {
  const response = fixture || {
    count: 1,
    data: [
      {
        accession: 'MGYA00000001',
        sample: { accession: 'ERS000001' },
        assembly: { accession: accession },
        run: null,
        pipeline_version: 'v5.0'
      }
    ]
  };
  cy.intercept('GET', `**/assemblies/${accession}/analyses*`, {
    statusCode: 200,
    body: response
  }).as('assembly-analyses');
}

describe('V2 Assembly page', () => {
  beforeEach(function() {
    cy.intercept('GET', `${config.api_v2}/assemblies/ERZ1`,
      { fixture: 'apiv2/assemblies/assemblyDetailERZ1.json' });
  });

  it('shows basic assembly details', () => {
    const acc = 'ERZ1';

    stubAssemblyDetails(acc);

    cy.visit(`/metagenomics/assemblies/${acc}`);

    cy.wait('@assembly-details');

    cy.contains(`Assembly: ${acc}`);
    cy.contains(`ENA accession`);
    cy.contains(`Study (of assembly)`);
    cy.contains(`MGYS1`);
  });

  it('renders Genomes with ENA, Sample, Runs and empty Derived genomes', () => {
    const acc = 'ERZ1';

    stubAssemblyDetails(acc);

    cy.visit(`/metagenomics/assemblies/${acc}#genomes`);

    cy.wait('@assembly-details');

    cy.contains(`Assembly: ${acc}`);
    cy.contains('Derived genomes');
    cy.contains('No derived genomes found.');
  });

  it('renders Analyses tab and loads analyses via assemblies endpoint', () => {
    const acc = 'ERZ1';

    stubAssemblyDetails(acc);
    stubAssemblyAnalyses(acc);

    cy.visit(`/metagenomics/assemblies/${acc}#analyses`);

    cy.wait(['@assembly-details', '@assembly-analyses']);

    cy.contains('Associated analyses');
    // The table component renders a heading "Analyses"
    cy.contains('Analyses');

    // Basic column checks (labels may come from the table component)
    cy.contains('Analysis accession');
    cy.contains('Sample accession');
    cy.contains('Pipeline version');

    // Row content
    cy.contains('MGYA00000001');
    cy.contains('ERS000001');
    cy.contains('5.0');
  });

  it('renders Derived genomes in Genomes', () => {
    const acc = 'ERZ1';
    const genomeAcc = 'MGYG000000001';

    stubAssemblyDetails(acc, {
      items: [
        {
          genome: {
            accession: genomeAcc,
            taxon_lineage: 'd__Bacteria',
            catalogue_id: 'human-gut',
            catalogue_version: '1.0'
          },
          species_rep: genomeAcc,
          mag_accession: 'ERZ000001',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ]
    });

    cy.visit(`/metagenomics/assemblies/${acc}#genomes`);

    cy.wait('@assembly-details');

    cy.contains('Derived genomes');
    cy.contains(genomeAcc);
    cy.contains('ERZ000001');
    cy.contains('human-gut v1.0');
    cy.contains('Bacteria');
  });
});
