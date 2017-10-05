const Backbone = require('backbone');
const _ = require('underscore');
const commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
import {DEFAULT_PAGE_SIZE} from "../config";
import {
    getURLFilterParams,
    getURLParameter,
    hideTableLoadingGif,
    initTableTools,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif
} from "../util";

const pagination = new Pagination();

setCurrentTab('#samples-nav');

var sample_id = getURLParameter();

const pageFilters = getURLFilterParams();
let runsView = null;


var SampleView = Backbone.View.extend({
    model: api.Sample,
    template: _.template($("#sampleTmpl").html()),
    el: '#main-content-area',
    initialize: function () {
        const that = this;
        this.model.fetch({
            data: $.param({include: 'runs,metadata'}), success: function (data) {
                that.render();
                initTableTools();
                const collection = new api.RunCollection({sample_id: sample_id});
                runsView = new RunsView({collection: collection});
                $("#pagination").append(commons.pagination);
                $("#pageSize").append(commons.pagesize);
                pagination.setPageSizeChangeCallback(updatePageSize);
            }
        });
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});

var RunView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#runRow").html()),
    attributes: {
        class: 'run-row',
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});


var RunsView = Backbone.View.extend({
    el: '#runsTableBody',
    initialize: function () {
        var that = this;

        let params = {};
        const pagesize = pageFilters.get('pagesize') || DEFAULT_PAGE_SIZE;
        if (pagesize !== null) {
            params.page_size = pagesize;
        }
        params.page = pageFilters.get('page') || 1;

        // params.include = 'sample';
        params.sample_accession = sample_id;

        this.collection.fetch({
            data: $.param(params), success: function (collection, response, options) {
                const pag = response.meta.pagination;
                pagination.initPagination(params.page, pagesize, pag.pages, pag.count, changePage);
                that.render();
                createLiveFilter();
            }
        });
        return this;
    },

    update: function (page, page_size) {
        $(".run-row").remove();
        showTableLoadingGif();
        var that = this;
        var params = {};
        if (page !== undefined) {
            params.page = page
        }
        if (page_size !== undefined) {
            params.page_size = page_size
        }
        params.sample_accession = sample_id;
        setURLParams(params, false);

        this.collection.fetch({
            data: $.param(params), remove: true,
            success: function (collection, response, options) {
                hideTableLoadingGif();
                pagination.updatePagination(response.meta.pagination);
                that.render();
            }
        });
    },
    render: function () {
        this.collection.each(function (run) {
            var runView = new RunView({model: run});
            $(this.$el).append(runView.render());
        }, this);
        return this;
    }
});

function updatePageSize(pageSize) {
    runsView.update(pagination.currentPage, pageSize);
}

function changePage(page) {
    runsView.update(page, pagination.getPageSize());
}

function createLiveFilter() {
    // $('#runsTableBody').liveFilter(
    //     '#search-filter', 'tr'
    // );
}


var sample = new api.Sample({id: sample_id});
var sampleView = new SampleView({model: sample});
