const Backbone = require('backbone');
const _ = require('underscore');
const INTERPRO_URL = process.env.INTERPRO_URL;
const Commons = require('../commons');
const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;
const util = require('../util');

const ClientSideTable = require('../components/clientSideTable');
const DetailList = require('../components/detailList');
require('tablesorter');

const TAXONOMY_COLOURS = Commons.TAXONOMY_COLOURS;

const DEFAULT_PAGE_SIZE = 25;

window.Foundation.addToJquery($);

const analysisID = util.getURLParameter();

util.setupPage('#browse-nav');
util.specifyPageTitle('Analysis', analysisID);


const TabsManager = Backbone.View.extend({
    tabs: {},
    hookTabs(elementId) {
        this.$tabs = this.$(elementId);
        this._tabs = new window.Foundation.Tabs(this.$tabs);
        this.$tabs.on('change.zf.tabs', this.selectTab.bind(this));
    },
    /**
    * Switch to the selected tabId
    * @param {string} tabId the tab Id selector
    * @return {Object} view The view.
    */
    changeTab(tabId) {
        const tab = this.tabs[tabId];
        if (tab) {
            tab.renderTab();
        }
        return this;
    },
    /**
     * Tab selection Handler
     * @param {Event} _ click event
     * @param {HTML} tab selected tab
    */
    selectTab(_, tab) {
        const $tab = $(tab);
        const tabId = $tab.children().first().attr('href');
        this.changeTab(tabId);
        // FIXME: Manage nested tabs.
        // let $parentTab = getParentTab($tab);
        // if ($parentTab.length > 0) {
        //     changeTab($parentTab);
        // }
    },
    /**
     * Enable tab by id
     * @param {string} tabId of tab
     */
    enableTab(tabId) {
        this.$('[href=\'#' + tabId + '\']').parent('li').removeClass('disabled');
    },

    /**
     * Disable tab by id
     * @param {string} tabId of tab
     */
    removeTab(tabId) {
        this.$('[href=\'#' + tabId + '\']').parent('li').remove();
    }
});

/**
 * Tab view general class.
 * Provides the common view methods and properties.
 */
const TabView = Backbone.View.extend({
    rendered: false,
    renderTab() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
        return this;
    }
});

/**
 * Main view.
 * This view handles the tabs and the general data managment.
 */
const AnalysisView = TabsManager.extend({
    model: api.Analysis,
    template: _.template($('#analysisTmpl').html()),
    el: '#main-content-area',
    render() {
        const that = this;
        this.model.fetch({
            data: {},
            success() {
                that.$el.html(that.template(that.model.toJSON()));

                that.hookTabs('#analysis-tabs');

                const attr = that.model.attributes;

                if (attr.experiment_type === 'assembly') {
                    $('#assembly-text-warning').removeClass('hidden');
                }

                // TODO: REMOVE $('#analysisSelect').val(attr['pipeline_version']);
                util.attachExpandButtonCallback();

                // -- Tabs -- //
                that.overviewTabView = new OverviewTabView(attr);
                that.qcTabView = new QCTabView(
                    analysisID,
                    attr.pipeline_version,
                    attr.experiment_type
                );
                that.taxonomyTabView = new TaxonomyTabView({
                    model: new api.TaxonomyOverview(analysisID)
                });

                const downloadModel = new api.AnalysisDownloads();
                downloadModel.load(attr.included);
                that.downloadTabView = new DownloadTabView({
                    model: downloadModel,
                    experiment_type: that.experimentType
                });

                that.abundanceTab = new AbundanceTabView(downloadModel);
                if (!that.abundanceTab.enable) {
                    that.removeTab('abundance');
                }

                if (attr.experiment_type !== 'amplicon') {
                    that.functionaTabView = new FunctionalTabView(analysisID);
                    that.enableTab('functional');
                } else {
                    that.removeTab('functional');
                }

                that.tabs = {
                    '#overview': that.overviewTabView,
                    '#qc': that.qcTabView,
                    '#taxonomic': that.taxonomyTabView,
                    '#functional': that.functionaTabView,
                    '#download': that.downloadTabView,
                    '#abundance': that.abundanceTab
                };

                // enable the selected tab
                if (window.location.hash === '#functional' &&
                    attr.experiment_type === 'amplicon') {
                    that.$tabs.foundation('selectTab', that.$('#overview'));
                } else if (window.location.hash === '#abundance' &&
                    !that.abundanceTab.enable) {
                    that.$tabs.foundation('selectTab', that.$('#overview'));
                } else if (!window.location.hash) {
                    that.$tabs.foundation('selectTab', that.$('#overview'));
                } else {
                    that.changeTab(window.location.hash);
                }
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve analysis: ' + analysisID);
            }
        });
        return this;
    }
});

