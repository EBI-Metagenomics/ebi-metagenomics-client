import { openPage } from '../util/util';
import { gzip } from 'pako';

const catalogueId = 'marine-viruses-v1-0';
const catalogue = {
  catalogue_id: catalogueId,
  name: 'Marine Viruses v1.0',
  version: '1.0',
  description: 'Marine viral fragments and a synthetic ASAv6 example.',
  biome: 'Marine',
  ftp_url:
    'https://ftp.ebi.ac.uk/pub/databases/metagenomics/BlueRemediomics/marine_viral_catalogue_v1/',
  pipeline_version: '',
  updated_at: '2026-11-18T10:00:00Z',
  fragment_count: 3,
  cluster_count: 3,
  total_sequence_count: 4,
  virus_count: 2,
  provirus_count: 1,
  prophage_count: 1,
  plasmid_count: 3,
  downloads: [],
  other_stats: {},
};
const fragment = {
  accession: 'MGYV0000104487',
  catalogue_id: catalogueId,
  original_id: 'MGYG000442973_10|viral_sequence-1:12842',
  cluster_representative: 'MGYV0000104487',
  length: 12842,
  cluster_size: 2,
  occurrence_count: 1,
  cluster_member_occurrence_count: 1,
  sequence_sha256: '',
  source_type: 'genome',
  source_accession: 'CCSUNS01',
  source_genome_accession: 'MGYG000449800',
  source_analysis_accession: null,
  source_sample: 'SAMEA119408115',
  source_study: 'ERP174490',
  source_lineage: 'Bacteria;Planctomycetota',
  prediction_tool: 'VIRify',
  checkv_quality: 'Low-quality',
  miuvig_quality: 'Genome-fragment',
  completeness: null,
  contamination: 0,
  is_provirus: false,
  sequence_type: 'virus',
  taxonomy: { vitap: 'Duplodnaviria;Caudoviricetes', genomad: 'missing' },
};
fragment.occurrences = [{
  fragment_accession: fragment.accession,
  original_id: fragment.original_id,
  source_type: 'genome',
  source_accession: fragment.source_accession,
  source_genome_accession: fragment.source_genome_accession,
  catalogue_genome_id: 123,
  genome_catalogue_id: 'marine-v2-0',
}];
fragment.cluster_member_occurrences = [{
  ...fragment.occurrences[0],
  fragment_accession: 'MGYV0000022715',
}];
const fragments = [
  fragment,
  {
    ...fragment,
    accession: 'MGYV0000123871',
    cluster_representative: 'MGYV0000123871',
    length: 12842,
    sequence_type: 'prophage',
  },
  {
    ...fragment,
    accession: 'MGYV9999999999',
    cluster_representative: 'MGYV9999999999',
    original_id: 'synthetic_ASAv6_contig_1',
    source_type: 'analysis',
    source_accession: 'ERZ857107',
    source_genome_accession: null,
    source_analysis_accession: 'MGYA00000002',
  },
];

