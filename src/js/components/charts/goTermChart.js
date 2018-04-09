const Highcharts = require('highcharts');
const _ = require('underscore');
require('highcharts/modules/exporting')(Highcharts);
const Commons = require('../../commons');

module.exports = class GoTermChart {
    constructor(containerId, chartTitle, data, color) {
        let series = [];
        let categories = [];
        data.forEach(function(d) {
            d = d.attributes;
            categories.push(d.description);
            series.push(d.count);
        });

        let options = {
            chart: {
                type: 'bar',
                height: 800,
                zoomType: 'xy',
                renderTo: 'container'
            },
            title: {
                text: chartTitle
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Annotations'
                }
            },
            xAxis: {
                categories: categories
            },
            plotOptions: {
                series: {
                    stacking: 'normal'
                },
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
                    colors: Commons.TAXONOMY_COLOURS
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
                    name: 'annotations',
                    data: series,
                    color: color
                }]
        };
        return Highcharts.chart(containerId, options);
    }
};