/**
 * Overview Tab
 */
const OverviewTabView = TabView.extend({
    el: '#overview',
    initialize(analysisData) {
        this.analysisData = analysisData;
    },
    render() {
        this.$el.html('');
        const description = this.constructDescriptionTable();
        this.$el.append(new DetailList('Description', description));

        let dataAnalysis = this.constructDataAnalysisTable();
        if (Object.keys(dataAnalysis).length > 0) {
            this.$el.append(new DetailList('Experiment details', dataAnalysis));
        }
    },
    /**
     * Business logic to create table of info related to current analysis
     * @return {{Study: string, Sample: string}}
     */
    constructDescriptionTable() {
        const attr = this.analysisData;
        let description = {
            'Study': util.createLinkTag(attr['study_url'], attr['study_accession']),
            'Sample': util.createLinkTag(attr['sample_url'], attr['sample_accession'])
        };

        if (attr['experiment_type'] === 'assembly') {
            description['Assembly'] = util.createLinkTag(
                attr['assembly_url'],
                attr['assembly_accession']);
        } else {
            description['Run'] = util.createLinkTag(
                attr['run_url'],
                attr['run_accession']);
        }

        description['Pipeline version'] = util.createLinkTag(
            attr['pipeline_url'],
            attr['pipeline_version']);

        return description;
    },
    /**
     * Business logic to create table of data analysis info related to current analysis
     * @param {object} attr attributes from BackBone AnalysesView model
     * @return {object}
     */
    constructDataAnalysisTable() {
        const attr = this.analysisData;
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
});

/**
 * QC results tab
 */
const QCTabView = TabView.extend({
    template: _.template($('#qcTmpl').html()),
    el: '#qc',
    initialize(analysisID, pipelineVersion, experimentType) {
        this.analysisID = analysisID;
        this.pipelineVersion = parseFloat(pipelineVersion);
        this.experimentType = experimentType;
    },
    render() {
        const that = this;
        this.$el.html(this.template({
            analysisID: this.analysisID,
            pipelineVersion: this.pipelineVersion,
            experimentType: this.experimentType
        }));

        const qcStepChart = new charts.QcChart('qc-step-chart', {
            accession: this.analysisID
        });
        qcStepChart.loaded.fail(() => {
            this.$('#qc-step-chart')
                .append('<h4>Could not load qc summary chart.</h4>');
        });

        if (this.pipelineVersion < 2) {
            return this;
        }

        const nucleotideChart = new charts.NucleotideHist('nucleotide', {
            accession: this.analysisID
        });
        nucleotideChart.loaded.fail(() => {
            that.$('#nucleotide-section').hide();
        }).done(() => {
            that.$('#nucleotide-section').show();
        });

        // TODO: if a chart fails we are not notified
        new charts.GcDistributionChart('reads-gc-hist', {accession: this.analysisID});
        new charts.GcContentChart('reads-gc-barchart', {accession: this.analysisID});
        new charts.ReadsLengthHist('reads-length-hist', {accession: this.analysisID});
        new charts.SeqLengthChart('reads-length-barchart', {accession: this.analysisID});

        return this;
    }
});

/**
 * Functional results tab
 */
let FunctionalTabView = TabView.extend({
    template: _.template($('#functionalTmpl').html()),
    el: '#functional',
    initialize(analysisID) {
        this.analysisID = analysisID;
    },
    /**
     * Load all charts on functional tab
     */
    render() {
        this.$el.html(this.template());
        // hook the tabs
        this.hookTabs('#functional-analysis-tabs');

        this.interProTab = new InterProTabView(this.analysisID);
        this.goTermsTab = new GOTermsTabView(this.analysisID);
        this.keggTab = new KEGGTabView(this.analysisID);

        this.tabs = {
            '#interpro': this.interProTab,
            '#go': this.goTermsTab,
            '#kegg': this.keggTab
        };
    }
});

// Tab manager capabilities
FunctionalTabView = FunctionalTabView.extend(TabsManager.prototype);

/* Functional sub tabs */
const InterProTabView = TabView.extend({
    el: '#interpro',
    initialize(analysisID) {
        this.analysisID = analysisID;
    },
    render() {
        const that = this;
        const analysisID = this.analysisID;
        const interproMatchPie = new charts.InterproMatchPie('interpro-pie-chart', {
            accession: analysisID
        });

        interproMatchPie.loaded.done(() => {
            let i = 0;
            const totalCount = interproMatchPie.raw_data.reduce((v, e) => {
                return v + e['attributes']['count'];
            }, 0);
            const tableData = interproMatchPie.raw_data.map((d) => {
                d = d.attributes;
                const colorDiv = getColourSquareIcon(i);
                const interProLink = that.createInterProLink(d.description, d.accession);
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
            const interproTable = new ClientSideTable(that.$('#interpro-table'), options);
            interproTable.update(tableData, false, 1, tableData.length);

            const numSeries = interproMatchPie.chart.series[0].data.length;
            interproTable.$tbody.find('tr').hover((e) => {
                let index = getSeriesIndex($(e.currentTarget).index(), numSeries);
                interproMatchPie.chart.series[0].data[index].setState('hover');
            }, (e) => {
                let index = getSeriesIndex($(e.currentTarget).index(), numSeries);
                interproMatchPie.chart.series[0].data[index].setState();
            });

            interproTable.$tbody.find('tr').click((e) => {
                let index = getSeriesIndex($(e.currentTarget).index(), numSeries);
                const series = interproMatchPie.chart.series[0].data[index];

                setTableRowAndChartHiding(
                    e.currentTarget,
                    series,
                    index,
                    numSeries,
                    !series.visible);
            });
        });
        const seqFeatChart = new charts.SeqFeatSumChart('seqfeat-chart', {
            accession: this.analysisID
        });
        seqFeatChart.loaded.fail(() => {
            this.$('#SeqFeat-chart')
                .append('<h4>Could not load sequence feature summary.</h4>');
        });
        return this;
    },
    /**
     * Generate interpro link
     * @param {string} text to display in link tag
     * @param {string} id of interpro result
     * @return {string}
     */
    createInterProLink(text, id) {
        const url = INTERPRO_URL + 'entry/' + id;
        return '<a href=\'' + url + '\'>' + text + '</a>';
    }
});

let GOTermsTabView = TabView.extend({
    el: '#go',
    initialize(analysisID) {
        this.analysisID = analysisID;
    },
    render() {
        const analysisID = this.analysisID;
        this._$tabs = new window.Foundation.Tabs(this.$('#go-tabs'));

        new charts.GoTermBarChart('biological-process-bar-chart', {
            accession: analysisID,
            lineage: 'biological_process'
        }, {
            title: 'Biological process',
            color:
            Commons.TAXONOMY_COLOURS[0]
        });

        new charts.GoTermBarChart('molecular-function-bar-chart', {
            accession: analysisID,
            lineage: 'molecular_function'
        }, {
            title: 'Molecular function',
            color: Commons.TAXONOMY_COLOURS[1]
        });

        new charts.GoTermBarChart('cellular-component-bar-chart', {
            accession: analysisID,
            lineage: 'cellular_component'
        }, {
            title: 'Cellular component',
            color: Commons.TAXONOMY_COLOURS[2]
        });

        new charts.GoTermPieChart('biological-process-pie-chart', {
            accession: analysisID,
            lineage: 'biological_process'
        }, {
            title: 'Biological process',
            color: Commons.TAXONOMY_COLOURS[0]
        });

        new charts.GoTermPieChart('molecular-function-pie-chart', {
            accession: analysisID,
            lineage: 'molecular_function'
        }, {
            title: 'Molecular function',
            color: Commons.TAXONOMY_COLOURS[1]
        });

        new charts.GoTermPieChart('cellular-component-pie-chart', {
            accession: analysisID,
            lineage: 'cellular_component'
        }, {
            title: 'Cellular component',
            color: Commons.TAXONOMY_COLOURS[2]
        });
        return this;
    }
});

const KEGGTabView = TabView.extend({
    el: '#kegg',
    model: '',
    initialize(analysisID) {
        this.analysisID = analysisID;
    },
    render() {
        const that = this;
        this.model.fetch({
            success(response) {
                const headers = [
                    {sortBy: 'a', name: 'Class ID'},
                    {sortBy: 'a', name: 'Description'},
                    {sortBy: 'a', name: 'Completeness'},
                    {name: 'Matching KO'},
                    {name: 'Missing KO'}
                ];
                const options = {
                    title: '',
                    headers: headers,
                    initPageSize: DEFAULT_PAGE_SIZE
                };
                const interproTable = new ClientSideTable(that.$('#interpro-table'), options);

                interproTable.update(tableData, false, 1, tableData.length);

                return this;
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve taxonomic analysis for: ' + analysisID,
                    that.el);
            }
        });
    }
});

/**
 * Taxonomy results tab
 */
const TaxonomyTabView = TabView.extend({
    template: _.template($('#taxonomicTabTmpl').html()),
    el: '#taxonomic',
    events: {
        'click .tax-select-button': 'renderTaxonomyCategory'
    },
    render() {
        const that = this;
        this.model.fetch({
            data: {},
            success() {
                let attributes = that.model.attributes;
                const processedData = {
                    enableSSU: attributes.taxonomy_ssu_count > 0,
                    enableLSU: attributes.taxonomy_lsu_count > 0,
                    enableITSoneDB: attributes.taxonomy_itsonedb_count > 0,
                    enableITSUnite: attributes.taxonomy_itsunite_count > 0
                };

                that.$el.html(that.template(processedData));

                that._tabs = new window.Foundation.Tabs(that.$('#taxonomy-tabs'));

                if (processedData.enableSSU) {
                    that.$('#smallrRNA').trigger('click');
                } else if (processedData.enableLSU) {
                    that.$('#largerRNA').trigger('click');
                } else if (processedData.enableITSoneDB) {
                    that.$('#itsoneDB').trigger('click');
                } else if (processedData.enableITSUnite) {
                    that.$('#itsUNITE').trigger('click');
                }
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve taxonomic analysis for: ' + analysisID,
                    that.el);
            }
        });
        return this;
    },
    /**
     * Load taxonomy data and create graphs
     * @param {jQuery.Event} event event
    * @return {jQuery.Promise} taxonomy backbone model.
     */
    renderTaxonomyCategory(event) {
        const category = $(event.currentTarget).val();

        const kronaUrl = api.getKronaURL(analysisID, category);
        const kronaChart = '<object class="krona_chart" ' +
            'data="' + kronaUrl + '" ' +
            'type="text/html"></object>';
        this.$('#krona').html(kronaChart);

        // Load pie charts
        const domainPie = new charts.TaxonomyPie('domain-composition-pie',
            {accession: analysisID, type: category},
            {title: 'Domain composition', seriesName: 'reads', subtitle: false}
        );
        const phylumPie = new charts.TaxonomyPie('phylum-composition-pie',
            {accession: analysisID, type: category, groupingDepth: 2},
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
        const domainColumn = new charts.TaxonomyColumn('domain-composition-column', {
            accession: analysisID,
            type: category
        }, {
            title: 'Domain composition',
            seriesName: 'reads',
            subtitle: false
        });

        const phylumColumn = new charts.TaxonomyColumn('phylum-composition-column', {
            accession: analysisID,
            type: category,
            groupingDepth: 2
        }, {
            title: 'Phylum composition (top 10)',
            seriesName: 'reads',
            numColumns: 10
        });

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
            const phylumColumnTable = new ClientSideTable(
                this.$('#column').find('.phylum-table'),
                options
            );
            phylumColumnTable.update(data, false, 1);

            const numSeries = phylumColumn.chart.series[0].data.length;

            phylumColumnTable.$tbody.find('tr').hover((e) => {
                let index = getSeriesIndex($(e.currentTarget).index(), numSeries);
                phylumColumn.chart.series[0].data[index].setState('hover');
            }, (e) => {
                let index = getSeriesIndex($(e.currentTarget).index(), numSeries);
                phylumColumn.chart.series[0].data[index].setState();
            });
            phylumColumnTable.$tbody.find('tr').click((e) => {
                let index = getSeriesIndex($(e.currentTarget).index(), numSeries);
                const series = phylumColumn.chart.series[0].data[index];
                phylumColumn.chart.series[0].data[index].visible = false;

                setTableRowAndChartHiding(e.currentTarget, series, index, numSeries, false);
            });
        });

        // Load stacked column charts
        const stackedColumn = new charts.TaxonomyColumnStacked('phylum-composition-stacked-column',
            {accession: analysisID, type: category},
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

            phylumStackedColumnTable.$tbody.find('tr').hover(() => {
                let index = getSeriesIndex($(this).index(), numSeries);
                stackedColumn.chart.series[index].data[0].setState('hover');
            }, () => {
                let index = getSeriesIndex($(this).index(), numSeries);
                stackedColumn.chart.series[index].data[0].setState();
            });
        });

        return $.when(domainPie.dataReady,
            phylumPie.loaded, domainColumn.loaded,
            phylumColumn.loaded, stackedColumn.loaded).promise();
    }
});

