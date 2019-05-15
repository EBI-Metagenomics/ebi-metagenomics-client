const _ = require('underscore');
const util = require('../util');
const commons = require('../commons');
const api = require('mgnify').api(process.env.API_URL);
const Pagination = require('../components/pagination').Pagination;
const GenericTable = require('../components/genericTable');
const Commons = require('../commons');
const pagination = new Pagination();
window.Foundation.addToJquery($);

util.attachTabHandlers();

util.setupPage('#browse-nav');

$('#pagination').append(commons.pagination);
$('#pageSize').append(commons.pagesize);

const pageFilters = util.getURLFilterParams();

const BIOME_SELECTOR_DEPTH = 3;

/**
 * Create basic request parameters for calls to studies / samples on EMG API
 * @return {object}
 */
function createInitParams() {
    let params = {};
    params.page = pagination.currentPage;

    const biome = pageFilters['lineage'];
    if (biome) {
        params.lineage = biome;
    } else {
        params.lineage = 'root';
    }

    const ordering = pageFilters['ordering'];
    if (ordering) {
        params.ordering = ordering;
    } else {
        params.ordering = '-last_update';
    }

    const search = pageFilters['search'];
    if (search) {
        params.search = search;
        $('#search').val(search);
    }
    params.page_size = pageFilters['pagesize'] || Commons.DEFAULT_PAGE_SIZE;
    params.page = parseInt(pageFilters['page']) || 1;
    return params;
}

let GenomesView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},
    getRowData(attr) {
        console.log(attr);
        const genomeUrl = '<a href=\'' + attr.genome_url + '\'>' + attr.accession +
            '</a>';
        return [
            genomeUrl, attr.length,
            attr.num_contigs, attr.completeness,
            attr.contamination, attr.type, attr.last_updated
        ];
    },
    initialize() {
        const that = this;
        const columns = [
            {sortBy: 'accession', name: 'Accession'},
            {sortBy: 'length', name: 'Length'},
            {sortBy: 'num_contigs', name: 'Number of contigs'},
            {sortBy: 'completeness', name: 'Completeness'},
            {sortBy: 'contamination', name: 'Contamination'},
            {sortBy: null, name: 'Genome type'},
            {sortBy: 'last_update', name: 'Last updated'}
        ];
        let params = createInitParams();

        const $studiesSection = $('#genomes-section');
        let tableOptions = {
            title: 'Genomes list',
            headers: columns,
            initialOrdering: params.ordering,
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: true,
            textFilter: true,
            biomeFilter: false,
            tableClass: 'browse-genomes-table',
            hideIfEmpty: false,
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order || that.tableObj.getCurrentOrder(),
                    search: search
                });
            }
        };
        this.tableObj = new GenericTable($studiesSection, tableOptions);
        this.tableObj.order = params.ordering;
        this.update(params);
    }
});

let genomes = new api.GenomesCollection();
let genomesView = new GenomesView({collection: genomes});

