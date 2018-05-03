const Highcharts = require('highcharts');
require('highcharts/modules/exporting')(Highcharts);
const Commons = require('../../../commons');

// rgb(5, 141, 199)
// rgb(130, 210, 61)
// rgb(226, 103, 54)
// rgb(251, 227, 0)
// rgb(36, 203, 229)
// rgb(196, 158, 204)
// rgb(255, 192, 138)
// rgb(112, 128, 144)
// rgb(106, 249, 196)
// rgb(202, 174, 116)
// rgb(204, 204, 204)

/**
 * Get sum total of series values in dataset
 * @param {object} data
 * @return {number}
 */
function sumData(data) {
    let sum = 0;
    data.forEach(function(e) {
        sum += e.y;
    });
    return sum;
}

module.exports = class TaxonomyColumn {
    /**
     * Handler for taxonomy column chart, in taxonomy page
     * @param {string} containerId
     * @param {string} chartTitle
     * @param {object} chartData
     * @param {boolean} legend
     * @param {object} extraOptions
     * @return {Highcharts.Chart}
     */
    constructor(containerId, chartTitle, chartData, legend, extraOptions) {
        const categories = [];

        chartData.forEach(function(e) {
            categories.push(e.name);
        });
        let options = {
            chart: {
                plotBackgroundColor: null,
                plotBorderWidth: null,
                plotShadow: false,
                type: 'column'
            },
            title: {
                text: chartTitle
            },
            credits: {
                enabled: false
            },
            series: [
                {
                    colorByPoint: true,
                    data: chartData,
                    colors: Commons.TAXONOMY_COLOURS
                }],
            xAxis: {
                categories: categories,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Unique OTUs',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                formatter() {
                    let perc = this.percentage;
                    // Percentage in highcharts is not defined within series, hence the
                    // alternative calculation below
                    if (!this.percentage) {
                        const sum = sumData(this.series.data);
                        perc = 100 * this.y / sum;
                    }
                    let title = this.x;
                    if (title === '0') {
                        title = this.series.name;
                    }
                    return title + '<br/>' + '<b>' + this.y +
                        '</b> reads (' + (perc).toFixed(2) + '%)';
                }
            }
        };

        if (legend) {
            options.legend = {
                title: {
                    text: 'Click to hide'
                },
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical'
            };
        } else {
            options.legend = {
                enabled: false
            };
        }

        if (extraOptions) {
            options = $.extend(options, extraOptions);
        }
        const chart = Highcharts.chart(containerId, options);
        chart.sum = sumData(chartData);

        return chart;
    }
};

