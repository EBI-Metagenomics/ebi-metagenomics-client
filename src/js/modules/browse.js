const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
const Order = require('../components/order');
const GenericTable = require('../components/genericTable');
const Commons = require('../commons');
const pagination = new Pagination();
import {
    getURLFilterParams,
    setCurrentTab,
    BiomeCollectionView,
    checkAPIonline,
    initBiomeFilter,
    attachTabHandlers
} from "../util";

window.Foundation.addToJquery($);

attachTabHandlers();

const BIOME_FILTER_DEPTH = 3;


checkAPIonline();
setCurrentTab('#browse-nav');

$("#pagination").append(commons.pagination);
$("#pageSize").append(commons.pagesize);

const pageFilters = getURLFilterParams();

let StudiesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},

    fetch: function () {
        return this.collection.fetch()
    },
    init: function () {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'study_name', name: 'Study name'},
            {sortBy: 'samples_count', name: 'Samples'},
            {sortBy: 'last_update', name: 'Last updated'},
        ];
        const $studiesSection = $('#studies-section');
        this.tableObj = new GenericTable($studiesSection, 'Studies list', columns, Commons.DEFAULT_PAGE_SIZE, true, function (page, pageSize, order, search) {
            that.update({
                page: page,
                page_size: pageSize,
                ordering: order,
                search: search
            });
        });
        // initBiomeFilter($studiesSection.find('div.row:nth-child(2) > div.columns:nth-child(2)'), function () {
        //     that.update({
        //         lineage: $(this).val(),
        //         search: $('#tableFilter').val()
        //     });
        // });

        let params = {};
        params.page = pagination.currentPage;

        const biome = pageFilters.get('lineage');
        if (biome) {
            params.lineage = biome;
        } else {
            params.lineage = 'root';
        }

        const ordering = pageFilters.get('ordering');
        if (ordering) {
            params.ordering = ordering;
        } else {
            params.ordering = '-last_update';
        }

        const search = pageFilters.get('search');
        if (search) {
            params.search = search;
            $("#search").val(search);
        }
        params.page_size = pagination.getPageSize();
        const pagesize = pageFilters.get('pagesize') || Commons.DEFAULT_PAGE_SIZE;
        if (pagesize) {
            params.page_size = pagesize;
        }
        params.page = parseInt(pageFilters.get('page')) || 1;

        this.update(params);
    },

    update: function (params) {
        this.params = $.extend({}, this.params, params);

        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success: function (data, response) {
                const pagination = response.meta.pagination;
                that.renderData(pagination.page, that.params.page_size, pagination.count, response.links.first);
                that.tableObj.hideLoadingGif();
            },
        })
    },

    renderData: function (page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function (m) {
            const attr = m.attributes;
            const biomes = _.map(m.attributes.biomes, function (biome) {
                return "<span class=\"biome_icon icon_xs " + biome.icon + "\" title=\"" + biome.name + "\"></span>";
            }).join();
            const study_link = "<a href='" + attr.study_link + "'>" + attr.study_name + "</a>";
            return [biomes, study_link, attr.samples_count, attr.last_update];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

let SamplesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},

    fetch: function () {
        return this.collection.fetch()
    },
    init: function () {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: 'accession', name: 'Sample ID'},
            {sortBy: 'sample_name', name: 'Name'},
            {sortBy: null, name: 'Description'},
            {sortBy: 'last_update', name: 'Last updated'},
        ];
        const $samplesSection = $('#samples-section');
        this.tableObj = new GenericTable($samplesSection, 'Samples list', columns, Commons.DEFAULT_PAGE_SIZE, true, function (page, pageSize, order, search) {
            that.update({
                page: page,
                page_size: pageSize,
                ordering: order,
                search: search
            });
        });

        // initBiomeFilter($studiesSection.find('div.row:nth-child(2) > div.columns:nth-child(2)'), function () {
        //     that.update({
        //         lineage: $(this).val(),
        //         search: $('#tableFilter').val()
        //     });
        // });

        let params = {};
        params.page = pagination.currentPage;

        const biome = pageFilters.get('lineage');
        if (biome) {
            params.lineage = biome;
        } else {
            params.lineage = 'root';
        }

        const ordering = pageFilters.get('ordering');
        if (ordering) {
            params.ordering = ordering;
        } else {
            params.ordering = '-last_update';
        }

        const search = pageFilters.get('search');
        if (search) {
            params.search = search;
            $("#search").val(search);
        }
        params.page_size = pagination.getPageSize();
        const pagesize = pageFilters.get('pagesize') || Commons.DEFAULT_PAGE_SIZE;
        if (pagesize) {
            params.page_size = pagesize;
        }
        params.page = parseInt(pageFilters.get('page')) || 1;

        this.update(params);
    },

    update: function (params) {
        this.params = $.extend({}, this.params, params);

        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success: function (data, response) {
                const pagination = response.meta.pagination;
                that.renderData(pagination.page, that.params.page_size, pagination.count, response.links.first);
                that.tableObj.hideLoadingGif();
            },
        })
    },

    renderData: function (page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function (m) {
            const attr = m.attributes;
            const biomes = "<span class=\"biome_icon icon_xs " + attr.biome_icon + "\" title=\"" + attr.biome_name + "\"></span>";
            const sample_link = "<a href='" + attr.sample_url + "'>" + attr.sample_accession + "</a>";
            return [biomes, sample_link, attr.sample_name, attr.sample_desc, attr.last_update];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

function syncFilterFields() {
    const events = 'input select change';
    $('.biome-select').on(events, function () {
        $('.biome-select').val($(this).val());
    });
    $('.table-filter').on('input select', function () {
        $('.table-filter').not(this).val($(this).val()).trigger('keyup');
    });
}

var biomes = new api.BiomeCollection();
var biomesSelectView = new BiomeCollectionView({
    collection: biomes,
    maxDepth: BIOME_FILTER_DEPTH
}, pageFilters.get('lineage'));

var studies = new api.StudiesCollection();
var studiesView = new StudiesView({collection: studies});

var samples = new api.SamplesCollection();
var samplesView = new SamplesView({collection: samples});

studiesView.init();
samplesView.init();

initBiomeFilter($("section").find('div.row:nth-child(2) > div.columns:nth-child(2)'), function () {
    const updateObj = {
        lineage: $(this).val(),
        search: $('#tableFilter').val()
    };
    studiesView.update(updateObj);
    samplesView.update(updateObj);
});

syncFilterFields();