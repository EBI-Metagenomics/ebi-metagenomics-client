const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;

const util = require('../util');
const DetailList = require('../components/detailList');
const ClientSideTable = require('../components/clientSideTable');

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
                    'Contamination': attr.contamination,
                    'Completeness': attr.completeness,
                    'Number of contigs': attr.num_contigs,
                    'Number of genomes': attr.num_genomes,
                    'Number of proteins': attr.pangenome_size,
                    'rRNA 5s': attr.rna_5s,
                    'rRNA 16s': attr.rna_16s,
                    'rRNA 23s': attr.rna_23s,
                    'tRNas': attr.trna_s,
                    'GC content': attr.gc_content,
                    'InterPro coverage': attr.ipr_prop,
                    'N50 (min contig length for 50% genome coverage)': attr.n_50
                };
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
    loadKegg();
    loadIPR();
}

function loadKegg() {
    const keggColumn = new charts.GenomeKeggColumnChart('kegg-column',
        {accession: genomeId});
    keggColumn.loaded.done(() => {
        const headers = [
            {sortBy: false, name: ''},
            {sortBy: 'a', name: 'Brite ID'},
            {sortBy: 'a', name: 'Description'},
            {sortBy: 'a', name: 'Count'}
        ];
        let i = 0;
        const data = keggColumn.data.map((e) => {
            return [util.getColourSquareIcon(i++), e.brite_id, e.name, e.count];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE
        };
        const keggColumnTable = new ClientSideTable($('.kegg-column-table'), options);
        keggColumnTable.update(data, false, 1);
    });
}

function loadIPR(){
    const iprColumn = new charts.GenomeIprColumnChart('ipr-column',
        {accession: genomeId});
    iprColumn.loaded.done(() => {
        const headers = [
            {sortBy: false, name: ''},
            {sortBy: 'a', name: 'Accession'},
            {sortBy: 'a', name: 'Count'}
        ];
        let i = 0;
        const data = iprColumn.data.map((e) => {
            const interProLink = '<a href=\'' + e.ipr_url + '\'>' +
                e.ipr_accession + '</a>';
            return [util.getColourSquareIcon(i++),interProLink, e.count];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE
        };
        const iprColumnTable = new ClientSideTable($('.ipr-column-table'), options);
        iprColumnTable.update(data, false, 1);
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
                that.$el.html(that.template(that.model.toJSON()));
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

    // let analyses = new api.StudyAnalyses({id: genomeId});
    let downloads = new api.GenomeDownloads({id: genomeId});

    genomeView.fetchAndRender().done(() => {
        loadGenomeCharts();
        // new util.AnalysesView({collection: analyses});
        // new MapData({collection: samples, study_accession: studyId});
        new DownloadsView({model: downloads});
        util.attachExpandButtonCallback();
    });
}

initPage();
