import {getExportingStructure, zoomMsg} from './qcChartUtil';

const Highcharts = require('highcharts');

export let drawSequenceLengthHistogram = function(elem, rawdata, isFromSubset, stats, urlToFile) {
    if (typeof rawdata == 'undefined' || rawdata == null) return;
    let data = rawdata.split('\n').filter(function(line) {
        return line.trim() != '';
    }).map(function(line) {
        return line.split('\t').map(function(v) {
            return 1 * v;
        });
    });
    let lengthMax = Math.max.apply(null, data.map(function(e) {
        if (e) {
            return e[0];
        }
    }));

    new Highcharts.Chart({
        chart: {
            renderTo: elem,
            marginLeft: 78, // Keep both charts - lenght histogram & bar chart - left aligned
            style: {
                fontFamily: 'Helvetica'
            },
            zoomType: 'x'
        },
        title: {
            text: 'Reads length histogram',
            style: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        subtitle: {
            text: ((isFromSubset)
                ? 'A subset of the sequences was used to generate this chart -'
                : '') + zoomMsg
        },
        yAxis: {
            title: {text: 'Number of reads'}
        },
        xAxis: {
            min: 0,
            max: 100 * (Math.floor(lengthMax / 100) + 1),
            plotBands: (stats == null) ? [] : [
                { // visualize the standard deviation
                    from: stats['average_length'] - stats['standard_deviation_length'],
                    to: stats['average_length'] + stats['standard_deviation_length'],
                    color: 'rgba(128, 128, 128, .2)',
                    label: {
                        text: 'Standard Deviation<br/>\u00B1' +
                        (stats['standard_deviation_length'].toFixed(2)),
                        style: {
                            color: '#666666',
                            fontSize: '0.8em'
                        }
                    }
                }]
        },
        series: [
            {
                name: 'Reads',
                data: data,
                color: (isFromSubset) ? '#8dc7c7' : '#058dc7'
            }
        ],
        legend: {enabled: false},
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: getExportingStructure(urlToFile)
    });
};

export let drawSequencesLength = function(elem, data) {
    if (typeof data == 'undefined' || data == null) return;
    new Highcharts.Chart({
        chart: {
            renderTo: elem,
            type: 'bar',
            marginTop: 0, // Keep all charts left aligned
            height: 120
        },
        title: false,
        xAxis: {
            categories: ['Minimum', 'Average', 'Maximum'],
            title: {enabled: false},
            lineColor: '#595959',
            tickColor: ''
        },
        yAxis: {
            min: 0,
            max: 100 * (Math.floor(data['length_max'] / 100) + 1),
            title: {text: 'Sequence length (bp)'},
            plotBands: [
                { // visualize the standard deviation
                    from: data['average_length'] - data['standard_deviation_length'],
                    to: data['average_length'] + data['standard_deviation_length'],
                    color: 'rgba(128, 128, 128, .2)'
                }]
        },
        plotOptions: {
            series: {
                grouping: false,
                shadow: false,
                borderWidth: 0
            }
        },
        series: [
            {
                name: 'Length',
                data: [
                    {y: data['length_min'], x: 0, color: 'rgb(114, 191, 63)'},
                    {y: data['average_length'], x: 1, color: 'rgb(63, 114, 191)'},
                    {y: data['length_max'], x: 2, color: 'rgb(114, 63, 191)'}
                ],
                pointPadding: -0.2,
                tooltip: {
                    pointFormatter: function() {
                        return '<span style="color:' + this.color + '">\u25CF</span> ' +
                            this.category + ': <b>' + (this.y).toFixed(2) + '</b><br/>';
                    }
                }
            }
        ],
        legend: {enabled: false},
        credits: false,
        navigation: {
            buttonOptions: {
                height: 32,
                width: 32,
                symbolX: 16,
                symbolY: 16,
                y: -10
            }
        },
        exporting: {enabled: false}
    });
};
