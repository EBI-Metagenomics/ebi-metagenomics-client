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


const BIOME_FILTER_DEPTH = 3;

import {
    getURLFilterParams,
    initResultsFilter,
    setCurrentTab,
    BiomeCollectionView,
    checkAPIonline,
    initBiomeFilter
} from "../util";

checkAPIonline();
setCurrentTab('#studies-nav');
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
        initBiomeFilter($studiesSection.find('div.row:nth-child(2) > div.columns:nth-child(2)'), function () {
            that.update({
                lineage: $(this).val(),
                search: $('#tableFilter').val()
            });
        });

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

var biomes = new api.BiomeCollection();
var biomesSelectView = new BiomeCollectionView({
    collection: biomes,
    maxDepth: BIOME_FILTER_DEPTH
}, pageFilters.get('lineage'));

var studies = new api.StudiesCollection();
var studiesView = new StudiesView({collection: studies});

studiesView.init();

initResultsFilter(pageFilters.get('search'), function (e) {
    var params = {
        page_size: pagination.getPageSize(),
        page: pagination.currentPage,
        search: $("#search-input").val(),
        lineage: $("#biome-select").val(),
        ordering: Order.currentOrder,
    };
    studiesView.update(params);
});

