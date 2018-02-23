const Backbone = require('backbone');
const _ = require('underscore');
const INTERPRO_URL = process.env.INTERPRO_URL;
const Commons = require('../commons');
const api = require('../components/api');
const TaxonomyPieChart = require('../components/charts/taxonomy/taxonomyPie');
const TaxonomyColumnChart = require('../components/charts/taxonomy/taxonomyColumn');
const TaxonomyStackedColumnChart = require('../components/charts/taxonomy/taxonomyStackedColumn');
const ClientSideTable = require('../components/clientSideTable');

const QCChart = require('../components/charts/qcChart');
const GoTermChart = require('../components/charts/goTermChart');
const SeqFeatChart = require('../components/charts/sequFeatSumChart');

const detailList = require('../components/detailList');

require('tablesorter');

import {attachTabHandlers, getURLParameter, setCurrentTab, checkAPIonline, tabDeepLink} from "../util";

checkAPIonline();

const TAXONOMY_COLOURS = Commons.TAXONOMY_COLOURS;

setCurrentTab('#samples-nav');

window.Foundation.addToJquery($);


let run_id = getURLParameter();

let analysis = null;
let interproData = null;
let taxonomy = null;
let goTerm = null;

let RunView = Backbone.View.extend({
    model: api.Run,
    template: _.template($("#runTmpl").html()),
    el: '#main-content-area',
    initialize: function () {
        const that = this;
        this.model.fetch({
            data: {},
            success: function (data) {
                const attr = data.attributes;
                let version = attr.pipeline_versions[0];

                that.render(function () {
                    let description = {
                        Study: "<a href='" + attr.study_url + "'>" + attr.study_id + "</a>",
                        Sample: "<a href='" + attr.sample_url + "'>" + attr.sample_id + "</a>",
                    };
                    const dataAnalysis = {};
                    if (attr['experiment_type']) {
                        dataAnalysis['Experiment type'] = attr['experiment_type']
                    }

                    if (attr['instrument_model']) {
                        dataAnalysis['Instrument model'] = attr['instrument_model']
                    }

                    if (attr['instrument_platform']) {
                        dataAnalysis['Instrument platform'] = attr['instrument_platform']
                    }

                    $('#overview').append(new detailList('Description', description));
                    if (Object.keys(dataAnalysis).length > 0) {
                        $('#overview').append(new detailList('Data analysis', dataAnalysis));
                    }
                    loadAnalysisData(run_id, version);

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
    initialize: function (attr) {
        const data = {};
        attr['analysis_summary'].forEach(function (e) {
            data[e.key] = e.value;
        });
        const qcChart = new QCChart('QC-step-chart', 'Number of sequence reads per QC step', data);
        const seqFeatChart = new SeqFeatChart('SeqFeat-chart', 'Sequence feature summary', data);
    }
});

// Cluster and compact groups other than top 10 largest into an 'other' category
function groupTaxonomyData(data, depth) {
    let clusteredData = _.sortBy(clusterData(data, depth), function (o) {
        return o.y;
    }).reverse();
    _.each(clusteredData, function(o, i){
        if(o.name==="undefined"){
            o.name = "Unassigned";
            o.lineage = ["Unassigned"];
        }
    });
    // if (clusteredData.length > 10) {
    //     const top10 = clusteredData.slice(0, 10);
    //     const others = {
    //         name: 'Other',
    //         lineage: [],
    //         y: 0
    //     };
    //     _.each(clusteredData.slice(10, clusteredData.length), function (d) {
    //         others.y += d.y;
    //         if (others.lineage.indexOf(d.lineage[0]) === -1) {
    //             others.lineage.push(d.lineage[0]);
    //         }
    //     });
    //     others.lineage = others.lineage.join(", ");
    //     top10.push(others);
    //     clusteredData = top10;
    // }
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
                    const colorDiv = getColourSquareIcon(i);
                    return [++i, colorDiv + d.name, d.lineage[0], d.y, (d.y * 100 / total).toFixed(2)]
                });
                const phylumPieTable = new ClientSideTable($('#pie').find(".phylum-table"), '', headers);
                phylumPieTable.update(data, false, 1);

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
                phylumColumnTable.update(data, false, 1);
                phylumColumnTable.$tbody.find('tr').hover(function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumColumnChart.series[0].data[index].setState('hover');
                }, function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumColumnChart.series[0].data[index].setState();
                });


                // Column tab
                const phylumStackedColumnChart = new TaxonomyStackedColumnChart('phylum-composition-stacked-column', 'Phylum composition', phylumData, false);
                const phylumStackedColumnTable = new ClientSideTable($('#stacked-column').find(".phylum-table"), '', headers);
                phylumStackedColumnTable.update(data, false, 1);
                phylumStackedColumnTable.$tbody.find('tr').hover(function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumStackedColumnChart.series[index].data[0].setState('hover');
                }, function () {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    phylumStackedColumnChart.series[index].data[0].setState();
                });

            }
        });
    }
});

