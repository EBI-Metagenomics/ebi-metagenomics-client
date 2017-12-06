const Backbone = require('backbone');
const _ = require('underscore');
const util = require('../util');
const Config = require('config');
const Commons = require('../commons');
const api = require('../components/api');
const TaxonomyPieChart = require('../components/taxonomy/taxonomyPie');
const TaxonomyColumnChart = require('../components/taxonomy/taxonomyColumn');
const TaxonomyStackedColumnChart = require('../components/taxonomy/taxonomyStackedColumn');
const ClientSideTable = require('../components/clientSideTable');

require('tablesorter');
import {attachTabHandlers, getURLParameter, setCurrentTab} from "../util";

let Highcharts = require('highcharts');


const TAXONOMY_COLOURS = Commons.TAXONOMY_COLOURS;

setCurrentTab('#samples-nav');

let run_id = getURLParameter();

let analysis = null;
let metadata = null;
let taxonomy = null;
let qcChart = null;

let RunView = Backbone.View.extend({
    model: api.Run,
    template: _.template($("#runTmpl").html()),
    el: '#main-content-area',
    initialize: function () {
        const that = this;
        this.model.fetch({
            data: {},
            success: function (data) {
                let version = data.attributes.pipeline_versions[0];
                analysis = new api.Analysis({id: run_id, version: version});
                metadata = new api.AnalysisMetadata({id: run_id, version: version});
                taxonomy = new api.Taxonomy({id: run_id, version: version});
                that.render(function () {
                    // let qcGraph = new QCGraphView({model: metadata});
                    let taxonomyGraph = new TaxonomyGraphView({model: taxonomy});
                });
            }
        });
    },
    render: function (callback) {
        this.$el.html(this.template(this.model.toJSON()));
        attachTabHandlers();
        callback();
        return this.$el;
    }
});

let QCGraphView = Backbone.View.extend({
    model: api.AnalysisMetadata,
    initialize: function () {
        this.model.fetch({
            success: function (model) {
                let data = {};
                model.attributes.data.map(function (e) {
                    const attr = e.attributes;
                    data[attr['let-name']] = attr['let-value'];
                });
                let remaining = [0, 0, 0, 0, 0];
                let filtered = [0, 0, 0, 0, 0];
                let post_sample = [0, 0, 0, 0, 0];
                remaining[0] = parseInt(data['Submitted nucleotide sequences']);
                remaining[1] = parseInt(data['Nucleotide sequences after format-specific filtering']);
                remaining[2] = parseInt(data['Nucleotide sequences after length filtering']);
                remaining[3] = parseInt(data['Nucleotide sequences after undetermined bases filtering']);
                filtered[2] = remaining[1] - remaining[2];
                qcChart = Highcharts.chart('QC-step-chart', {
                    chart: {
                        type: 'bar'
                    },
                    title: {
                        text: 'Number of sequence reads per QC step'
                    },
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Count'
                        }
                    },
                    xAxis: {
                        categories: ['Initial reads', 'Trimming', 'Length filtering', 'Ambiguous base filtering', 'Reads subsampled for QC analysis']
                    },
                    plotOptions: {
                        series: {
                            stacking: 'normal'
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    series: [
                        {
                            name: 'Reads filtered out',
                            data: filtered,
                            color: '#CCCCD3'
                        }, {
                            //     name: 'Reads after sampling',
                            //     data: post_sample,
                            //     color: '#8DC7C7'
                            // }, {
                            name: 'Reads remaining',
                            data: remaining,
                            color: '#058DC7',
                        }]
                });
            }
        });
    }
});

// Cluster and compact groups other than top 10 largest into an 'other' category
function groupTaxonomyData(data, depth) {
    let clusteredData = _.sortBy(clusterData(data, depth), function (o) {
        return o.y;
    }).reverse();
    if (clusteredData.length > 10) {
        const top10 = clusteredData.slice(0, 10);
        const others = {
            name: 'Other',
            lineage: [],
            y: 0
        };
        _.each(clusteredData.slice(10, clusteredData.length), function (d) {
            others.y += d.y;
            if (others.lineage.indexOf(d.lineage[0]) === -1) {
                others.lineage.push(d.lineage[0]);
            }
        });
        others.lineage = others.lineage.join(", ");
        top10.push(others);
        clusteredData = top10;
    }
    return clusteredData
}