/**
 * Download results tab
 */
const DownloadTabView = TabView.extend({
    template: _.template($('#downloadsTmpl').html()),
    el: '#download',
    render() {
        const that = this;
        // setAbundanceTab(response.attributes.downloadGroups['Statistics']);
        that.$el.html(that.template({
                groups: that.model.attributes.downloadGroups,
                experiment_type: that.experiment_type
            }
        ));
    }
});

/**
 * Abundance results tab
 */
const AbundanceTabView = TabView.extend({
    el: '#abundance',
    /**
     * Abundance and comparision.
     * This table is only enabled for the analysis that have
     * the 'Taxa abundance distribution' files.
     * @param {Object} data Downloads endpoint data (added from the include data for Analysis).
     * @return {AbundanceTabView} The view instance.
     */
    initialize(data) {
        this.enable = false;
        if (!data && _.has(data.attributes, 'downloadGroups')) {
            return this;
        }
        const download = _.first(data.attributes.downloadGroups.Statistics);
        if (download) {
            this.enable = true;
            this.download = download;
        }
        return this;
    },
    /**
     * Get the taxa abundance distribution SVG and render that.
     * @return {AbundanceTabView} The view instance.
     */
    render() {
        const that = this;
        if (!this.enable) {
            return this;
        }
        this.$('#abundance-chart').attr('src', this.download.links.self);
        $.get({
            url: that.download.links.self,
            success(svg) {
                that.$('#abundance-disp').html(svg);
            }
        });
        return this;
    }
});

// -- Common utilities to most of the views -- //

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

/* Entry point */
const mainView = new AnalysisView({
    model: new api.Analysis({id: analysisID, params: {include: 'downloads'}})
});

mainView.render();