let InterProSummary = Backbone.View.extend({
    model: api.InterproIden,
    initialize: function () {
        this.model.fetch({
            data: $.param({page_size: 7000}),
            success: function (model) {
                const data = model.attributes.data;
                let top10AndOthers = [];
                let totalCount = 0;

                data.forEach(function (d) {
                    d = d.attributes;
                    top10AndOthers.push({
                        name: d.description,
                        y: d.count
                    });
                    totalCount += d.count;
                });
                let sumOthers = 0;
                _.each(data.slice(10), function (d) {
                    sumOthers += d.attributes.count;
                });
                totalCount += sumOthers;
                const others = {
                    name: 'Other',
                    y: sumOthers
                };
                top10AndOthers.push(others);
                const chartOptions = {
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: false
                            }
                        }
                    },
                    series: [{
                        name: 'pCDS matched'
                    }]
                };
                new TaxonomyPieChart('InterProPie-chart', 'InterPro matches summary', top10AndOthers, false, chartOptions);
                const tableData = [];
                let i = 0;
                data.forEach(function (d) {
                    d = d.attributes;
                    const colorDiv = getColourSquareIcon(i);
                    const interProLink = createInterProLink(d.description, d.accession);
                    tableData.push([++i, colorDiv + interProLink, d.accession, d.count, (d.count * 100 / totalCount).toFixed(2)])
                });

                const headers = [{sortBy: 'a', name: ''},
                    {sortBy: 'a', name: 'Entry name'},
                    {sortBy: 'a', name: 'ID'},
                    {sortBy: 'a', name: 'pCDS matched'},
                    {sortBy: 'a', name: '%'}
                ];
                const interproTable = new ClientSideTable($('#InterPro-table'), '', headers);
                interproTable.update(tableData, false, 1, data.length);
            }
        })
    }
});

function getTotalGoTermCount(array){
    let sum = 0;
    _.each(array, function(e){
        sum+= e.attributes.count;
    });
    return sum
}

let GoTermCharts = Backbone.View.extend({
    model: api.GoSlim,
    initialize: function () {
        this.model.fetch({
            success: function (model) {
                const data = model.attributes.data;

                if (getTotalGoTermCount(data) === 0) {
                    disableTab('functional');
                    return;
                }
                let biological_process_data = [];
                let molecular_function_data = [];
                let cellular_component_data = [];
                data.forEach(function (d) {
                    switch (d.attributes.lineage) {
                        case 'biological_process':
                            biological_process_data.push(d);
                            break;
                        case 'molecular_function':
                            molecular_function_data.push(d);
                            break;
                        case 'cellular_component':
                            cellular_component_data.push(d);
                            break;
                    }
                });
                new GoTermChart('biological-process-bar-chart', 'Biological process', biological_process_data, Commons.TAXONOMY_COLOURS[0]);
                new GoTermChart('molecular-function-bar-chart', 'Molecular function', molecular_function_data, Commons.TAXONOMY_COLOURS[1]);
                new GoTermChart('cellular-component-bar-chart', 'Cellular component', cellular_component_data, Commons.TAXONOMY_COLOURS[2]);

                new TaxonomyPieChart('biological-process-pie-chart', 'Biological process', groupGoTermData(biological_process_data), true, {plotOptions: {pie: {dataLabels: {enabled: false}}}});
                new TaxonomyPieChart('molecular-function-pie-chart', 'Molecular function', groupGoTermData(molecular_function_data), true, {plotOptions: {pie: {dataLabels: {enabled: false}}}});
                new TaxonomyPieChart('cellular-component-pie-chart', 'Cellular component', groupGoTermData(cellular_component_data), true, {plotOptions: {pie: {dataLabels: {enabled: false}}}});


                $('#go-bar-btn').click(function () {
                    $('#go-slim-pie-charts').hide();
                    $('#go-slim-bar-charts').show();
                });
                $('#go-pie-btn').click(function () {
                    $('#go-slim-pie-charts').show();
                    $('#go-slim-bar-charts').hide();
                });
            }
        });
    }
});


