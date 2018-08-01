import {getExportingStructure, zoomMsg} from './qcChartUtil';

const Highcharts = require('highcharts');

export let drawGCContent = function(elem, data) {
    if (typeof data === 'undefined' || data === null) {
        return;
    }
    new Highcharts.Chart({
        chart: {
            renderTo: elem,
            type: 'bar',
            marginTop: 0, // Keep all charts left aligned
            height: 150
        },
        title: false,
        xAxis: {
            categories: ['Content'],
            title: {enabled: false},
            lineColor: '#595959',
            tickColor: ''
        },
        yAxis: {
            min: 0,
            max: 100,
            title: {enabled: false},
            plotBands: [
                { // visualize the standard deviation
                    from: data['average_gc_content'] - data['standard_deviation_gc_content'],
                    to: data['average_gc_content'] + data['standard_deviation_gc_content'],
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
                name: 'GC Content',
                pointPadding: 0.25,
                color: 'rgb(63, 114, 191)',
                // tooltip: {
                //    pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}:
                // <b>'+data["average_gc_content"]+'</b><br/><span style="color:{point.color}">
                // \u25CF</span> GC ratio: <b>'+data["average_gc_ratio"]+'</b><br/>',
                // },
                tooltip: {
                    pointFormatter: function() {
                        return '<span style="color:' + this.color + '">\u25CF</span> ' +
                            this.series.name + ': <b>' + (this.y).toFixed(2) + '%</b><br/>';
                    }
                },
                data: [data['average_gc_content']]
            }, {
                name: 'AT Content',
                color: 'rgb(114, 63, 191)',
                pointPadding: 0.25,
                threshold: data['average_gc_content'],
                tooltip: {
                    pointFormatter: function() {
                        const val = (100 - data['average_gc_content']).toFixed(2);
                        return '<span style="color:' + this.color + '">\u25CF</span> ' +
                            this.series.name + ': <b>' + val + '%</b><br/>';
                    }
                },
                // tooltip: {
                //     pointFormatter: function() {
                //         return '<span style="color:' + this.color + '">\u25CF</span> ' +
                //             this.series.name + ': <b>' +
                //             (100 - data['average_gc_content']).toFixed(2) + '%</b><br/>';
                //     }
                // },
                data: [100]
            }
        ],
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

export let drawSequenceGCDistribution = function(elem, rawdata, isFromSubset, stats, urlToFile) {
    if (typeof rawdata === 'undefined' || rawdata === null) {
        return;
    }
    let data = rawdata.split('\n').map(function(line) {
        if (line.trim() !== '') {
            return line.split('\t').map(function(v) {
                return 1 * v;
            });
        }
    }).reduce(
        function(acc, v) {
            if (v) {
                let key = Math.min(100, Math.max(0, Math.round(v[0])));
                acc[key][1] += v[1];
            }
            return acc;
        },
        new Array(101).fill(null).map(function(d, i) {
            return [i, 0];
        }));
    // Create the chart
    new Highcharts.Chart({
        // $('#seq_gc').highcharts({
        chart: {
            renderTo: elem,
            style: {
                fontFamily: 'Helvetica'
            },
            zoomType: 'x'
        },
        title: {
            text: 'Reads GC distribution',
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
            max: 100,

            plotBands: (stats === null) ? [] : [
                { // visualize the standard deviation
                    from: stats['average_gc_content'] - stats['standard_deviation_gc_content'],
                    to: stats['average_gc_content'] + stats['standard_deviation_gc_content'],
                    color: 'rgba(128, 128, 128, .2)',
                    borderColor: '#000000',
                    label: {
                        text: 'Standard Deviation<br/>\u00B1' +
                        (stats['standard_deviation_gc_content'].toFixed(2)),
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
            }],
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
