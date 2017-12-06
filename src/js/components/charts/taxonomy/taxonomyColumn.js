const Highcharts = require('highcharts');
const _ = require('underscore');
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


module.exports = class TaxonomyColumn {
    constructor(containerId, chartTitle, chartData, legend, extraOptions) {
        const categories = [];

        chartData.forEach(function (e) {
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
            // tooltip: {
            //     pointFormat: '<b>{point.y}</b> {series.name} ({point.percentage:.1f}%)'
            // },
            // plotOptions: {
            //     pie: {
            //         allowPointSelect: true,
            //         cursor: 'pointer',
            //         dataLabels: {
            //             enabled: true,
            //             format: '<b>{point.name}</b>: {point.percentage:.1f} %',
            //             style: {
            //                 color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
            //             }
            //         },
            //         colors: Commons.TAXONOMY_COLOURS,
            //     }
            // },
            credits: {
                enabled: false
            },
            series: [{
                colorByPoint: true,
                data: chartData,
                colors: Commons.TAXONOMY_COLOURS,
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
                formatter: function () {
                    let perc = this.percentage;
                    // Percentage in highcharts is not defined within series, hence the alternative calculation below
                    if (!this.percentage) {
                        const sum = sumData(this.series.data);
                        perc = 100 * this.y / sum;
                    }
                    let title = this.x;
                    if (title=='0'){
                        title = this.series.name;
                    }
                    return title+ '<br/>' + '<b>' + this.y +
                        '</b> reads (' + (perc).toFixed(2) + '%)';
                }
            },
        };

        if (legend) {
            options.legend = {
                title: {
                    text: 'Click to hide'
                },
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
            };
            // options.plotOptions.pie.showInLegend = true;
        } else {
            options.legend = {
                enabled: false
            }
        }

        if (extraOptions) {
            options = $.extend(options, extraOptions);
        }
        const chart = Highcharts.chart(containerId, options);
        chart.sum = sumData(chartData);

        return chart
        // $('button.column').click(function () {
        //     options.chart.renderTo = 'container';
        //     options.chart.type = 'column';
        //     chart = Highcharts.chart(containerId, options);
        // });


    }

    clusterData(data, depth) {
        let clusteredData = {};
        let total = 0;
        _.each(data, function (d) {
            const attr = d.attributes;
            const lineage = attr.lineage.split(':');
            let category;
            if (lineage.length < depth) {
                category = lineage[lineage.length - 1]
            } else {
                category = lineage[depth]
            }
            let val = attr.count;
            if (clusteredData.hasOwnProperty(category)) {
                clusteredData[category]['v'] += val;
            } else {
                clusteredData[category] = {
                    v: val,
                    l: lineage,
                };
            }
            total += val;
        });
        clusteredData = _.map(clusteredData, function (values, k) {
            return {
                name: k,
                y: values.v,
                lineage: values.l
            }
        });
        return clusteredData;
    }
};


function sumData(data) {
    let sum = 0;
    data.forEach(function (e) {
        sum += e.y;
    });
    return sum
}