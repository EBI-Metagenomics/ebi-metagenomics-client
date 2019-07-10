const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;

const util = require('../util');
const DetailList = require('../components/detailList');
const ClientSideTable = require('../components/clientSideTable');
const GenomeBrowser = require('../components/genome_browser');

const DEFAULT_PAGE_SIZE = 25;
require('../../../static/js/jquery.liveFilter.js');

util.setupPage('#genome-nav');

let genomeId = util.getURLParameter();
util.specifyPageTitle('Genome', genomeId);

let GenomeView = Backbone.View.extend({
    model: api.Genome,
    template: _.template($('#genomeTmpl').html()),
    el: '#main-content-area',
    fetchAndRender() {
        const that = this;
        return this.model.fetch({
            success() {
                const attr = that.model.attributes;
                let description = {
                    'Type': attr.type,
                    'Length (bp)': attr.length,
                    'Contamination': attr.contamination + '%',
                    'Completeness': attr.completeness + '%',
                    'Number of contigs': attr.num_contigs,
                    'Total number of genomes in species': attr.num_genomes_total,
                    'Non-redundant number of genomes in species': attr.num_genomes_nr,
                    'Number of proteins': attr.pangenome_size,
                    'rRNA 5s total gene length coverage': attr.rna_5s + '%',
                    'rRNA 16s total gene length coverage': attr.rna_16s + '%',
                    'rRNA 23s total gene length coverage': attr.rna_23s + '%',
                    'tRNAs': attr.trna_s,
                    'GC content': attr.gc_content + '%',
                    'InterPro coverage': attr.ipr_cov + '%',
                    'EggNog coverage': attr.eggnog_cov + '%',
                    'Taxonomic lineage': attr.taxon_lineage,
                    'Pangenome size': attr.pangenome_size,
                    'Pangenome core size': attr.pangenome_core_size,
                    'Pangenome accessory size': attr.pangenome_accessory_size,
                    'Pangenome eggnog coverage': attr.pangenome_eggnog_cov + '%',
                    'Pangenome InterPro coverage': attr.pangenome_ipr_cov + '%',
                    'Geographic origin': attr.geographic_origin,
                    'Geographic range': attr.geographic_range.join(', ')
                };
                const n50Tooltip = util.wrapTextTooltip('N50',
                    '(min contig length for 50% genome coverage)');
                description[n50Tooltip] = attr.n_50;
                if (attr.ena_genome_accession) {
                    description['ENA genome accession'] = util.createLinkTag(attr.ena_genome_url,
                        attr.ena_genome_accession);
                }
                if (attr.ena_sample_accession) {
                    description['ENA sample accession'] = util.createLinkTag(attr.ena_sample_url,
                        attr.ena_sample_accession);
                }
                if (attr.ena_study_accession) {
                    description['ENA study accession'] = util.createLinkTag(attr.ena_study_url,
                        attr.ena_study_accession);
                }
                if (attr.img_genome_accession) {
                    description['IMG genome accession'] = util.createLinkTag(attr.img_genome_url,
                        attr.img_genome_accession);
                }
                if (attr.ncbi_genome_accession) {
                    description['NCBI genome accession'] = util.createLinkTag(attr.ncbi_genome_url,
                        attr.ncbi_genome_accession);
                }
                if (attr.ncbi_sample_accession) {
                    description['NCBI sample accession'] = util.createLinkTag(attr.ncbi_sample_url,
                        attr.ncbi_sample_accession);
                }
                if (attr.ncbi_study_accession) {
                    description['NCBI study accession'] = util.createLinkTag(attr.ncbi_study_url,
                        attr.ncbi_study_accession);
                }
                if (attr.patric_genome_accession) {
                    description['Patric genome accession'] = util.createLinkTag(
                        attr.patric_genome_url, attr.patric_genome_accession);
                }
                that.$el.html(that.template(that.model.toJSON()));
                $('#genome-details').append(new DetailList('Description', description));
                util.attachTabHandlers();
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve study: ' + genomeId);
            }
        });
    }
});

