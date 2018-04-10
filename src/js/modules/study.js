const Backbone = require('backbone');
const _ = require('underscore');
const api = require('../components/api');
const Map = require('../components/map');
const util = require('../util');

// const OverlappingMarkerSpiderfier = require('../../../static/js/oms.min.js');
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

let MapData = api.StudyGeoCoordinates.extend({
    initialize() {
        this.data = [];
        const that = this;
        this.fetch({
            success(response, meta) {
                let data = _.map(response.attributes.data, function(model) {
                    return model.attributes;
                });
                that.data = that.data.concat(data);
                if (meta.links.next !== null) {
                    that.url = meta.links.next;
                    that.fetchAll();
                } else {
                    Map('map', that.data, true);
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

/**
 * Method to initialise page load from googleMaps loading callback
 */
function initPage() {
    let study = new api.Study({id: studyId});
    let studyView = new StudyView({model: study});

    let samples = new api.SamplesCollection({study_accession: studyId});
    let samplesView = new util.SamplesView({collection: samples});

    let runs = new api.RunsCollection({study_accession: studyId});
    let runsView = new util.RunsView({collection: runs});

    let downloads = new api.StudyDownloads({id: studyId});

    let coordinates = new api.StudyGeoCoordinates({study_accession: studyId});
    $.when(
        studyView.fetchAndRender()
    ).done(function() {
        samplesView.initialize();
        runsView.initialize();
        new MapData({model: coordinates})();
        DownloadsView({model: downloads});
    });
}

window.initPage = initPage;

