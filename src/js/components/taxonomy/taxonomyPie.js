const Highcharts = require('highcharts');
const _ = require('underscore');
require('highcharts/modules/exporting')(Highcharts);

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


module.exports = class GenericTable {
    constructor(containerId, chartTitle, data, depth, legend) {
        // Sort in descending order and cluster by variable at specified depth
        const clustered_data = _.sortBy(this.clusterData(data, depth), function (o) {
            return o.y;
        }).reverse();
        let pieData;
        if (clustered_data.length > 10) {
            const top10 = clustered_data.slice(0, 10);
            const others = {
                name: 'Other',
                lineage: [],
                y: 0
            };
            _.each(clustered_data.slice(10, clustered_data.length), function (d) {
                others.y += d.y;
                if (others.lineage.indexOf(d.lineage[0]) === -1) {
                    others.lineage.push(d.lineage[0]);
                }
            });
            others.lineage = others.lineage.join(", ");
            top10.push(others);
            pieData = top10;
        } else {
            pieData = clustered_data;
        }


        const chartParams = {
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

        if (legend) {
            chartParams.legend = {
                title: {
                    text: 'Click to hide'
                },
                align: 'right',
                verticalAlign: 'top',
                layout: 'vertical',
            };
            chartParams.plotOptions.pie.showInLegend = true;
        }
        const chart = Highcharts.chart(containerId, chartParams);

        chart.clusteredData = clustered_data;

        return chart;
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