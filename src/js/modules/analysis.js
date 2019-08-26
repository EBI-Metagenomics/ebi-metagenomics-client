const Backbone = require('backbone');
const _ = require('underscore');
const Commons = require('../commons');
const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;
const util = require('../util');
const ClientSideTable = require('../components/clientSideTable');
const DetailList = require('../components/detailList');
const igv = require('igv').default;

require('tablesorter');
require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/css');

const INTERPRO_URL = process.env.INTERPRO_URL;
const TAXONOMY_COLOURS = Commons.TAXONOMY_COLOURS;
const DEFAULT_PAGE_SIZE = 25;

util.setupPage('#browse-nav');
window.Foundation.addToJquery($);

const analysisID = util.getURLParameter(); // MGYA00141542
util.specifyPageTitle('Analysis', analysisID);


/* Assembly Viewer */
let AnalysesContig = Backbone.Model.extend({
    parse(data) {
        return {
            display_name: data.attributes['display-name'],
            contig_name: data.attributes['contig-name'],
            length: data.attributes.length,
            coverage: data.attributes.coverage
        };
    }
});

let ContigCollection = Backbone.Collection.extend({
    model: AnalysesContig,
    initialize(options) {
        this.accession = options.accession;
    },
    url() {
        return process.env.API_URL + 'analyses/' + this.accession + '/contigs';
    },
    parse(response) {
        return response.data;
    }
});

let ContigsView = Backbone.View.extend({

    el: $('#contigs-containter'),

    events: {
        'click .contig-browser': 'contigViewer',
        'click #filter': 'render'
    },

    initialize() {
        const that = this;
        this.$igvDiv = $('#genome-browser');
        this.$gbLoading = $('#gb-loading');
        this.$tblLoading = $('#table-loading');
        this.$popoverTemplate = _.template($('#igv-popup-template').html());
        /* Slider */
        this.$maxLen = $('#max-length');
        this.$minLen = $('#min-length');
        this.$lenSlider = this.$el.find('.slider').slider({
            range: true,
            min: 1000,
            max: 100000,
            values: [10000, 100000],
            change: (event, ui) => {
                that.$maxLen.val(ui.values[1]);
                that.$minLen.val(ui.values[0]);
            }
        });
        /* Features filters */
        this.$cog = $('#cog-filter');
        this.$kegg = $('#kegg-filter');
        this.$taxonomtFilter = $('#taxonomy-filter');

        const tableOptions = {
            tableContainer: 'contigs-table',
            headers: [
                {sortBy: 'a', name: 'Name'},
                {sortBy: 'a', name: 'Length (pb)'},
                {sortBy: 'a', name: 'Coverage'}
            ],
            initPageSize: DEFAULT_PAGE_SIZE,
            textFilter: true
        };
        this.$contigsTable = new ClientSideTable($('#contigs-table'), tableOptions);
    },

    /**
     * Refresh the table data.
     * @return {Deferred} Deferred promise
     */
    refreshTable() {
        const that = this;
        const deferred = $.Deferred();
        this.collection.fetch({
            data: {
                gt: this.$minLen.val(),
                lt: this.$maxLen.val(),
                cog: this.$cog.val(),
                kegg: this.$kegg.val(),
                taxonomy: this.$taxonomtFilter.val()
            },
            success() {
                const data = _.reduce(that.collection.models, (arr, model) => {
                    arr.push([
                        '<a href="#" class="contig-browser" data-name="' +
                            model.attributes.contig_name +
                        '">' +
                            model.attributes.display_name +
                        '</a>',
                        model.attributes.length,
                        model.attributes.coverage
                    ]);
                    return arr;
                }, []);
                deferred.resolve(data);
            },
            error(error) {
                // TODO HANDLE error
                console.log(error);
                deferred.reject();
            }
        });
        return deferred.promise();
    },
    /**
     * Render
     * @param {bool} viewFirst Load the first contig of the table
     */
    render(viewFirst) {
        const that = this;
        this.$tblLoading.show();
        that.refreshTable().then((data) => {
            that.$contigsTable.update(data, true, 1);
            if (viewFirst) {
                $('.contig-browser').first().trigger('click');
            }
        }).catch((err) => {
            // TODO HANDLE error
            console.log('Error loading the contigs:' + err);
        }).always(() => {
            this.$tblLoading.hide();
        });
    },

    /**
     * View a contig using IGV.
     * @param {Event} e the event
     */
    contigViewer(e) {
        e.preventDefault();
        const that = this;

        const contigName = $(e.target).data('name');
        const displayName = $(e.target).val();
        let options = {
            showChromosomeWidget: false,
            showTrackLabelButton: false,
            showTrackLabels: false,
            showCenterGuide: false,
            reference: {
                indexed: false,
                fastaURL: process.env.API_URL + 'analyses/' + this.collection.accession + 
                          '/contigs/' + contigName
            },
            tracks: [{
                name: displayName,
                type: 'annotation',
                format: 'gff3',
                url: process.env.API_URL + 'analyses/' + this.collection.accession +
                     '/annotations/' + contigName,
                displayMode: 'EXPANDED',
                nameField: 'gene'
            }],
            ebi: {
                colorAttributes: [
                    'Colour', /* Label */
                    'COG',
                    'product',
                    'Pfam',
                    'KEGG',
                    'InterPro',
                    'eggNOG'
                ],
                showLegendButton: true
            }
        };

        this.$gbLoading.show();

        if (this.igvBrowser) {
            igv.removeBrowser(this.igvBrowser);
        }

        igv.createBrowser(this.$igvDiv, options).then((browser) => {
            // Customize the track Pop Over
            browser.on('trackclick', (ignored, data) => {
                if (!data || !data.length) {
                    return false;
                }

                let attributes = _.where(data, (d) => {
                    return d.name;
                });

                if (attributes.length === 0) {
                    return false;
                }

                // By returning a string from the trackclick handler
                // we're asking IGV to use our custom HTML in its pop-over.
                const markup = this.$popoverTemplate({attributes: attributes});
                return markup;
            });
            this.igvBrowser = browser;
            this.$gbLoading.hide();
        }).catch((error) => {
            // TODO: Handle
            console.error(error);
            that.igvBrowser = undefined;
            that.$gbLoading.hide();
            // FIXME: clean the browser
        });
    }
});

