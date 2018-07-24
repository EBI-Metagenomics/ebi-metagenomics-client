const Backbone = require('backbone');
const _ = require('underscore');
const INTERPRO_URL = process.env.INTERPRO_URL;
const Commons = require('../commons');
const api = require('mgnify').api;
const util = require('../util');
const TaxonomyPieChart = require('../components/charts/taxonomy/taxonomyPie');
const TaxonomyColumnChart = require('../components/charts/taxonomy/taxonomyColumn');
const TaxonomyStackedColumnChart = require('../components/charts/taxonomy/taxonomyStackedColumn');
const ClientSideTable = require('../components/clientSideTable');

const QCChart = require('../components/charts/qc/qcChart');
const SeqLengthChart = require('../components/charts/qc/seqLengthHist');
const GCDispChart = require('../components/charts/qc/readsGCDisp');
const NucleotideChart = require('../components/charts/qc/nucleotideHist');
const SeqFeatChart = require('../components/charts/sequFeatSumChart');
const GoTermChart = require('../components/charts/goTermChart');
const DetailList = require('../components/detailList');

require('tablesorter');

const TAXONOMY_COLOURS = Commons.TAXONOMY_COLOURS;

const DEFAULT_PAGE_SIZE = 25;

util.setupPage('#browse-nav');

window.Foundation.addToJquery($);

let analysisID = util.getURLParameter();
util.specifyPageTitle('Analysis', analysisID);

let interproData = null;
let taxonomy = null;
let goTerm = null;

/**
 * Fetch data and render read length charts in QC tab
 * @param {string} analysisID Accession of analysis
 * @param {object} statsData Stats data associated with analysis
 */
function loadReadLengthDisp(analysisID, statsData) {
    const seqLengthData = new api.QcChartData({id: analysisID, type: 'seq-length'});
    seqLengthData.fetch({
        dataType: 'text',
        success(ignored, response) {
            try {
                SeqLengthChart.drawSequenceLengthHistogram('readsLengthHist', response, false,
                    statsData,
                    seqLengthData.url());
                SeqLengthChart.drawSequencesLength('readsLengthBarChart', statsData);
            } catch (e) {
                console.log('Could not load ReadLengthDisp data');
            }
        }
    });
}

/**
 * Fetch data and render GC length charts in QC tab
 * @param {string} analysisID Accession of analysis
 * @param {object} statsData Stats data associated with analysis
 */
function loadGCDistributionDisp(analysisID, statsData) {
    const gcDistributionData = new api.QcChartData({id: analysisID, type: 'gc-distribution'});
    gcDistributionData.fetch({
        dataType: 'text',
        success(ignored, response) {
            try {
                GCDispChart.drawSequenceGCDistribution('readsGCHist', response, false, statsData,
                    gcDistributionData.url());
                GCDispChart.drawGCContent('readsGCBarChart', statsData);
            } catch (e) {
                console.log('Could not load ReadsGCHist data');
            }
        }
    });
}

/**
 * Fetch data and render nucleotide position chart in QC tab
 * @param {string} analysisID Accession of analysis
 */
function loadNucleotideDisp(analysisID) {
    const nucleotideDistData = new api.QcChartData(
        {id: analysisID, type: 'nucleotide-distribution'});
    nucleotideDistData.fetch({
        dataType: 'text',
        success(ignored, response) {
            try {
                NucleotideChart.drawNucleotidePositionHistogram('nucleotide', response, false,
                    nucleotideDistData.url());
            } catch (e) {
                console.log('Could not load nucleotide position chart.');
            }
        }
    });
}

/**
 *
 * @param {string} analysisID ENA analysis primary accession
 */
function loadDownloads(analysisID) {
    let downloads = new api.AnalysisDownloads({id: analysisID});
    new DownloadView({model: downloads});
}

/**
 * Load taxonomy data and create graphs
 * @param {string} analysisID ENA analysis primary accession
 * @param {string} type of analysis (see API documentation for endpoint)
 * @param {integer} pipelineVersion
 */
function loadTaxonomy(analysisID, type, pipelineVersion) {
    taxonomy = new api.Taxonomy({id: analysisID, type: type});
    new TaxonomyGraphView({model: taxonomy}, pipelineVersion);
    loadKronaChart(analysisID, type);
}

