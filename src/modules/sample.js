import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';
import Pagination from '../components/pagination';


util.setCurrentTab('#samples-nav');

var sample_id = util.getURLParameter();

const pageFilters = util.getURLFilterParams();
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
                util.initTableTools();
                const collection = new api.RunCollection({sample_id: sample_id});
                runsView = new RunsView({collection: collection});
                $("#pagination").append(util.pagination);
                $("#pageSize").append(util.pagesize);
                Pagination.setPageSizeChangeCallback(updatePageSize);
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
        const pagesize = pageFilters.get('pagesize') || util.DEFAULT_PAGE_SIZE;
        if (pagesize !== null) {
            params.page_size = pagesize;
        }
        params.page = pageFilters.get('page') || 1;

        // params.include = 'sample';
        params.sample_accession = sample_id;

        this.collection.fetch({
            data: $.param(params), success: function (collection, response, options) {
                const pag = response.meta.pagination;
                Pagination.initPagination(params.page, pagesize, pag.pages, pag.count, changePage);
                that.render();
                createLiveFilter();
            }
        });
        return this;
    },

    update: function (page, page_size) {
        $(".run-row").remove();
        util.showTableLoadingGif();
        var that = this;
        var params = {};
        if (page !== undefined) {
            params.page = page
        }
        if (page_size !== undefined) {
            params.page_size = page_size
        }
        params.sample_accession = sample_id;
        util.setURLParams(null, null, params.page_size, params.page, false);
        this.collection.fetch({
            data: $.param(params), remove: true,
            success: function (collection, response, options) {
                util.hideTableLoadingGif();
                Pagination.updatePagination(response.meta.pagination);
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
    runsView.update(Pagination.currentPage, pageSize);
}

function changePage(page) {
    runsView.update(page, Pagination.getPageSize());
}

function createLiveFilter() {
    $('#runsTableBody').liveFilter(
        '#search-filter', 'tr'
    );
}


var sample = new api.Sample({id: sample_id});
var sampleView = new SampleView({model: sample});
