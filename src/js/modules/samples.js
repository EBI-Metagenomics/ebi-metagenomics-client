const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination');
const Order = require('../components/order');


import {DEFAULT_PAGE_SIZE} from "../config";
import {
    getFormData,
    getURLFilterParams,
    hideTableLoadingGif,
    initResultsFilter,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif,
    stripLineage,
    BiomeCollectionView
} from "../util";

setCurrentTab('#samples-nav');
$("#pagination").append(commons.pagination);
$("#pageSize").append(commons.pagesize);

const pageFilters = getURLFilterParams();

const orderOptions = [
    {name: 'Sample accession', value: 'accession'},
    {name: 'Sample name', value: 'sample_name'},
    // {name: 'Number of runs', value: 'runs-count'}, // NOT DISPLAYED IN TABLE
    // {name: 'Number of samples', value: 'samples_count'},
    {name: 'Last updated', value: 'last_update'},
];


var SampleView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#sample-row").html()),
    attributes: {
        class: 'sample',
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});


var SamplesView = Backbone.View.extend({
    el: "#samples-table-body",
    params: {},
    initialize: function () {
        var that = this;
        let params = {};
        params.page = Pagination.currentPage;
        params.page_size = Pagination.getPageSize();

        const biome = pageFilters.get('lineage');
        if (biome) {
            params.lineage = biome;
        } else {
            params.lineage = 'root';
        }

        const ordering = pageFilters.get('ordering');
        if (ordering){
            params.ordering = ordering;
        } else {
            params.ordering = '-last_update';
        }

        const search = pageFilters.get('search');
        if (search !== null) {
            params.search = search;
            $("#search").val(search);
        }

        const pagesize = pageFilters.get('pagesize') || DEFAULT_PAGE_SIZE;
        if (pagesize) {
            params.page_size = pagesize;
        }
        params.page = pageFilters.get('page') || 1;
        this.params = params;

        this.collection.fetch({
            data: $.param(params), success: function (collection, response, options) {
                that.render();
                const pag = response.meta.pagination;
                Pagination.initPagination(params.page, pagesize, pag.pages, pag.count, changePage);
                Order.initHeaders(params.ordering, function(sort){
                    var formData = getFormData("#filter");
                    const params = {
                        page: 1,
                        pagesize: Pagination.getPageSize(),
                        ordering: sort
                    };
                    that.update(params);
                })
            }
        });
        return this;
    },
    update: function (params) {
        const that = this;

        this.params = $.extend(this.params, params);
        $(".sample").remove();

        showTableLoadingGif();
        setURLParams(this.params, false);

        this.collection.fetch({
            data: $.param(that.params), remove: true, success: function (collection, response, options) {
                hideTableLoadingGif();
                Pagination.updatePagination(response.meta.pagination);
                that.render();
            }
        });
        return this;
    },
    render: function () {
        this.collection.each(function (sample) {
            var sampleView = new SampleView({model: sample});
            $(this.$el).append(sampleView.render());
        }, this);
        return this;
    }
});

function updatePageSize(pageSize) {
    const params = {
        page_size: pageSize,
        page: Pagination.currentPage,
    };
    samplesView.update(params);
}

function changePage(page) {
    const params = {
        page_size: Pagination.getPageSize(),
        page: page,
    };
    samplesView.update(params);
}

Pagination.setPageSizeChangeCallback(updatePageSize);


var biomes = new api.BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes}, pageFilters.get('lineage'));

var samples = new api.SamplesCollection();
var samplesView = new SamplesView({collection: samples});

initResultsFilter(pageFilters.get('search'), function (e) {
    e.preventDefault();
    var params = {
        page_size: Pagination.getPageSize(),
        page: Pagination.currentPage,
        search: $("#search-input").val(),
        lineage: $("#biome-select").val(),
        ordering: Order.currentOrder,
    };
    samplesView.update(params);
});

// TODO remove this
window.samplesView = samplesView;