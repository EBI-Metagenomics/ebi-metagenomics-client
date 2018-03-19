const Backbone = require('backbone');
const _ = require('underscore');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
const commons = require('../commons');
const Order = require('../components/order');
const util = require('../util');
const pagination = new Pagination();

const DEFAULT_PAGE_SIZE = commons.DEFAULT_PAGE_SIZE;


util.checkAPIonline();


util.setCurrentTab('');

$("#pagination").append(commons.pagination);
$("#pageSize").append(commons.pagesize);

const pageFilters = util.getURLFilterParams();


var BiomeView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#biome-row").html()),
    attributes: {
        class: 'biome',
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});

var BiomesView = Backbone.View.extend({
    el: '#biomes-table-body',
    initialize: function () {
        var that = this;
        let params = {};
        params.page = pagination.currentPage;
        params.page_size = pagination.getPageSize();

        const ordering = pageFilters.get('ordering');
        if (ordering) {
            params.ordering = ordering;
        } else {
            params.ordering = '-samples_count';
        }

        const pagesize = pageFilters.get('pagesize') || DEFAULT_PAGE_SIZE;
        params.page_size = pagesize;
        params.page = pageFilters.get('page') || 1;
        this.params = params;

        this.fetchXhr = this.collection.fetch({
            data: $.param(params),
            remove: true,
            success: function (collection, response, options) {
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
        var that = this;
        this.params = $.extend(this.params, params);
        $('.biome').remove();
        util.showTableLoadingGif();
        util.setURLParams(this.params, false);

        if (this.fetchXhr.readyState > 0 && this.fetchXhr.readyState < 4) {
            this.fetchXhr.abort();
        }
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params), remove: true, success: function (collection, response, options) {
                util.hideTableLoadingGif();
                pagination.update(response.meta.pagination, changePage);
                that.render();
            }
        });
        return this;
    },
    render: function () {
        $('.biome').remove();
        this.collection.each(function (biome) {
            biome.attributes.lineage = util.formatLineage(biome.attributes.lineage);
            var biomeView = new BiomeView({model: biome});
            $(this.$el).append(biomeView.render());
        }, this);

        return this;
    }
});


function updatePageSize(pageSize) {
    const params = {
        page_size: pageSize,
        page: 1,
    };
    biomesView.update(params);
}

function changePage(page) {
    console.log(page);
    const params = {
        page_size: pagination.getPageSize(),
        page: page,
    };
    biomesView.update(params);
}

pagination.setPageSizeChangeCallback(updatePageSize);


var biomes = new api.BiomeCollection();
var biomesView = new BiomesView({collection: biomes});
