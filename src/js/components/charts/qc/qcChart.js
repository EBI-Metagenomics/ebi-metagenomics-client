const Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);

module.exports = class QCChart {
    constructor(containerId, data, numSequences) {
        let remaining = [0, 0, 0, 0, 0];
        let filtered = [0, 0, 0, 0, 0];
        let subsampled = [0, 0, 0, 0, numSequences];
        remaining[0] = parseInt(data['Submitted nucleotide sequences']);
        remaining[1] = parseInt(data['Nucleotide sequences after format-specific filtering']);
        remaining[2] = parseInt(data['Nucleotide sequences after length filtering']);
        remaining[3] = parseInt(data['Nucleotide sequences after undetermined bases filtering']);
        filtered[2] = remaining[1] - remaining[2];
        filtered[1] = remaining[0] - remaining[1];
        filtered[4] = remaining[3] - remaining[4] - subsampled[4];

        let options = {
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
                categories: [
                    'Initial reads',
                    'Trimming',
                    'Length filtering',
                    'Ambiguous base filtering',
                    'Reads subsampled for QC analysis']
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
                    color: '#058DC7'
                }, {
                    name: 'Reads after sampling',
                    data: subsampled,
                    color: '#8dc7c7'
                }]
        };
        return Highcharts.chart(containerId, options);
    }
};
