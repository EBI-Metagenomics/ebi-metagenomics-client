const Backbone = require('backbone');
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

let StudiesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},

    init() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'accession', name: 'Accession'},
            {sortBy: 'study_name', name: 'Study name'},
            {sortBy: 'samples_count', name: 'Samples'},
            {sortBy: 'last_update', name: 'Last updated'}
        ];
        const $studiesSection = $('#studies-section');
        this.tableObj = new GenericTable($studiesSection, 'Studies list', columns, '-last_update',
            Commons.DEFAULT_PAGE_SIZE, true, true, 'browse-studies-table',
            function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            });

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

        this.update(params);
    },

    update(params) {
        this.params = $.extend({}, this.params, params);

        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success(data, response) {
                const pagination = response.meta.pagination;
                that.renderData(pagination.page, that.params.page_size, pagination.count,
                    response.links.first);
                that.tableObj.hideLoadingGif();
            }
        });
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            const biomes = _.map(m.attributes.biomes, function(biome) {
                return '<span class="biome_icon icon_xs ' + biome.icon + '" title="' + biome.name +
                    '"></span>';
            }).join('');
            const accessionLink = '<a href=\'' + attr.study_link + '\'>' + attr.study_id +
                '</a>';
            const nameLink = '<a href=\'' + attr.study_link + '\'>' + attr.study_name + '</a>';
            return [biomes, accessionLink, nameLink, attr.samples_count, attr.last_update];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

let SamplesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},

    init() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'accession', name: 'Accession'},
            {sortBy: 'sample_name', name: 'Sample name'},
            {sortBy: null, name: 'Description'},
            {sortBy: 'last_update', name: 'Last updated'}
        ];
        const $samplesSection = $('#samples-section');
        this.tableObj = new GenericTable($samplesSection, 'Samples list', columns, '-last_update',
            Commons.DEFAULT_PAGE_SIZE, true, true, 'samples-table',
            function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            });

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

        return this.update(params);
    },

    update(params) {
        this.params = $.extend({}, this.params, params);

        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success(ignored, response) {
                const pagination = response.meta.pagination;
                that.renderData(pagination.page, that.params.page_size, pagination.count,
                    response.links.first);
                that.tableObj.hideLoadingGif();
            }
        });
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            const biomes = '<span class="biome_icon icon_xs ' + attr.biome_icon + '" title="' +
                attr.biome_name + '"></span>';
            const sampleLink = '<a href=\'' + attr.sample_url + '\'>' + attr.sample_accession +
                '</a>';
            return [biomes, sampleLink, attr.sample_name, attr.sample_desc, attr.last_update];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
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

studiesView.init();
samplesView.init();

/**
 * Create biome select filter
 * @param {jQuery.HTMLElement} $div
 * @param {callback} callback
 */
function initBiomeFilter($div) {
    $div.before(biomeFilter);
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

initBiomeFilter($('section').find('.tableFilters'));

$('.table-filter').val(pageFilters['search']);

syncFilterFields();
