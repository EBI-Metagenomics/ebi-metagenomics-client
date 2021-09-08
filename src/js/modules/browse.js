const _ = require('underscore');
const marked = require('marked');
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
 * Create basic request parameters for calls to the EMG API
 * @param {object} options Object containing the following properties:
 * {boolean} biome if true use the lineage filter
 * {ordering} ordering set to configure the default ordening
 * @return {object}
 */
function createInitParams(options) {
    options = options || {
        ordering: '-last_update',
        biome: true
    };
    let params = {};
    params.page = pagination.currentPage;

    if (options.biome) {
        const biome = pageFilters['lineage'];
        if (biome) {
            params.lineage = biome;
        } else {
            params.lineage = 'root';
        }
    }

    const ordering = pageFilters['ordering'];
    if (ordering) {
        params.ordering = ordering;
    } else if (options.ordering) {
        params.ordering = options.ordering;
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
        const accessionLink = '<a href=\'' + attr.study_url + '\'>' + attr.study_accession +
            '</a>';
        const nameLink = '<a href=\'' + attr.study_url + '\'>' + attr.study_name + '</a>';
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
            hideIfEmpty: false,
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

let SuperStudiesView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},

    getRowData(attr) {
        const titleLink = '<a href=\'' + attr.superstudy_url + '\'>' +
                          attr.superstudy_title + '</a>';
        return [titleLink, util.truncateString(attr.superstudy_description, 250)];
    },

    initialize() {
        const that = this;
        const columns = [
            {sortBy: 'superstudy_title', name: 'Title'},
            {sortBy: 'superstudy_description', name: 'Description'}
        ];

        let params = createInitParams({biome: false, ordering: 'super_study_id'});

        const $superStudiesSection = $('#super-studies-section');
        let tableOptions = {
            title: 'Super Studies list',
            headers: columns,
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: true,
            textFilter: true,
            biomeFilter: false,
            tableClass: 'browse-super-studies-table',
            hideIfEmpty: false,
            callback: function(page, pageSize, _, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    search: search
                });
            }
        };
        this.tableObj = new GenericTable($superStudiesSection, tableOptions);
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
            hideIfEmpty: false,
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
        const pubmedLink = '<a class=\'ext\' href=\'' + attr.pmc_url + '\'> '
            + attr.pubmedID + '</a> ';
        const studyLink = '<a href=\'' + attr.pubMgnifyURL + '#studies-section\'>'
            + attr.studiesCount + '</a>';
        return [
            pubmedLink,
            attr['title'],
            studyLink,
            attr['publishedYear']];
    },
    initialize() {
        const that = this;
        const columns = [
            {sortBy: 'pubmed_id', name: 'PMID'},
            {sortBy: null, name: 'Publication title'},
            {sortBy: 'studies_count', name: 'Studies'},
            {sortBy: 'published_year', name: 'Year of pub.'}
        ];
        let params = createInitParams({biome: false, ordering: '-published_year'});

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
        this.tableObj = new GenericTable($samplesSection, tableOptions);
        this.update(params);
    }
});

let GenomeCataloguesView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},

    getRowData(attr) {
        const biomes = '<span class="biome_icon icon_xs ' + attr.biome_icon + '" title="' +
            attr.biome_name + '"></span>';
        const genomeCatalogueLink = '<a href=\'' + attr.catalogue_url + '\'>' + attr.catalogue_id +
            '</a>';
        return [biomes, genomeCatalogueLink, attr.catalogue_name, attr.catalogue_version, attr.genome_count,
            attr.last_updated];
    },
    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'catalogue_id', name: 'Catalogue ID'},
            {sortBy: 'catalogue_name', name: 'Catalogue name'},
            {sortBy: 'version', name: 'Catalogue version'},
            {sortBy: 'genome_count', name: 'Genomes count'},
            {sortBy: 'last_update', name: 'Last updated'}
        ];
        let params = createInitParams();

        const $genomesSection = $('#genome-catalogues-section');

        let tableOptions = {
            title: 'Genome catalogues list',
            description: marked('Genome catalogues are biome-specific collections of ' +
                'metagenomic-assembled and isolate genomes. ' +
                'The latest version of each catalogue is shown on this website. ' +
                'Data for current and previous versions are available on the ' +
                '[FTP server](ftp://ftp.ebi.ac.uk/pub/databases/metagenomics/mgnify_genomes/).'),
            headers: columns,
            initialOrdering: params.ordering,
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: true,
            textFilter: true,
            biomeFilter: true,
            tableClass: 'genome-catalogues-table',
            hideIfEmpty: false,
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
        this.tableObj = new GenericTable($genomesSection, tableOptions);
        this.tableObj.order = params.ordering;
        this.update(params);
    }
});

let BiomeTree = api.BiomeWithChildren.extend({
    initialize(params) {
        this.rootLineage = params['rootLineage'] || 'root';
        this.baseDepth = (this.rootLineage.match(/:/g) || []).length;
        this.relativeDepth = params['relativeDepth'];
    },
    fetchWithParams() {
        return this.fetch({
            data: $.param({
                depth_gte: this.baseDepth + 1,
                depth_lte: this.baseDepth + this.relativeDepth,
                page_size: 100
            })
        });
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
let biomes = new BiomeTree({rootLineage: rootLineage, relativeDepth: BIOME_SELECTOR_DEPTH});

new util.BiomeCollectionView({collection: biomes});

let superStudies = new api.SuperStudiesCollection();
new SuperStudiesView({collection: superStudies});

let studies = new api.StudiesCollection();
let studiesView = new StudiesView({collection: studies});

let samples = new api.SamplesCollection();
let samplesView = new SamplesView({collection: samples});

let genomeCatalogues = new api.GenomeCataloguesCollection();
let genomeCataloguesView = new GenomeCataloguesView({collection: genomeCatalogues});

let publications = new api.PublicationsCollection();
new PublicationsView({collection: publications});

/**
 * Create biome select filter
 * @param {jQuery.HTMLElement} $div
 */
function initBiomeFilter() {
    // $div.before(biomeFilter);
    const $biomeSelect = $('.biome-select');
    $biomeSelect.on('change', function() {
        const updateObj = {
            lineage: $(this).val(),
            search: $('.table-filter').val()
        };
        studiesView.update(updateObj);
        samplesView.update(updateObj);
        genomeCataloguesView.update(updateObj);
    });

    const $clearBtn = $('.clear-filter');
    $clearBtn.click(function() {
        $('.table-filter').val('');
        biomes = new BiomeTree({rootLineage: 'root', relativeDepth: BIOME_SELECTOR_DEPTH});
        new util.BiomeCollectionView({collection: biomes}).fetchOp.done(() => {
            $biomeSelect.prop('selectedIndex', 0);
            $biomeSelect.trigger('change');
        });
    });
}

initBiomeFilter($('section.table-container:not(#publications-section)').find('.tableFilters'));

$('.table-filter').val(pageFilters['search']);

syncFilterFields();
