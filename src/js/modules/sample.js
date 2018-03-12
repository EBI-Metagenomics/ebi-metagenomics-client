const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const api = require('../components/api');
const GenericTable = require('../components/genericTable');
const API_URL = process.env.API_URL;
const Map = require('../components/map');
const DetailList = require('../components/detailList');
const util = require('../util');


util.checkAPIonline();

util.setCurrentTab('#browse-nav');

const DEFAULT_PAGE_SIZE = Commons.DEFAULT_PAGE_SIZE;


let sample_id = util.getURLParameter();

let SampleView = Backbone.View.extend({
    model: api.Sample,
    template: _.template($("#sampleTmpl").html()),
    el: '#main-content-area',
    fetchAndRender: function () {
        const that = this;
        const deferred = $.Deferred();
        this.model.fetch({
            data: $.param({}),
            success: function (data, response) {
                const attr = data.attributes;
                that.model.attributes.metadatas.sort(compareByName);
                const metadataObj = {};
                _.each(that.model.attributes.metadatas, function (e) {
                    metadataObj[e.name] = e.value;
                });
                getExternalLinks(attr.id, attr.bioproject).done(function (data) {
                    const links = _.map(data, function (url, text) {
                        return util.createListItem(util.createLinkTag(url, text));
                    });
                    that.model.attributes.external_links = links;
                    that.$el.html(that.template(that.model.toJSON()));
                    console.log(Object.keys(metadataObj).length);
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

function compareByName(a, b) {
    const textA = a.name.toUpperCase();
    const textB = b.name.toUpperCase();
    if (textA < textB) {
        return -1;
    } else if (textB < textA) {
        return 1;
    } else {
        return 0
    }
}

let RunView = Backbone.View.extend({
    tagName: 'tr',
    template: _.template($("#runRow").html()),
    attributes: {
        class: 'run-row',
    },
    render: function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this.$el
    }
});

let StudiesView = Backbone.View.extend({
    tableObj: null,
    pagination: null,
    fetch: function () {
        return this.collection.fetch()
    },

    init: function () {
        const that = this;
        const columns = [
            {sortBy: null, name: 'Biome'},
            {sortBy: null, name: 'Study ID'},
            {sortBy: null, name: 'Name'},
            {sortBy: null, name: 'Abstract'},
            {sortBy: null, name: 'Samples count'},
            {sortBy: null, name: 'Last update'},
        ];
        this.tableObj = new GenericTable($('#studies-section'), 'Associated studies', columns, DEFAULT_PAGE_SIZE, false, function (page, pageSize, order, query) {
            that.update(page, pageSize, order, query);
        });
        this.update(1, DEFAULT_PAGE_SIZE, null, null)
    },

    update: function (page, pageSize, order, query) {
        this.tableObj.showLoadingGif();
        let params = {
            sample_id: this.collection.params.sample_id,
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
            const study_link = "<a href='" + attr.study_link + "'>" + attr.study_id + "</a>";
            const biomes = _.map(m.attributes.biomes, function (b) {
                return "<span class='biome_icon icon_xs " + b.icon + "' title='" + b.name + "'></span>"
            });
            return [biomes.join(' '), study_link, attr['study_name'], attr['abstract'], attr['samples_count'], attr['last_update']]
        });
        this.tableObj.update(tableData, true, page, pageSize, resultCount, requestURL);
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
        this.tableObj = new GenericTable($('#runs-section'), 'Associated runs', columns, DEFAULT_PAGE_SIZE, false, function (page, pageSize, order, query) {
            that.update(page, pageSize, order, query);
        });
        this.update(1, DEFAULT_PAGE_SIZE, null, null)
    },

    update: function (page, pageSize, order, query) {
        this.tableObj.showLoadingGif();
        let params = {
            sample_id: this.collection.sample_id,
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

function getExternalLinks(sample_accession) {
    var deferred = new $.Deferred();
    const ena_url = 'https://www.ebi.ac.uk/ena/data/view/' + sample_accession;
    const ena_url_check = util.checkURLExists(ena_url);
    let urls = {};
    $.when(
        ena_url_check
    ).done(function () {
        if (ena_url_check.status === 200) {
            urls['ENA website (' + sample_accession + ')'] = ena_url;
        }
        deferred.resolve(urls);

    });
    return deferred.promise();
}

// Called by googleMaps import callback
function initPage() {
    let sample = new api.Sample({id: sample_id});
    let sampleView = new SampleView({model: sample});

    let studies = new api.StudiesCollection({sample_id: sample_id}, API_URL + 'samples/' + sample_id + '/studies');
    let studiesView = new StudiesView({collection: studies});

    let runs = new api.RunCollection({sample_id: sample_id});
    let runsView = new RunsView({collection: runs});

    $.when(
        sampleView.fetchAndRender()
    ).done(function () {
        studiesView.init();
        runsView.init();
    });
}

window.initPage = initPage;