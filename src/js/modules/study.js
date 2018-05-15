const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api;
const Map = require('../components/map');
const util = require('../util');
const GenericTable = require('../components/genericTable');
const Commons = require('../commons');
const Pagination = require('../components/pagination').Pagination;

require('../../../static/js/jquery.liveFilter.js');

util.setupPage('#browse-nav');

let studyId = util.getURLParameter();
let StudyView = Backbone.View.extend({
    model: api.Study,
    template: _.template($('#studyTmpl').html()),
    el: '#main-content-area',
    fetchAndRender() {
        const that = this;
        return this.model.fetch({
            data: $.param({
                include: 'publications'
            }),
            success(ignored, response) {
                const pubObj = new api.Publication();
                that.model.attributes.publications = _.map(response.included, function(d) {
                    return pubObj.parse(d);
                });
                console.log(that.model);
                that.$el.html(that.template(that.model.toJSON()));
                util.attachTabHandlers();
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve study: ' + studyId);
            }
        });
    }
});

let MapData = Backbone.View.extend({
    model: api.StudyGeoCoordinates,
    initialize() {
        this.data = [];
        const that = this;
        this.model.fetch({
            success(response, meta) {
                let data = _.map(response.attributes.data, function(model) {
                    return model.attributes;
                });
                that.data = that.data.concat(data);
                if (meta.links.next !== null) {
                    that.url = meta.links.next;
                    that.fetchAll();
                } else {
                    new Map('map', that.data, true, studyId);
                }
            },
            error() {
            }
        });
    }
});

let DownloadsView = Backbone.View.extend({
    model: api.StudyDownloads,
    template: _.template($('#downloadsTmpl').html()),
    el: '#downloads',
    initialize() {
        const that = this;
        this.model.fetch({
            success(response) {
                const pipelineFiles = response.attributes.pipelineFiles;
                that.$el.html(that.template({pipeline_files: pipelineFiles}));
            }
        });
    }
});

const pagination = new Pagination();

let AnalysesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    params: {},

    init() {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: null, name: 'Sample accession'},
            {sortBy: null, name: 'Sample description'},
            {sortBy: null, name: 'Run accession'},
            {sortBy: null, name: 'Pipeline version'},
            {sortBy: null, name: 'Analysis accession'}
        ];
        const $analysisSection = $('#analysis-section');
        this.tableObj = new GenericTable($analysisSection, 'Analyses', columns,
            Commons.DEFAULT_PAGE_SIZE, false, true, 'analyses-table',
            function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            });

        let params = {};
        params.page = pagination.currentPage;

        // if (biome) {
        //     params.lineage = biome;
        // } else {
        //     params.lineage = 'root';
        // }
        //
        // if (ordering) {
        //     params.ordering = ordering;
        // } else {
        //     params.ordering = '-last_update';
        // }

        // if (search) {
        //     params.search = search;
        //     $('#search').val(search);
        // }
        params.page_size = Commons.DEFAULT_PAGE_SIZE;
        params.page = 1;

        this.update(params);
    },

    update(params) {
        this.params = $.extend({}, this.params, params);

        const that = this;
        this.fetchXhr = this.collection.fetch({
            data: $.param(this.params),
            success(ignored, response) {
                const pagination = response.meta.pagination;
                that.renderData(pagination.page, that.params.page_size, pagination.count,
                    response.links.first);
                that.tableObj.hideLoadingGif();
            }
        });
    },

    renderData(page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function(m) {
            console.log(m);
            const attr = m.attributes;
            const biomes = _.map(m.attributes.biomes, function(biome) {
                return '<span class="biome_icon icon_xs ' + biome.icon + '" title="' + biome.name +
                    '"></span>';
            }).join('');
            const sampleLink = '<a href=\'' + attr.sample_url + '\'>' + attr.sample_accession +
                '</a>';
            const runLink = '<a href=\'' + attr.run_url + '\'>' + attr.run_accession +
                '</a>';
            const analysisLink = '<a href=\'' + attr.analysis_url + '\'>' + attr.analysis_accession +
                '</a>';
            return [biomes, sampleLink, 'Sample desc',
                runLink, attr['pipeline_version'], analysisLink];
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

/**
 * Method to initialise page load from googleMaps loading callback
 */
function initPage() {
    let study = new api.Study({id: studyId});
    let studyView = new StudyView({model: study});

    let analyses = new api.StudyAnalyses({id: studyId});
    let analysesView = new AnalysesView({collection: analyses});

    let downloads = new api.StudyDownloads({id: studyId});
    let coordinates = new api.StudyGeoCoordinates({study_accession: studyId});
    studyView.fetchAndRender().done(() => {
        analysesView.init();
        new MapData({model: coordinates});
        new DownloadsView({model: downloads});
        util.attachExpandButtonCallback();
    });
}

window.initPage = initPage;