let DownloadView = Backbone.View.extend({
    template: _.template($("#download-tmpl").html()),
    el: '#download-list',
    initialize: function (data) {
        //    TODO implement downloads
        data = {
            groups: [
                {
                    group_name: "Name",
                    entries: [
                        {
                            name: "Submitted nucleotide reads",
                            type: 'DNA/RNA data type',
                            compression: 'GZIP',
                            format: 'FASTA',
                            link: 'link'
                        }
                    ]
                }, {
                    group_name: "Name2",
                    entries: [
                        {
                            name: "Submitted nucleotide reads",
                            type: 'DNA/RNA data type',
                            compression: 'GZIP',
                            format: 'FASTA',
                            link: 'link'
                        }
                    ]
                }
            ]
        };
        this.$el.html(this.template(data));
    }
});


// Compact groups other than top 10 largest into an 'other' category
function groupGoTermData(data) {
    let top10 = data.slice(0, 10).map(function (d) {
        d = d.attributes;
        return {
            name: d.description,
            y: d.count
        }
    });
    if (data.length > 10) {
        const others = {
            name: 'Other',
            y: 0
        };
        _.each(data.slice(10), function (d) {
            others.y += d.attributes.count;
        });
        top10.push(others);
        data = top10;
    }
    return data
}

function getSeriesIndex(index, numSeries) {
    if (index >= numSeries - 1) {
        index = numSeries - 1;
    }
    return index
}

function createInterProLink(text, id) {
    const url = INTERPRO_URL + 'entry/' + id;
    return "<a href='" + url + "'>" + text + "</a>"
}


function getColourSquareIcon(i) {
    const taxColor = Math.min(TAXONOMY_COLOURS.length - 1, i);
    return "<div class='puce-square-legend' style='background-color: " + Commons.TAXONOMY_COLOURS[taxColor] + "'></div>";
}

function disableTab(id) {
    $("[href='#" + id + "']").parent('li').addClass('disabled');
}

function loadKronaChart(run_id, pipeline_version) {
    const krona_url = api.getKronaURL(run_id, pipeline_version);
    // $.ajax({
    //     url: krona_url,
    //     success: function (e) {
    //         const frame = $("<object></object>");
    //         frame.append(e);
    //         $('#krona').append(frame);
    //     }
    // });
    const krona_chart = "<object class=\"krona_chart\"\n" +
        "data=\"" + krona_url + "\" " +
        "type=\"text/html\"></object>";
    $('#krona').append(krona_chart);
// <object class="krona_chart"
//     data="<%= krona_url %>"
//     type="text/html"></object>
}


function loadAnalysisData(run_id, pipeline_version) {
    loadKronaChart(runView.model.attributes.run_id, pipeline_version);

    analysis = new api.Analysis({id: run_id, version: pipeline_version});
    analysis.fetch({
        success: function (model) {
            const attr = model.attributes;
            let qcGraph = new QCGraphView(attr);
            let downloadView = new DownloadView(attr.download)
        }
    });

    interproData = new api.InterproIden({id: run_id, version: pipeline_version});
    let interProSummary = new InterProSummary({model: interproData});

    taxonomy = new api.Taxonomy({id: run_id, version: pipeline_version});
    let taxonomyGraph = new TaxonomyGraphView({model: taxonomy});

    goTerm = new api.GoSlim({id: run_id, version: pipeline_version});
    let goTermCharts = new GoTermCharts({model: goTerm});
}

function onAnalysisSelect() {
    loadAnalysisData(runView.model.attributes.run_id, $(this).val());
}

$(document).ready(function () {
    // TODO Handle change of analysis
    $("#analysisSelect").change(onAnalysisSelect);
});

let run = new api.Run({id: run_id});
let runView = new RunView({model: run});
