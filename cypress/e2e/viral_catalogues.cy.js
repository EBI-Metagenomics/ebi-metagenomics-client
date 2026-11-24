import { openPage } from '../util/util';

const version = 'v1.0';
const catalogue = {
  catalogue_id: version, name: 'MGnify Viruses v1.0', version: '1.0', description: 'Marine catalogue fixture', biome: 'Marine',
  ftp_url: 'http://localhost:5055/viral-test/', pipeline_version: '', updated_at: '2026-11-23T10:00:00Z', fragment_count: 1, cluster_count: 1,
  total_sequence_count: 2, virus_count: 1, prophage_count: 0, plasmid_count: 1, other_stats: {}, downloads: [],
};
const representative = { accession: 'MGYV0000104487', catalogue_id: version, length: 12842, cluster_size: 2, source_types: ['genome'], completeness: 75, contamination: 1, checkv_quality: 'Medium-quality', sequence_type: 'virus' };
const plasmid = { ...representative, accession: 'MGYV0000022586', sequence_type: 'plasmid', cluster_size: 1, completeness: null, contamination: null, checkv_quality: '' };
const rows = [
  { ID: representative.accession, Original_ID: 'MGYG000442973_10|viral_sequence-1:12842', Cluster_rep: representative.accession, Source: 'genome', Source_sample: 'SAMEA119408115', Source_project: 'ERP174490', Source_analysis: 'MGYA00000002' },
  { ID: 'MGYV0000022715', Original_ID: 'MGYG000449800_185', Cluster_rep: representative.accession, Source: 'genome', Source_sample: 'SAMD00362163', Source_project: 'PRJDB11811', Source_analysis: '' },
];