/**
 * Load and displaycharts for selected view
 * @param {string} analysisID ENA analysis primary accession
 * @param {string} pipelineVersion
 */
function loadAnalysisData(analysisID, pipelineVersion) {
    interproData = new api.InterproIden({id: analysisID});
    new InterProSummary({model: interproData});

    let type = parseFloat(pipelineVersion) >= 4.0 ? '/ssu' : '';
    loadTaxonomy(analysisID, type, pipelineVersion);

    goTerm = new api.GoSlim({id: analysisID});
    new GoTermCharts({model: goTerm});
}

/**
 * Callback for taxonomy size selection in taxonomic analysis tab
 * @param {string} srcElem jQuery selector string of event source element
 * @param {number} pipelineVersion
 */
function onTaxonomySelect(srcElem, pipelineVersion) {
    const type = $(srcElem).val();
    loadTaxonomy(analysisID, type, pipelineVersion);
}

/**
 * Business logic to create table of info related to current analysis
 * @param {object} attr attributes from BackBone AnalysesView model
 * @return {{Study: string, Sample: string}}
 */
function constructDescriptionTable(attr) {
    let description = {
        'Study': '<a href=\'' + attr['study_url'] + '\'>' +
        attr['study_accession'] + '</a>',
        'Sample': '<a href=\'' + attr['sample_url'] + '\'>' +
        attr['sample_accession'] + '</a>'
    };

    if (attr['experiment_type'] === 'assembly') {
        attr['run_url'] = attr['run_url'].replace('runs', 'assemblies');
        description['Assembly'] = '<a href=\'' + attr['run_url'] + '\'>' +
            attr['run_accession'] + '</a>';
    } else {
        description['Run'] = '<a href=\'' + attr['run_url'] + '\'>' +
            attr['run_accession'] + '</a>';
    }

    description['Pipeline version'] = '<a href=\'' + attr.pipeline_url + '\'>' +
        attr.pipeline_version +
        '</a>';

    return description;
}

/**
 * Business logic to create table of data analysis info related to current analysis
 * @param {object} attr attributes from BackBone AnalysesView model
 * @return {{Experiment type: string, Instrument model: string, Instrument platform: string}}
 */
function constructDataAnalysisTable(attr) {
    const dataAnalysis = {};
    if (attr['experiment_type']) {
        dataAnalysis['Experiment type'] = attr['experiment_type'];
    }

    if (attr['instrument_model']) {
        dataAnalysis['Instrument model'] = attr['instrument_model'];
    }

    if (attr['instrument_platform']) {
        dataAnalysis['Instrument platform'] = attr['instrument_platform'];
    }
    return dataAnalysis;
}

let AnalysisView = Backbone.View.extend({
    model: api.Analysis,
    template: _.template($('#runTmpl').html()),
    el: '#main-content-area',
    initialize() {
        const that = this;
        this.model.fetch({
            data: {},
            success(data) {
                const attr = data.attributes;
                attr['displaySsuButtons'] = (attr.pipeline_version >= 4.0 &&
                    attr.experiment_type !== 'amplicon');

                if (attr['experiment_type'] === 'assembly') {
                    attr['run_url'] = attr['run_url'].replace('runs', 'assemblies');
                }
                that.render(attr.pipeline_version, function() {
                    $('#analysisSelect').val(attr['pipeline_version']);

                    let description = constructDescriptionTable(attr);
                    let dataAnalysis = constructDataAnalysisTable(attr);

                    const $overview = $('#overview');
                    $overview.append(new DetailList('Description', description));
                    if (Object.keys(dataAnalysis).length > 0) {
                        $overview.append(new DetailList('Experiment details', dataAnalysis));
                    }
                    util.attachExpandButtonCallback();

                    loadAnalysisData(analysisID, attr['pipeline_version']);
                    loadDownloads(analysisID, attr['pipeline_version']);

                    new SeqFeatChart('SeqFeat-chart', 'Sequence feature summary',
                        attr['analysis_summary']);

                    const statsData = new api.QcChartStats({id: analysisID});
                    statsData.fetch({
                        dataType: 'text',
                        success(model) {
                            new QCChart('QC-step-chart', attr['analysis_summary'],
                                model.attributes['sequence_count']);
                            if (attr['pipeline_version'] > 2) {
                                loadReadLengthDisp(analysisID, model.attributes);
                                loadGCDistributionDisp(analysisID, model.attributes);
                                loadNucleotideDisp(analysisID, model.attributes);
                            }
                        }
                    });

                    if (attr.experiment_type !== 'amplicon') {
                        enableTab('functional');
                        // QC charts
                    } else {
                        removeTab('functional');
                        if (window.location.hash.substr(1) === 'functional') {
                            util.changeTab($('#overview'));
                        }
                    }
                });
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve analysis: ' + analysisID);
            }
        });
    },
    render(pipelineVersion, callback) {
        this.$el.html(this.template(this.model.toJSON()));
        $('.rna-select-button').click(function() {
            onTaxonomySelect(this, pipelineVersion);
        });
        util.attachTabHandlers();
        callback();
        return this.$el;
    }
});

