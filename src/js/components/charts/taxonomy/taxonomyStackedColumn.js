const Highcharts = require('highcharts');
const _ = require('underscore');
require('highcharts/modules/exporting')(Highcharts);
const Commons = require('../../../commons');
const TaxonomyColumn = require('./taxonomyColumn');

module.exports = class TaxonomyStackedColumns extends TaxonomyColumn {
    constructor(containerId, chartTitle, data, legend, extraOptions) {
        const transformedData = transformData(data);
        const barOptions = {
            chart: {
                type: 'column'
            },
            plotOptions: {
                series: {
                    stacking: 'percent',
                    dataLabels: {
                        enabled: true,
                    },
                }
            },
            yAxis: {
                min: 0,
                max: 100
            },
            xAxis: {
                title: {
                    text: null,
                    enabled: false,
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
        super(containerId, chartTitle, data, legend, extraOptions)
    }
};

function transformData(data) {
    let transformedData = [];
    let i = 0;
    const maxColorIndex = Commons.TAXONOMY_COLOURS.length - 1;
    data.forEach(function (e) {
        transformedData.push({
            name: e.name,
            data: [e.y],
            color: Commons.TAXONOMY_COLOURS[Math.min(i, maxColorIndex)]
        });
        i++;
    });
    return transformedData;
}