/**
 * Fetch data and render nucleotide position chart in QC tab
 * @param {string} analysisID Accession of analysis
 * @return {object}
 */
function loadNucleotideDisp(analysisID) {
    return new charts.NucleotideHist('nucleotide', {accession: analysisID});
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
 * @param {HighCharts.series} series in chart
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
}

/**
 * Load taxonomy data and create graphs
 * @param {string} analysisID ENA analysis primary accession
 * @param {string} subunitType of analysis (see API documentation for endpoint)
 * @return {jQuery.Promise} taxonomy backbone model
 */
function loadTaxonomy(analysisID, subunitType) {
    loadKronaChart(analysisID, subunitType);

    // Load pie charts
    const domainPie = new charts.TaxonomyPie('domain-composition-pie',
        {accession: analysisID, type: subunitType},
        {title: 'Domain composition', seriesName: 'reads', subtitle: false}
    );
    const phylumPie = new charts.TaxonomyPie('phylum-composition-pie',
        {accession: analysisID, type: subunitType, groupingDepth: 2},
        {title: 'Phylum composition', seriesName: 'reads', legend: true}
    );

    phylumPie.loaded.done(() => {
        const headers = [
            {sortBy: 'a', name: ''},
            {sortBy: 'a', name: 'Phylum'},
            {sortBy: 'a', name: 'Domain'},
            {sortBy: 'a', name: 'Unique OTUs'},
            {sortBy: 'a', name: '%'}
        ];
        const total = _.reduce(phylumPie.clusteredData, function(m, d) {
            return m + d.y;
        }, 0);
        let i = 0;
        const data = _.map(phylumPie.clusteredData, function(d) {
            const colorDiv = getColourSquareIcon(i);
            return [++i, colorDiv + d.name, d.lineage[0], d.y, (d.y * 100 / total).toFixed(2)];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE
        };
        const phylumPieTable = new ClientSideTable($('#pie').find('.phylum-table'), options);
        phylumPieTable.update(data, false, 1);

        const numSeries = phylumPie.chart.series[0].data.length;
        phylumPieTable.$tbody.find('tr').hover(function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            phylumPie.chart.series[0].data[index].setState('hover');
        }, function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            phylumPie.chart.series[0].data[index].setState();
        });
        phylumPieTable.$tbody.find('tr').click(function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            const series = phylumPie.chart.series[0].data[index];
            setTableRowAndChartHiding(this, series, index, numSeries, !series.visible);
        });
    });

    // Load column charts
    const domainColumn = new charts.TaxonomyColumn('domain-composition-column',
        {accession: analysisID, type: subunitType},
        {title: 'Domain composition', seriesName: 'reads', subtitle: false});
    const phylumColumn = new charts.TaxonomyColumn('phylum-composition-column',
        {accession: analysisID, type: subunitType, groupingDepth: 2},
        {title: 'Phylum composition (top 10)', seriesName: 'reads', numColumns: 10}
    );

    phylumColumn.loaded.done(() => {
        const headers = [
            {sortBy: 'a', name: ''},
            {sortBy: 'a', name: 'Phylum'},
            {sortBy: 'a', name: 'Domain'},
            {sortBy: 'a', name: 'Unique OTUs'},
            {sortBy: 'a', name: '%'}
        ];
        const total = _.reduce(phylumColumn.clusteredData, function(m, d) {
            return m + d.y;
        }, 0);
        let i = 0;
        const data = _.map(phylumColumn.clusteredData, function(d) {
            const colorDiv = getColourSquareIcon(i);
            return [++i, colorDiv + d.name, d.lineage[0], d.y, (d.y * 100 / total).toFixed(2)];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE
        };
        const phylumColumnTable = new ClientSideTable($('#column').find('.phylum-table'), options);
        phylumColumnTable.update(data, false, 1);

        const numSeries = phylumColumn.chart.series[0].data.length;
        phylumColumnTable.$tbody.find('tr').hover(function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            phylumColumn.chart.series[0].data[index].setState('hover');
        }, function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            phylumColumn.chart.series[0].data[index].setState();
        });
        phylumColumnTable.$tbody.find('tr').click(function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            const series = phylumColumn.chart.series[0].data[index];
            phylumColumn.chart.series[0].data[index].visible = false;
            setTableRowAndChartHiding(this, series, index, numSeries, false);
        });
    });

    // Load stacked column charts
    const stackedColumn = new charts.TaxonomyColumnStacked('phylum-composition-stacked-column',
        {accession: analysisID, type: subunitType},
        {title: 'Phylum composition', seriesName: 'reads'});

    stackedColumn.loaded.done(() => {
        const headers = [
            {sortBy: 'a', name: ''},
            {sortBy: 'a', name: 'Phylum'},
            {sortBy: 'a', name: 'Domain'},
            {sortBy: 'a', name: 'Unique OTUs'},
            {sortBy: 'a', name: '%'}
        ];
        const total = _.reduce(stackedColumn.clusteredData, function(m, d) {
            return m + d.y;
        }, 0);
        let i = 0;
        const data = _.map(stackedColumn.clusteredData, function(d) {
            const colorDiv = getColourSquareIcon(i);
            return [++i, colorDiv + d.name, d.lineage[0], d.y, (d.y * 100 / total).toFixed(2)];
        });
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE
        };
        const numSeries = stackedColumn.chart.series[0].data.length;
        const phylumStackedColumnTable = new ClientSideTable(
            $('#stacked-column').find('.phylum-table'), options);
        phylumStackedColumnTable.update(data, false, 1);
        phylumStackedColumnTable.$tbody.find('tr').hover(function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            stackedColumn.chart.series[index].data[0].setState('hover');
        }, function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            stackedColumn.chart.series[index].data[0].setState();
        });
    });
    return $.when(domainPie.dataReady,
        phylumPie.loaded, domainColumn.loaded,
        phylumColumn.loaded, stackedColumn.loaded).promise();
}