function loadGenomeCharts() {
    loadCog();
    loadKeggClass();
    loadKeggModule();
}

function loadCog() {
    const cogColumn = new charts.GenomeCogColumnChart('cog-column',
        {accession: genomeId});
    cogColumn.loaded.done(() => {
        const headers = [
            {sortBy: 'a', name: 'COG ID'},
            {sortBy: 'a', name: 'Description'},
            {sortBy: 'a', name: 'Genome count'},
            {sortBy: 'a', name: 'Pangenome count'}
        ];
        const data = cogColumn.data.map((e) => {
            return [e.name, e.description, e['genome-count'], e['pangenome-count']];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE,
            filename: genomeId + '_COG.csv'
        };
        const cogColumnTable = new ClientSideTable($('.cog-column-table'), options);
        cogColumnTable.update(data, false, 1);
    });
}

function loadKeggClass() {
    const keggColumn = new charts.GenomeKeggClassColumnChart('kegg-class-column',
        {accession: genomeId});
    keggColumn.loaded.done(() => {
        const headers = [
            {sortBy: 'a', name: 'Class ID'},
            {sortBy: 'a', name: 'Description'},
            {sortBy: 'a', name: 'Genome count'},
            {sortBy: 'a', name: 'Pangenome count'}
        ];
        const data = keggColumn.data.map((e) => {
            return [e['class-id'], e.name, e['genome-count'], e['pangenome-count']];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE,
            filename: genomeId + '_KEGG.csv'
        };
        const keggColumnTable = new ClientSideTable($('.kegg-class-column-table'), options);
        keggColumnTable.update(data, false, 1);
    });
}

function loadKeggModule() {
    const keggColumn = new charts.GenomeKeggModuleColumnChart('kegg-module-column',
        {accession: genomeId});
    keggColumn.loaded.done(() => {
        const headers = [
            {sortBy: 'a', name: 'Module ID'},
            {sortBy: 'a', name: 'Description'},
            {sortBy: 'a', name: 'Genome count'},
            {sortBy: 'a', name: 'Pangenome count'}
        ];
        let i = 0;
        const data = keggColumn.data.map((e) => {
            return [e.name, e.description, e['genome-count'], e['pangenome-count']];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE,
            filename: genomeId + '_KEGG.csv'
        };
        const keggColumnTable = new ClientSideTable($('.kegg-module-column-table'), options);
        keggColumnTable.update(data, false, 1);
    });
}

let DownloadsView = Backbone.View.extend({
    model: api.GenomeDownloads,
    template: _.template($('#downloadsTmpl').html()),
    el: '#downloads-section',
    initialize() {
        const that = this;
        this.model.fetch({
            success() {
                const data = that.model.toJSON();
                that.$el.html(that.template(data));
            }
        });
    }
});

/**
 * Method to initialise page load
 */
function initPage() {
    let genome = new api.Genome({id: genomeId});
    let genomeView = new GenomeView({model: genome});

    let downloads = new api.GenomeDownloads({id: genomeId});

    genomeView.fetchAndRender().done(() => {
        loadGenomeCharts();
        new DownloadsView({model: downloads});
        util.attachExpandButtonCallback();
        const config = {
            'name': 'MGYG-HGUT-01621',
            'fasta_url': 'https://wwwdev.ebi.ac.uk/metagenomics/api/v1/genomes/MGYG-HGUT-01621/downloads/MGYG-HGUT-01621.fna',
            'fasta_index_url': 'https://wwwdev.ebi.ac.uk/metagenomics/api/v1/genomes/MGYG-HGUT-01621/downloads/MGYG-HGUT-01621.fna.fai',
            'gff_url': 'https://wwwdev.ebi.ac.uk/metagenomics/api/v1/genomes/MGYG-HGUT-01621/downloads/MGYG-HGUT-01621.gff'
        };
        new GenomeBrowser('genome-browser-container', config);
    });
}

initPage();
