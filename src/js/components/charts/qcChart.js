const Highcharts = require('highcharts');
const _ = require('underscore');
require('highcharts/modules/exporting')(Highcharts);

module.exports = class QCChart {
    constructor(containerId, chartTitle, data) {
        let remaining = [0, 0, 0, 0, 0];
        let filtered = [0, 0, 0, 0, 0];
        remaining[0] = parseInt(data['Submitted nucleotide sequences']);
        remaining[1] = parseInt(data['Nucleotide sequences after format-specific filtering']);
        remaining[2] = parseInt(data['Nucleotide sequences after length filtering']);
        remaining[3] = parseInt(data['Nucleotide sequences after undetermined bases filtering']);
        filtered[2] = remaining[1] - remaining[2];

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
        };
        return Highcharts.chart(containerId, options);
    }
};