/**
 * Cluster data by depth
 * @param {[*]} data
 * @param {number} depth
 * @return {[*]}≈
 */
function clusterData(data, depth) {
    let clusteredData = {};
    _.each(data, function(d) {
        const attr = d.attributes;
        let lineage = attr.lineage.split(':');
        // Remove empty strings
        let category;
        if (lineage.length < depth) {
            category = lineage[lineage.length - 1];
        } else {
            category = lineage[depth];
        }

        if (depth > 0 &&
            ['', 'Bacteria', 'Eukaryota', 'other_sequences', undefined].indexOf(category) > -1) {
            if (lineage[0] === 'Bacteria') {
                category = 'Unassigned Bacteria';
            } else {
                category = 'Unassigned';
            }
        }

        let val = attr.count;
        if (clusteredData.hasOwnProperty(category)) {
            clusteredData[category]['v'] += val;
        } else {
            clusteredData[category] = {
                v: val,
                l: lineage
            };
        }
    });
    clusteredData = _.map(clusteredData, function(values, k) {
        return {
            name: k,
            y: values.v,
            lineage: values.l
        };
    });
    return clusteredData;
}

/**
 * Cluster and compact groups other than top 10 largest into an 'other' category
 * @param {[*]}data
 * @param {number} depth
 * @return {Array.<*>} array data summed by parameter depth
 */
function groupTaxonomyData(data, depth) {
    // _.each(clusteredData, function (o, i) {
    //     if (o.name === "undefined") {
    //         o.name = "Unassigned";
    //         o.lineage = ["Unassigned"];
    //     }
    // });
    return _.sortBy(clusterData(data, depth), function(o) {
        return o.y;
    }).reverse();
}

/**
 * Group all data after index n into single category
 * @param {[*]} clusteredData
 * @param {number} n index after which to group data
 * @return {[*]} grouped data
 */
function groupAfterN(clusteredData, n) {
    if (clusteredData.length > n) {
        const top10 = clusteredData.slice(0, n);
        const others = {
            name: 'Other',
            lineage: [],
            y: 0
        };
        _.each(clusteredData.slice(n, clusteredData.length), function(d) {
            others.y += d.y;
            if (others.lineage.indexOf(d.lineage[0]) === -1) {
                others.lineage.push(d.lineage[0]);
            }
        });
        others.lineage = others.lineage.join(', ');
        top10.push(others);
        clusteredData = top10;
    }
    return clusteredData;
}

/**
 * Converts series index to capped index, used to handle events
 * @param {number} index
 * @param {number} numSeries
 * @return {number}
 */
function getSeriesIndex(index, numSeries) {
    if (index >= numSeries - 1) {
        index = numSeries - 1;
    }
    return index;
}

/**
 * Create a display of the series color
 * @param {number} i index of series color
 * @return {string} display element
 */
function getColourSquareIcon(i) {
    const taxColor = Math.min(TAXONOMY_COLOURS.length - 1, i);
    return '<div class=\'puce-square-legend\' style=\'background-color: ' +
        Commons.TAXONOMY_COLOURS[taxColor] + '\'></div>';
}

/**
 * Enable toggling of series visibility, sync'd across table of series and chart
 * @param {jQuery.element} elem table row
 * @param {HighCharts.serie} series in chart
 * @param {integer} index index of serie in chart
 * @param {integer} numSeries total number of series
 * @param {boolean} defaultVisibility true if series should be visible by default
 */
