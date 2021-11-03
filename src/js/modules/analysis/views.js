const _ = require('underscore');
const Backbone = require('backbone');
const Cocktail = require('backbone.cocktail');
Cocktail.patch(Backbone);
const queryString = require('query-string');

const Commons = require('../../commons');
const util = require('../../util');
const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;

const {TabMixin, TabsManagerMixin} = require('./mixins');
const {getColourSquareIcon, getSeriesIndex, setTableRowAndChartHiding} = require('./helpers');
const genomePropertiesHierarchy = require('../../../../static/data/genome-properties-hierarchy.json');

const igv = require('igv');
const igvPopup = require('../../components/igvPopup');
const ClientSideTable = require('../../components/clientSideTable');
const DetailList = require('../../components/detailList');
const ExperimentTableTpl = require('../../../partials/experymentDetails.handlebars');
const AnnotationTableView = require('../../components/annotationTable');
require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/css');
require('tablesorter');

const {ContigsTable} = require('../../components/contigsViewerTable');

const INTERPRO_URL = process.env.INTERPRO_URL;
const DEFAULT_PAGE_SIZE = 25;
const MIN_CONTIG_LEN = 500;

const analysisID = util.getURLParameter();

/**
 * Main view.
 * This view handles the tabs and the general data management.
 */
export const AnalysisView = Backbone.View.extend({
    mixins: [TabsManagerMixin],
    model: api.Analysis,
    template: _.template($('#analysisTmpl').html()),
    el: '#main-content-area',
    initialize() {
        this.router = new Backbone.Router();
        this.$loadingSpinner = this.$('.main-loading-spinner');
    },
    render() {
        const that = this;
        this.$loadingSpinner.show();
        this.model.fetch({
            success() {
                that.$el.append(that.template(that.model.toJSON()));

                // TODO: hook directly on the mixin
                that.hookTabs('#analysis-tabs');

                if (that.model.isAssembly()) {
                    $('#assembly-text-warning').removeClass('hidden');
                }

                // ## Tabs ## //
                // -- Common tabs --//
                that.registerTab({
                    tabId: 'overview',
                    tab: new OverviewTabView(that.model),
                    route: 'overview' // => default route
                });

                that.registerTab({
                    tabId: 'qc',
                    tab: new QCTabView(that.model),
                    route: 'qc'
                });

                that.registerTab({
                    tabId: 'taxonomic',
                    tab: new TaxonomyTabView({
                        model: new api.TaxonomyOverview(analysisID)
                    }),
                    route: 'taxonomic'
                });

                const downloadModel = that.model.get('downloads');

                that.registerTab({
                    tabId: 'download',
                    tab: new DownloadTabView({
                        model: downloadModel,
                        experiment_type: that.experimentType
                    }),
                    route: 'download'
                });

                // -- Abundance -- //
                that.abundanceTab = new AbundanceTabView(downloadModel);
                if (that.abundanceTab.enable) {
                    that.registerTab({
                        tabId: 'abundance',
                        tab: that.abundanceTab,
                        route: 'abundance'
                    });
                } else {
                    that.removeTab('abundance');
                }

                // -- Annotation tabs --//
                const annotTabsOpts = {
                    analysisID: analysisID,
                    pipelineVersion: that.model.get('pipeline_version'),
                    experimentType: that.model.get('experiment_type'),
                    router: that.router
                };

                if (that.model.get('experiment_type') !== 'amplicon') {
                    that.registerTab({
                        tabId: 'functional',
                        tab: new FunctionalTabView(annotTabsOpts),
                        route: 'functional(/:innerTabId)',
                        baseRoute: 'functional',
                        // TODO: this is leaking information into the manager
                        routingHandler: function(innerTabId) {
                            this.changeTab(innerTabId || 'interpro'); // default
                        }
                    });
                    that.enableTab('functional');
                } else {
                    that.removeTab('functional');
                }

                if (that.model.isAssembly() &&
                    that.model.get('pipeline_version') >= 5.0) {
                    that.registerTab({
                        tabId: 'path-systems',
                        tab: new PathSystemsTabView(annotTabsOpts),
                        route: 'path-systems(/:innerTabId)',
                        baseRoute: 'path-systems',
                        routingHandler: function(innerTabId) {
                            this.changeTab(innerTabId || 'kegg-modules');
                        }
                    });
                    that.enableTab('path-systems');

                    that.registerTab({
                        tabId: 'contigs-viewer',
                        tab: new ContigsViewTab(annotTabsOpts),
                        route: 'contigs-viewer'
                    });
                    that.enableTab('contigs-viewer');
                } else {
                    that.removeTab('path-systems');
                    that.removeTab('contigs-viewer');
                }

                that.$loadingSpinner.hide();
                if (!Backbone.history.start({root: window.location.pathname})) {
                    that.router.navigate('/overview', {trigger: true});
                }
            },
            error(ignored, response) {
                util.displayError(response.status, 'Could not retrieve analysis: ' + analysisID);
                that.$loadingSpinner.hide();
            }
        });
        return this;
    }
});

/**
 * Overview Tab
 */
