const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api;
const util = require('../util');
const DetailList = require('../components/detailList');

require('../../../static/js/jquery.liveFilter.js');

util.setupPage('#browse-nav');

let publicationID = util.getURLParameter();

let PublicationView = Backbone.View.extend({
    model: api.Publication,
    template: _.template($('#studyTmpl').html()),
    el: '#main-content-area',
    fetchAndRender() {
        const that = this;
        return this.model.fetch({
            success(ignored) {
                that.$el.html(that.template(that.model.toJSON()));
                const attr = that.model.attributes;
                let description = {
                    'ISBN': attr['isbn'],
                    'DOI': '<a href=\'https://www.doi.org/'+attr['doi']+'\'>'+attr['doi'] + '</a>'
                };
                if (attr['medicineJournal']) {
                    description['Medical journal'] = attr['medicineJournal'];
                }
                $('#publication-details').append(new DetailList('Publication ', description));
                util.attachTabHandlers();
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve publication: ' +
                    publicationID);
            }
        });
    }
});

/**
 * Method to initialise page load from googleMaps loading callback
 */
function initPage() {
    let study = new api.Publication({id: publicationID});
    let studyView = new PublicationView({model: study});
    let publicationStudies = new api.PublicationStudies({id: publicationID});

    studyView.fetchAndRender().done(() => {
        new util.StudiesView({
            collection: publicationStudies,
            tableClass: 'my-studies-table',
            isPageHeader: false,
            filter: false,
            sectionTitle: 'Associated studies'
        });
        util.attachExpandButtonCallback();
    });
}

window.initPage = initPage;

