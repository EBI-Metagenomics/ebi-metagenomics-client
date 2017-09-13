import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';
import Pagination from '../components/pagination';


util.setCurrentTab('#samples-nav');

const pageFilters = util.getURLFilterParams();

util.initResultsFilter(function (e) {
    e.preventDefault();
    var formData = util.getFilterFormData();
    util.setURLParams(formData[0].value, formData[1].value, Pagination.getPageSize(), 1, true);
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
                        const biome = pageFilters.get('biome');
                        if (biome !== null) {
                            //TODO handle if invalid biome
                            $("#biomeSelect > select").val(biome);
                        }
                    }
                });
            }
        });
    },
    render: function () {
        var biomes = this.collection.models.map(function (model) {
            return model.attributes.lineage
        });
        biomes.sort();
        var selectData = {biomes: biomes.sort()};
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
    initialize: function () {
        var that = this;
        const params = {};
        params.page = Pagination.currentPage;
        params.page_size = Pagination.getPageSize();

        const biome = pageFilters.get('biome');
        if (biome !== null) {
            params.lineage = biome;
        }
        const search = pageFilters.get('search');
        if (search !== null) {
            params.search = search;
            $("#search").val(search);
        }

        const pagesize = pageFilters.get('pagesize') || util.DEFAULT_PAGE_SIZE;
        if (pagesize !== null) {
            params.page_size = pagesize;
        }
        params.page = pageFilters.get('page') || 1;
        this.collection.fetch({
            data: $.param(params), success: function (collection, response, options) {
                that.render();
                const pag = response.meta.pagination;
                Pagination.initPagination(params.page, pagesize, pag.pages, pag.count, changePage);
            }
        });
        return this;
    },
    update: function (page, page_size, searchQuery, biome) {
        var that = this;

        var params = {};
        if (page !== undefined) {
            params.page = page
        }
        if (page_size !== undefined) {
            params.page_size = page_size
        }
        if (searchQuery !== undefined && searchQuery.length > 0) {
            params.search = searchQuery
        }
        if (biome !== undefined) {
            params.lineage = biome
        }

        util.setURLParams(params.search, params.lineage, params.page_size, params.page, false);
        this.collection.fetch({
            data: $.param(params),
            remove: true,
            success: function (collection, response, options) {
                $(".sample").remove();
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

$("#pagination").append(util.pagination);
$("#pageSize").append(util.pagesize);

Pagination.setPageSizeChangeCallback(updatePageSize);


function updatePageSize(pageSize) {
    var formData = util.getFilterFormData();
    samplesView.update(Pagination.currentPage, pageSize, formData[0].value, formData[1].value);
}

function changePage(page) {
    var formData = util.getFilterFormData();
    samplesView.update(page, Pagination.getPageSize(), formData[0].value, formData[1].value);
}


var biomes = new api.BiomeCollection();
var biomesSelectView = new BiomeCollectionView({collection: biomes});

var samples = new api.SamplesCollection();
var samplesView = new SamplesView({collection: samples});

// TODO remove this
window.samplesView = samplesView;