const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
const {SamplesMapView} = require('../components/samplesMap');
const util = require('../util');

require('../../../static/js/jquery.liveFilter.js');
const {PublicationEuropePMCAnnotationsView} = require("../components/europePMCAnnotations");

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
                that.$el.html(that.template(that.model.toJSON()));
                util.attachTabHandlers();
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve study: ' + studyId);
            }
        });
    },

    /**
     * Adjust the Layout as there is no map.
     */
    adjustToNoMap() {
        this.$("#study-description").removeClass("small-12 medium-4 large-4");
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

    studyView.fetchAndRender().done(() => {
        
        new util.AnalysesView({collection: analyses});

        new DownloadsView({model: downloads});

        const samplesMapView = new SamplesMapView({
            study: study
        });

        samplesMapView.on("samples-map:no-samples", () => {
            studyView.adjustToNoMap();
        });

        samplesMapView.render();

        _.forEach(study.attributes.publications, function(pub) {
            new PublicationEuropePMCAnnotationsView({
                publicationId: pub.pubmedID,
                el: '#europe-pmc-annotations-' + pub.pubmedID
            });
        });

        util.attachExpandButtonCallback();
        util.enableRevealModals();
    });
}

initPage();