const OverviewTabView = Backbone.View.extend({
    mixins: [TabMixin],
    el: '#overview',
    /**
     * OverviewTabView
     * @param {api.AnalysisModel} analysisModel
     */
    initialize(analysisModel) {
        this.analysisModel = analysisModel;
    },
    render() {
        this.$el.html('');
        const description = this.constructDescriptionTable();
        this.$el.append(new DetailList('Description', description));

        this.constructExperimentDetailsTable().then((experimentDetails) => {
            if (_.isEmpty(experimentDetails)) return;
            this.$el.append(experimentDetails);
        });
    },
    /**
     * Business logic to create table of info related to current analysis
     * @return {{Study: string, Sample: string}}
     */
    constructDescriptionTable() {
        const model = this.analysisModel;
        let description = {
            'Study': util.createLinkTag(model.get('study_url'), model.get('study_accession')),
            'Sample': util.createLinkTag(model.get('sample_url'), model.get('sample_accession'))
        };
        
        if (model.isAssembly()) {
            description['Assembly'] = util.createLinkTag(
                model.get('assembly_url'),
                model.get('assembly_accession'));
        } else {
            description['Run'] = util.createLinkTag(
                model.get('run_url'),
                model.get('run_accession'));
        }

        description['Pipeline version'] = util.createLinkTag(
            model.get('pipeline_url'),
            model.get('pipeline_version'));

        return description;
    },
    /**
     * Business logic to create table of data analysis info related to current analysis.
     * Returns a pre-rendered html element.
     * @return {Promise}
     */
     constructExperimentDetailsTable() {
        const deferred = $.Deferred();
        const model = this.analysisModel;
        let templateModel = {};

        if (model.get('experiment_type') === 'hybrid_assembly') {
            /**
             * Analyses for hybrid assemblies.
             * In this case the data about the sequencing instruments is pulled 
             * from the runs.
            */
            templateModel = { 
                analysis: model.toJSON(),
                runs: []
            }
            const assembly = model.get('assembly');
            const runCollections = new api.AssemblyRuns(assembly.get('assembly_id'));
            runCollections.fetch().then(() => {
                _.each(runCollections.models, (run) => {
                    templateModel.runs.push(run.toJSON());
                });
                deferred.resolve(
                    ExperimentTableTpl({
                        model: templateModel,
                        id: _.uniqueId('experimentTable')
                    })
                );
            }).catch((error) => {
                deferred.reject(error);
            });
        } else {
            // TODO: refactor this
            if (model.has('experiment_type')) {
                templateModel['Experiment type'] = model.get('experiment_type').replace(/_/g, " ");
            }
            if (model.has('instrument_model')) {
                templateModel['Instrument model'] = model.get('instrument_model');
            }
            if (model.has('instrument_platform')) {
                templateModel['Instrument platform'] = model.get('instrument_platform');
            }
            deferred.resolve(
                new DetailList('Experiment details', templateModel)
            );
        }

        return deferred.promise();
    }
});

/**
 * QC results tab
 */
