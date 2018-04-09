const Backbone = require('backbone');
const _ = require('underscore');
const api = require('../components/api');
const API_URL = process.env.API_URL;
const Map = require('../components/map');
const DetailList = require('../components/detailList');
const util = require('../util');

util.checkAPIonline();

util.setCurrentTab('#browse-nav');

let sampleId = util.getURLParameter();

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
                    metadataObj[e.name] = e.value;
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
                new Map('map', [that.model.attributes], false);
                deferred.resolve(true);
            }
        });
        return deferred.promise();
    }
});

/**
 * Sort by parameter name ignoring case
 * @param {object} a to sort
 * @param {object} b  to sort
 * @return {number} ordering
 */
function compareByName(a, b) {
    const textA = a.name.toUpperCase();
    const textB = b.name.toUpperCase();
    let val;
    if (textA < textB) {
        val = -1;
    } else if (textB < textA) {
        val = 1;
    } else {
        val = 0;
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
    urls['ENA website (' + sampleAccession + ')'] = 'https://www.ebi.ac.uk/ena/data/view/' +
        sampleAccession;
    return urls;
}

/**
 * Method to initialise page load from googleMaps loading callback
 */
function initPage() {
    let sample = new api.Sample({id: sampleId});
    let sampleView = new SampleView({model: sample});

    let studies = new api.StudiesCollection({sample_accession: sampleId}, API_URL + 'samples/' +
        sampleId + '/studies');

    let runs = new api.RunsCollection({sample_accession: sampleId});

    $.when(
        sampleView.fetchAndRender()
    ).done(function() {
        new util.StudiesView({collection: studies});
        new util.RunsView({collection: runs});
    });
}

window.initPage = initPage;