/**
 * Disable a subunit button and check the selected type
 * @param {string} enableType /ssu or /lsu
 */
function disableSubUnitRadio(enableType) {
    $('.rna-select-button[value!=\'' + enableType + '\']').attr('disabled', true);
    $('.rna-select-button[value=\'' + enableType + '\']').attr('checked', true);
}

/**
 * Displays error if taxonomy graph data could not be loaded
 */
function displayTaxonomyGraphError() {
    const error = $('<h4>No taxonomy annotation has been associated with this analysis.</h4>');
    console.debug('Failed to load taxonomy annotation associated with this analysis.');
    $('#taxonomic').empty().append(error);
}

/**
 * Attempt to load taxonomy, and fallback to /lsu if /ssu does not exist
 * @param {string} analysisID accession of analysis
 * @param {string} subunitType of analysis
 * @param {float} pipelineVersion
 * @param {string} experimentType of analysis {amplicon|wgs|metabarcoding}
 */
function loadTaxonomyWithFallback(analysisID, subunitType, pipelineVersion, experimentType) {
    loadTaxonomy(analysisID, subunitType).fail((model) => {
        if (subunitType === '/ssu') {
            subunitType = '/lsu';
            loadTaxonomy(analysisID, subunitType).fail((model) => {
                if (model.length === 0) {
                    displayTaxonomyGraphError();
                }
            });
        } else {
            if (model.length === 0) {
                displayTaxonomyGraphError();
            }
        }
    });
    if (['amplicon', 'metabarcoding'].indexOf(experimentType) > -1 && pipelineVersion >= 4.0) {
        disableSubUnitRadio(subunitType);
    }
}