const QCTabView = Backbone.View.extend({
    mixins: [TabMixin],
    template: _.template($('#qcTmpl').html()),
    el: '#qc',
    initialize(analysis) {
        this.analysisID = analysis.get('id');
        this.pipelineVersion = analysis.get('pipeline_version');
        this.experimentType = analysis.get('experiment_type');
        this.analysisModel = analysis;
    },
    render() {
        const that = this;
        this.$el.html(this.template({
            analysisID: this.analysisID,
            pipelineVersion: this.pipelineVersion,
            experimentType: this.experimentType
        }));

        const qcStepChart = new charts.QcChart('qc-step-chart', {
            accession: this.analysisID,
            analysesModel: this.analysisModel
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
const FunctionalTabView = Backbone.View.extend({
    mixins: [TabsManagerMixin, TabMixin],
    template: _.template($('#functionalTmpl').html()),
    el: '#functional',
    initialize({analysisID, pipelineVersion, experimentType, router}) {
        this.analysisID = analysisID;
        this.pipelineVersion = pipelineVersion;
        this.longReadExperiment = experimentType === 'long_reads_assembly';
        this.router = router;
    },
    /**
     * Load all charts on functional tab
     */
    render() {
        this.$el.html(
            this.template({
                longReadExperiment: this.longReadExperiment,
                pipelineVersion: this.pipelineVersion
            })
        );
        // hook the tabs
        this.hookTabs('#functional-analysis-tabs');

        this.registerTab({
            tabId: 'interpro',
            tab: new InterProTabView(this.analysisID),
            route: 'functional/interpro' // => default
        });

        this.registerTab({
            tabId: 'go',
            tab: new GOTermsTabView(this.analysisID),
            route: 'functional/go'
        });

        if (this.pipelineVersion >= 5) {
            this.registerTab({
                tabId: 'pfam',
                tab: new PfamTabView(this.analysisID),
                route: 'functional/pfam'
            });
            this.registerTab({
                tabId: 'ko',
                tab: new KOTabView(this.analysisID),
                route: 'functional/ko'
            });
        } else {
            this.removeTab('pfam');
            this.removeTab('ko');
        }
    }
});

// ------------------------- //
// -- Functional sub tabs -- //
// ------------------------- //

const InterProTabView = Backbone.View.extend({
    mixins: [TabMixin],
    el: '#interpro',
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.$loadingSpinner = this.$('.loading-spinner');
    },
    render() {
        const that = this;
        const analysisID = this.analysisID;
        const interproMatchPie = new charts.InterproMatchPie('interpro-pie-chart', {
            accession: analysisID
        });

        this.$loadingSpinner.show();
        that.$('.row').hide();

        const summaryPromise = $.Deferred();
        const piePromise = $.Deferred();

        const seqFeatChart = new charts.SeqFeatSumChart('seqfeat-chart', {
            accession: this.analysisID
        });
        seqFeatChart.loaded.fail(() => {
            this.$('#seqfeat-chart')
                .removeClass('run-qc-chart')
                .append('<h4>Could not load sequence feature summary.</h4>');
        }).always(() => summaryPromise.resolve());

        interproMatchPie.loaded.then(() => {
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
            // TODO: this table is loading all the interpro results in one go
            //       split and load only per page
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
        }).fail(() => {
            this.$('#interpro-pie-chart')
                .append('<h4>Could not load Inter Pro data.</h4>');
        }).always(() => piePromise.resolve());

        summaryPromise.done().then(() => {
            that.$('.row').show();
        });

        $.when(summaryPromise, piePromise).then(() => {
            that.$loadingSpinner.hide();
            that.$('.row').show();
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

const GOTermsTabView = Backbone.View.extend({
    mixins: [TabMixin],
    el: '#go',
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.$loadingSpinner = this.$('.loading-spinner');
    },
    render() {
        const analysisID = this.analysisID;
        this.$loadingSpinner.show();

        this._$tabs = new window.Foundation.Tabs(this.$('#go-tabs'));

        new charts.GoTermBarChart('biological-process-bar-chart', {
            accession: analysisID,
            lineage: 'biological_process'
        }, {
            title: 'Biological process',
            color: Commons.TAXONOMY_COLOURS[0]
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
        this.$loadingSpinner.hide();
        return this;
    }
});

const PfamTabView = Backbone.View.extend({
    mixins: [TabMixin],
    el: '#pfam',
    model: api.Pfam,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.Pfam({
            id: analysisID
        });
        this.$loadingSpinner = this.$('.loading-spinner');
    },
    render() {
        const that = this;

        this.tableView = new AnnotationTableView({
            el: '#pfam-table',
            model: api.Pfam,
            analysisID: this.analysisID
        });

        const tablePromise = this.tableView.render();
        const modelPromise = $.Deferred();

        this.model.fetch({
            data: {
                page_size: 10 // Top 10.
            },
            success() {
                const rawData = that.model.attributes.data;
                const data = rawData.map((d) => d.attributes['count']);
                let categoriesDescriptions = rawData.reduce((memo, d) => {
                    memo[d.attributes['accession']] = d.attributes['description'];
                    return memo;
                }, {});
                const chartOptions = {
                    title: 'Top 10 Pfam entries',
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Number of matches'
                        }
                    },
                    xAxis: {
                        categories: rawData.map((d) => d.attributes['accession'])
                    },
                    tooltip: {
                        formatter() {
                            const description = categoriesDescriptions[this.key];
                            let tooltip = this.series.name + '<br/>Count: ' + this.y;
                            if (description) {
                                tooltip += '<br/>Pfam entry: ' + description;
                            }
                            return tooltip;
                        }
                    },
                    series: [{
                        name: 'Analysis ' + that.analysisID,
                        data: data,
                        colors: Commons.TAXONOMY_COLOURS[1]
                    }]
                };
                that.chart = new charts.GenericColumnChart('pfam-chart', chartOptions);
                modelPromise.resolve();
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve Pfam results for: ' + analysisID,
                    that.el);
                modelPromise.reject();
            }
        });

        $.when(tablePromise, modelPromise).always(() => {
            that.$loadingSpinner.hide();
        });

        return this;
    }
});

const KOTabView = Backbone.View.extend({
    mixins: [TabMixin],
    el: '#ko',
    model: api.KeggOrtholog,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.KeggOrtholog({
            id: analysisID
        });
        this.$loadingSpinner = this.$('.loading-spinner');
    },
    render() {
        const that = this;

        this.tableView = new AnnotationTableView({
            el: '#ko-table',
            model: api.KeggOrtholog,
            analysisID: this.analysisID
        });

        const tablePromise = this.tableView.render();
        const modelPromise = $.Deferred();

        this.$loadingSpinner.show();

        this.model.fetch({
            data: {
                page_size: 10 // Top 10.
            },
            success() {
                const rawData = that.model.attributes.data;
                const data = rawData.map((d) => d.attributes['count']);
                let categoriesDescriptions = rawData.reduce((memo, d) => {
                    memo[d.attributes['accession']] = d.attributes['description'];
                    return memo;
                }, {});
                const chartOptions = {
                    title: 'Top 10 KO entries',
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Number of matches'
                        }
                    },
                    xAxis: {
                        categories: rawData.map((d) => d.attributes['accession'])
                    },
                    tooltip: {
                        formatter() {
                            const description = categoriesDescriptions[this.key];
                            let tooltip = this.series.name + '<br/>Count: ' + this.y;
                            if (description) {
                                tooltip += '<br/>KEGG Class: ' + description;
                            }
                            return tooltip;
                        }
                    },
                    series: [{
                        name: 'Analysis ' + that.analysisID,
                        data: data,
                        colors: Commons.TAXONOMY_COLOURS[1]
                    }]
                };
                that.chart = new charts.GenericColumnChart('ko-chart', chartOptions);
                modelPromise.resolve();
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve KO analysis for: ' + analysisID,
                    that.el);
                modelPromise.reject();
            }
        });

        $.when(tablePromise, modelPromise).always(() => {
            that.$loadingSpinner.hide();
        });

        return this;
    }
});

// ------------------------- //
// -- Path/Systems sub tabs //
// -------------------------//

let PathSystemsTabView = Backbone.View.extend({
    mixins: [TabsManagerMixin, TabMixin],
    template: _.template($('#pathSystemsTmpl').html()),
    el: '#path-systems',
    initialize({analysisID, pipelineVersion, router}) {
        this.analysisID = analysisID;
        this.pipelineVersion = pipelineVersion;
        this.router = router;
    },
    /**
     * Sub tabs
     */
    render() {
        this.$el.html(this.template());
        // hook the tabs
        this.hookTabs('#path-systems-tabs');

        this.keggTab = new KEGGModuleTabView(this.analysisID);
        this.genomePropertiesTab = new GenomePropertiesTabView(this.analysisID);
        this.antiSMASHTab = new AntiSMASHTabView(this.analysisID);

        this.registerTab({
            tabId: 'kegg-modules',
            tab: this.keggTab,
            route: 'path-systems/kegg-modules' // => default route
        });

        this.registerTab({
            tabId: 'genome-properties',
            tab: this.genomePropertiesTab,
            route: 'path-systems/genome-properties'
        });

        this.registerTab({
            tabId: 'antismash',
            tab: this.antiSMASHTab,
            route: 'path-systems/antismash'
        });
    }
});

const KEGGModuleTabView = Backbone.View.extend({
    mixins: [TabMixin],
    el: '#kegg-modules',
    model: api.KeggModule,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.KeggModule({
            id: analysisID
        });
        this.$loadingSpinner = this.$('.loading-spinner');
    },
    render() {
        this.$loadingSpinner.show();
        const KeggAnnotationTable = AnnotationTableView.extend({
            buildRow(data) {
                return [
                    data['accession'],
                    data['name'],
                    data['description'],
                    data['completeness'],
                    data['matching-kos'].length,
                    data['missing-kos'].length
                ];
            }
        });
        this.tableView = new KeggAnnotationTable({
            el: '#kegg-module-table',
            model: api.KeggModule,
            analysisID: this.analysisID,
            headers: [
                {name: 'Class ID'},
                {name: 'Name'},
                {name: 'Description'},
                {name: 'Completeness'},
                {name: 'Matching KO'},
                {name: 'Missing KO'}
            ]
        });
        this.tableView.render().fail((response) => {
            util.displayError(
                response.status || 404,
                'Could not retrieve KEGG Module analysis for: ' + analysisID,
                this.tableView.el);
        }).always(() => {
            this.$loadingSpinner.hide();
        });

        this.chart = new charts.AnalysisKeggColumnChart('kegg-module-chart', {
            accession: this.analysisID
        });
        return this;
    }
});

const GenomePropertiesTabView = Backbone.View.extend({
    mixins: [TabMixin],
    el: '#genome-properties',
    model: api.GenomeProperties,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.GenomeProperties({
            id: analysisID
        });
        this.$loadingSpinner = this.$('.loading-spinner');
    },
    events: {
        'click .gp-expander': 'collapseNode',
        'click #gp-expand-all': 'expandAll',
        'click #gp-collapse-all': 'collapseAll'
    },
    render() {
        const that = this;

        this.$('button').hide();
        this.$loadingSpinner.show();

        this.model.fetch({
            success() {
                const genomePropertiesCount = {};

                _.each(that.model.attributes.data, (d) => {
                    const id = d.attributes['accession'];
                    const presence = d.attributes['presence'];
                    let count = 0;
                    if (presence === 'Yes' || presence === 'Partial') {
                        count = 1;
                    }
                    // eslint-disable-next-line security/detect-object-injection
                    genomePropertiesCount[id] = count;
                });

                /*
                Each node {
                    name: STRING,
                    children: Array,
                    id: STRING (GenPropXXXX)
                }
                */
                const buildNodeHtml = (node, html, level) => {
                    if (!node.aggregatedCount && !node.count) {
                        return;
                    }
                    const linkUrl = 'https://www.ebi.ac.uk/interpro/genomeproperties/#' +
                        node.id;
                    const htmlNode = $('<div>' +
                        util.createLinkTag(linkUrl, node.id) + ':' +
                        util.createLinkTag(linkUrl, node.name) +
                    '</div>');

                    if (node.count === 0 || (node.aggregatedCount - node.count) === 0) {
                        htmlNode.append('<span class="gp-entry-count">' +
                            '<strong>' + node.aggregatedCount + '</strong>' +
                            '</span>');
                    } else {
                        htmlNode.append('<span class="gp-entry-count">' +
                            '<strong>' + node.aggregatedCount + '</strong>' +
                            ' (' + node.count + ') ' +
                            '</span>');
                    }

                    if (node.children && node.children.length) {
                        htmlNode.prepend('<span class="gp-header">' +
                            '<a class="gp-expander"></a>' +
                            '</span>');
                        const childContainer = $('<div></div>', {
                            'class': 'children gp-node-level-' + level
                        });
                        if (level > 1) {
                            childContainer.addClass('gp-collapsed');
                        }
                        htmlNode.append(childContainer);
                        // keep going down the tree
                        _.each(node.children, (child) => {
                            buildNodeHtml(child, childContainer, level + 1);
                        });
                    } else {
                        htmlNode.prepend('<span class="gp-header">・</span>');
                    }
                    html.append(htmlNode);
                };

                /**
                 * Annotate the nodes with the counts.
                 * @param {Object} node a gp node
                 * @return {int} the aggregated count for a sub-tree
                 */
                const annotate = (node) => {
                    node.count = genomePropertiesCount[node.id] || 0;
                    node.aggregatedCount = (node.aggregatedCount || 0) + node.count;
                    if (node.children && node.children.length) {
                        node.aggregatedCount += _.reduce(node.children, (mem, child) => {
                            return mem + annotate(child);
                        }, 0);
                    }
                    return node.aggregatedCount;
                };

                annotate(genomePropertiesHierarchy);

                const htmlContainter = $('<div class="genome-properties"></div>');
                buildNodeHtml(genomePropertiesHierarchy, htmlContainter, 1);
                htmlContainter.find('.gp-expander:first').addClass('gp-expander-expanded');

                that.$('#gp-tree-container').html(htmlContainter);

                that.$loadingSpinner.hide();
                that.$('button').show();
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve genome properties analysis for: ' + analysisID,
                    that.el);
                that.$loadingSpinner.hide();
            }
        });
    },
    /**
     * Collapse the node children.
     * @param {Event} event the click event
     */
    collapseNode(event) {
        event.preventDefault();
        const $target = this.$(event.currentTarget);
        $target.toggleClass('gp-expander-expanded');
        const $parentNode = $target.parent().parent();
        $parentNode.find('.children:first').toggleClass('gp-collapsed');
    },
    /**
     * Expand every node on the tree
     */
    expandAll() {
        this.$('.gp-expander:not(:first)').addClass('gp-expander-expanded');
        this.$('.children:not(:first)').removeClass('gp-collapsed');
    },
    /**
     * Collapse every node on the tree
     */
    collapseAll() {
        this.$('.gp-expander:not(:first)').removeClass('gp-expander-expanded');
        this.$('.children:not(:first)').addClass('gp-collapsed');
    }
});

