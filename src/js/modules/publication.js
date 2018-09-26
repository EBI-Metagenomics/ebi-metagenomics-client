const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
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
            success() {
                that.$el.html(that.template(that.model.toJSON()));
                const attr = that.model.attributes;
                let description = {
                    'Journal name': attr['isoJournal'],
                    'DOI': '<a class=\'ext\' href=\'https://www.doi.org/' + attr['doi'] + '\'>' + attr['doi'] +
                    '</a>',
                    'PMID': '<a class=\'ext\' href=\'' + attr.pmc_url + '\'> ' + attr['pubmedID'] + '</a> ',
                    'Published year': attr['publishedYear']
                    // 'ISBN': attr['isbn']
                };
                if (attr['medicineJournal']) {
                    description['Medical journal'] = attr['medicineJournal'];
                }
                $('#publication-details').append(new DetailList('Extenal links', description));
                util.attachTabHandlers();
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve publication: ' +
                    publicationID);
            }
        });
    }
});

const PublicationStudiesView = util.StudiesView.extend({
    columns: [
        {sortBy: null, name: 'Biome'},
        {sortBy: null, name: 'Study Accession'},
        {sortBy: null, name: 'Name'},
        {sortBy: null, name: 'Samples count'},
        {sortBy: null, name: 'Last update'}
    ],
    getRowData(attr) {
        const studyLink = '<a href=\'' + attr.study_url + '\'>' + attr.study_accession + '</a>';
        const biomes = _.map(attr.biomes, function(b) {
            return '<span class=\'biome_icon icon_xs ' + b.icon + '\' title=\'' + b.name +
                '\'></span>';
        });
        return [
            biomes.join(' '),
            studyLink,
            attr['study_name'],
            attr['samples_count'],
            attr['last_update']];
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
        new PublicationStudiesView({
            collection: publicationStudies,
            tableClass: 'my-studies-table',
            isPageHeader: false,
            textFilter: false,
            sectionTitle: 'Associated studies'
        });
        util.attachExpandButtonCallback();
    });
}

window.initPage = initPage;