describe('MGnify Viruses releases and raw cluster metadata', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/viruses/catalogues/latest', catalogue).as('latest');
    cy.intercept('GET', `**/viruses/catalogues/${version}`, catalogue).as('catalogue');
    cy.intercept('GET', `**/viruses/catalogues/${version}/fragments?*`, req => {
      const params = new URL(req.url).searchParams;
      if (params.get('source_type') === 'analysis') req.alias = params.has('completeness_min') ? 'sourceFiltered' : 'rangeCleared';
      req.reply({ count: 1, items: [params.get('kind') === 'plasmids' ? plasmid : representative] });
    }).as('representatives');
    cy.intercept('GET', `**/viruses/catalogues/${version}/fragments/*`, req => {
      const isPlasmid = req.url.endsWith(plasmid.accession);
      req.reply({ ...(isPlasmid ? plasmid : representative), metadata_rows: isPlasmid ? [{ ID: plasmid.accession, Source: 'genome', Cluster_rep: plasmid.accession, Source_sample: 'SAMEA119408115' }] : rows, metadata_url: `http://localhost:5055/viral-test/${isPlasmid ? 'plasmids' : 'viruses'}-all-metadata.tsv.gz` });
    }).as('detail');
  });

  it('opens the live release directly from the navigation', () => {
    openPage('browse/studies');
    cy.get('#viruses-link').click();
    cy.wait('@latest');
    cy.location('pathname').should('equal', `/metagenomics/viruses/${version}`);
    cy.get('h2').should('contain', catalogue.name);
    cy.get('.vf-tabs__list').first().find('a').then($links => {
      expect([...$links].map(link => link.textContent)).to.deep.equal(['Overview', 'Viruses', 'Plasmids', 'Downloads']);
    });
  });

  it('keeps cards and file views within their catalogue folder', () => {
    const files = [
      'viruses/viruses-all-metadata.tsv.gz',
      'viruses/cluster_representatives/functional_annotation/amr/viruses.tsv',
      'viruses/cluster_representatives/functional_annotation/lifestyle/viruses.bacphlip.gz',
      'plasmids/cluster_representatives/functional_annotation/amr/plasmids.tsv',
    ].map((alias, index) => ({
      alias, url: `http://localhost:5055/viral-test/section-${index}.tsv`,
      file_type: 'tsv', download_type: 'Functional analysis', download_group: alias.split('/')[0],
      short_description: `File ${index}`, long_description: '', index_files: null,
    }));
    cy.intercept('GET', `**/viruses/catalogues/${version}`, {
      ...catalogue, downloads: files,
      other_stats: { total_sequences: 3, total_proteins_viruses: 10, total_proteins_plasmids: 2 },
    });
    files.forEach(file => cy.intercept('GET', file.url, {
      body: 'ID\tSequence_length\tcheckv_quality\tSource_of_prediction\tdrug_class\tgene_symbol\nrep1\t1000\tComplete\tgeNomad\tbeta-lactam\tgeneA\n',
    }));
    openPage(`viruses/${version}`);
    cy.contains('a', 'catalogue.json').should('have.attr', 'href', `${catalogue.ftp_url}catalogue.json`);
    cy.get('.stat_label').should('contain', 'Version').and('contain', 'Total sequences')
      .and('not.contain', 'Virus representatives').and('not.contain', 'Plasmid representatives');
    cy.get('.compressed-tsv-table').should('not.exist');
    cy.get('.vf-tabs').first().then($tabs => {
      cy.get('.vf-card').first().then($card => {
        expect($tabs[0].compareDocumentPosition($card[0]) & Node.DOCUMENT_POSITION_FOLLOWING).to.be.greaterThan(0);
      });
    });
    cy.contains('a.vf-tabs__link', 'Viruses').click();
    cy.get('.stat_label').should('contain', 'Virus representatives').and('contain', 'Viral proteins')
      .and('not.contain', 'Plasmid representatives').and('not.contain', 'Version');
    cy.contains('a.vf-tabs__link', 'Metadata and QC').click();
    cy.get('[data-cy=viral-chart-sequence-lengths]').should('contain', 'File 0');
    cy.get('.compressed-tsv-table').should('have.length', 1);
    cy.contains('a.vf-tabs__link', 'Functional annotations').click();
    cy.get('[data-cy=viral-chart-amr-classes]').should('contain', 'File 1');
    cy.get('[data-cy=viral-chart-viral-lifestyle]').should('contain', 'File 2');
    cy.contains('File 3').should('not.exist');
    cy.contains('a.vf-tabs__link', 'Plasmids').click();
    cy.get('.stat_label').should('contain', 'Plasmid representatives').and('contain', 'Plasmid proteins')
      .and('not.contain', 'Virus representatives');
    cy.contains('a.vf-tabs__link', 'Functional annotations').click();
    cy.get('.compressed-tsv-table').should('have.length', 1);
    cy.contains('File 3').should('be.visible');
    cy.contains('File 1').should('not.exist');
  });

  it('shows the exact cluster rows with accession enrichment and source link', () => {
    openPage(`viruses/${version}/viruses`);
    cy.wait('@representatives');
    cy.contains('.mg-table a', representative.accession).click();
    cy.wait('@detail');
    cy.get('dl').should('not.exist');
    cy.get('tbody tr').should('have.length', 2);
    cy.contains('a', 'MGYG000442973').should('have.attr', 'href', '/metagenomics/genomes/MGYG000442973');
    cy.contains('a', 'MGYA00000002').should('have.attr', 'href', '/metagenomics/analyses/MGYA00000002');
    cy.contains('a', 'SAMEA119408115').should('have.attr', 'href', 'https://www.ebi.ac.uk/ena/browser/view/SAMEA119408115');
    cy.contains('a', 'ERP174490').should('have.attr', 'href', 'https://www.ebi.ac.uk/ena/browser/view/ERP174490');
    cy.contains('a', 'PRJDB11811').should('have.attr', 'href', 'https://www.ebi.ac.uk/ena/browser/view/PRJDB11811');
    cy.contains('a', 'viruses-all-metadata.tsv.gz').should('have.attr', 'href', 'http://localhost:5055/viral-test/viruses-all-metadata.tsv.gz');
  });

  it('opens plasmid representatives with their smaller metadata table', () => {
    openPage(`viruses/${version}/plasmids`);
    cy.wait('@representatives').its('request.url').should('contain', 'kind=plasmids');
    cy.get('thead').should('not.contain', 'CheckV');
    cy.contains('.mg-table a', plasmid.accession).click();
    cy.wait('@detail');
    cy.get('h2').should('contain', 'Plasmid cluster representative');
    cy.get('tbody tr').should('have.length', 1);
    cy.contains('a', 'plasmids-all-metadata.tsv.gz').should('be.visible');
  });

  it('keeps numeric filters in the URL and resets pagination after source changes', () => {
    openPage(`viruses/${version}/viruses?page=2&completeness_min=20&completeness_max=90&contamination_max=5`);
    cy.wait('@representatives').its('request.url').should('contain', 'completeness_min=20');
    cy.get('#completeness-filter').should('be.checked');
    cy.get('#viral-source').select('analysis');
    cy.wait('@sourceFiltered').then(({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('page')).to.equal('1');
      expect(params.get('source_type')).to.equal('analysis');
      expect(params.get('contamination_max')).to.equal('5');
    });
    cy.get('#completeness-filter').uncheck({ force: true });
    cy.wait('@rangeCleared').its('request.url').should('not.contain', 'completeness_min');
  });

  it('embeds available Krona exports alongside viral taxonomy', () => {
    const file = { alias: 'viruses/cluster_representatives/taxonomy/genomad/genomad_krona.html', url: 'http://localhost:5055/viral-test/krona.html', file_type: 'html', download_type: 'Taxonomic analysis', download_group: 'viruses.viral_taxonomy', short_description: 'geNomad Krona taxonomy', long_description: 'Interactive taxonomy', index_files: null };
    const counts = { ...file, alias: 'viruses/cluster_representatives/taxonomy/genomad/viruses_genomad_taxonomy_counts.tsv', url: 'http://localhost:5055/viral-test/counts.tsv', file_type: 'tsv' };
    cy.intercept('GET', `**/viruses/catalogues/${version}`, { ...catalogue, downloads: [file, counts] });
    cy.intercept('GET', file.url, { body: '<html><body><h1>Interactive Krona taxonomy</h1></body></html>' });
    cy.intercept('GET', counts.url, { body: '3\tViruses\tRealm\n' });
    openPage(`viruses/${version}/viruses#viral-taxonomy`);
    cy.get('iframe[title="geNomad Krona taxonomy"]').should('have.attr', 'srcdoc').and('contain', 'Interactive Krona taxonomy');
  });
});