/**
 * Load and display charts for selected view
 * @param {string} analysisID ENA analysis primary accession
 * @param {string} pipelineVersion
 * @param {string} experimentType of analysis {amplicon|wgs|metabarcoding}
 */
function loadTaxonomicAnalysis(analysisID, pipelineVersion, experimentType) {
    let type = parseFloat(pipelineVersion) >= 4.0 ? '/ssu' : '';
    loadTaxonomyWithFallback(analysisID, type, pipelineVersion, experimentType);
}

/**
 * Load all charts on QC tab
 * @param {string} analysisID accession of analysis
 * @param {string} pipelineVersion version of pipeline used to conduct analysis
 */
function loadQCAnalysis(analysisID, pipelineVersion) {
    const seqFeatChart = new charts.SeqFeatSumChart('SeqFeat-chart',
        {accession: analysisID});
    seqFeatChart.loaded.fail(() => {
        $('#SeqFeat-chart')
            .append('<h4>Could not load sequence feature summary.</h4>');
    });

    const qcStepChart = new charts.QcChart('QC-step-chart',
        {accession: analysisID});
    qcStepChart.loaded.fail(() => {
        $('#QC-step-chart')
            .append('<h4>Could not load qc summary chart.</h4>');
    });
    if (parseFloat(pipelineVersion) > 2) {
        const nucleotideChart = loadNucleotideDisp(analysisID);
        nucleotideChart.loaded.fail(() => {
            console.debug('Failed to load nucleotide hist.');
            $('#nucleotide-section').hide();
        }).done(() => {
            $('#nucleotide-section').show();
        });

        new charts.GcContentChart('readsGCBarChart', {accession: analysisID});
        new charts.GcDistributionChart('readsGCHist', {accession: analysisID});
        new charts.ReadsLengthHist('readsLengthHist', {accession: analysisID});
        new charts.SeqLengthChart('readsLengthBarChart', {accession: analysisID});
    }
}

/**
 * Load all charts on functional tab
 * @param {string} analysisID accession of analysis
 */
function loadFunctionalAnalysis(analysisID) {
    const interproMatchPie = new charts.InterproMatchPie('InterProPie-chart',
        {accession: analysisID});

    interproMatchPie.loaded.done(() => {
        let i = 0;
        const totalCount = interproMatchPie.raw_data.reduce(function(v, e) {
            return v + e['attributes']['count'];
        }, 0);
        const tableData = interproMatchPie.raw_data.map(function(d) {
            d = d.attributes;
            const colorDiv = getColourSquareIcon(i);
            const interProLink = createInterProLink(d.description, d.accession);
            return [
                ++i,
                colorDiv + interProLink,
                d.accession,
                d.count,
                (d.count * 100 / totalCount).toFixed(2)];
        });
        const headers = [
            {sortBy: 'a', name: ''},
            {sortBy: 'a', name: 'Entry name'},
            {sortBy: 'a', name: 'ID'},
            {sortBy: 'a', name: 'pCDS matched'},
            {sortBy: 'a', name: '%'}
        ];
        const options = {
            title: '',
            headers: headers,
            initPageSize: DEFAULT_PAGE_SIZE
        };
        const interproTable = new ClientSideTable($('#InterPro-table'), options);
        interproTable.update(tableData, false, 1, tableData.length);

        const numSeries = interproMatchPie.chart.series[0].data.length;
        interproTable.$tbody.find('tr').hover(function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            interproMatchPie.chart.series[0].data[index].setState('hover');
        }, function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            interproMatchPie.chart.series[0].data[index].setState();
        });

        interproTable.$tbody.find('tr').click(function() {
            let index = getSeriesIndex($(this).index(), numSeries);
            const series = interproMatchPie.chart.series[0].data[index];
            setTableRowAndChartHiding(this, series, index, numSeries, !series.visible);
        });
    });
    new charts.GoTermBarChart('biological-process-bar-chart',
        {accession: analysisID, lineage: 'biological_process'},
        {title: 'Biological process', color: Commons.TAXONOMY_COLOURS[0]});
    new charts.GoTermBarChart('molecular-function-bar-chart',
        {accession: analysisID, lineage: 'molecular_function'},
        {title: 'Molecular function', color: Commons.TAXONOMY_COLOURS[1]});
    new charts.GoTermBarChart('cellular-component-bar-chart',
        {accession: analysisID, lineage: 'cellular_component'},
        {title: 'Cellular component', color: Commons.TAXONOMY_COLOURS[2]});

    new charts.GoTermPieChart('biological-process-pie-chart',
        {accession: analysisID, lineage: 'biological_process'},
        {title: 'Biological process', color: Commons.TAXONOMY_COLOURS[0]});
    new charts.GoTermPieChart('molecular-function-pie-chart',
        {accession: analysisID, lineage: 'molecular_function'},
        {title: 'Molecular function', color: Commons.TAXONOMY_COLOURS[1]});
    new charts.GoTermPieChart('cellular-component-pie-chart',
        {accession: analysisID, lineage: 'cellular_component'},
        {title: 'Cellular component', color: Commons.TAXONOMY_COLOURS[2]});
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
                that.$el.html(that.template({
                        groups: that.model.attributes.downloadGroups,
                        experiment_type: that.experiment_type
                    }
                ));
            }
        });
    }
});

