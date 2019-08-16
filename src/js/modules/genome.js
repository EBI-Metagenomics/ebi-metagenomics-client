const api = require('mgnify').api(process.env.API_URL);
const Backbone = require('backbone');
const _ = require('underscore');
const charts = require('mgnify').charts;
const util = require('../util');
const DetailList = require('../components/detailList');
const ClientSideTable = require('../components/clientSideTable');
const GenomeBrowser = require('../components/genomeBrowser');
require('../../../static/images/ajax-loader.gif');
require('../../../static/js/jquery.liveFilter.js'); // FIXME: install using NPM

const DEFAULT_PAGE_SIZE = 25;

util.setupPage('#genome-nav');

let genomeId = util.getURLParameter();
util.specifyPageTitle('Genome', genomeId);

let GenomeView = Backbone.View.extend({
    model: api.Genome,
    template: _.template($('#genomeTmpl').html()),
    el: '#content-header',
    fetchAndRender() {
        const that = this;
        return this.model.fetch({
            success() {
                const attr = that.model.attributes;
                let genomeStats = {
                    'Type': attr.type,
                    'Length (bp)': attr.length,
                    'Contamination': attr.contamination + '%',
                    'Completeness': attr.completeness + '%',
                    'Number of contigs': attr.num_contigs
                };
                if (attr.num_genomes_total) {
                    genomeStats['Total number of genomes in species'] = attr.num_genomes_total;
                }
                if (attr.num_genomes_nr) {
                    genomeStats['Non-redundant number of genomes in species'] = attr.num_genomes_nr;
                }

                // TODO and this `if (attr.pan)`?

                genomeStats['Number of proteins'] = attr.num_proteins;
                genomeStats['GC content'] = attr.gc_content + '%';
                genomeStats['Taxonomic lineage'] = attr.taxon_lineage;

                const n50Tooltip = util.wrapTextTooltip('N50',
                    '(min contig length for 50% genome coverage)');
                // eslint-disable-next-line security/detect-object-injection
                genomeStats[n50Tooltip] = attr.n_50;

                let genomeAnnotationStats = {
                    'InterPro coverage': attr.ipr_cov + '%',
                    'EggNog coverage': attr.eggnog_cov + '%'
                };
                let pangenomeStats = {};
                if (attr.pangenome_size) {
                    pangenomeStats['Pangenome size'] = attr.pangenome_size;
                }
                if (attr.pangenome_core_size) {
                    pangenomeStats['Pangenome core size'] = attr.pangenome_core_size;
                }
                if (attr.pangenome_accessory_size) {
                    pangenomeStats['Pangenome accessory size'] = attr.pangenome_accessory_size;
                }
                if (attr.pangenome_ipr_cov) {
                    pangenomeStats['Pangenome InterPro coverage'] = attr.pangenome_ipr_cov + '%';
                }
                if (attr.pangenome_eggnog_cov) {
                    pangenomeStats['Pangenome EggNOG coverage'] = attr.pangenome_eggnog_cov + '%';
                }

                let rnaStats = {
                    'rRNA 5s total gene length coverage': attr.rna_5s + '%',
                    'rRNA 16s total gene length coverage': attr.rna_16s + '%',
                    'rRNA 23s total gene length coverage': attr.rna_23s + '%',
                    'tRNAs': attr.trnas,
                    'ncRNA': attr.nc_rnas
                };

                let geoStats = {};
                if (attr.geographic_origin) {
                    geoStats['Origin of representative genome'] = attr.geographic_origin;
                }
                if (attr.geographic_range) {
                    geoStats['Geographic range of pangenome'] = attr.geographic_range.join(', ');
                }

                let extLinks = {};
                if (attr.ena_genome_accession) {
                    let url = util.createLinkTag(attr.ena_genome_url, attr.ena_genome_accession);
                    extLinks['ENA genome accession'] = url;
                }
                if (attr.ena_sample_accession) {
                    let url = util.createLinkTag(attr.ena_sample_url, attr.ena_sample_accession);
                    extLinks['ENA sample accession'] = url;
                }
                if (attr.ena_study_accession) {
                    let url = util.createLinkTag(attr.ena_study_url, attr.ena_study_accession);
                    extLinks['ENA study accession'] = url;
                }
                if (attr.img_genome_accession) {
                    let url = util.createLinkTag(attr.img_genome_url, attr.img_genome_accession);
                    extLinks['IMG genome accession'] = url;
                }
                if (attr.ncbi_genome_accession) {
                    let url = util.createLinkTag(attr.ncbi_genome_url, attr.ncbi_genome_accession);
                    extLinks['NCBI genome accession'] = url;
                }
                if (attr.ncbi_sample_accession) {
                    let url = util.createLinkTag(attr.ncbi_sample_url, attr.ncbi_sample_accession);
                    extLinks['NCBI sample accession'] = url;
                }
                if (attr.ncbi_study_accession) {
                    let url = util.createLinkTag(attr.ncbi_study_url, attr.ncbi_study_accession);
                    extLinks['NCBI study accession'] = url;
                }
                if (attr.patric_genome_accession) {
                    let url = util.createLinkTag(attr.patric_genome_url,
                        attr.patric_genome_accession);
                    extLinks['Patric genome accession'] = url;
                }
                that.$el.html(that.template(that.model.toJSON()));

                const $genomeDets = $('#genome-details');
                $genomeDets.append(new DetailList('Genome statistics', genomeStats));
                $genomeDets.append(new DetailList('Genome annotations', genomeAnnotationStats));
                if (Object.keys(pangenomeStats).length > 0) {
                    $genomeDets.append(new DetailList('Pangenome statistics', pangenomeStats));
                }
                $genomeDets.append(new DetailList('Genome RNA coverage', rnaStats));
                if (Object.keys(geoStats).length > 0) {
                    $genomeDets.append(new DetailList('Geographic metadata', geoStats));
                }
                $genomeDets.append(new DetailList('External links', extLinks));
                util.attachTabHandlers();
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve study: ' + genomeId);
            }
        });
    }
});

