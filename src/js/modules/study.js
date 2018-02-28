const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const api = require('../components/api');
const Pagination = require('../components/pagination').Pagination;
const GenericTable = require('../components/genericTable');
const Map = require('../components/map');
const API_URL = process.env.API_URL;


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
    checkAPIonline
} from "../util";

checkAPIonline();

setCurrentTab('#studies-nav');



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
                    that.model.attributes.external_links = links;
                    that.$el.html(that.template(that.model.toJSON()));
                    deferred.resolve(true);
                });
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
        this.tableObj = new GenericTable($('#samples-section'), 'Associated samples', columns, Commons.DEFAULT_PAGE_SIZE_SAMPLES, function (page, pageSize, order, query) {
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
        this.fetchXhr = this.collection.fetch({
            data: $.param(params),
            success: function (data, response) {
                that.renderData(page, pageSize, response.meta.pagination.count, response.links.first);
                that.tableObj.hideLoadingGif();
            },
        })
    },

    renderData: function (page, pageSize, resultCount, requestURL) {
        const tableData = _.map(this.collection.models, function (m) {
            const attr = m.attributes;
            const sample_link = "<a href='" + attr.sample_url + "'>" + attr.sample_accession + "</a>";
            return [attr.sample_name, sample_link, attr.sample_desc, attr.last_update]
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
    }
});


let MapData = api.SamplesCollection.extend({
    fields : ['latitude','longitude','biome','accession','sample_alias','sample_desc','sample_name'],

    initialize: function(study_id){
        this.url = API_URL + 'samples?page_size=250&study_accession='+ study_id + '&fields='+this.fields.join(',');
        this.study_id = study_id;
        this.data = [];
    },
    fetchAll: function(){
        const that = this;
        this.fetch({
            success: function(response, meta){
                let data = _.map(response.models, function(model){
                    return model.attributes;
                });
                that.data = that.data.concat(data);
                if (meta.links.next!==null){
                    that.url = meta.links.next;
                    that.fetchAll();
                } else {
                    new Map('map', that.data, true);
                }
            },
            error: function(a,b,c){
            }
        });
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
        this.tableObj = new GenericTable($('#runs-section'), 'Associated runs', columns, Commons.DEFAULT_PAGE_SIZE, function (page, pageSize, order, query) {
            that.update(page, pageSize, order, query);
        });
        this.update(1, Commons.DEFAULT_PAGE_SIZE, null, null)
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

function getExternalLinks(study_id, study_accession) {
    var deferred = new $.Deferred();
    const ena_url = 'https://www.ebi.ac.uk/ena/data/view/' + study_accession;
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
        new MapData(study_id).fetchAll();
    });
}


window.initPage = initPage;


// <!--<% _.each(samples, function(sample){ %>-->
// <!--<% attr = sample.attributes %>-->
// <!--<% console.log(sample) %>-->
// <!--<tr>-->
// <!--<td><a href="<%= attr.url %>"><%= attr['sample-name'] %></a></td>-->
// <!--<td><a href="<%= attr.url %>"><%= attr.accession %></a></td>-->
// <!--<td><%= attr['sample-desc'] %></td>-->
// <!--<td><%= attr['last-update'] %></td>-->
//     <!--</tr>-->
// <!--<% });%>-->