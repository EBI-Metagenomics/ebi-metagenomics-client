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
    },
    fetchAll() {
        const that = this;
        this.model.fetch({
            success(response, meta) {
                let data = _.map(response.models, function(model) {
                    return model.attributes;
                });
                that.data = that.data.concat(data);
                if (meta.links.next !== null) {
                    that.model.url = meta.links.next;
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
 * Method to initialise page load from googleMaps loading callback
 */
function initPage() {
    let study = new api.Study({id: studyId});
    let studyView = new StudyView({model: study});

    let analyses = new api.StudyAnalyses({id: studyId});
    let downloads = new api.StudyDownloads({id: studyId});
    let coordinates = new api.StudyGeoCoordinates({id: studyId});

    studyView.fetchAndRender().done(() => {
        new util.AnalysesView({collection: analyses});
        new MapData({model: coordinates});
        new DownloadsView({model: downloads});
        util.attachExpandButtonCallback();
    });
}

window.initPage = initPage;

