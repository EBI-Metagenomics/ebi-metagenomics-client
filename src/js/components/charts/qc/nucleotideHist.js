import {getExportingStructure} from './qcChartUtil';

const Highcharts = require('highcharts');

export const drawNucleotidePositionHistogram = function(elem, rawdata, isFromSubset, urlToFile) {
    if (typeof rawdata == 'undefined' || rawdata == null) return;
    let data = {'pos': [], 'A': [], 'G': [], 'T': [], 'C': [], 'N': []};
    let colors = {
        'A': 'rgb(16, 150, 24)',
        'G': 'rgb(255, 153, 0)',
        'C': 'rgb(51, 102, 204)',
        'T': 'rgb(220, 57, 18)',
        'N': 'rgb(138, 65, 23)'
    };
    let headers = null;
    rawdata.split('\n').forEach(function(line) {
        if (headers == null) {
            headers = line.split('\t');
        } else {
            line.split('\t').forEach(function(v, i) {
                data[headers[i]].push(v * 1);
            });
        }
    });
    new Highcharts.Chart({
        chart: {
            renderTo: 'nucleotide',
            type: 'area',
            style: {
                fontFamily: 'Helvetica'
            }
        },
        title: {
            text: 'Nucleotide position histogram',
            style: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        subtitle: {
            text: (isFromSubset)
                ? 'A subset of the sequences was used to generate this chart'
                : undefined
        },
        xAxis: {
            categories: data['pos'],
            tickmarkPlacement: 'on',
            title: {enabled: false}
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {enabled: false}
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        tooltip: {shared: true},
        series: ['A', 'T', 'C', 'G', 'N'].map(function(d) {
            return {
                name: d,
                data: data[d],
                color: colors[d]
            };
        }),
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
