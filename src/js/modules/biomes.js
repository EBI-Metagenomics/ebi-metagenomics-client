const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination');
import {DEFAULT_PAGE_SIZE} from "../config";

import {
    formatLineage,
    getFilterFormData,
    getURLFilterParams,
    hideTableLoadingGif,
    initResultsFilter,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif
} from "../util";

setCurrentTab('');

const pageFilters = getURLFilterParams();

initResultsFilter(function (e) {
    e.preventDefault();
    let params = {
        page_size: Pagination.getPageSize(),
        page: Pagination.currentPage
    };
    setURLParams(params, true);
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
        showTableLoadingGif();
        var that = this;
        var params = {};
        if (page !== undefined) {
            params.page = page
        }
        if (page_size !== undefined) {
            params.page_size = page_size
        }
        setURLParams(params, false);

        this.collection.fetch({
            data: $.param(params), remove: true, success: function (collection, response, options) {
                hideTableLoadingGif();
                Pagination.updatePagination(response.meta.pagination);
                that.render();
            }
        });
        return this;
    },
    render: function () {
        this.collection.each(function (biome) {
            biome.attributes.lineage = formatLineage(biome.attributes.lineage);
            var biomeView = new BiomeView({model: biome});
            $(this.$el).append(biomeView.render());
        }, this);

        return this;
    }
});

// PAGINATION

$("#pagination").append(commons.pagination);
$("#pageSize").append(commons.pagesize);

Pagination.setPageSizeChangeCallback(updatePageSize);


function updatePageSize(pageSize) {
    var formData = getFilterFormData();
    biomesView.update(Pagination.currentPage, pageSize, formData[0], formData[1]);
}

function changePage(page) {
    var formData = getFilterFormData();
    biomesView.update(page, Pagination.getPageSize(), formData[0], formData[1]);
}




var biomes = new api.BiomeCollection();
var biomesView = new BiomesView({collection: biomes});