const AntiSMASHTabView = Backbone.View.extend({
    mixins: [TabMixin],
    el: '#antismash',
    model: api.AntiSMASHGeneCluster,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.AntiSMASHGeneCluster({
            id: analysisID
        });
        this.$loadingSpinner = this.$('.loading-spinner');
    },
    render() {
        const that = this;

        this.tableView = new AnnotationTableView({
            el: '#antismash-gene-clusters-table',
            model: api.AntiSMASHGeneCluster,
            analysisID: this.analysisID
        });

        const tablePromise = this.tableView.render();
        const modelPromise = $.Deferred();

        this.$loadingSpinner.show();

        this.model.fetch({
            data: {
                page_size: 10 // Top 10.
            },
            success() {
                const rawData = that.model.attributes.data;
                const data = rawData.map((d) => d.attributes['count']);
                let categoriesDescriptions = rawData.reduce((memo, d) => {
                    memo[d.attributes['accession']] = d.attributes['description'];
                    return memo;
                }, {});
                const chartOptions = {
                    title: 'Top 10 antiSMASH gene clusters',
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Number of matches'
                        }
                    },
                    xAxis: {
                        categories: rawData.map((d) => d.attributes['accession'])
                    },
                    tooltip: {
                        formatter() {
                            const description = categoriesDescriptions[this.key];
                            let tooltip = this.series.name + '<br/>Count: ' + this.y;
                            if (description) {
                                tooltip += '<br/>antiSMASH gene cluster: ' + description;
                            }
                            return tooltip;
                        }
                    },
                    series: [{
                        name: 'Analysis ' + that.analysisID,
                        data: data,
                        colors: Commons.TAXONOMY_COLOURS[1]
                    }]
                };
                that.chart = new charts.GenericColumnChart(
                    'antismash-gene-clusters-chart', chartOptions);
                modelPromise.resolve();
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve antiSMASH gene clusters analysis for: ' + analysisID,
                    that.el);
                modelPromise.reject();
            }
        });

        $.when(tablePromise, modelPromise).always(() => {
            that.$loadingSpinner.hide();
        });

        return this;
    }
});

