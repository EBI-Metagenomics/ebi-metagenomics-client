/*
    We want this sort of functionality.
    So - two major issues on the website to address.
    1) Find a contig of interest
    2) Visualise the contig and colour according to different features.
    I think IGV allows you to do most of 2
    May be not is a really nice way yet.
    Selecting the colours is not really intuitive.
    Finding the contig, may require some work on the backend....
*/

const igv = require('igv').default;
const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const util = require('../util');
const GenericTable = require('../components/genericTable');
require('tablesorter');

util.setupPage('#browse-nav');

window.Foundation.addToJquery($); // ?

// let accession = util.getURLParameter();
// let objType = 'Analysis';
// util.specifyPageTitle(objType, accession);

let AnalysisContig = Backbone.Model.extend({
    url() {
        return 'http://localhost:8000/v1/contigs/MGYA00141542/' + this.id;
    },
    parse(data) {
        return {
            id: data.id,
            name: data.attributes.name,
            length: data.attributes.length
        };
    }
});

let ContigCollection = Backbone.Collection.extend({
    url() {
        return 'http://localhost:8000/v1/contigs/MGYA00141542';
    },
    model: AnalysisContig,
    parse(response) {
        return response.data;
    }
});

let ContigsView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},

    getRowData(attr) {
        return [
            '<a hred="#" class="contig-browser" ' +
            'data-id="' + attr['id'] + '"' +
            'data-name="' + attr['name'] + '">' +
            attr['name'] + '</a>',
            attr['length']
        ];
    },

    initialize() {
        const that = this;
        const $contigsSection = $('#contigs-section');

        let tableOptions = {
            title: 'Contigs',
            headers: [
                {sortBy: null, name: 'Name'},
                {sortBy: null, name: 'Length'}
            ],
            initialOrdering: '-length',
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: false,
            textFilter: false,
            tableClass: 'contigs-table',
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            }
        };
        this.tableObj = new GenericTable($contigsSection, tableOptions);

        this.update({page_size: Commons.DEFAULT_PAGE_SIZE}).always((data) => {
            if (data.models.length === 0) {
                $contigsSection.hide();
            }
        });
    }
});


$(document).on('click', '.contig-browser', (e) => {
    e.preventDefault();
    // show the genome browser
    const id = $(e.target).data('id');
    const name = $(e.target).data('name');
    let options = {
        reference: {
            id: id,
            fastaURL: 'http://localhost:9000/metagenomics/api/contigs/' + name + '/fa',
            indexURL: 'http://localhost:9000/metagenomics/api/contigs/' + name + '/fa.fai',
            index: true
        }
        // tracks: [{
        //     name: 'test',
        //     url: config['gff_url'],
        //     format: 'gff',
        //     displayMode: 'EXPANDED'
        // }],
        // color_fields: [
        //     '',
        //     'COG',
        //     'product',
        //     'Pfam',
        //     'KEGG',
        //     'InterPro',
        //     'eggNOG'
        // ]
    };
    window.igv_config = options;
    igv.createBrowser(document.getElementById('genome-browser'), options).then((browser) => {
        console.debug('Created IGV browser');
    });
});

let view = new ContigsView({ collection: new ContigCollection({ accession: 'MGYA00141542' }) });

view.initialize();