function setTableRowAndChartHiding(elem, series, index, numSeries, defaultVisibility) {
    series.setVisible(defaultVisibility);
    if (index === numSeries - 1) {
        ($(elem).parent().children().slice(numSeries - 1)).toggleClass(
            'disabled-clickable');
    } else {
        $(elem).toggleClass('disabled-clickable');
    }
}

let TaxonomyGraphView = Backbone.View.extend({
    model: api.Taxonomy,
    initialize(model, pipelineVersion) {
        this.model.fetch().done(function(model) {
            const clusteredData = groupTaxonomyData(model, 0);
            const phylumDepth = parseFloat(pipelineVersion) >= 4 ? 2 : 1;
            const phylumData = groupTaxonomyData(model, phylumDepth);
            // Pie tab
            new TaxonomyPieChart('domain-composition-pie', 'Domain composition', clusteredData);
            const phylumPieChart = new TaxonomyPieChart('phylum-composition-pie',
                'Phylum composition', groupAfterN(phylumData, 10), true);

            const headers = [
                {sortBy: 'a', name: ''},
                {sortBy: 'a', name: 'Phylum'},
                {sortBy: 'a', name: 'Domain'},
                {sortBy: 'a', name: 'Unique OTUs'},
                {sortBy: 'a', name: '%'}
            ];
            const total = _.reduce(phylumData, function(m, d) {
                return m + d.y;
            }, 0);
            let i = 0;
            const data = _.map(phylumData, function(d) {
                const colorDiv = getColourSquareIcon(i);
                return [++i, colorDiv + d.name, d.lineage[0], d.y, (d.y * 100 / total).toFixed(2)];
            });
            const phylumPieTable = new ClientSideTable($('#pie').find('.phylum-table'), '', headers,
                DEFAULT_PAGE_SIZE);
            phylumPieTable.update(data, false, 1);

            const numSeries = phylumPieChart.series[0].data.length;
            phylumPieTable.$tbody.find('tr').hover(function() {
                let index = getSeriesIndex($(this).index(), numSeries);
                phylumPieChart.series[0].data[index].setState('hover');
            }, function() {
                let index = getSeriesIndex($(this).index(), numSeries);
                phylumPieChart.series[0].data[index].setState();
            });

            phylumPieTable.$tbody.find('tr').click(function() {
                let index = getSeriesIndex($(this).index(), numSeries);
                const series = phylumPieChart.series[0].data[index];
                setTableRowAndChartHiding(this, series, index, numSeries, !series.visible);
            });

            new TaxonomyColumnChart('domain-composition-column', 'Domain composition',
                clusteredData, false);
            const phylumColumnChart = new TaxonomyColumnChart('phylum-composition-column',
                'Phylum composition', phylumData, false);

            const phylumColumnTable = new ClientSideTable($('#column').find('.phylum-table'), '',
                headers, DEFAULT_PAGE_SIZE);
            phylumColumnTable.update(data, false, 1);
            phylumColumnTable.$tbody.find('tr').hover(function() {
                let index = getSeriesIndex($(this).index(), numSeries);
                phylumColumnChart.series[0].data[index].setState('hover');
            }, function() {
                let index = getSeriesIndex($(this).index(), numSeries);
                phylumColumnChart.series[0].data[index].setState();
            });

            phylumColumnTable.$tbody.find('tr').click(function() {
                let index = getSeriesIndex($(this).index(), numSeries);
                const series = phylumColumnChart.series[0].data[index];
                phylumColumnChart.series[0].data[index].visible = false;
                setTableRowAndChartHiding(this, series, index, numSeries, false);
            });

            const numSeriesPhylumColumn = phylumColumnChart.series[0].data.length;
            phylumColumnTable.$tbody.find('tr').hover(function() {
                let index = getSeriesIndex($(this).index(), numSeriesPhylumColumn);
                phylumColumnChart.series[0].data[index].setState('hover');
            }, function() {
                let index = getSeriesIndex($(this).index(), numSeriesPhylumColumn);
                phylumColumnChart.series[0].data[index].setState();
            });

            // Column tab
            const phylumStackedColumnChart = new TaxonomyStackedColumnChart(
                'phylum-composition-stacked-column', 'Phylum composition', phylumData, false);
            const phylumStackedColumnTable = new ClientSideTable(
                $('#stacked-column').find('.phylum-table'), '', headers, DEFAULT_PAGE_SIZE);
            phylumStackedColumnTable.update(data, false, 1);
            phylumStackedColumnTable.$tbody.find('tr').hover(function() {
                let index = getSeriesIndex($(this).index(), numSeries);
                phylumStackedColumnChart.series[index].data[0].setState('hover');
            }, function() {
                let index = getSeriesIndex($(this).index(), numSeries);
                phylumStackedColumnChart.series[index].data[0].setState();
            });
        });
    }
});

