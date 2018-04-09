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
                getExternalLinks(attr.id, attr.bioproject).done(function(data) {
                    that.model.attributes.external_links = _.map(data, function(url, text) {
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
                });

            }
        });
        return deferred.promise();
    }
});

/**
 * Sort by parameter name ignoring case
 * @param a object to sort
 * @param b object to sort
 * @returns {number} ordering
 */
function compareByName(a, b) {
    const textA = a.name.toUpperCase();
    const textB = b.name.toUpperCase();
    if (textA < textB) {
        return -1;
    } else if (textB < textA) {
        return 1;
    } else {
        return 0;
    }
}

function getExternalLinks(sampleAccession) {
    let deferred = new $.Deferred();
    const enaUrl = 'https://www.ebi.ac.uk/ena/data/view/' + sampleAccession;
    const enaUrlCheck = util.checkURLExists(enaUrl);
    let urls = {};
    $.when(
        enaUrlCheck
    ).done(function() {
        if (enaUrlCheck.status === 200) {
            urls['ENA website (' + sampleAccession + ')'] = enaUrl;
        }
        deferred.resolve(urls);
    });
    return deferred.promise();
}

// Called by googleMaps import callback
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