const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
const util = require('../util');

require('../../../static/js/jquery.liveFilter.js');

util.setupPage('#browse-nav');

let superStudyId = util.getURLParameter();

let SuperStudyView = Backbone.View.extend({
    model: api.SuperStudy,
    template: _.template($('#superStudyTmpl').html()),
    el: '#main-content-area',
    fetchAndRender() {
        const that = this;
        return this.model.fetch({
            success() {
                that.$el.html(that.template(that.model.toJSON()));
                util.attachTabHandlers();
            },
            error(ignored, response) {
                util.displayError(response.status,
                                  'Could not retrieve Super Study: ' + superStudyId);
            }
        });
    }
});

/**
 * Method to initialise page load
 */
function initPage() {
    let superStudy = new api.SuperStudy({id: superStudyId});
    let superStudyView = new SuperStudyView({model: superStudy});

    let studies = new api.SuperStudyFlagshipStudiesCollection({super_study_id: superStudyId});
    let relatedStudies = new api.SuperStudyRelatedStudiesCollection({super_study_id: superStudyId});

    superStudyView.fetchAndRender().done(() => {
        new util.StudiesView({collection: studies, initPageSize: 10,
                             domSelector: '#flagship-studies-section',
                             truncateAbstract: true});
        new util.StudiesView({collection: relatedStudies, initPageSize: 10,
                              domSelector: '#related-studies-section',
                              truncateAbstract: true});
        util.attachExpandButtonCallback();
    });
}

initPage();