/**
 * Generate interpro link
 * @param {string} text to display in link tag
 * @param {string} id of interpro result
 * @return {string}
 */
function createInterProLink(text, id) {
    const url = INTERPRO_URL + 'entry/' + id;
    return '<a href=\'' + url + '\'>' + text + '</a>';
}

let InterProSummary = Backbone.View.extend({
    model: api.InterproIden,
    initialize() {
        this.model.fetch()
            .done(function(data) {
                let top10AndOthers = [];
                let totalCount = 0;

                data.forEach(function(d) {
                    d = d.attributes;
                    top10AndOthers.push({
                        name: d.description,
                        y: d.count
                    });
                    totalCount += d.count;
                });

                let sumOthers = 0;
                _.each(data.slice(10), function(d) {
                    sumOthers += d.attributes.count;
                });
                totalCount += sumOthers;
                const others = {
                    name: 'Other',
                    y: sumOthers
                };
                top10AndOthers = top10AndOthers.slice(0, 10);
                top10AndOthers.push(others);
                const chartOptions = {
                    plotOptions: {
                        pie: {
                            dataLabels: {
                                enabled: false
                            }
                        }
                    },
                    series: [
                        {
                            name: 'pCDS matched'
                        }]
                };
                const taxonomyPieChart = new TaxonomyPieChart('InterProPie-chart',
                    'InterPro matches summary', top10AndOthers, false, chartOptions);
                const tableData = [];
                let i = 0;
                data.forEach(function(d) {
                    d = d.attributes;
                    const colorDiv = getColourSquareIcon(i);
                    const interProLink = createInterProLink(d.description, d.accession);
                    tableData.push([
                        ++i,
                        colorDiv + interProLink,
                        d.accession,
                        d.count,
                        (d.count * 100 / totalCount).toFixed(2)]);
                });

                const headers = [
                    {sortBy: 'a', name: ''},
                    {sortBy: 'a', name: 'Entry name'},
                    {sortBy: 'a', name: 'ID'},
                    {sortBy: 'a', name: 'pCDS matched'},
                    {sortBy: 'a', name: '%'}
                ];
                const interproTable = new ClientSideTable($('#InterPro-table'), '', headers,
                    DEFAULT_PAGE_SIZE);
                interproTable.update(tableData, false, 1, data.length);

                const numSeries = taxonomyPieChart.series[0].data.length;
                interproTable.$tbody.find('tr').hover(function() {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    taxonomyPieChart.series[0].data[index].setState('hover');
                }, function() {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    taxonomyPieChart.series[0].data[index].setState();
                });

                interproTable.$tbody.find('tr').click(function() {
                    let index = getSeriesIndex($(this).index(), numSeries);
                    const series = taxonomyPieChart.series[0].data[index];
                    setTableRowAndChartHiding(this, series, index, numSeries, false);
                });
            });
    }
});

/**
 * Disable tab by id
 * @param {string} id of tab
 */
function removeTab(id) {
    $('[href=\'#' + id + '\']').parent('li').remove();
}

/**
 * Enable tab by id
 * @param {string} id of tab
 */
function enableTab(id) {
    $('[href=\'#' + id + '\']').parent('li').removeClass('disabled');
}

/**
 *  Compact groups other than top 10 largest into an 'other' category
 * @param {[*]} data
 * @return {*} data grouped into top 10 categories, and all following summed into 'Other'
 */
