const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const Commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
const Handlebars = require('handlebars');
const List = require('list.js');
const GenericTable = require('../components/genericTable');
const pagination = new Pagination();
const Map = require('../components/map');

// const OverlappingMarkerSpiderfier = require('../../../static/libraries/oms.min.js');
import 'js-marker-clusterer';

import {
    attachTabHandlers,
    getURLFilterParams,
    getURLParameter,
    hideTableLoadingGif,
    initTableTools,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif
} from "../util";

setCurrentTab('#studies-nav');

const DEFAULT_PAGE_SIZE = Commons.DEFAULT_PAGE_SIZE;


let study_id = getURLParameter();
let StudyView = Backbone.View.extend({
    model: api.Study,
    template: _.template($("#studyTmpl").html()),
    el: '#main-content-area',
    fetchAndRender: function () {
        const that = this;
        return this.model.fetch({
            data: $.param({}), success: function (data, response) {
                that.$el.html(that.template(that.model.toJSON()));
                attachTabHandlers();
            }
        });
    }
});

let SamplesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    fetch: function () {
        return this.collection.fetch()
    },

    init: function () {
        const that = this;
        const columns = [
            {sortBy: 'sample_name', name: 'Sample name'},
            {sortBy: 'accession', name: 'Sample ID'},
            {sortBy: null, name: 'Description'},
            {sortBy: 'last_update', name: 'Last update'},
        ];
        this.tableObj = new GenericTable($('#samples-section'), 'Associated samples', columns, function (page, pageSize, order, query) {
            that.update(page, pageSize, order, query);
        });
        this.update(1, DEFAULT_PAGE_SIZE, null, null)
    },

    update: function (page, pageSize, order, query) {
        this.tableObj.showLoadingGif();
        let params = {
            study_accession: this.collection.study_accession,
            page: page,
            page_size: pageSize
        };
        if (order) {
            params['ordering'] = order;
        }
        if (query) {
            params['search'] = query;
        }
        const that = this;
        this.collection.fetch({
            data: $.param(params),
            success: function (data, response) {
                that.renderData(page, response.meta.pagination.count);
                that.tableObj.hideLoadingGif();
            }
        })
    },

    renderData: function (page, resultCount) {
        new Map('map', this.collection.models);
        const tableData = _.map(this.collection.models, function (m) {
            const attr = m.attributes;
            const sample_link = "<a href='" + attr.sample_url + "'>" + attr.sample_accession + "</a>";
            return [attr.sample_name, sample_link, attr.sample_desc, attr.last_update]
        });
        this.tableObj.update(tableData, true, page, resultCount);
    }
});


let RunsView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    fetch: function () {
        return this.collection.fetch()
    },

    init: function () {
        const that = this;
        const columns = [
            {sortBy: 'accession', name: 'Run ID'},
            {sortBy: null, name: 'Experiment type'},
            {sortBy: null, name: 'Instrument model'},
            {sortBy: null, name: 'Instrument platform'},
        ];
        this.tableObj = new GenericTable($('#runs-section'), 'Associated runs', columns, function (page, pageSize, order, query) {
            that.update(page, pageSize, order, query);
        });
        this.update(1, DEFAULT_PAGE_SIZE, null, null)
    },

    update: function (page, pageSize, order, query) {
        this.tableObj.showLoadingGif();
        let params = {
            study_accession: this.collection.study_accession,
            page: page,
            page_size: pageSize
        };
        if (order) {
            params['ordering'] = order;
        }
        if (query) {
            params['search'] = query;
        }
        const that = this;
        this.collection.fetch({
            data: $.param(params),
            success: function (data, response) {
                that.renderData(page, response.meta.pagination.count);
                that.tableObj.hideLoadingGif();
            }
        })
    },

    renderData: function (page, resultCount) {
        const tableData = _.map(this.collection.models, function (m) {
            const attr = m.attributes;
            const run_link = "<a href='" + attr.run_url + "'>" + attr.run_id + "</a>";
            return [run_link, attr['experiment_type'], attr['instrument_model'], attr['instrument_platform']]
        });
        this.tableObj.update(tableData, true, page, resultCount);
    }
});

// Called by googleMaps import callback
function initPage() {
    let study = new api.Study({id: study_id});
    let studyView = new StudyView({model: study});

    let samples = new api.SamplesCollection({study_accession: study_id});
    let samplesView = new SamplesView({collection: samples});

    let runs = new api.RunCollection({study_accession: study_id});
    let runsView = new RunsView({collection: runs});


    $.when(
        studyView.fetchAndRender(),
    ).done(function () {
        samplesView.init();
        runsView.init();
    });
}

window.initPage = initPage;


// <!--<% _.each(samples, function(sample){ %>-->
// <!--<% attr = sample.attributes %>-->
// <!--<% console.log(sample) %>-->
// <!--<tr>-->
// <!--<td><a href="<%= attr.url %>"><%= attr['sample-name'] %></a></td>-->
// <!--<td><a href="<%= attr.url %>"><%= attr.accession %></a></td>-->
// <!--<td><%= attr['sample-desc'] %></td>-->
// <!--<td><%= attr['last-update'] %></td>-->
//     <!--</tr>-->
// <!--<% });%>-->