import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';
import Pagination from '../components/pagination';
import {DEFAULT_PAGE_SIZE} from "../config";

util.setCurrentTab('');

const pageFilters = util.getURLFilterParams();

util.initResultsFilter(function (e) {
    e.preventDefault();
    util.setURLParams(null, null, Pagination.getPageSize(), Pagination.currentPage, true);
});


var BiomeView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#biome-row").html()),
    attributes: {
        class: 'biome-row',
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

        const params = {};
        const pagesize = pageFilters.get('pagesize') || DEFAULT_PAGE_SIZE;
        if (pagesize !== null) {
            params.page_size = pagesize;
        }
        params.page = pageFilters.get('page') || 1;
        this.collection.fetch({
            data: $.param(params),
            remove: true,
            success: function (collection, response, options) {
                that.render();
                const pag = response.meta.pagination;
                Pagination.initPagination(params.page, pagesize, pag.pages, pag.count, changePage);
            }
        });
        return this;
    },
    update: function (page, page_size) {
        $(".biome-row").remove();
        util.showTableLoadingGif();
        var that = this;
        var params = {};
        if (page !== undefined) {
            params.page = page
        }
        if (page_size !== undefined) {
            params.page_size = page_size
        }
        util.setURLParams(null, null, params.page_size, params.page, false);

        this.collection.fetch({
            data: $.param(params), remove: true, success: function (collection, response, options) {
                util.hideTableLoadingGif();
                Pagination.updatePagination(response.meta.pagination);
                that.render();
            }
        });
        return this;
    },
    render: function () {
        this.collection.each(function (biome) {
            biome.attributes.lineage = util.formatLineage(biome.attributes.lineage);
            var biomeView = new BiomeView({model: biome});
            $(this.$el).append(biomeView.render());
        }, this);

        return this;
    }
});

// PAGINATION

$("#pagination").append(util.pagination);
$("#pageSize").append(util.pagesize);

Pagination.setPageSizeChangeCallback(updatePageSize);


function updatePageSize(pageSize) {
    var formData = util.getFilterFormData();
    biomesView.update(Pagination.currentPage, pageSize, formData[0], formData[1]);
}

function changePage(page) {
    var formData = util.getFilterFormData();
    biomesView.update(page, Pagination.getPageSize(), formData[0], formData[1]);
}




var biomes = new api.BiomeCollection();
var biomesView = new BiomesView({collection: biomes});
