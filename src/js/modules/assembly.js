const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const api = require('mgnify').api(process.env.API_URL);
const util = require('../util');
const DetailList = require('../components/detailList');
const GenericTable = require('../components/genericTable');

require('tablesorter');

util.setupPage('#browse-nav');

window.Foundation.addToJquery($);

let accession = util.getURLParameter();
let objType = 'Assembly';
util.specifyPageTitle(objType, accession);

let AssemblyView = Backbone.View.extend({
    model: api.Assembly,
    template: _.template($('#runTmpl').html()),
    el: '#main-content-area',
    init() {
        const that = this;
        const deferred = $.Deferred();
        this.model.fetch({
            data: {},
            success(data) {
                const attr = data.attributes;
                that.render(attr).then(() => {
                    deferred.resolve();
                });
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve ' +
                    'assembly: ' + accession);
                deferred.reject();
            }
        });
        return deferred.promise();
    },
    render(attr) {
        this.$el.html(this.template(this.model.toJSON()));
        let samples = attr.samples.map((s) => {
            return '<a href=\'' + s.url + '\'>' + s.id + '</a>';
        }).join(', ');
        let runs = attr.runs.map((r) => {
            return '<a href=\'' + r.url + '\'>' + r.id + '</a>';
        }).join(', ');

        let enaURL = 'https://www.ebi.ac.uk/ena/portal/api/search?' +
            'result=assembly&' +
            'format=json&' +
            'query=accession%3D' + attr.legacy_id;
        let enaAccess = attr.assembly_id;

        return $.ajax({
            format: 'json',
            url: enaURL
        }).done((data) => {
            enaAccess = '<a ' +
                'href="' + process.env.ENA_URL + attr.assembly_id + '" ' +
                'alt="ENA link for assembly ' + attr.assembly_id + '" ' +
                '>' +
                attr.assembly_id +
                '</a>';
        }).then(() => {
            let description = {
                'Sample': samples,
                'Runs': runs,
                // TODO url must be checked using gca
                'ENA accession': enaAccess
            };
            $('#overview').append(new DetailList('Description', description));
        });
    }
});

const columns = [
    {sortBy: null, name: 'Analysis accession'},
    {sortBy: null, name: 'Experiment type'},
    {sortBy: null, name: 'Instrument model'},
    {sortBy: null, name: 'Instrument platform'},
    {sortBy: 'pipeline', name: 'Pipeline version'}
];

let AssemblyAnalysesView = util.GenericTableView.extend({
    tableObj: null,
    pagination: null,
    params: {},

    getRowData(attr) {
        const accessionLink = '<a href=\'' + attr.analysis_url + '\'>' +
            attr.analysis_accession +
            '</a>';
        const pipelineLink = '<a href=\'' + attr.pipeline_url + '\'>' +
            attr.pipeline_version.toString() +
            '</a>';
        return [
            accessionLink,
            attr['experiment_type'],
            attr['instrument_model'],
            attr['instrument_platform'],
            pipelineLink];
    },

    initialize() {
        const that = this;
        const $analysesSection = $('#analyses');
        let tableOptions = {
            title: 'Analyses',
            headers: columns,
            initialOrdering: '-pipeline',
            initPageSize: Commons.DEFAULT_PAGE_SIZE,
            isHeader: false,
            textFilter: false,
            tableClass: 'analyses-table',
            callback: function(page, pageSize, order, search) {
                that.update({
                    page: page,
                    page_size: pageSize,
                    ordering: order,
                    search: search
                });
            }
        };
        this.tableObj = new GenericTable($analysesSection, tableOptions);
        this.update({page_size: Commons.DEFAULT_PAGE_SIZE}).always((data) => {
            if (data.models.length === 0) {
                $analysesSection.hide();
            }
        });
    }
});

let assembly = new api.Assembly({id: accession});
let assemblyView = new AssemblyView({model: assembly});

let assemblyAnalyses = new api.AssemblyAnalyses({id: accession});
assemblyView.init()
    .then(() => {
        return new AssemblyAnalysesView({collection: assemblyAnalyses});
    }).then(() => {
    util.attachExpandButtonCallback();
});
