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
    stripLineage
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

initResultsFilter(function (e) {
    e.preventDefault();
    var formData = getFormData("#filter");
    var params = {
        page_size: Pagination.getPageSize(),
        page: Pagination.currentPage,
        search: formData.search,
        lineage: formData.biome,
        ordering: Order.currentOrder,
    };
    setURLParams(params, true);
});


var BiomeCollectionView = Backbone.View.extend({
    el: "#biomeSelect",
    template: _.template($("#biomeSelectorTmpl").html()),
    initialize: function () {
        var that = this;
        this.collection.fetch({
            data: $.param({depth_lte: 3}), success: function () {
                // Fetch and pre-pend root node to list
                var root = new api.Biome({id: 'root'});
                root.fetch({
                    success: function () {
                        that.collection.unshift(root);
                        that.render();
                        let biome = pageFilters.get('lineage');
                        if (!biome) {
                            biome = 'root';
                        }
                        $("#biomeSelect > select").val(biome);
                    }
                });
            }
        });
    },
    render: function () {
        var biomes = this.collection.models.map(function (model) {
            return model.attributes.lineage
        });
        var selectData = {
            biomes: biomes.sort().map(function (x) {
                return {
                    lineage: x,
                    biome: stripLineage(x)
                };
            })
        };
        this.$el.html(this.template(selectData));
        return this
    }
});


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
                console.log(collection);
                const pag = response.meta.pagination;
                Pagination.initPagination(params.page, pagesize, pag.pages, pag.count, changePage);
                Order.initHeaders(params.ordering, function(sort){
                    var formData = getFormData("#filter");
                    that.update(1, Pagination.getPageSize(), null, null, sort);
                })
            }
        });
        return this;
    },
    update: function (page, page_size, searchQuery, biome, ordering) {
        $(".sample").remove();

        showTableLoadingGif();
        var that = this;
        var params = {};

        if (page !== null) {
            params.page = page
        }

        if (page_size !== null) {
            params.page_size = page_size
        }

        if (searchQuery !== null) {
            params.search = searchQuery
        } else {
            if (this.params.search) {
                params.search = this.params.search;
            }
        }

        if (biome !== null) {
            params.lineage = biome
        } else {
            if (this.params.lineage) {
                params.lineage = this.params.lineage;
            }
        }

        if (ordering !== undefined) {
            params.ordering = ordering
        }
        // util.setURLParams(params.search, params.lineage, params.page_size, params.page, false);
        setURLParams(params, false);

        this.collection.fetch({
            data: $.param(params),
            remove: true,
            success: function (collection, response, options) {
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



Pagination.setPageSizeChangeCallback(updatePageSize);


function updatePageSize(pageSize) {
    var formData = getFormData("#filter");
    samplesView.update(Pagination.currentPage, pageSize, null, null);
}

function changePage(page) {
    var formData = getFormData("#filter");
    samplesView.update(page, Pagination.getPageSize(), null, null);
}


var biomes = new api.BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes});

var samples = new api.SamplesCollection();
var samplesView = new SamplesView({collection: samples});

// TODO remove this
window.samplesView = samplesView;