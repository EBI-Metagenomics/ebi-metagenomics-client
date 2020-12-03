const Backbone = require('backbone');
const _ = require('underscore');
const api = require('mgnify').api(process.env.API_URL);
const { SamplesMapView } = require('../components/samplesMap');
const DetailList = require('../components/detailList');
const util = require('../util');

require('../../../static/js/jquery.liveFilter.js');

util.setupPage('#browse-nav');

let sampleId = util.getURLParameter();
util.specifyPageTitle('Sample', sampleId);

/**
 * Sort by parameter name ignoring case
 * @param {object} a to sort
 * @param {object} b  to sort
 * @return {number} ordering
 */
function compareByName(a, b) {
    const textA = a.name.toUpperCase();
    const textB = b.name.toUpperCase();

    let val = 0;
    if (textA < textB) {
        val = -1;
    } else if (textB < textA) {
        val = 1;
    }
    return val;
}

/**
 * Generate link to ENA if sample accession exists in ENA
 * @param {string} sampleAccession ENA secondary sample accession
 * @return {promise} with valid urls as data.
 */
function getExternalLinks(sampleAccession) {
    let urls = {};
    urls['ENA website (' + sampleAccession + ')'] = process.env.ENA_URL + sampleAccession;
    return urls;
}

let SampleView = Backbone.View.extend({
    model: api.Sample,
    template: _.template($('#sampleTmpl').html()),
    el: '#main-content-area',
    fetchAndRender() {
        const that = this;
        const deferred = $.Deferred();
        this.model.fetch({
            data: $.param({}),
            success(data) {
                const attr = data.attributes;
                that.model.attributes.metadatas.sort(compareByName);
                const metadataObj = {};

                _.each(that.model.attributes.metadatas, function(e) {
                    metadataObj[e.name] = e.value + (e.unit !== null ? ' ' + e.unit : '');
                });
                const urls = getExternalLinks(attr.id);
                that.model.attributes.external_links = _.map(urls, function(url, text) {
                    return util.createListItem(util.createLinkTag(url, text));
                });
                
                that.$el.html(that.template(that.model.toJSON()));

                if (Object.keys(metadataObj).length > 0) {
                    $('#sample-metadata').html(new DetailList('Sample metadata', metadataObj));
                } else {
                    $('#sample-metadata').html('No metadata to be displayed.');
                }
                const mapView = new SamplesMapView({
                    samples: [that.model],
                    zoom: 4
                });
                mapView.on("samples-map:no-samples", function() {
                    $('#sample-description').removeClass('small-6 medium-6 large-6');
                });
                mapView.render();
                deferred.resolve(true);
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve sample: ' + sampleId);
            }
        });
        return deferred.promise();
    }
});

/**
 * Initialise page load
 */
function initPage() {
    let sample = new api.Sample({id: sampleId});
    let sampleView = new SampleView({model: sample});

    let studies = new api.SampleStudiesCollection({sample_accession: sampleId});

    let runs = new api.RunsCollection({sample_accession: sampleId});
    let assemblies = new api.AssembliesCollection({sample_accession: sampleId});

    $.when(
        sampleView.fetchAndRender()
    ).done(function() {
        new util.StudiesView({
            collection: studies,
            tableClass: 'studies-table',
            isPageHeader: false,
            textFilter: true,
            sectionTitle: 'Associated studies'
        });
        new util.RunsView({collection: runs});
        new util.AssembliesView({collection: assemblies});
        util.attachExpandButtonCallback();
    });
}

initPage();
