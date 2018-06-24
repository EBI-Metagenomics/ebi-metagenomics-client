const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const api = require('mgnify').api;
const util = require('../util');
const DetailList = require('../components/detailList');
const GenericTable = require('../components/genericTable');

require('tablesorter');

util.setupPage('#browse-nav');

window.Foundation.addToJquery($);

let runId = util.getURLParameter();
util.specifyPageTitle('Run', runId);

let pipelineVersion = util.getURLFilterParams()['version'];

let RunView = Backbone.View.extend({
    model: api.Run,
    template: _.template($('#runTmpl').html()),
    el: '#main-content-area',
    init() {
        const that = this;
        const deferred = $.Deferred();
        this.model.fetch({
            data: {},
            success(data) {
                const attr = data.attributes;
                let version;
                if (typeof pipelineVersion !== 'undefined' && pipelineVersion !== null) {
                    version = pipelineVersion;
                } else {
                    version = attr.pipeline_versions[0];
                }
                that.model.attributes.version = version;
                that.render(attr);
                deferred.resolve();
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve run: ' + runId);
                deferred.reject();
            }
        });
        return deferred.promise();
    },
    render(attr) {
        this.$el.html(this.template(this.model.toJSON()));
        let description = {
            'Study': '<a href=\'' + attr.study_url + '\'>' + attr.study_id + '</a>',
            'Sample': '<a href=\'' + attr.sample_url + '\'>' + attr.sample_id + '</a>',
            'ENA accession': '<a class=\'ext\' href=\'' + attr.ena_url + '\'>' + attr.run_id + '</a>'
        };
        $('#overview').append(new DetailList('Description', description));
        return this.$el;
    }
});

let RunAnalysesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},

    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Analysis accession'},
            {sortBy: null, name: 'Experiment type'},
            {sortBy: null, name: 'Instrument model'},
            {sortBy: null, name: 'Instrument platform'},
            {sortBy: null, name: 'Pipeline version'}
        ];
        const $studiesSection = $('#analyses');
        this.tableObj = new GenericTable($studiesSection, 'Analyses', columns, null,
            Commons.DEFAULT_PAGE_SIZE, false, false, 'analyses-table',
            function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            });
        return this.update({page_size: Commons.DEFAULT_PAGE_SIZE});
    },

    update(params) {
        this.params = $.extend({}, this.params, params);

        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success(data, response) {
                if (data.length > 0) {
                    const pagination = response.meta.pagination;
                    that.renderData(pagination.page, that.params.page_size, pagination.count,
                        response.links.first);
                    that.tableObj.hideLoadingGif();
                } else {
                    $('#analyses').hide();
                }
            }
        });
        return this.fetchXhr;
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            const accessionLink = '<a href=\'' + attr.analysis_url + '\'>' +
                attr.analysis_accession +
                '</a>';
            return [
                accessionLink,
                attr['experiment_type'],
                attr['instrument_model'],
                attr['instrument_platform'],
                attr['pipeline_version']];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

let RunAssemblyView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},

    initialize() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Analysis accession'},
            {sortBy: null, name: 'Experiment type'},
            {sortBy: null, name: 'Instrument model'},
            {sortBy: null, name: 'Instrument platform'},
            {sortBy: null, name: 'Pipeline version'}
        ];
        const $studiesSection = $('#assemblies');
        this.tableObj = new GenericTable($studiesSection, 'Assemblies', columns, null,
            Commons.DEFAULT_PAGE_SIZE, false, false, 'assembly-table',
            function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            });
        this.update({page_size: Commons.DEFAULT_PAGE_SIZE});
    },

    update(params) {
        this.params = $.extend({}, this.params, params);

        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success(data, response) {
                if (data.length > 0) {
                    const pagination = response.meta.pagination;
                    that.renderData(pagination.page, that.params.page_size, pagination.count,
                        response.links.first);
                    that.tableObj.hideLoadingGif();
                } else {
                    $('#assemblies').hide();
                }
            }
        });
        return this.fetchXhr;
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            const accessionLink = '<a href=\'' + attr.analysis_url + '\'>' +
                attr.analysis_accession +
                '</a>';
            return [
                accessionLink,
                attr['experiment_type'],
                attr['instrument_model'],
                attr['instrument_platform'],
                attr['pipeline_version']];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

let run = new api.Run({id: runId});
let runView = new RunView({model: run});

let runAnalyses = new api.RunAnalyses({id: runId});
let runAssemblies = new api.RunAssemblies({id: runId});
runView.init().then(() => {
    return $.when(new RunAnalysesView({collection: runAnalyses}),
        new RunAssemblyView({collection: runAssemblies}));
}).then(() => {
    util.attachExpandButtonCallback();
});
