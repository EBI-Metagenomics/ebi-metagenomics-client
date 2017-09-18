import Backbone from 'backbone';
import _ from 'underscore';
import * as util from '../main';
import * as api from '../components/api';

var Highcharts = require('highcharts');

util.setCurrentTab('#samples-nav');

var run_id = util.getURLParameter();
console.log(Highcharts);

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
        util.attachTabHandlers();
        callback();
        return this.$el;
    }
});

var QCGraphView = Backbone.View.extend({
    model: api.AnalysisMetadata,
    initialize: function () {
        console.log(this);
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
                    data: [1, 1, 1, 1, 1],
                    color: '#CCCCD3'
                }, {
                    name: 'Reads after sampling',
                    data: [2, 2, 2, 2, 2],
                    color: '#8DC7C7'
                },
                {
                    name: 'Reads remaining',
                    data: [1, 1, 1, 1, 1],
                    color: '#058DC7',
                }]
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
