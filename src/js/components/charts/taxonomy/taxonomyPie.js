const Highcharts = require('highcharts');
const _ = require('underscore');
require('highcharts/modules/exporting')(Highcharts);
const Commons = require('../../../commons');

function duplicateLastColor(colours, data) {
    let new_colours = [];
    let i = 0;
    while (i < data.length) {
        new_colours.push(colours[Math.min(i, colours.length-1)]);
        i++;
    }
    return new_colours;
}

module.exports = class TaxonomyPie {
    constructor(containerId, chartTitle, pieData, legend, extraOptions) {
        const categories = [];
        pieData.forEach(function(e) {
            categories.push(e.name);
        });
        let options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'pie'
            },
            title: {
                text: chartTitle
            },
            tooltip: {
                pointFormat: '<b>{point.y}</b> {series.name} ({point.percentage:.1f}%)'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                        }
                    },
                    colors: duplicateLastColor(Commons.TAXONOMY_COLOURS, pieData)
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'reads',
                colorByPoint: true,
                data: pieData
            }]
        };
        if (extraOptions) {
            options = $.extend(true, options, extraOptions);
        }
        if (legend) {
            options.legend = {
                title: {
                    text: 'Click to hide'
                },
                align: 'right',
                verticalAlign: 'middle',
                layout: 'vertical',
                labelFormatter() {
                    if (this.name.length > 15) {
                        return this.name.slice(0, 15) + '...';
                    } else {
                        return this.name;
                    }
                }
            };
            options.plotOptions.pie.showInLegend = true;
        }
        return Highcharts.chart(containerId, options);
    }
};