// Cluster data by depth
function clusterData(data, depth) {
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

let TaxonomyGraphView = Backbone.View.extend({
    model: api.Taxonomy,
    initialize: function () {
        this.model.fetch({
            success: function (model) {

                const clusteredData = groupTaxonomyData(model.attributes.data, 0);
                const phylumData = groupTaxonomyData(model.attributes.data, 1);

                // Pie tab
                new TaxonomyPieChart('domain-composition-pie', 'Domain composition', clusteredData);
                const phylumPieChart = new TaxonomyPieChart('phylum-composition-pie', 'Phylum composition', phylumData, true);

                const headers = [
                    {sortBy: 'a', name: ''},
                    {sortBy: 'a', name: 'Phylum'},
                    {sortBy: 'a', name: 'Domain'},
                    {sortBy: 'a', name: 'Unique OTUs'},
                    {sortBy: 'a', name: '%'},
                ];
                const total = _.reduce(phylumData, function (m, d) {
                    return m + d.y;
                }, 0);
                let i = 0;
                const data = _.map(phylumData, function (d) {
                    const taxColor = Math.min(TAXONOMY_COLOURS.length - 1, i);
                    const colorDiv = "<div class='puce-square-legend' style='background-color: " + Commons.TAXONOMY_COLOURS[taxColor] + "'></div>";
                    return [++i, colorDiv + d.name, d.lineage[0], d.y, (d.y * 100 / total).toFixed(2)]
                });
                const phylumPieTable = new ClientSideTable($('#pie').find(".phylum-table"), '', headers);
                phylumPieTable.update(data, false, 1, data.length);
                phylumPieTable.$table.tablesorter({});

                const numSeries = phylumPieChart.series[0].data.length;
                phylumPieTable.$tbody.find('tr').hover(function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumPieChart.series[0].data[index].setState('hover');
                }, function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumPieChart.series[0].data[index].setState();
                });

                phylumPieTable.$tbody.find('tr').click(function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    const series = phylumPieChart.series[0].data[index];
                    series.setVisible(!series.visible);
                    if (index === numSeries - 1) {
                        ($(this).parent().children().slice(numSeries - 1)).toggleClass('disabled');
                    } else {
                        $(this).toggleClass('disabled');
                    }
                });

                new TaxonomyColumnChart('domain-composition-column', 'Domain composition', clusteredData, false);
                const phylumColumnChart = new TaxonomyColumnChart('phylum-composition-column', 'Phylum composition', phylumData, false);
                const phylumColumnTable = new ClientSideTable($('#column').find(".phylum-table"), '', headers);
                phylumColumnTable.update(data, false, 1, data.length);
                phylumColumnTable.$table.tablesorter({});
                phylumColumnTable.$tbody.find('tr').hover(function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumColumnChart.series[0].data[index].setState('hover');
                }, function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumColumnChart.series[0].data[index].setState();
                });

                // phylumColumnTable.$tbody.find('tr').click(function () {
                //     let index = getSeriesIndex($(this).index(), numSeries);
                //     const series = phylumColumnChart.series[0].data[index];
                //     series.setVisible(!series.visible);
                //     if (index === numSeries - 1) {
                //         ($(this).parent().children().slice(numSeries - 1)).toggleClass('disabled');
                //     } else {
                //         $(this).toggleClass('disabled');
                //     }
                // });


                // Column tab
                const phylumStackedColumnChart = new TaxonomyStackedColumnChart('phylum-composition-stacked-column', 'Phylum composition', phylumData, false);
                const phylumStackedColumnTable = new ClientSideTable($('#stacked-column').find(".phylum-table"), '', headers);
                phylumStackedColumnTable.update(data, false, 1, data.length);
                phylumStackedColumnTable.$table.tablesorter({});
                phylumStackedColumnTable.$tbody.find('tr').hover(function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumStackedColumnChart.series[index].data[0].setState('hover');
                }, function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumStackedColumnChart.series[index].data[0].setState();
                });

                // phylumStackedColumnTable.$tbody.find('tr').click(function () {
                //     let index = getSeriesIndex($(this).index(), numSeries);
                //     const series = phylumStackedColumnChart.series[0].data[index];
                //     console.log(phylumColumnChart.series);
                //
                //     series.setVisible(!series.visible);
                //     if (index === numSeries - 1) {
                //         ($(this).parent().children().slice(numSeries - 1)).toggleClass('disabled');
                //     } else {
                //         $(this).toggleClass('disabled');
                //     }
                // });

            }
        });
    }
});

function getSeriesIndex(index, numSeries) {
    if (index >= numSeries - 1) {
        index = numSeries - 1;
    }
    return index
}

$(document).ready(function () {
    // TODO Handle change of analysis
    $("#analysisSelect").change(function (e) {
        // console.log(this);
        // console.log(e);
    });
});

let run = new api.Run({id: run_id});
let runView = new RunView({model: run});
