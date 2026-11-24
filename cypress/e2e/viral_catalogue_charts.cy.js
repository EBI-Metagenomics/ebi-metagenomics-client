import { openPage } from '../util/util';

const catalogueId = 'test-viral-charts';
const taxonomyFile = (database) => ({
  alias: `viruses/cluster_representatives/taxonomy/${database}/viruses_${database}_taxonomy_counts.tsv`,
  url: `http://localhost:5055/viral-test/${database}.tsv`,
  file_type: 'tsv', download_type: 'Taxonomic analysis', download_group: 'viruses.taxonomy',
  short_description: database, long_description: `${database} taxonomy`, index_files: null,
});
const catalogue = {
  catalogue_id: catalogueId, name: 'Viral chart test', description: 'Small taxonomy data',
  version: '1.0', biome: 'Marine', updated_at: '2026-11-18T10:00:00Z',
  fragment_count: 5, cluster_count: 5, virus_count: 5, provirus_count: 0, prophage_count: 0,
  plasmid_count: 0, ftp_url: 'https://example.test/catalogue/', pipeline_version: '', other_stats: {},
};

describe('Viral taxonomy Sankeys', () => {
  it('aggregates lineage edges and keeps repeated names under separate parents', () => {
    const files = ['genomad', 'viphogs', 'vitap'].map(taxonomyFile);
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, { ...catalogue, downloads: files });
    files.forEach((file) => cy.intercept('GET', file.url, {
      body: '2\tViruses\tRealm A\tUnclassified\n3\tViruses\tRealm B\tUnclassified\n1\tViruses\tRealm A\tFamily A\n',
    }));
    openPage(`viruses/${catalogueId}/viruses#viral-taxonomy`);
    cy.get('#viral-chart').should('not.exist');
    cy.contains('a.vf-tabs__link', 'Viral taxonomy').should('have.class', 'is-active');
    cy.get('[data-cy=viral-chart-genomad-taxonomy] .highcharts-container').should('be.visible');
    cy.get('[data-cy=viral-chart-viphog-taxonomy] .highcharts-container').should('be.visible');
    cy.get('[data-cy=viral-chart-vitap-taxonomy] .highcharts-container').should('be.visible');
    cy.get('[data-cy=viral-chart-genomad-taxonomy] .highcharts-node').should(($nodes) => {
      const nodes = [...$nodes].map((element) => element.point);
      const unclassified = nodes.filter((node) => node.name === 'Unclassified');
      expect(unclassified).to.have.length(2);
      expect(new Set(unclassified.map((node) => node.id)).size).to.equal(2);
      const root = nodes.find((node) => node.name === 'All sequences');
      expect(root.sum).to.equal(6);
      expect(nodes.find((node) => node.name === 'Realm A').sum).to.equal(3);
    });
    cy.get('[data-cy=viral-chart-genomad-taxonomy]').within(() => {
      cy.contains('button', 'Table view').click();
      cy.get('tbody tr').should('have.length', 3).first().should('contain.text', '2').and('contain.text', 'Realm A');
      cy.contains('button', 'Chart view').click();
      cy.get('.highcharts-node').should('have.length.greaterThan', 2);
    });
  });

  it('shows a file error for an unavailable taxonomy export', () => {
    const file = taxonomyFile('genomad');
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, { ...catalogue, downloads: [file] });
    cy.intercept('GET', file.url, { statusCode: 404 });
    openPage(`viruses/${catalogueId}/viruses#viral-taxonomy`);
    cy.get('[role=alert]').should('contain.text', '404');
  });

  it('shows representative source and predicted hosts as separate Sankeys', () => {
    const names = [
      'viruses/viruses-all-metadata.tsv.gz',
      'viruses/cluster_representatives/host_detection/spacepharer/custom_chosen_host.tsv',
      'viruses/cluster_representatives/host_detection/iphop/iphop_genus.csv',
      'viruses/cluster_representatives/host_detection/iphop/iphop_genome.csv',
      'viruses/cluster_representatives/protein_clusters_phammseqs/viruses_phams.tsv',
    ];
    const files = names.map((alias, i) => ({ ...taxonomyFile('host'), alias, url: `http://localhost:5055/viral-test/host-${i}.tsv`, short_description: `Friendly file ${i}`, long_description: `Readable description ${i}` }));
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, { ...catalogue, downloads: files });
    cy.intercept('GET', files[0].url, { body: 'ID\tCluster_rep\tSource\tSource_lineage\nrep1\trep1\tgenome\tBacteria;Alpha\nmember1\trep1\tgenome\tBacteria;Member\nrep2\trep2\tgenome\tBacteria;Beta\nrep3\trep3\tanalysis\tBacteria;Assembly\n' });
    cy.intercept('GET', files[1].url, { body: 'viral_seq\thost_lineage\nr1\tBacteria;Host A\nr2\tBacteria;Host B\n' });
    cy.intercept('GET', files[2].url, { body: 'Virus,Host genus\nr1,"Bacteria;Alpha, genus"\n' });
    cy.intercept('GET', files[3].url, { body: 'Virus,Host taxonomy\nr1,Bacteria;Host species\n' });
    cy.intercept('GET', files[4].url, { body: 'pham1\tprotein1 annotation\npham2\tprotein2 annotation\n' });
    openPage(`viruses/${catalogueId}/viruses#host-taxonomy`);
    cy.contains('a.vf-tabs__link', 'Overview').should('be.visible');
    cy.contains('a.vf-tabs__link', 'Host taxonomy').should('have.class', 'is-active');
    cy.get('[data-cy=viral-chart-source-genome-taxonomy] .highcharts-node').should(($nodes) => {
      const nodes = [...$nodes].map((element) => element.point);
      expect(nodes.find((node) => node.name === 'All occurrences').sum).to.equal(2);
      expect(nodes.map((node) => node.name)).not.to.include('Member');
      expect(nodes.map((node) => node.name)).not.to.include('Assembly');
    });
    cy.get('[data-cy=viral-chart-crispr-host-predictions] .highcharts-node').should(($nodes) => {
      expect([...$nodes].find((element) => element.point.name === 'All predictions').point.sum).to.equal(2);
    });
    cy.get('[data-cy=viral-chart-iphop-predicted-host-genera] .highcharts-node').should(($nodes) => {
      expect([...$nodes].map((element) => element.point.name)).to.include('Alpha, genus');
    });
    cy.get('[data-cy=viral-chart-iphop-predicted-host-genomes] .highcharts-container').should('be.visible');
    cy.get('[data-cy=viral-chart-iphop-predicted-host-genera]').within(() => {
      cy.contains('button', 'Table view').click();
      cy.get('tbody tr').should('have.length', 1).and('contain.text', 'Alpha, genus');
    });
    cy.get(`a[href="${files[0].url}"]`).first().should('have.text', files[0].url);
    cy.contains('Readable description 0').should('be.visible');
    cy.contains('a.vf-tabs__link', 'Protein catalogue').click();
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 2).first().should('contain.text', 'pham1');
    cy.get(`a[href="${files[4].url}"]`).first().should('have.text', files[4].url);
  });

  it('charts protein functions, protein clusters, and plasmid metadata from their table files', () => {
    const files = [
      'viruses/cluster_representatives/protein_clusters_phammseqs/viruses_phams.tsv',
      'plasmids/plasmids-all-metadata.tsv.gz',
    ].map((alias, i) => ({ ...taxonomyFile('protein'), alias, url: `http://localhost:5055/viral-test/protein-plasmid-${i}.tsv` }));
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, { ...catalogue, downloads: files });
    cy.intercept('GET', files[0].url, {
      body: 'pham1\tp1 Capsid protein\npham1\tp2 Capsid protein\npham1\tp3 Tail protein\npham2\tp4 hypothetical protein\npham2\tp5 putative protein\npham3\tp6 Tail protein\n',
    });
    cy.intercept('GET', files[1].url, {
      body: 'ID\tCluster_rep\tSequence_length\tSource_lineage\np1\tp1\t1000\tBacteria;Alpha\np2\tp1\t7000\tBacteria;Alpha\np3\tp3\t20000\tBacteria;Beta\n',
    });
    openPage(`viruses/${catalogueId}/viruses#protein-catalogue`);
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 6);
    cy.contains('button', 'Table view').should('be.disabled');
    const selectChart = (name) => {
      cy.contains('button', 'Chart views').click();
      cy.contains('[role=option]', name).click();
    };
    selectChart('Top protein functions');
    cy.get('.highcharts-series-0 .highcharts-point').should(($points) => {
      expect([...$points].map((element) => [element.point.category, element.point.y])).to.deep.equal([
        ['Capsid protein', 2], ['Tail protein', 2],
      ]);
    });
    selectChart('Protein cluster size distribution');
    cy.get('.highcharts-series-0 .highcharts-point').should(($points) => {
      expect([...$points].map((element) => [element.point.category, element.point.y])).to.deep.equal([
        ['1', 1], ['2', 1], ['3', 1],
      ]);
    });
    selectChart('Protein cluster rank-abundance');
    cy.get('.highcharts-series-0 .highcharts-graph').should('have.attr', 'd').and('not.be.empty');
    cy.get('.highcharts-xaxis .highcharts-axis-title').should('contain.text', 'Protein cluster rank');
    cy.get('.highcharts-yaxis .highcharts-axis-title').should('contain.text', 'Proteins per cluster');
    selectChart('Protein cluster function purity');
    cy.get('.highcharts-series-0 .highcharts-point').should(($points) => {
      expect($points).to.have.length(1);
      expect($points[0].point.category).to.equal('67');
      expect($points[0].point.y).to.equal(1);
    });
    cy.contains('button', 'Table view').click().should('be.disabled');
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 6);
    cy.contains('a.vf-tabs__link', 'Plasmids').click();
    cy.contains('a.vf-tabs__link', 'Metadata and charts').click();
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 3);
    selectChart('Sequence lengths histogram');
    cy.get('.highcharts-container').should('be.visible');
    selectChart('Cluster size distribution');
    cy.get('.highcharts-series-0 .highcharts-point').should(($points) => {
      expect([...$points].map((element) => [element.point.category, element.point.y])).to.deep.equal([
        ['1', 1], ['2', 1],
      ]);
    });
    selectChart('Source genome taxonomy');
    cy.get('.highcharts-node').should(($nodes) => {
      expect([...$nodes].find((element) => element.point.name === 'All plasmids').point.sum).to.equal(3);
    });
  });

  it('shares AMR class and gene charts between viral and plasmid exports', () => {
    const files = ['viruses', 'plasmids'].map(kind => ({
      ...taxonomyFile('amr'),
      alias: `${kind}/cluster_representatives/functional_annotation/amr/${kind}.tsv`,
      url: `http://localhost:5055/viral-test/${kind}-amr.tsv`,
    }));
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, { ...catalogue, downloads: files });
    files.forEach(file => cy.intercept('GET', file.url, {
      body: 'drug_class\tgene_symbol\nclass A; class B\tgene1\nclass B\tgene2\n',
    }));
    ['viruses', 'plasmids'].forEach(kind => {
      openPage(`viruses/${catalogueId}/${kind}#annotations`);
      cy.contains('button', 'Chart views').click();
      cy.contains('[role=option]', 'AMR classes').click();
      cy.get('.highcharts-title').should('have.text', 'AMR classes');
      cy.get('.highcharts-series-0 .highcharts-point').should($points => {
        expect([...$points].map(element => [element.point.category, element.point.y]))
          .to.deep.equal([['class B', 2], ['class A', 1]]);
      });
      cy.contains('button', 'Chart views').click();
      cy.contains('[role=option]', 'AMR elements').click();
      cy.get('.highcharts-title').should('have.text', 'AMR elements');
      cy.contains('button', 'Table view').click();
      cy.get('tbody tr').should('have.length', 2);
    });
  });

  it('handles both marine and sediment MOB-suite header delimiters without splitting cell values', () => {
    const files = ['marine', 'sediment'].map(kind => ({
      ...taxonomyFile('mob'), short_description: `${kind} MOB-suite`,
      alias: `plasmids/cluster_representatives/functional_annotation/mobsuite-typer/${kind}.txt`,
      url: `http://localhost:5055/viral-test/${kind}-mob.txt`,
    }));
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, { ...catalogue, downloads: files });
    files.forEach((file, i) => cy.intercept('GET', file.url, {
      body: ['sample_id', 'num_contigs', 'mash_neighbor_identification'].join(i ? '\t' : '    ') +
        '\nMGYV0000022586\t1\tEscherichia coli\n',
    }));
    openPage(`viruses/${catalogueId}/plasmids#annotations`);
    cy.get('.compressed-tsv-table').should('have.length', 2).each($table => {
      cy.wrap($table).find('thead th').should('have.length', 3);
      cy.wrap($table).find('tbody td').should('have.length', 3).last().should('have.text', 'Escherichia coli');
    });
  });

  it('limits large host taxonomies while preserving totals and the full table', () => {
    const file = {
      ...taxonomyFile('host'),
      alias: 'viruses/cluster_representatives/host_detection/iphop/iphop_genus.csv',
      url: 'http://localhost:5055/viral-test/large-hosts.csv',
    };
    const rows = Array.from({ length: 70000 }, (_, i) =>
      `virus${i},d__Bacteria;p__Phylum${i % 20};c__Class${i};g__Genus${i}`
    );
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, { ...catalogue, downloads: [file] });
    cy.intercept('GET', file.url, { body: 'Virus,Host genus\n' + rows.join('\n') });
    openPage(`viruses/${catalogueId}/viruses#host-taxonomy`);
    cy.get('.highcharts-node').should(($nodes) => {
      const nodes = [...$nodes].map(element => element.point);
      expect(nodes).to.have.length(13); // Root, domain, ten phyla and Other.
      expect(nodes.find(node => node.name === 'All predictions').sum).to.equal(70000);
      expect(nodes.find(node => node.name === 'Other').sum).to.equal(35000);
      expect(nodes.find(node => node.name === 'd__Bacteria').sum).to.equal(70000);
      expect(nodes.some(node => /Class|Genus/.test(node.name))).to.equal(false);
    });
    cy.get('.highcharts-node').filter((_, element) => element.point.name === 'Other').click(5, 5, { scrollBehavior: 'center' });
    cy.contains('button', 'Back to overview').should('not.exist');
    cy.contains('.highcharts-data-label text', 'p__Phylum0').click({ scrollBehavior: 'center' });
    cy.get('.highcharts-node').should(($nodes) => {
      const nodes = [...$nodes].map(element => element.point);
      expect(nodes).to.have.length(12); // Selected phylum, ten classes and Other.
      expect(nodes.find(node => node.name === 'p__Phylum0').sum).to.equal(3500);
      expect(nodes.find(node => node.name === 'Other').sum).to.equal(3490);
      expect(nodes.some(node => /Genus/.test(node.name))).to.equal(false);
    });
    cy.contains('button', 'Back to overview').click();
    cy.get('.highcharts-node').should(($nodes) => {
      expect([...$nodes].find(element => element.point.name === 'All predictions').point.sum).to.equal(70000);
    });
    cy.contains('button', 'Table view').click();
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 100);
    cy.contains('button', 'Search...').click();
    cy.get('#compressed-tsv-search-term').type('virus69999');
    cy.contains('.ReactModal__Content button', 'Search').click();
    cy.get('.compressed-tsv-table tbody tr').should('have.length', 1).and('contain.text', 'g__Genus69999');
    cy.contains('button', 'Chart view').click();
    cy.get('.highcharts-node').should(($nodes) => {
      const root = [...$nodes].find(element => element.point.name === 'All predictions');
      expect(root.point.sum).to.equal(1);
    });
  });

  it('drills into the full phylum lineage when names occur under different domains', () => {
    const file = {
      ...taxonomyFile('host'),
      alias: 'viruses/cluster_representatives/host_detection/iphop/iphop_genus.csv',
      url: 'http://localhost:5055/viral-test/repeated-phyla.csv',
    };
    cy.intercept('GET', `**/viruses/catalogues/${catalogueId}`, { ...catalogue, downloads: [file] });
    cy.intercept('GET', file.url, { body:
      'Virus,Host genus\na,d__Bacteria;p__Shared;c__One\nb,d__Bacteria;p__Shared;c__Two\nc,d__Archaea;p__Shared;c__Excluded\nd,d__Bacteria;p__Different;c__Hidden\n'
    });
    openPage(`viruses/${catalogueId}/viruses#host-taxonomy`);
    cy.get('.highcharts-node').filter((_, element) => element.point.id === JSON.stringify(['d__Bacteria', 'p__Shared'])).click(5, 5, { scrollBehavior: 'center' });
    cy.get('.highcharts-node').should(($nodes) => {
      const nodes = [...$nodes].map(element => element.point);
      expect(nodes.map(node => node.name).sort()).to.deep.equal(['c__One', 'c__Two', 'p__Shared']);
      expect(nodes.find(node => node.name === 'p__Shared').sum).to.equal(2);
    });
    cy.contains('button', 'Back to overview').click();
    cy.get('.highcharts-node').should(($nodes) => {
      expect([...$nodes].find(element => element.point.name === 'All predictions').point.sum).to.equal(4);
    });
  });

});