/**
 * Load download tab view
 * @param {string} analysisID ENA analysis primary accession
 * @param {string} experimentType Experiment Type [Assembly, Amplicon, Metabarcoding]
 */
function loadDownloads(analysisID, experimentType) {
    let downloads = new api.AnalysisDownloads({id: analysisID, experiment_type: experimentType});
    new DownloadView({model: downloads});
}

/**
 * Callback for taxonomy size selection in taxonomic analysis tab
 * @param {string} srcElem jQuery selector string of event source element
 * @param {number} pipelineVersion
 */
function onTaxonomySelect(srcElem) {
    const type = $(srcElem).val();
    loadTaxonomy(analysisID, type);
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
        description['Assembly'] = '<a href=\'' + attr['assembly_url'] + '\'>' +
            attr['assembly_accession'] + '</a>';
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
 * @return {object}
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

/**
 * Main view for the Analysis.
 * This view managed the tabs and the general
 * analysis data.
 */
let AnalysisView = Backbone.View.extend({
    model: api.Analysis,
    template: _.template($('#analysisTmpl').html()),
    el: '#main-content-area',
    initialize() {
        const that = this;
        this.model.fetch({
            data: {},
            success(data) {
                const attr = data.attributes;
                /* Display rules */
                attr.displaySsuButtons = attr.pipeline_version >= 4.0;
                // attr.displayContigsViewer = attr.experiment_type === 'assembly' &&
                //                              attr.annotationAvailable;
                attr.displayContigsViewer = true;
                if (attr.experiment_type === 'assembly') {
                    attr.other_analyses = attr.assembly_url;
                } else {
                    attr.other_analyses = attr.run_url;
                }

                that.render(attr.pipeline_version, function() {
                    if (attr.experiment_type === 'assembly') {
                        $('#assembly-text-warning').removeClass('hidden');
                        // Check if the viewer tab should be enabled.
                    }
                    $('#analysisSelect').val(attr.pipeline_version);

                    let description = constructDescriptionTable(attr);
                    let dataAnalysis = constructDataAnalysisTable(attr);

                    const $overview = $('#overview');
                    $overview.append(new DetailList('Description', description));
                    if (Object.keys(dataAnalysis).length > 0) {
                        $overview.append(new DetailList('Experiment details', dataAnalysis));
                    }
                    util.attachExpandButtonCallback();

                    loadQCAnalysis(analysisID, attr.pipeline_version);
                    loadTaxonomicAnalysis(analysisID, attr.pipeline_version,
                                          attr.experiment_type);
                    loadDownloads(analysisID, attr.experiment_type);

                    if (attr.experiment_type !== 'amplicon') {
                        loadFunctionalAnalysis(analysisID);
                        enableTab('functional');
                    } else {
                        removeTab('functional');
                        if (window.location.hash.substr(1) === 'functional') {
                            util.changeTab($('#overview'));
                        }
                    }
                    if (attr.displayContigsViewer) {
                        that.contigsViewer = new ContigsView({
                            el: $('#contigs-containter'),
                            collection: new ContigCollection({accession: analysisID})
                        });
                        that.loadAssemblyViewer();
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
            onTaxonomySelect(this);
        });
        util.attachTabHandlers();
        callback();
        return this.$el;
    },
    /**
     * Load the Assembly Viewer in the corresponding tab
     */
    loadAssemblyViewer() {
        this.contigsViewer.render(true);
    }
    // FIXME: move the tabs management to this view.
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

let analysis = new api.Analysis({id: analysisID});
new AnalysisView({model: analysis});
