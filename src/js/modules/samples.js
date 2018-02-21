const Backbone = require('backbone');
const _ = require('underscore');
const commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
const Order = require('../components/order');

const pagination = new Pagination();
const DEFAULT_PAGE_SIZE = commons.DEFAULT_PAGE_SIZE;
import {
    getURLFilterParams,
    hideTableLoadingGif,
    initResultsFilter,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif,
    getDownloadParams,
    setDownloadResultURL,
    BiomeCollectionView,
    checkAPIonline
} from "../util";

checkAPIonline();
setCurrentTab('#samples-nav');
$("#pagination").append(commons.pagination);
$("#pageSize").append(commons.pagesize);

const pageFilters = getURLFilterParams();


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
        params.page = pagination.currentPage;
        params.page_size = pagination.getPageSize();

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

        this.fetchXhr = this.collection.fetch({
            data: $.param(params),
            success: function (collection, response, options) {
                const newParams = getDownloadParams(params);
                setDownloadResultURL(that.collection.url + '?' + $.param(newParams));
                that.render();
                const pag = response.meta.pagination;
                pagination.init(params.page, pagesize, pag.pages, pag.count, changePage);
                Order.initHeaders(params.ordering, function (sort) {
                    const params = {
                        page: 1,
                        page_size: pagination.getPageSize(),
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
        if(this.fetchXhr.readyState > 0 && this.fetchXhr.readyState < 4){
            this.fetchXhr.abort();
        }
        this.fetchXhr = this.collection.fetch({
            data: $.param(that.params), remove: true, success: function (collection, response, options) {
                hideTableLoadingGif();
                pagination.update(response.meta.pagination, changePage);
                that.render();
            }
        });
        const newParams = getDownloadParams(that.params);
        setDownloadResultURL(that.collection.url + '?' + $.param(newParams));

        return this;
    },
    render: function () {
        $(".sample").remove();
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
        page: 1,
    };
    samplesView.update(params);
}

function changePage(page) {
    const params = {
        page_size: pagination.getPageSize(),
        page: page,
    };
    samplesView.update(params);
}

pagination.setPageSizeChangeCallback(updatePageSize);


var biomes = new api.BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes}, pageFilters.get('lineage'));

var samples = new api.SamplesCollection();
var samplesView = new SamplesView({collection: samples});

initResultsFilter(pageFilters.get('search'), function (e) {
    var params = {
        page_size: pagination.getPageSize(),
        page: pagination.currentPage,
        search: $("#search-input").val(),
        lineage: $("#biome-select").val(),
        ordering: Order.currentOrder,
    };
    samplesView.update(params);
});