describe('MGnify Viruses', () => {
  beforeEach(() => {
    cy.intercept('GET', `**/viruses/catalogues/?*`, {
      body: { count: 1, items: [catalogue] },
    }).as('catalogues');
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, {
      body: catalogue,
    }).as('catalogue');
    cy.intercept(
      'GET',
      `**/viruses/catalogues/${catalogueId}/fragments?*`,
      (req) => {
        const params = new URL(req.url).searchParams;
        if (params.get('source_type') === 'analysis')
          req.alias = 'assemblyFragments';
        if (params.get('sequence_type') || params.get('representatives_only'))
          req.alias = 'categoryFragments';
        let items = fragments;
        if (params.get('sequence_type'))
          items = items.filter(
            (row) => row.sequence_type === params.get('sequence_type')
          );
        if (params.get('representatives_only'))
          items = items.filter(
            (row) => row.accession === row.cluster_representative
          );
        if (params.get('source_type'))
          items = items.filter(
            (row) => row.source_type === params.get('source_type')
          );
        if (params.get('cluster_representative'))
          items = items.filter(
            (row) =>
              row.cluster_representative ===
              params.get('cluster_representative')
          );
        if (params.get('search'))
          items = items.filter((row) =>
            row.accession.includes(params.get('search'))
          );
        const count = items.length;
        const page = Number(params.get('page') || 1);
        const size = Number(params.get('page_size') || 10);
        req.reply({
          count,
          items: items.slice((page - 1) * size, page * size),
        });
      }
    ).as('fragments');
    cy.intercept(
      'GET',
      `**/viruses/catalogues/${catalogueId}/fragments/*`,
      (req) => {
        const accession = req.url.split('/').pop();
        req.reply(fragments.find((row) => row.accession === accession));
      }
    ).as('fragment');
  });

  it('opens the catalogue from the top navigation and Browse tab', () => {
    openPage('browse/studies');
    cy.get('#viruses-link').should('contain', 'MGnify Viruses').click();
    cy.wait('@catalogues');
    cy.contains('a.vf-tabs__link', 'Viruses').should('be.visible');
    cy.contains('.mg-table a', catalogue.name).click();
    cy.wait(['@catalogue', '@fragments']);
    cy.get('h2').should('contain', catalogue.name);
    cy.contains('a.vf-tabs__link', 'Downloads').click();
    cy.contains('a', 'Catalogue FTP directory').should(
      'have.attr',
      'href',
      catalogue.ftp_url
    );
    cy.contains('a.vf-tabs__link', 'Viral fragments').click();
    cy.contains('.mg-table a', fragment.accession).click();
    cy.wait('@fragment');
    cy.get('h2').should('contain', fragment.accession);
    cy.contains('dd', 'Unknown').should('be.visible');
    cy.contains('a', fragment.source_genome_accession).should(
      'have.attr',
      'href',
      `/metagenomics/genomes/${fragment.source_genome_accession}`
    );
    cy.get('[data-cy=representativeOccurrences]')
      .should('contain', fragment.accession)
      .find(`a[href="/metagenomics/genomes/${fragment.source_genome_accession}?catalogue=marine-v2-0"]`)
      .should('be.visible');
    cy.get('[data-cy=memberOccurrences]').should('contain', 'MGYV0000022715');
  });

  it('filters assembly sources and retains an analysis link', () => {
    openPage(`viral-catalogues/${catalogueId}?page=2&pageSize=1`);
    cy.wait('@fragments');
    cy.get('#viral-source').select('analysis');
    cy.wait('@assemblyFragments').then(({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('source_type')).to.equal('analysis');
      expect(params.get('page')).to.equal('1');
    });
    cy.contains('.mg-table a', 'MGYV9999999999').click();
    cy.wait('@fragment');
    cy.contains('dd', 'Assembly analysis').should('be.visible');
    cy.contains('a', 'MGYA00000002').should(
      'have.attr',
      'href',
      '/metagenomics/analyses/MGYA00000002'
    );
  });

  it('filters fragment types and representatives from the count cards', () => {
    openPage(`viral-catalogues/${catalogueId}`);
    cy.wait('@fragments');
    cy.contains('article', 'Prophage representatives').find('a').click();
    cy.wait('@categoryFragments');
    cy.get('.mg-table tbody tr')
      .should('have.length', 1)
      .and('contain.text', 'Prophage');
    cy.location('search').should('contain', 'sequence_type=prophage');
    cy.contains('article', 'Viral clusters').find('a').click();
    cy.wait('@categoryFragments');
    cy.get('.mg-table tbody tr').should('have.length', 3);
  });

  it('shows an empty table after an unmatched fragment search', () => {
    openPage(`viral-catalogues/${catalogueId}?search=absent`);
    cy.wait('@fragments');
    cy.contains('No matching data').should('be.visible');
  });

  it('shows labelled downloads with distinct viral and plasmid groups', () => {
    const downloads = [
      ['viruses', 'Viral representative nucleotide sequences'],
      ['plasmids', 'Plasmid representative nucleotide sequences'],
    ].map(([kind, label]) => ({
      alias: `${kind}/cluster_representatives/${kind}.fasta.gz`,
      url: `http://localhost:5055/viral-test/${kind}.fasta.gz`,
      download_type: 'Coding Sequences',
      download_group: `${kind}.coding_sequences`,
      file_type: 'fasta',
      short_description: label,
      long_description: 'Nucleotide sequence of each cluster representative.',
      index_files: null,
    }));
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, {
      ...catalogue,
      downloads,
    });
    openPage(`viral-catalogues/${catalogueId}#downloads`);
    cy.contains('h4', 'Viruses · Coding Sequences').should('be.visible');
    cy.contains('h4', 'Plasmids · Coding Sequences').should('be.visible');
    downloads.forEach((file) => {
      cy.get(`a[download][href="${file.url}"]`).within(() => {
        cy.get('.vf-card__heading').should('have.text', file.short_description);
        cy.contains(file.long_description).should('be.visible');
      });
    });
  });

  it('charts the complete gzip file and splits multiple AMR classes', () => {
    const files = [
      ['viruses/viruses-all-metadata.tsv.gz', 'lengths.tsv.gz'],
      ['viruses/viruses-cluster-stats.tsv.gz', 'clusters.tsv.gz'],
      [
        'viruses/cluster_representatives/functional_annotation/amr/viruses.tsv',
        'amr.tsv',
      ],
      ['plasmids/plasmids-all-metadata.tsv.gz', 'plasmids.tsv.gz'],
    ].map(([alias, name]) => ({
      alias,
      url: `http://localhost:5055/viral-test/${name}`,
      download_type: 'Statistics',
      download_group: 'viruses',
      file_type: 'tsv',
      short_description: name,
      long_description: name,
      index_files: null,
    }));
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, {
      ...catalogue,
      downloads: files,
    });
    cy.intercept('GET', files[0].url, {
      body: gzip(
        'ID\tSequence_length\tcheckv_quality\tSource_of_prediction\n' +
          Array.from({ length: 121 }, (_, i) => `MGYV${i}\t6506\tComplete\tVIRify`).join('\n')
      ).buffer,
    }).as('metadataFile');
    cy.intercept('GET', files[1].url, {
      body: gzip('Rep_ID\tcluster_size\na\t1\nb\t2\nc\t5\n').buffer,
    });
    cy.intercept('GET', files[2].url, {
      body: 'gene_symbol\tdrug_class\na\tA; B; A\nb\tB; C\n',
    });
    cy.intercept('GET', files[3].url, {
      body: gzip('ID\tSequence_length\nplasmid_1\t1000\n').buffer,
    });
    openPage(`viral-catalogues/${catalogueId}#overview`);
    cy.get('[data-cy=viral-chart-sequence-lengths] .highcharts-container').scrollIntoView().should('be.visible');
    cy.get('[data-cy=viral-chart-sequence-lengths] .highcharts-series-0 .highcharts-point')
      .eq(1)
      .should(($point) => {
        expect($point[0].point.y).to.equal(121);
        expect($point[0].point.category).to.equal('5000–9999');
      });
    cy.get('@metadataFile.all').then((requests) => cy.wrap(requests.length).as('initialMetadataRequests'));
    cy.get('[data-cy=viral-chart-sequence-lengths]').within(() => {
      cy.get('.compressed-tsv-table').should('have.length', 1);
      cy.get('[role=tablist]').should('not.exist');
      cy.get('.compressed-tsv-table__toolbar-actions button').should('have.length', 3);
      cy.contains('button', 'Table view').should('be.enabled');
      cy.contains('button', 'Chart views').click();
      cy.contains('[role=option]', 'CheckV quality').click();
      cy.get('.highcharts-point').should(($points) => expect($points[0].point.y).to.equal(121));
      cy.contains('button', 'Table view').click().should('be.disabled');
    });
    cy.get('[data-cy=viral-chart-sequence-lengths] .compressed-tsv-table tbody tr').should('have.length', 100);
    cy.get('@initialMetadataRequests').then((count) => cy.get('@metadataFile.all').should('have.length', count));
    cy.get('[data-cy=viral-chart-cluster-sizes] .highcharts-xaxis-labels').should('contain.text', '3–5');
    cy.contains('button[role=tab]', 'AMR').click();
    cy.get('[aria-label=AMR] article').should('have.length', 1);
    cy.get('[data-cy=viral-chart-amr-classes]').contains('button', 'Chart views').click();
    cy.contains('[role=option]', 'AMR elements').click();
    cy.get('[data-cy=viral-chart-amr-classes] .highcharts-container').should('be.visible');
    cy.get('[data-cy=viral-chart-amr-classes]').contains('button', 'Chart views').click();
    cy.contains('[role=option]', 'AMR classes').click();
    cy.get('[data-cy=viral-chart-amr-classes] .highcharts-series-0 .highcharts-point').should(($points) => {
      expect(
        [...$points].map((element) => [element.point.category, element.point.y])
      ).to.deep.equal([
        ['B', 2],
        ['A', 1],
        ['C', 1],
      ]);
    });
    cy.contains('a.vf-tabs__link', 'Plasmids').click();
    cy.get('.compressed-tsv-table tbody').should('contain.text', 'plasmid_1');
    cy.contains('a.vf-tabs__link', 'Downloads').click();
    cy.get(
      '[aria-label="Download viruses/viruses-all-metadata.tsv.gz"]'
    ).should('have.attr', 'href', files[0].url);
    cy.contains('button', 'Show curl script').click();
    cy.get('pre').should(
      'contain.text',
      "--create-dirs -o 'viruses/viruses-all-metadata.tsv.gz'"
    );
  });

  it('shows an API error for a missing catalogue', () => {
    cy.intercept('GET', `**/viruses/catalogues/missing`, {
      statusCode: 404,
    }).as('missing');
    openPage('viral-catalogues/missing');
    cy.wait('@missing');
    cy.contains('404').should('be.visible');
  });
});