/**
 * Taxonomy results tab
 */
const TaxonomyTabView = Backbone.View.extend({
    mixins: [TabMixin],
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
                    enableSSU: attributes.taxonomy_ssu_count > 0 || attributes.taxonomy_count > 0,
                    enableLSU: attributes.taxonomy_lsu_count > 0,
                    enableITSoneDB: attributes.taxonomy_itsonedb_count > 0,
                    enableITSUnite: attributes.taxonomy_itsunite_count > 0,
                    isV2: !attributes.taxonomy_ssu_count && attributes.taxonomy_count > 0
                };

                that.viewConf = processedData;
                that.$el.html(that.template(processedData));

                that.$loadingSpinner = that.$('.loading-spinner');

                // TODO: use TabViews
                that._tabs = new window.Foundation.Tabs(that.$('#taxonomy-tabs'));

                if (processedData.enableITSoneDB) {
                    that.$('#itsoneDB').trigger('click');
                } else if (processedData.enableITSUnite) {
                    that.$('#itsUNITE').trigger('click');
                } else if (processedData.enableSSU || processedData.isV2) {
                    that.$('#smallrRNA').trigger('click');
                } else if (processedData.enableLSU) {
                    that.$('#largerRNA').trigger('click');
                }
            }, error(ignored, response) {
                if (response.status === 404) {
                    that.$el.append('<div>There are no taxonomic results for : ' +
                                    analysisID + '</div>');
                } else {
                    util.displayError(
                        response.status,
                        'Could not retrieve taxonomic analysis for: ' + analysisID,
                        that.el);
                }
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

        this.$loadingSpinner.show();
        this.$('.taxonomy-tabs-content').hide();

        const kronaUrl = api.getKronaURL(analysisID, category);
        const kronaChart = '<object class="krona_chart" ' +
            'data="' + kronaUrl + '" ' +
            'type="text/html"></object>';
        this.$('#krona').html(kronaChart);

        let promises = [];

        // ITS doesn't load Domain pie or charts
        if (_.indexOf(['', '/ssu', '/lsu'], category) > -1) {
            const domainPie = new charts.TaxonomyPie('domain-composition-pie',
                {accession: analysisID, type: category},
                {title: 'Domain composition', seriesName: 'reads', subtitle: false}
            );
            promises.push(domainPie.dataReady);

            const domainColumn = new charts.TaxonomyColumn('domain-composition-column', {
                accession: analysisID,
                type: category
            }, {
                title: 'Domain composition',
                seriesName: 'reads',
                subtitle: false
            });
            promises.push(domainColumn.loaded);
        }

        const phylumPie = new charts.TaxonomyPie('phylum-composition-pie',
            {accession: analysisID, type: category, groupingDepth: 2},
            {title: 'Phylum composition', seriesName: 'reads', legend: true}
        );

        promises.push(phylumPie.loaded);

        phylumPie.loaded.done(() => {
            const headers = [
                {sortBy: 'a', name: ''},
                {sortBy: 'a', name: 'Phylum'},
                {sortBy: 'a', name: 'Domain'},
                {sortBy: 'a', name: 'Unique OTUs'},
                {sortBy: 'a', name: '%'}
            ];
            const total = _.reduce(phylumPie.clusteredData, (m, d) => m + d.y, 0);
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
            const total = _.reduce(phylumColumn.clusteredData, (m, d) => m + d.y, 0);
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
            const total = _.reduce(stackedColumn.clusteredData, (m, d) => m + d.y, 0);
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

        promises.push(phylumColumn.loaded);
        promises.push(stackedColumn.loaded);

        // Adjust the layout
        const $phylumPie = this.$('#phylum-composition-pie');
        $phylumPie.html('');
        const $domainPie = this.$('#domain-composition-pie');
        $domainPie.html('');
        const $phylumColumn = this.$('#phylum-composition-column');
        $phylumColumn.html('');
        const $domainColumn = this.$('#domain-composition-column');
        $domainColumn.html('');

        const $piePhylumContainer = $phylumPie.parent();
        const $pieDomainContainer = $domainPie.parent();
        const $columnDomainContainer = $domainColumn.parent();
        const $columnPhylumContainer = $phylumColumn.parent();

        if (_.indexOf(['', '/ssu', '/lsu'], category) > -1) {
            if (!$piePhylumContainer.hasClass('medium-8 larger-8')) {
                $piePhylumContainer.addClass('medium-8 larger-8');
            }
            if (!$columnPhylumContainer.hasClass('medium-8 larger-8')) {
                $columnPhylumContainer.addClass('medium-8 larger-8');
            }
            $pieDomainContainer.show();
            $columnDomainContainer.show();
        } else {
            $piePhylumContainer.removeClass('medium-8 larger-8');
            $columnPhylumContainer.removeClass('medium-8 larger-8');
            $pieDomainContainer.hide();
            $columnDomainContainer.hide();
        }
        $.when(...promises).always(() => {
            this.$loadingSpinner.hide();
            this.$('.taxonomy-tabs-content').show();
        });
        return this;
    }
});

