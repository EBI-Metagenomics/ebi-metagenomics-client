const Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
const Commons = require('../../commons');

/**
 * Container for GoTermChart
 * @type {module.GoTermChart}
 */
module.exports = class GoTermChart {
    /**
     * Initialise GoTermChart in container
     * @param {string} containerId
     * @param {string} chartTitle
     * @param {object} data
     * @param {string} color
     * @return {Highcharts.Chart}
     */
    constructor(containerId, chartTitle, data, color, extraOptions) {
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
                        format: '<b>{point.name}</b>: {point.percentage:.2f} %',
                        style: {
                            color: (Highcharts.theme && Highcharts.theme.contrastTextColor)
                            || 'black'
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
        if (extraOptions) {
            options = $.extend(options, extraOptions);
        }
        return Highcharts.chart(containerId, options);
    }
};
