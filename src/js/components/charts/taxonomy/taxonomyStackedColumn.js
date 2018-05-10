const Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
const Commons = require('../../../commons');
const TaxonomyColumn = require('./taxonomyColumn');

/**
 * Reformat data into multiple series
 * @param {object} data
 * @return {Array} of data
 */
function transformData(data) {
    let transformedData = [];
    let i = 0;
    const maxColorIndex = Commons.TAXONOMY_COLOURS.length - 1;
    data.forEach(function(e) {
        transformedData.push({
            name: e.name,
            data: [e.y],
            color: Commons.TAXONOMY_COLOURS[Math.min(i, maxColorIndex)]
        });
        i++;
    });
    return transformedData;
}

module.exports = class TaxonomyStackedColumns extends TaxonomyColumn {
    /**
     * Handler for stacked taxonomy column chart, in taxonomy page
     * @param {string} containerId
     * @param {string} chartTitle
     * @param {object} chartData
     * @param {boolean} legend
     * @param {object} extraOptions
     */
    constructor(containerId, chartTitle, chartData, legend, extraOptions) {
        const transformedData = transformData(chartData);
        const barOptions = {
            chart: {
                type: 'column'
            },
            plotOptions: {
                series: {
                    stacking: 'percent',
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            yAxis: {
                min: 0,
                max: 100
            },
            xAxis: {
                title: {
                    text: null,
                    enabled: false
                },
                labels: {
                    enabled: false
                }
            },
            series: transformedData
        };
        if (!extraOptions) {
            extraOptions = $.extend(true, extraOptions, barOptions);
        } else {
            extraOptions = barOptions;
        }
        super(containerId, chartTitle, chartData, legend, extraOptions);
    }
};