function groupGoTermData(data) {
    data = _.sortBy(data, function(o) {
        return o.attributes.count;
    }).reverse();
    let top10 = data.slice(0, 10).map(function(d) {
        d = d.attributes;
        return {
            name: d.description,
            y: d.count
        };
    });

    if (data.length > 10) {
        const others = {
            name: 'Other',
            y: 0
        };
        _.each(data.slice(10), function(d) {
            others.y += d.attributes.count;
        });
        top10.push(others);
        data = top10;
    }
    return data;
}

let GoTermCharts = Backbone.View.extend({
    model: api.GoSlim,
    initialize() {
        this.model.fetch({
            success(model) {
                const data = model.attributes.data;
                let bioProcessData = [];
                let molecularFuncData = [];
                let cellularComponentData = [];
                data.forEach(function(d) {
                    switch (d.attributes.lineage) {
                        case 'biological_process':
                            bioProcessData.push(d);
                            break;
                        case 'molecular_function':
                            molecularFuncData.push(d);
                            break;
                        case 'cellular_component':
                            cellularComponentData.push(d);
                            break;
                        default:
                            console.warn('Unknown lineage: ' + d.attributes.lineage);
                    }
                });
                new GoTermChart('biological-process-bar-chart', 'Biological process',
                    bioProcessData, Commons.TAXONOMY_COLOURS[0]);
                new GoTermChart('molecular-function-bar-chart', 'Molecular function',
                    molecularFuncData, Commons.TAXONOMY_COLOURS[1]);
                new GoTermChart('cellular-component-bar-chart', 'Cellular component',
                    cellularComponentData, Commons.TAXONOMY_COLOURS[2]);

                new TaxonomyPieChart('biological-process-pie-chart', 'Biological process',
                    groupGoTermData(bioProcessData), true,
                    {plotOptions: {pie: {dataLabels: {enabled: false}}}});
                new TaxonomyPieChart('molecular-function-pie-chart', 'Molecular function',
                    groupGoTermData(molecularFuncData), true,
                    {plotOptions: {pie: {dataLabels: {enabled: false}}}});
                new TaxonomyPieChart('cellular-component-pie-chart', 'Cellular component',
                    groupGoTermData(cellularComponentData), true,
                    {plotOptions: {pie: {dataLabels: {enabled: false}}}});

                $('#go-bar-btn').click(function() {
                    $('#go-slim-pie-charts').hide();
                    $('#go-slim-bar-charts').show();
                });
                $('#go-pie-btn').click(function() {
                    $('#go-slim-pie-charts').show();
                    $('#go-slim-bar-charts').hide();
                });
            }
        });
    }
});

/**
 * Display abundance tab if data exists to populate it
 * @param {[*]} statisticsData
 */
function setAbundanceTab(statisticsData) {
    if (statisticsData !== undefined) {
        const download = _.filter(statisticsData, function(entry) {
            return entry.attributes.description.label === 'Taxa abundance distribution';
        });
        if (download.length > 0) {
            $('#abundance-chart').attr('src', download[0].links.self);
            $.get({
                url: download[0].links.self,
                success(svg) {
                    $('#abundance-disp').html(svg);
                }
            });
            enableTab('abundance');
            return;
        }
    }
    removeTab('abundance');
    if (window.location.hash.substr(1) === 'abundance') {
        util.changeTab($('#overview'));
    }
}

let DownloadView = Backbone.View.extend({
    model: api.RunDownloads,
    template: _.template($('#downloadsTmpl').html()),
    el: '#download-list',
    initialize() {
        const that = this;
        this.model.fetch({
            data: $.param({page_size: 250}),
            success(response) {
                setAbundanceTab(response.attributes.downloadGroups['Statistics']);
                that.$el.html(that.template({groups: response.attributes.downloadGroups}));
            }
        });
    }
});

/**
 * Load krona chart for current view
 * @param {string} analysisID ENA primary accession for analysis
 * @param {string} type subunit type (for pipeline version 4.0 and above) ("ssu" or "lsu")
 */
function loadKronaChart(analysisID, type) {
    const kronaUrl = api.getKronaURL(analysisID, type);
    const kronaChart = '<object class="krona_chart" ' +
        'data="' + kronaUrl + '" ' +
        'type="text/html"></object>';
    $('#krona').html(kronaChart);
// <object class="krona_chart"
//     data="<%= kronaUrl %>"
//     type="text/html"></object>
}

let analysis = new api.Analysis({id: analysisID});
new AnalysisView({model: analysis});


