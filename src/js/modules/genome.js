const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;

const util = require('../util');
const DetailList = require('../components/detailList');
const ClientSideTable = require('../components/clientSideTable');

const igv = require('igv').default;
console.log(igv);

const DEFAULT_PAGE_SIZE = 25;
require('../../../static/js/jquery.liveFilter.js');

util.setupPage('#genome-nav');

let genomeId = util.getURLParameter();
util.specifyPageTitle('Genome', genomeId);

// function loadGenoverse(containerId, url) {
//     let options =
//         {
//             showNavigation: true,
//             showRuler: true,
//             genome: {fastaUrl: 'http://127.0.0.1:8000/v1/genomes/GUT_GENOME000001/downloads/genome_seq.fa'},
//             fastaUrl: 'http://127.0.0.1:8000/v1/genomes/GUT_GENOME000001/downloads/genome_seq.fa',
//             tracks: [
//                 {
//                     url: url,
//                     indexed: false,
//                     isLog: true,
//                     name: 'MyGenome'
//                 }
//             ]
//         };
//
//     igv.createBrowser(containerId, options);
// }

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
                    'Number of genomes in species': attr.num_genomes,
                    'Number of proteins': attr.pangenome_size,
                    'rRNA 5s total gene length coverage': attr.rna_5s + '%',
                    'rRNA 16s total gene length coverage': attr.rna_16s + '%',
                    'rRNA 23s total gene length coverage': attr.rna_23s + '%',
                    'tRNAs': attr.trna_s,
                    'GC content': attr.gc_content + '%',
                    'InterPro coverage': attr.ipr_prop + '%'
                };
                const n50Tooltip = util.wrapTextTooltip('N50',
                    '(min contig length for 50% genome coverage)');
                description[n50Tooltip] = attr.n_50;
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
    loadKegg();
    loadIPR();
    loadEggNog();
}

function loadCog() {
    const cogColumn = new charts.GenomeCogColumnChart('cog-column',
        {accession: genomeId});
    cogColumn.loaded.done(() => {
        const headers = [
            {sortBy: false, name: ''},
            {sortBy: 'a', name: 'COG ID'},
            {sortBy: 'a', name: 'Description'},
            {sortBy: 'a', name: 'Count'}
        ];
        let i = 0;
        const data = cogColumn.data.map((e) => {
            return [util.getColourSquareIcon(i++), e.name, e.description, e.count];
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
            initPageSize: DEFAULT_PAGE_SIZE,
            filename: genomeId + '_KEGG.csv'
        };
        const keggColumnTable = new ClientSideTable($('.kegg-column-table'), options);
        keggColumnTable.update(data, false, 1);
    });
}

function loadIPR() {
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
            return [util.getColourSquareIcon(i++), interProLink, e.count];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE,
            filename: genomeId + '_IPR.csv'
        };
        const iprColumnTable = new ClientSideTable($('.ipr-column-table'), options);
        iprColumnTable.update(data, false, 1);
    });
}

function loadEggNog() {
    const eggNogColumn = new charts.GenomeEggNogColumnChart('eggnog-column',
        {accession: genomeId});
    eggNogColumn.loaded.done(() => {
        const headers = [
            {sortBy: false, name: ''},
            {sortBy: 'a', name: 'Host'},
            {sortBy: 'a', name: 'Organism'},
            {sortBy: 'a', name: 'Description'},
            {sortBy: 'a', name: 'Count'}
        ];
        let i = 0;
        const data = eggNogColumn.data.map((e) => {
            return [util.getColourSquareIcon(i++), e.host, e.organism, e.description, e.count];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE,
            filename: genomeId + '_eggNOG.csv'
        };
        const iprColumnTable = new ClientSideTable($('.eggnog-column-table'), options);
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
                const data = that.model.toJSON();
                that.$el.html(that.template(data));
                // loadGenoverse('#genoverse-container', 'http://127.0.0.1:8000/v1/genomes/GUT_GENOME000001/downloads/genome.gff');
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
    });
}

initPage();
