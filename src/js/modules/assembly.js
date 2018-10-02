const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const api = require('mgnify').api;
const util = require('../util');
const DetailList = require('../components/detailList');
const GenericTable = require('../components/genericTable');

require('tablesorter');

util.setupPage('#browse-nav');

window.Foundation.addToJquery($);

let accession = util.getURLParameter();
let isRun = ['ERZ', 'GCA'].indexOf(accession.slice(0, 3)) > -1;
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
                that.render(attr);
                deferred.resolve();
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
        let description = {
            'Study': '<a href=\'' + attr.study_url + '\'>' + attr.study_id + '</a>',
            'Sample': '<a href=\'' + attr.sample_url + '\'>' + attr.sample_id + '</a>',
            'ENA accession': '<a class=\'ext\' href=\'' + attr.ena_url + '\'>' + attr.assembly_id +
            '</a>'
        };
        $('#overview').append(new DetailList('Description', description));
        return this.$el;
    }
});

const columns = [
    {sortBy: null, name: 'Analysis accession'},
    {sortBy: null, name: 'Experiment type'},
    {sortBy: null, name: 'WGS ID'},
    {sortBy: null, name: 'Legacy ID'},
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
            attr.pipeline_version +
            '</a>';
        return [
            accessionLink,
            attr['experiment_type'],
            attr['wgs_accession'],
            attr['legacy_accession'],
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
        const up = this.update({page_size: Commons.DEFAULT_PAGE_SIZE});
        up.always((data) => {
            if (data.models.length === 0) {
                $analysesSection.hide();
            }
        });
    }

});


let assembly = new api.Assembly({id: accession});
let assemblyView = new AssemblyView({model: assembly});

let assemblyAnalyses = new api.AssemblyAnalysesView({id: accession});

$.when(
    assemblyView.fetchAndRender()
).done(function() {
    new util.AssemblyAnalysesView({collection: assemblyAnalyses});
    util.attachExpandButtonCallback();
});