/**
 * Download results tab
 */
const DownloadTabView = Backbone.View.extend({
    mixins: [TabMixin],
    template: _.template($('#downloadsTmpl').html()),
    el: '#download',
    events: {
        'click a.file-checksum': function(event) {
            const $a = $(event.currentTarget);
            const filename = _.last(($a.data('fileurl') || 'checksum.txt').split('/'));
            const checksum = $a.data('checksum');
            const checksumAlgorithm = $a.data('checksum-algorithm');
            const downloadFilename = filename.replace(/\.[^/.]+$/, '.' + checksumAlgorithm);

            const objectURL = URL.createObjectURL(
                new Blob([checksum + ' ' + filename], {type: 'text/plain'})
            );
            $a.attr('href', objectURL);
            $a.attr('download', downloadFilename);
            _.delay(() => URL.revokeObjectURL(objectURL), 150);
        }
    },
    render() {
        const that = this;
        // Order
        const order = [
            'Sequence data',
            'Functional analysis',
            'Pathways and Systems',
            'Taxonomic analysis',
            'Taxonomic analysis SSU rRNA',
            'Taxonomic analysis LSU rRNA',
            'Taxonomic analysis ITS',
            'Taxonomic analysis mOTU',
            'non-coding RNAs'
        ];
        const data = that.model.attributes.downloadGroups;
        const dataKeysOrdered = _.sortBy(_.allKeys(data), (dataKey) => {
            const idx = _.indexOf(order, dataKey);
            // push items that are missing on the order list to the end
            return (idx === -1) ? 9999 : idx;
        });
        const groups = {};
        _.each(dataKeysOrdered, (key) => {
            // eslint-disable-next-line security/detect-object-injection
            groups[key] = data[key];
        });
        // ITS grouping
        let itsRes = groups['Taxonomic analysis ITS'] || [];
        if (data['Taxonomic analysis ITSoneDB']) {
            itsRes.push(...data['Taxonomic analysis ITSoneDB']);
        }
        if (data['Taxonomic analysis UNITE']) {
            itsRes.push(...data['Taxonomic analysis UNITE']);
        }
        if (itsRes.length > 0) {
            groups['Taxonomic analysis ITS'] = itsRes;
        }

        that.$el.html(that.template({
            groups: groups,
            experiment_type: that.experiment_type
        }));
    }
});

