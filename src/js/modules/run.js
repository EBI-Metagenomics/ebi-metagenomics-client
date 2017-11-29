const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const Config = require('../config');
require('../commons');
const api = require('../components/api');
const TaxonomyPieChart = require('../components/taxonomy/taxonomyPie');
const GenericTable = require('../components/genericTable');

require('tablesorter');
import {attachTabHandlers, getURLParameter, setCurrentTab} from "../util";

let Highcharts = require('highcharts');

setCurrentTab('#samples-nav');

let run_id = getURLParameter();

let analysis = null;
let metadata = null;
let taxonomy = null;
let qcChart = null;

let RunView = Backbone.View.extend({
    model: api.Run,
    template: _.template($("#runTmpl").html()),
    el: '#main-content-area',
    initialize: function () {
        const that = this;
        this.model.fetch({
            data: {},
            success: function (data) {
                let version = data.attributes.pipeline_versions[0];
                analysis = new api.Analysis({id: run_id, version: version});
                metadata = new api.AnalysisMetadata({id: run_id, version: version});
                taxonomy = new api.Taxonomy({id: run_id, version: version});
                that.render(function () {
                    let qcGraph = new QCGraphView({model: metadata});
                    let taxonomyGraph = new TaxonomyGraphView({model: taxonomy});
                });
            }
        });
    },
    render: function (callback) {
        this.$el.html(this.template(this.model.toJSON()));
        attachTabHandlers();
        callback();
        return this.$el;
    }
});

let QCGraphView = Backbone.View.extend({
    model: api.AnalysisMetadata,
    initialize: function () {
        this.model.fetch({
            success: function (model) {
                let data = {};
                model.attributes.data.map(function (e) {
                    const attr = e.attributes;
                    data[attr['let-name']] = attr['let-value'];
                });
                let remaining = [0, 0, 0, 0, 0];
                let filtered = [0, 0, 0, 0, 0];
                let post_sample = [0, 0, 0, 0, 0];
                remaining[0] = parseInt(data['Submitted nucleotide sequences']);
                remaining[1] = parseInt(data['Nucleotide sequences after format-specific filtering']);
                remaining[2] = parseInt(data['Nucleotide sequences after length filtering']);
                remaining[3] = parseInt(data['Nucleotide sequences after undetermined bases filtering']);
                filtered[2] = remaining[1] - remaining[2];
                qcChart = Highcharts.chart('QC-step-chart', {
                    chart: {
                        type: 'bar'
                    },
                    title: {
                        text: 'Number of sequence reads per QC step'
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Count'
                        }
                    },
                    xAxis: {
                        categories: ['Initial reads', 'Trimming', 'Length filtering', 'Ambiguous base filtering', 'Reads subsampled for QC analysis']
                    },
                    plotOptions: {
                        series: {
                            stacking: 'normal'
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    series: [
                        {
                            name: 'Reads filtered out',
                            data: filtered,
                            color: '#CCCCD3'
                        }, {
                            //     name: 'Reads after sampling',
                            //     data: post_sample,
                            //     color: '#8DC7C7'
                            // }, {
                            name: 'Reads remaining',
                            data: remaining,
                            color: '#058DC7',
                        }]
                });
            }
        });
    }
});

let TaxonomyGraphView = Backbone.View.extend({
    model: api.Taxonomy,
    initialize: function () {
        this.model.fetch({
            success: function (model) {
                // Pie tab
                new TaxonomyPieChart('domain-composition', 'Domain composition', model.attributes.data, 0);
                const phylumChart = new TaxonomyPieChart('phylum-composition', 'Phylum composition', model.attributes.data, 1, true);
                const headers = [
                    {sortBy: 'a', name: ''},
                    {sortBy: 'a', name: 'Phylum'},
                    {sortBy: 'a', name: 'Domain'},
                    {sortBy: 'a', name: 'Reads'},
                    {sortBy: 'a', name: '%'},
                ];
                const total = _.reduce(phylumChart.clusteredData, function (m, d) {
                    return m + d.y;
                }, 0);
                let i = 0;
                const data = _.map(phylumChart.clusteredData, function (d) {
                    const taxColor = Math.min(Config.TAXONOMY_COLOURS.length-1, i);
                    const colorDiv = "<div class='puce-square-legend' style='background-color: " + Config.TAXONOMY_COLOURS[taxColor] + "'></div>";
                    return [++i, colorDiv+d.name, d.lineage[0], d.y, (d.y * 100 / total).toFixed(2)]
                });
                const phylumTable = new GenericTable($('#pie').find("[data-table='phylum-table']"), '', headers, function () {
                });
                phylumTable.update(data, false, 1, data.length);
                phylumTable.$table.tablesorter({
                    headers: {0: {sorter: false}}
                });

            }
        });
    }
});


$(document).ready(function () {
    // TODO Handle change of analysis
    $("#analysisSelect").change(function (e) {
        // console.log(this);
        // console.log(e);
    });
});

let run = new api.Run({id: run_id});
let runView = new RunView({model: run});
