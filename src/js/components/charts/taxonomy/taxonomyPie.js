const Highcharts = require('highcharts');
const _ = require('underscore');
require('highcharts/modules/exporting')(Highcharts);
const Commons = require('../../../commons');


module.exports = class TaxonomyPie {
    constructor(containerId, chartTitle, pieData, legend, extraOptions) {
        const categories = [];
        pieData.forEach(function (e) {
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
                    colors: Commons.TAXONOMY_COLOURS,
                }
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'reads',
                colorByPoint: true,
                data: pieData,
            }],
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
                labelFormatter: function() {
                    if (this.name.length>15){
                        return this.name.slice(0, 15)+'...'
                    } else{
                        return this.name
                    }

                }
            };
            options.plotOptions.pie.showInLegend = true;
        }
        return Highcharts.chart(containerId, options);
    }
};