/**
 * Load the COGs
 */
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

/**
 * Load the KEGG Classes
 */
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

/**
 * Load the KEGG Module
 */
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
    init() {
        const that = this;
        return this.model.fetch({
            success() {
                const data = that.model.toJSON();
                that.$el.html(that.template(data));
            }
        });
    }
});

let genomeBrowserLoaded = false;

/**
 * Load the genome browser
 * @param {DownloadsView} downloadsModel The model
 */
function loadGenomeBrowser(downloadsModel) {
    const files = downloadsModel.attributes.genomeFiles['Genome analysis'];
    if (!genomeBrowserLoaded) {
        const config = {
            'name': genomeId,
            'fasta_url': util.findFileUrl(files, genomeId + '.fna'),
            'fasta_index_url': util.findFileUrl(files, genomeId + '.fna.fai'),
            'gff_url': util.findFileUrl(files, genomeId + '.gff')
        };
        new GenomeBrowser('genome-browser-container', config);
        genomeBrowserLoaded = true;
    }
}

/**
 * Method to initialise page load
 */
function initPage() {
    let genome = new api.Genome({id: genomeId});
    let genomeView = new GenomeView({model: genome});

    let downloads = new api.GenomeDownloads({id: genomeId});
    let downloadsView = new DownloadsView({model: downloads});
    genomeView.fetchAndRender().done(() => {
        util.attachExpandButtonCallback();
    });

    // Charts
    loadCog();
    loadKeggClass();
    loadKeggModule();

    downloadsView.init().done(() => {
        // Genome browser loading is delayed UNLESS div is visible
        // This mitigates bug in IGV which created a blank canvas
        // when the div is not visible on load
        $('a[href="#genome-browser"]').click(() => {
            loadGenomeBrowser(downloadsView.model);
            if (window.location.hash === '#genome-browser') {
                loadGenomeBrowser(downloadsView.model);
            }
        });
    });
}

initPage();
