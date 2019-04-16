const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
const Map = require('../components/map');
const util = require('../util');

require('../../../static/js/jquery.liveFilter.js');

util.setupPage('#browse-nav');

let studyId = util.getURLParameter();
// util.specifyPageTitle('Study', studyId);

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
    initialize(params) {
        this.data = [];
        this.collection = params['collection'];
        this.study_accession = params['study_accession'];
        const that = this;
        this.collection.fetch({
            data: $.param({study_accession: that.study_accession}),
            success(response, meta) {
                let data = response.models;
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
    },
    fetchAll() {
        const that = this;
        this.collection.fetch({
            data: $.param({study_accession: that.study_accession}),
            success(response, meta) {
                let data = response.models;
                that.data = that.data.concat(data);
                if (meta.links.next !== null) {
                    that.collection.url = meta.links.next;
                    that.fetchAll();
                } else {
                    new Map('map', that.data, true);
                }
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

/**
 * Method to initialise page load
 */
function initPage() {
    let study = new api.Study({id: studyId});
    let studyView = new StudyView({model: study});

    let analyses = new api.StudyAnalyses({id: studyId});
    let downloads = new api.StudyDownloads({id: studyId});
    let samples = new api.SamplesCollection();

    studyView.fetchAndRender().done(() => {
        new util.AnalysesView({collection: analyses});
        new MapData({collection: samples, study_accession: studyId});
        new DownloadsView({model: downloads});
        util.attachExpandButtonCallback();
    });
}

initPage();
