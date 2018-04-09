const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const api = require('../components/api');
const GenericTable = require('../components/genericTable');
const Map = require('../components/map');
const util = require('../util');

// const OverlappingMarkerSpiderfier = require('../../../static/libraries/oms.min.js');
require('js-marker-clusterer');

util.checkAPIonline();

util.setCurrentTab('#browse-nav');

let studyId = util.getURLParameter();
let StudyView = Backbone.View.extend({
    model: api.Study,
    template: _.template($('#studyTmpl').html()),
    el: '#main-content-area',
    fetchAndRender() {
        const that = this;
        const deferred = $.Deferred();
        this.model.fetch({
            data: $.param({
                include: 'publications'
            }),
            success(ignored, response) {
                const pubObj = new api.Publication();
                that.model.attributes.publications = _.map(response.included, function(d) {
                    return pubObj.parse(d);
                });

                that.$el.html(that.template(that.model.toJSON()));
                util.attachTabHandlers();

                deferred.resolve(true);
            }
        });
        return deferred.promise();
    }
});

/**
 * Method to update Samples or Runs view from pagination event
 * @param view Backbone view for sample or studies
 * @param page current page number
 * @param pageSize size of current page
 * @param order ordering string
 * @param query filtering string
 */
function updateTableFromPagination(view, page, pageSize, order, query) {
    view.tableObj.showLoadingGif();
    let params = {
        study_accession: view.collection.study_accession,
        page: page,
        page_size: pageSize
    };
    if (order) {
        params['ordering'] = order;
    }
    if (query) {
        params['search'] = query;
    }
    const that = view;
    view.fetchXhr = view.collection.fetch({
        data: $.param(params),
        success: function(data, response) {
            that.renderData(page, pageSize, response.meta.pagination.count,
                response.links.first);
            that.tableObj.hideLoadingGif();
        }
    });
}

let SamplesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,

    initialize() {
        const that = this;
        const columns = [
            {sortBy: 'sample_name', name: 'Sample name'},
            {sortBy: 'accession', name: 'Sample ID'},
            {sortBy: null, name: 'Description'},
            {sortBy: 'last_update', name: 'Last update'}
        ];
        this.tableObj = new GenericTable($('#samples-section'), 'Associated samples', columns,
            Commons.DEFAULT_PAGE_SIZE_SAMPLES, false, function(page, pageSize, order, query) {
                that.update(page, pageSize, order, query);
            });
        this.update(1, Commons.DEFAULT_PAGE_SIZE_SAMPLES, null, null);
    },

    update(page, pageSize, order, query) {
        updateTableFromPagination(this, page, pageSize, order, query);
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            const sampleLink = '<a href=\'' + attr.sample_url + '\'>' + attr.sample_accession +
                '</a>';
            return [attr.sample_name, sampleLink, attr.sample_desc, attr.last_update];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

let MapData = api.StudyGeoCoordinates.extend({
    fetchAll() {
        this.data = [];
        const that = this;
        this.fetch({
            success: function(response, meta) {
                let data = _.map(response.attributes.data, function(model) {
                    return model.attributes;
                });
                that.data = that.data.concat(data);
                if (meta.links.next !== null) {
                    that.url = meta.links.next;
                    that.fetchAll();
                } else {
                    new Map('map', that.data, true);
                }
            },
            error: function() {
            }
        });
    }
});

let RunsView = Backbone.View.extend({
    tableObj: null,
    pagination: null,

    initialize() {
        const that = this;
        const columns = [
            {sortBy: 'accession', name: 'Run ID'},
            {sortBy: null, name: 'Experiment type'},
            {sortBy: null, name: 'Instrument model'},
            {sortBy: null, name: 'Instrument platform'},
            {sortBy: null, name: 'Pipeline versions'}
        ];
        this.tableObj = new GenericTable($('#runs-section'), 'Associated runs', columns,
            Commons.DEFAULT_PAGE_SIZE, false, function(page, pageSize, order, query) {
                that.update(page, pageSize, order, query);
            });
        this.update(1, Commons.DEFAULT_PAGE_SIZE, null, null);
    },

    update(page, pageSize, order, query) {
        updateTableFromPagination(this, page, pageSize, order, query);
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            const attr = m.attributes;
            const runLink = '<a href=\'' + attr.run_url + '\'>' + attr.run_id + '</a>';
            return [
                runLink,
                attr['experiment_type'],
                attr['instrument_model'],
                attr['instrument_platform'],
                attr['pipeline_versions'].join(', ')];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

let DownloadsView = Backbone.View.extend({
    model: api.StudyDownloads,
    template: _.template($('#downloadsTmpl').html()),
    el: '#downloads',
    initialize() {
        const that = this;
        this.model.fetch({
            success: function(response) {
                const pipelineFiles = response.attributes.pipelineFiles;
                that.$el.html(that.template({pipeline_files: pipelineFiles}));
            }
        });
    }
});

/**
 * Method to initialise page load from googleMaps loading callback
 */
function initPage() {
    let study = new api.Study({id: studyId});
    let studyView = new StudyView({model: study});

    let samples = new api.SamplesCollection({study_accession: studyId});
    let samplesView = new SamplesView({collection: samples});

    let runs = new api.RunCollection({study_accession: studyId});
    let runsView = new RunsView({collection: runs});

    let downloads = new api.StudyDownloads({id: studyId});

    $.when(
        studyView.fetchAndRender()
    ).done(function() {
        samplesView.initialize();
        runsView.initialize();
        new MapData(studyId).fetchAll();
        new DownloadsView({model: downloads});
    });
}

window.initPage = initPage;

