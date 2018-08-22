// Sequence feature summary chart

const Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);

/**
 * Container for SeqFeatChart
 * @type {module.SeqFeatChart}
 */
module.exports = class SeqFeatChart {
    /**
     * Initialise seqfeatchart in container
     * @param {string} containerId
     * @param {string} chartTitle
     * @param {object} data
     * @return {Highcharts.Chart}
     */
    constructor(containerId, chartTitle, data) {
        const categories = [
            'Reads with predicted CDS',
            'Reads with predicted rRNA',
            'Reads with InterProScan match',
            'Predicted CDS',
            'Predicted CDS with InterProScan match'
        ];

        let series = [
            data['Nucleotide sequences with predicted CDS'],
            data['Nucleotide sequences with predicted rRNA'],
            data['Predicted CDS with InterProScan match'],
            data['Predicted CDS'],
            data['Predicted CDS with InterProScan match']
        ].map(function(e) {
            return parseInt(e);
        });
        let options = {
            chart: {
                type: 'bar'
            },
            title: {
                text: chartTitle
            },
            yAxis: {
                type: 'logarithmic',
                title: {
                    text: 'Count (note the logarithmic scale)'
                }
            },
            xAxis: {
                categories: categories
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