/**
 * Abundance results tab
 */
const AbundanceTabView = Backbone.View.extend({
    mixins: [TabMixin],
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

// -- Contigs Viewer -- //
const ContigsViewTab = Backbone.View.extend({
    mixins: [TabMixin],
    template: _.template($('#contigsViewerTmpl').html()),
    el: '#contigs-viewer',
    events: {
        'click .contig-browser': function(event) {
            event.preventDefault();
            const $el = $(event.currentTarget);
            const contigId = $el.data('contig_id');
            const row = _.first(this.contigsTable.getRows(contigId));
            this.loadContig(row.model);
        },
        'click .antismash-load': 'loadAntiSmash',
        'change input[type=number]': 'refreshTable',
        'change input[type=checkbox]': 'refreshTable',
        'keyup input[type=text]': _.debounce(function(e) {
            const el = $(e.currentTarget);
            const minlength = el.data('minlength');
            if (!_.isUndefined(minlength) && el.val().length < minlength) {
                return;
            }
            this.refreshTable();
        }, 300),
        'click .clear-filter': function() {
             this.$('.table-filter').val('').trigger('keyup');
        }
    },
    /**
     * Contigs Viewer and browser.
     * This tabls provides a contig browser and table for the analysis.
     * @param {string} analysisID The analysis id
     */
    initialize({analysisID, experimentType}) {
        const that = this;
        that.analysisID = analysisID;
        that.collection = new api.ContigCollection({accession: analysisID});
        // Long Read assemblies don't have the coverage in the fasta headers as expected.
        // we just hide that col in the table
        that.showCoverage = experimentType !== 'long_reads_assembly'
    },
    /**
     * Render
     */
    render() {
        const that = this;

        this.$el.html(this.template());

        this.$igvDiv = this.$('#genome-browser');
        this.$gbLoading = this.$('#gb-loading');

        // table related
        this.$maxLen = this.$('#max-length');
        this.$minLen = this.$('#min-length');
        this.$lenSlider = this.$el.find('.slider').slider({
            range: true,
            min: MIN_CONTIG_LEN
        });
        this.$cog = this.$('#cog-filter');
        this.$kegg = this.$('#kegg-filter');
        this.$goFilter = this.$('#go-filter');
        this.$pfamFilter = this.$('#pfam-filter');
        this.$interproFilter = this.$('#interpro-filter');
        this.$antismashFilter = this.$('#antismash-filter');
        this.$search = this.$('#contigs-search');
        this.$facetFilters = this.$('.facet');

        // Load filters from query string
        const qs = queryString.extract(location.href);
        const urlParams = queryString.parse(qs, {arrayFormat: 'bracket'});

        this.loadFilterParams(urlParams);

        that.contigsTable = new ContigsTable(that.collection, that.showCoverage);
        that.contigsTable.setElement('#contigs-table');

        that.contigsTable.on('contigs-table:render:done', function() {
            const firstRow = _.first(that.contigsTable.getRows());
            that.loadContig(firstRow.model);
        });

        // Fetch with no filters to get MAX contig length
        this.collection.fetch({
            data: {
                page_size: 1
            }, success() {
                const model = _.first(that.collection.models);
                const min = that.$minLen.val() || MIN_CONTIG_LEN;
                const max = that.$maxLen.val() || model.get('length');
                that.$lenSlider.slider('option', 'max', max);
                that.$lenSlider.slider('option', 'values', [min, max]);
                that.$minLen.val(min);
                that.$maxLen.val(max);
                that.$lenSlider.on('slidechange', function(event, ui) {
                    that.$maxLen.val(ui.values[1]);
                    that.$minLen.val(ui.values[0]);
                    that.$maxLen.trigger('change');
                });

                that.contigsTable.render(urlParams);
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Error while retrieving contigs data for: ' + that.analysisID,
                    that.el);
            }
        });
    },

    /**
     * Get urls parameters and
     */
    loadFilterParams(urlParams) {
        this.$maxLen.val(urlParams.lt);
        this.$minLen.val(urlParams.gt);

        this.$cog.val(urlParams.cog);
        this.$kegg.val(urlParams.kegg);
        this.$goFilter.val(urlParams.go);
        this.$pfamFilter.val(urlParams.pfam);
        this.$interproFilter.val(urlParams.interpro);
        this.$antismashFilter.val(urlParams.antismash);
        this.$search.val(urlParams.search);

        if (!_.isEmpty(urlParams.facet)) {
            _.each(this.$facetFilters, (el) =>
                el.checked = _.contains(urlParams.facet, $(el).data('name'))
            );
        }

        return this;
    },

    /**
     * Get the contig filter inputs values, *note* doesn't include the
     * pagination data
     * @return {Object} Object with the filter dict
     */
    getTableFilters() {
        let facetFilters = [];
        _.each(this.$facetFilters.filter(':checked'),
            (el) => facetFilters.push($(el).data('name')));
        return {
            gt: this.$minLen.val(),
            lt: this.$maxLen.val(),
            cog: this.$cog.val(),
            kegg: this.$kegg.val(),
            go: this.$goFilter.val(),
            interpro: this.$interproFilter.val(),
            pfam: this.$pfamFilter.val(),
            antismash: this.$antismashFilter.val(),
            search: this.$search.val(),
            facet: facetFilters
        };
    },

    /**
     * Refresh the table data, calling the collection and filtering.
     * Side effect, refreshing the query string with the applied filters
     */
    refreshTable() {
        const that = this;
        this.contigsTable.refreshTable(this.getTableFilters());
        this.contigsTable.on('contigs-table:refresh:done', function(parameters) {
            that.refreshQueryString(parameters);
        });
        return this;
    },

    /**
     * Refresh the query string on the url
     * @param {Object} params Filter parameters
     */
    refreshQueryString(params) {
        let urlParams = {};
        _.mapObject(params, (value, key) => {
            if (_.isArray(value)) {
                if (!_.has(urlParams, key)) {
                    urlParams[key] = [];
                }
                _.each(value, (innerValue) => urlParams[key].push(innerValue));
            } else {
                urlParams[key] = value;
            }
        });
        window.history.replaceState('',
            document.title,
            location.pathname + '#contigs-viewer?' + queryString.stringify(urlParams, {arrayFormat: 'bracket'}));
    },

    /**
     * View a contig using IGV.
     * @param {ContigModel} contig The Contig to load
     */
    loadContig(contig) {
        const that = this;
        if (_.isUndefined(contig)) {
            util.displayError(
                'Client error.',
                'Error loading the contig in the contig viewer.',
                that.$igvDiv
            );
            return this;
        }
        // disable the click until it's done
        that.$('.contig-browser').css('pointer-events', 'none');

        const contigId = contig.get('contig_id');
        const antiSMASH = contig.get('has_antismash');
        const displayName = contig.get('contig_name');

        let options = {
            showChromosomeWidget: false,
            showTrackLabelButton: true,
            showTrackLabels: true,
            showCenterGuide: false,
            reference: {
                indexed: false,
                fastaURL: process.env.API_URL + 'analyses/' +
                          this.collection.accession + '/contigs/' + contigId
            },
            tracks: [{
                name: displayName,
                type: 'mgnify-annotation',
                format: 'gff3',
                url: process.env.API_URL + 'analyses/' +
                     this.collection.accession + '/contigs/' + contigId +
                     '/annotations',
                displayMode: 'EXPANDED',
                label: 'Functional annotation',
                colorAttributes: [
                    ['Default', ''],
                    ['COG', 'COG'],
                    ['GO', 'GO'],
                    ['KEGG', 'KEGG'],
                    ['Pfam', 'Pfam'],
                    ['InterPro', 'InterPro']
                ]
            }],
            showLegend: true,
            legendParent: '#genome-browser'
        };
        if (antiSMASH) {
            options.tracks.push({
                type: 'mgnify-annotation',
                format: 'gff3',
                displayMode: 'EXPANDED',
                url: process.env.API_URL + 'analyses/' +
                     this.collection.accession + '/contigs/' + contigId +
                     '/annotations?antismash=True',
                label: 'antiSMASH',
                colorBy: 'as_type',
                defaultColour: '#BEBEBE',
                labelBy: 'as_gene_clusters'
            });
        }

        this.$gbLoading.show();

        if (this.igvBrowser) {
            igv.removeBrowser(this.igvBrowser);
        }
        // force clean, the igvPromise is resolved faster than the
        // the data loading of igv, if a user clicks multiples times
        // on a fresh load then multiples browsers will appear
        this.$(this.$igvDiv).html('');

        this.igvPromise = igv.createBrowser(this.$igvDiv, options);
        this.igvPromise.then((browser) => {
            browser.on('trackclick', (ignored, data) => {
                return igvPopup(data);
            });
            that.igvBrowser = browser;
        }).catch((error) => {
            util.displayError(
                'Contig viewer load fail.',
                'Error loading the contigs on the browser. Connection issue: ' + error,
                that.$igvDiv);
            that.igvBrowser = undefined;
        }).finally(() => {
            that.$gbLoading.hide();
            that.$('.contig-browser').css('pointer-events', 'auto');
        });

        return this;
    },
    /**
     * Load the contig antiSMASH gff track
     * @param {string} contigId The contig identifier
     */
    loadAntiSmash(contigId) {
        const that = this;
        if (!this.igvBrowser) {
            util.displayError('IGV error',
                'Error loading the contigs on the browser.',
                this.$el('.message-area'));
        }
        this.igvBrowser.loadTrack({
            type: 'mgnify-annotation',
            format: 'gff3',
            displayMode: 'EXPANDED',
            url: process.env.API_URL + 'analyses/' +
                 this.collection.accession + '/contigs/' + contigId +
                 '/annotations?antismash=True',
            label: 'antiSMASH',
            colorBy: 'antiSMASH'
        }).catch((error) => {
            util.displayError(
                'IGV Error',
                'Error loading the contigs on the browser. Detail: ' + error,
                that.$el('.message-area'));
        });
    }
});
