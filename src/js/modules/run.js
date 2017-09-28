const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
require('../commons');
const api = require('../components/api');

import {attachTabHandlers, getURLParameter, setCurrentTab} from "../util";

var Highcharts = require('highcharts');

setCurrentTab('#samples-nav');

var run_id = getURLParameter();

let analysis = null;
let metadata = null;

let qcChart = null;
var RunView = Backbone.View.extend({
    model: api.Run,
    template: _.template($("#runTmpl").html()),
    el: '#main-content-area',
    initialize: function () {
        const that = this;
        this.model.fetch({
            data: {},
            success: function (data) {
                analysis = new api.Analysis({id: run_id, version: data.attributes.pipeline_versions[0]});
                metadata = new api.AnalysisMetadata({id: run_id, version: data.attributes.pipeline_versions[0]});

                that.render(function () {
                    let qcGraph = new QCGraphView({model: metadata});
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

var QCGraphView = Backbone.View.extend({
    model: api.AnalysisMetadata,
    initialize: function () {
        this.model.fetch({
            success: function (model) {
                let data = {};
                model.attributes.data.map(function (e) {
                    const attr = e.attributes;
                    data[attr['var-name']] = attr['var-value'];
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


$(document).ready(function () {
    // TODO Handle change of analysis
    $("#analysisSelect").change(function (e) {
        console.log(this);
        console.log(e);
    });
});

var run = new api.Run({id: run_id});
var runView = new RunView({model: run});
