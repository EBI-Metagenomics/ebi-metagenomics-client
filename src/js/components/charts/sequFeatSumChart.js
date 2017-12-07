// Sequence feature summary chart

const Highcharts = require('highcharts');
const _ = require('underscore');
require('highcharts/modules/exporting')(Highcharts);

module.exports = class QCChart {
    constructor(containerId, chartTitle, data) {
        const categories = [
            'Nucleotide sequences with predicted CDS',
            'Nucleotide sequences with predicted rRNA',
            'Nucleotide sequences with InterProScan match',
            'Predicted CDS',
            'Predicted CDS with InterProScan match',
        ];
        let series = [];
        categories.forEach(function(e, o){
            series.push(parseInt(data[e]));
        });

        let options = {
            chart: {
                type: 'bar'
            },
            title: {
                text: chartTitle,
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Count'
                }
            },
            xAxis: {
                categories: categories,
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                }
            },
            credits: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            tooltip: {
                pointFormat: '<b>{point.y}</b>'
            },
            series: [
                {
                    data: series,
                    color: '#058dc7'
                }]
        };
        return Highcharts.chart(containerId, options);
    }
};
