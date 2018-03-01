const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
const GenericTable = require('../components/genericTable');
const Map = require('../components/map');
const API_URL = process.env.API_URL;
const EUROPEPMC_ENTRY_URL = Commons.EBI_EUROPEPMC_ENTRY_URL;
const ENA_VIEW_URL = Commons.EBI_ENA_VIEW_URL;


// const OverlappingMarkerSpiderfier = require('../../../static/libraries/oms.min.js');
import 'js-marker-clusterer';

import {
    attachTabHandlers,
    getURLFilterParams,
    getURLParameter,
    hideTableLoadingGif,
    initTableTools,
    setCurrentTab,
    setURLParams,
    showTableLoadingGif,
    createListItem,
    createLinkTag,
    checkURLExists,
    checkAPIonline, getBiomeIcon, formatDate, formatLineage
} from "../util";

checkAPIonline();

setCurrentTab('#studies-nav');

const DEFAULT_PAGE_SIZE = Commons.DEFAULT_PAGE_SIZE;


let study_id = getURLParameter();
let StudyView = Backbone.View.extend({
    model: api.Study,
    template: _.template($("#studyTmpl").html()),
    el: '#main-content-area',
    fetchAndRender: function () {
        const that = this;
        const deferred = $.Deferred();
        this.model.fetch({
            data: $.param({}),
            success: function (data, response) {
                const attr = data.attributes;

                getExternalLinks(attr.id, attr.bioproject).done(function (data) {
                    const links = _.map(data, function (url, text) {
                        return createListItem(createLinkTag(url, text));
                    });
                    console.log("Check 2");
                    that.model.attributes.external_links = links;
                    console.log("Check 3");
                });
                getEuropePMCLinks(attr.id).done(function (data) {
                    console.log("Check 4");
                    const links = _.map(data, function (url, text) {
                        return createListItem(createLinkTag(url, text));
                    });
                    that.model.attributes.europepmc_links = links;
                });
                that.$el.html(that.template(that.model.toJSON()));
                deferred.resolve(true);
                attachTabHandlers();
            }
        });
        return deferred.promise();
    }
});

let SamplesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    fetch: function () {
        return this.collection.fetch()
    },

    init: function () {
        const that = this;
        const columns = [
            {sortBy: 'sample_name', name: 'Sample name'},
            {sortBy: 'accession', name: 'Sample ID'},
            {sortBy: null, name: 'Description'},
            {sortBy: 'last_update', name: 'Last update'},
        ];
        this.tableObj = new GenericTable($('#samples-section'), 'Associated samples', columns, function (page, pageSize, order, query) {
            that.update(page, pageSize, order, query);
        });
        this.update(1, Commons.DEFAULT_PAGE_SIZE_SAMPLES, null, null)
    },

    update: function (page, pageSize, order, query) {
        this.tableObj.showLoadingGif();
        let params = {
            study_accession: this.collection.study_accession,
            page: page,
            page_size: pageSize
        };
        if (order) {
            params['ordering'] = order;
        }
        if (query) {
            params['search'] = query;
        }
        const that = this;
        this.collection.fetch({
            data: $.param(params),
            success: function (data, response) {
                that.renderData(page, pageSize, response.meta.pagination.count, response.links.first);
                that.tableObj.hideLoadingGif();
            }
        })
    },

    renderData: function (page, pageSize, resultCount, requestURL) {
        // initMap(this.collection.models);
        const tableData = _.map(this.collection.models, function (m) {
            const attr = m.attributes;
            const sample_link = "<a href='" + attr.sample_url + "'>" + attr.sample_accession + "</a>";
            return [attr.sample_name, sample_link, attr.sample_desc, attr.last_update]
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});


let MapData = Backbone.Model.extend({
    url: function () {
        return API_URL + 'samples?page_size=250&study_accession=' + this.study_id + '&fields=latitude,longitude'
    },
    initialize: function (study_id) {
        this.study_id = study_id;
        this.data = [];
    },
    parse: function (d) {
        this.data = this.data.concat(d.data);
        if (d.links.next !== null) {
            this.url = d.links.next;
            this.fetch();
        } else {
            new Map('map', this.data);
        }
    }
});

let RunsView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    fetch: function () {
        return this.collection.fetch()
    },

    init: function () {
        const that = this;
        const columns = [
            {sortBy: 'accession', name: 'Run ID'},
            {sortBy: null, name: 'Experiment type'},
            {sortBy: null, name: 'Instrument model'},
            {sortBy: null, name: 'Instrument platform'},
            {sortBy: null, name: 'Pipeline versions'},
        ];
        this.tableObj = new GenericTable($('#runs-section'), 'Associated runs', columns, function (page, pageSize, order, query) {
            that.update(page, pageSize, order, query);
        });
        this.update(1, DEFAULT_PAGE_SIZE, null, null)
    },

    update: function (page, pageSize, order, query) {
        this.tableObj.showLoadingGif();
        let params = {
            study_accession: this.collection.study_accession,
            page: page,
            page_size: pageSize
        };
        if (order) {
            params['ordering'] = order;
        }
        if (query) {
            params['search'] = query;
        }
        const that = this;
        this.collection.fetch({
            data: $.param(params),
            success: function (data, response) {
                that.renderData(page, pageSize, response.meta.pagination.count, response.links.first);
                that.tableObj.hideLoadingGif();
            }
        })
    },

    renderData: function (page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function (m) {
            const attr = m.attributes;
            const run_link = "<a href='" + attr.run_url + "'>" + attr.run_id + "</a>";
            return [run_link, attr['experiment_type'], attr['instrument_model'], attr['instrument_platform'], attr['pipeline_versions'].join(', ')]
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});

function getEuropePMCLinks(study_id) {
    let deferred = new $.Deferred();
    let publications = new StudyPublications({study_accession: study_id});
    const publicationArray = [];

    publications.fetch({
        success: function (data, response) {
            for (let i = 0; i < data.models.length; i++) {
                const pubmed_id = data.models[i].attributes['pubmed_id'];
                const pub_title = data.models[i].attributes['pub_title'];
                const authors = data.models[i].attributes['authors'];
                const doi = data.models[0].attributes['doi'];
                publicationArray.push(new PublicationLink(pub_title, authors, pubmed_id, doi));
            }
            console.log("Check 5");
        },
        error: function () {
            console.log("Couldn't fetch study publications!");
        }
    });

    for (let i = 0; i < publicationArray.length; i++) {
        const pubmed_id = publicationArray[i].pubmed_id;
        const url = EUROPEPMC_ENTRY_URL + publicationArray[i].pubmed_id;
        const url_check = checkURLExists(url);
        console.log("Check 1");
        let urls = {};
        $.when(
            url_check
        ).done(function () {
            if (url_check.status === 200) {
                urls['PMID (' + pubmed_id + ')'] = url;
            }
            deferred.resolve(urls);

        });
    }
    return deferred.promise();
}

function getExternalLinks(study_id, study_accession) {
    var deferred = new $.Deferred();
    const ena_url = ENA_VIEW_URL + study_accession;
    const ena_url_check = checkURLExists(ena_url);
    let urls = {};
    $.when(
        ena_url_check
    ).done(function () {
        if (ena_url_check.status === 200) {
            urls['ENA website (' + study_id + ')'] = ena_url;
        }
        deferred.resolve(urls);

    });
    return deferred.promise();
}


// Called by googleMaps import callback
function initPage() {
    let study = new api.Study({id: study_id});
    let studyView = new StudyView({model: study});

    let samples = new api.SamplesCollection({study_accession: study_id});
    let samplesView = new SamplesView({collection: samples});

    let runs = new api.RunCollection({study_accession: study_id});
    let runsView = new RunsView({collection: runs});


    $.when(
        studyView.fetchAndRender(),
    ).done(function () {
        samplesView.init();
        runsView.init();
        new MapData(study_id).fetch();
    });
}


class PublicationLink {
    constructor(pub_title, authors, pubmed_id, doi) {
        this.pub_title = pub_title;
        this.authors = authors;
        this.pubmed_id = pubmed_id;
        this.doi = doi;
    }
}

const Publication = Backbone.Model.extend({
    parse: function (d) {
        const data = d.data !== undefined ? d.data : d;
        const attrs = data.attributes;
        return {
            pubmed_id: attrs['pubmed-id'],
            pub_title: attrs['pub-title'],
            authors: attrs['authors'],
            doi: attrs['doi'],
        }
    }
});

const StudyPublications = Backbone.Collection.extend({
    model: Publication,
    initialize: function (data) {
        if (data && data.hasOwnProperty('study_accession')) {
            this.study_accession = data.study_accession;
        }
    },
    url: function () {
        return API_URL + 'studies/' + this.study_accession + '/publications?page_size=10';
    },
    parse: function (response) {
        return response.data;
    }
});


window.initPage = initPage;


