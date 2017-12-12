const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const Commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
const Handlebars = require('handlebars');
const List = require('list.js');
const GenericTable = require('../components/genericTable');
const API_URL = require('config').API_URL;

import {
    getURLFilterParams,
    getURLParameter,
    hideTableLoadingGif,
    initTableTools,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif
} from "../util";

setCurrentTab('#samples-nav');

const DEFAULT_PAGE_SIZE = Commons.DEFAULT_PAGE_SIZE;


let sample_id = getURLParameter();

let SampleView = Backbone.View.extend({
    model: api.Sample,
    template: _.template($("#sampleTmpl").html()),
    el: '#main-content-area',
    fetchAndRender: function () {
        const that = this;
        return this.model.fetch({
            data: $.param({}), success: function (data, response) {
                that.model.attributes.metadatas.sort(compareByName);
                that.$el.html(that.template(that.model.toJSON()));
            }
        });
    }
});

function compareByName(a, b){
    const textA = a.name.toUpperCase();
    const textB = b.name.toUpperCase();
    if (textA < textB) {
        return -1;
    } else if (textB < textA){
        return 1;
    } else {
        return 0
    }
}

let RunView = Backbone.View.extend({
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

let StudiesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    fetch: function () {
        return this.collection.fetch()
    },

    init: function () {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: null, name: 'Study ID'},
            {sortBy: null, name: 'Name'},
            {sortBy: null, name: 'Abstract'},
            {sortBy: null, name: 'Samples count'},
            {sortBy: null, name: 'Last update'},
        ];
        this.tableObj = new GenericTable($('#studies-section'), 'Associated studies', columns, function (page, pageSize, order, query) {
            that.update(page, pageSize, order, query);
        });
        this.update(1, DEFAULT_PAGE_SIZE, null, null)
    },

    update: function (page, pageSize, order, query) {
        this.tableObj.showLoadingGif();
        let params = {
            sample_id: this.collection.params.sample_id,
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
            const study_link = "<a href='" + attr.study_link + "'>" + attr.study_id + "</a>";
            const biomes = _.map(m.attributes.biomes, function (b) {
                return "<span class='biome_icon icon_xs " + b.icon + "' title='" + b.name + "'></span>"
            });
            return [biomes.join(' '), study_link, attr['study_name'], attr['abstract'], attr['samples_count'], attr['last_update']]
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
            sample_id: this.collection.sample_id,
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


let sample = new api.Sample({id: sample_id});
let sampleView = new SampleView({model: sample});

let studies = new api.StudiesCollection({sample_id: sample_id}, API_URL + 'samples/' + sample_id + '/studies');
let studiesView = new StudiesView({collection: studies});

let runs = new api.RunCollection({sample_id: sample_id});
let runsView = new RunsView({collection: runs});

$.when(
    sampleView.fetchAndRender()
).done(function () {
    studiesView.init();
    runsView.init();
});