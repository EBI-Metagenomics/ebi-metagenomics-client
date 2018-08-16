const _ = require('underscore');
const util = require('../util');
const commons = require('../commons');
const api = require('mgnify').api;
const Pagination = require('../components/pagination').Pagination;
const GenericTable = require('../components/genericTable');
const Commons = require('../commons');
const pagination = new Pagination();
const biomeFilter = require('../commons').biomeFilter;
window.Foundation.addToJquery($);

util.attachTabHandlers();

util.setupPage('#browse-nav');

$('#pagination').append(commons.pagination);
$('#pageSize').append(commons.pagesize);

const pageFilters = util.getURLFilterParams();

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

let StudiesView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},

    getRowData(attr) {
        const biomes = _.map(attr.biomes, function(biome) {
            return '<span class="biome_icon icon_xs ' + biome.icon + '" title="' + biome.name +
                '"></span>';
        }).join('');
        const accessionLink = '<a href=\'' + attr.study_link + '\'>' + attr.study_id +
            '</a>';
        const nameLink = '<a href=\'' + attr.study_link + '\'>' + attr.study_name + '</a>';
        return [biomes, accessionLink, nameLink, attr.samples_count, attr.last_update];
    },

    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'study_id', name: 'Accession'},
            {sortBy: 'study_name', name: 'Study name'},
            {sortBy: 'samples_count', name: 'Samples'},
            {sortBy: 'last_update', name: 'Last updated'}
        ];

        let params = createInitParams();

        const $studiesSection = $('#studies-section');
        let tableOptions = {
            title: 'Studies list',
            headers: columns,
            initialOrdering: params.ordering,
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: true,
            textFilter: true,
            biomeFilter: true,
            tableClass: 'browse-studies-table',
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order || that.tableObj.getCurrentOrder(),
                    search: search,
                    lineage: $('.biome-select').val()
                });
            }
        };
        this.tableObj = new GenericTable($studiesSection, tableOptions);
        this.tableObj.order = params.ordering;
        this.update(params);
    }
});

let SamplesView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},

    getRowData(attr) {
        const biomes = '<span class="biome_icon icon_xs ' + attr.biome_icon + '" title="' +
            attr.biome_name + '"></span>';
        const sampleLink = '<a href=\'' + attr.sample_url + '\'>' + attr.sample_accession +
            '</a>';
        return [biomes, sampleLink, attr.sample_name, attr.sample_desc, attr.last_update];
    },
    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'accession', name: 'Accession'},
            {sortBy: 'sample_name', name: 'Sample name'},
            {sortBy: null, name: 'Description'},
            {sortBy: 'last_update', name: 'Last updated'}
        ];
        let params = createInitParams();

        const $samplesSection = $('#samples-section');

        let tableOptions = {
            title: 'Samples list',
            headers: columns,
            initialOrdering: params.ordering,
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: true,
            textFilter: true,
            biomeFilter: true,
            tableClass: 'samples-table',
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order || that.tableObj.getCurrentOrder(),
                    search: search,
                    lineage: $('.biome-select').val()
                });
            }
        };
        this.tableObj = new GenericTable($samplesSection, tableOptions);
        this.tableObj.order = params.ordering;
        this.update(params);
    }
});

let PublicationsView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},

    getRowData(attr) {
        const title = attr['title'] + '(PMID: <a href=\'' + attr.pmc_url + '#studies-section\'> ' + attr.pubmedID +
            '</a>)';
        const studyLink = '<a href=\'' + attr.pubMgnifyURL + '#studies-section\'>' + attr.studiesCount +
            '</a>';
        return [
            title,
            studyLink,
            attr['publishedYear']];
    },
    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Publication title'},
            {sortBy: 'studies_count', name: 'Studies'},
            {sortBy: 'published_year', name: 'Year of pub.'}
        ];
        let params = createInitParams();

        const $samplesSection = $('#publications-section');

        let tableOptions = {
            title: 'Publications list',
            headers: columns,
            initialOrdering: '-pubmed_id',
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: true,
            textFilter: true,
            biomeFilter: false,
            tableClass: 'publications-table',
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order || that.tableObj.getCurrentOrder(),
                    search: search,
                    lineage: $('.biome-select').val()
                });
            }
        };
        this.tableObj = new GenericTable($samplesSection, tableOptions);
        this.update(params);
    }
});

/**
 * Maintain value of filter fields across tabs
 */
function syncFilterFields() {
    const events = 'input select change';
    $('.biome-select').on(events, function() {
        $('.biome-select').val($(this).val());
    });
    $('.table-filter').on('input select', function() {
        $('.table-filter').not(this).val($(this).val()).trigger('keyup');
    });
}

let rootLineage;
if (pageFilters.hasOwnProperty('lineage')) {
    rootLineage = pageFilters['lineage'];
} else {
    rootLineage = 'root';
}
let biomes = new api.BiomeWithChildren({rootLineage: rootLineage});

new util.BiomeCollectionView({collection: biomes});

let studies = new api.StudiesCollection();
let studiesView = new StudiesView({collection: studies});

let samples = new api.SamplesCollection();
let samplesView = new SamplesView({collection: samples});

let publications = new api.PublicationsCollection();
new PublicationsView({collection: publications});

/**
 * Create biome select filter
 * @param {jQuery.HTMLElement} $div
 */
function initBiomeFilter($div) {
    // $div.before(biomeFilter);
    const $biomeSelect = $('.biome-select');
    $biomeSelect.on('change', function() {
        const updateObj = {
            lineage: $(this).val(),
            search: $('.table-filter').val()
        };
        studiesView.update(updateObj);
        samplesView.update(updateObj);
    });

    const $clearBtn = $('.clear-filter');
    $clearBtn.click(function() {
        $('.table-filter').val('');
        $biomeSelect.prop('selectedIndex', -1);
        $biomeSelect.trigger('change');
        biomes = new api.BiomeWithChildren({rootLineage: 'root'});
        new util.BiomeCollectionView({collection: biomes});
    });
}

initBiomeFilter($('section.table-container:not(#publications-section)').find('.tableFilters'));

$('.table-filter').val(pageFilters['search']);

syncFilterFields();
