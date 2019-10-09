const _ = require('underscore');
const Backbone = require('backbone');
const Cocktail = require('backbone.cocktail');
Cocktail.patch(Backbone);

const Commons = require('../commons');
const {TabMixin, TabsManagerMixin} = require('../mixins');

const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;
const util = require('../util');
const genomePropertiesHierarchy = require('../../../static/data/genome-properties-hierarchy.json');

const igv = require('igv');
const igvPopup = require('../components/igvPopup');
const ClientSideTable = require('../components/clientSideTable');
const GenericTable = require('../components/genericTable');
const DetailList = require('../components/detailList');
const AnnotationTableView = require('../components/annotationTable');
require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/css');
require('tablesorter');

const INTERPRO_URL = process.env.INTERPRO_URL;
const TAXONOMY_COLOURS = Commons.TAXONOMY_COLOURS;
const DEFAULT_PAGE_SIZE = 25;
const MIN_CONTIG_LEN = 500;

const analysisID = util.getURLParameter();

util.setupPage('#browse-nav');
util.specifyPageTitle('Analysis', analysisID);

/**
 * Main view.
 * This view handles the tabs and the general data managment.
 */
const AnalysisView = Backbone.View.extend({
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
            data: {},
            success() {
                that.$el.append(that.template(that.model.toJSON()));

                // FIXME: hook directly on the mixin
                that.hookTabs('#analysis-tabs');

                const attr = that.model.attributes;

                // FIXME: the pipeline version should be a float not a string

                if (attr.experiment_type === 'assembly') {
                    $('#assembly-text-warning').removeClass('hidden');
                }

                // TODO: REMOVE $('#analysisSelect').val(attr['pipeline_version']);
                util.attachExpandButtonCallback();

                // ## Tabs ## //
                // -- Common tabs --//
                that.registerTab({
                    tabId: 'overview',
                    tab: new OverviewTabView(attr),
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

                const downloadModel = new api.AnalysisDownloads();
                downloadModel.load(attr.included);

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
                    pipelineVersion: attr.pipeline_version,
                    router: that.router
                };

                if (attr.experiment_type !== 'amplicon') {
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

                if (attr.experiment_type === 'assembly' && attr.pipeline_version === '5.0') {
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
const QCTabView = Backbone.View.extend({
    mixins: [TabMixin],
    template: _.template($('#qcTmpl').html()),
    el: '#qc',
    initialize(analysis) {
        this.analysisID = analysis.get('id');
        this.pipelineVersion = parseFloat(analysis.get('pipeline_version'));
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
    initialize({analysisID, pipelineVersion, router}) {
        this.analysisID = analysisID;
        this.pipelineVersion = pipelineVersion;
        this.router = router;
    },
    /**
     * Load all charts on functional tab
     */
    render() {
        this.$el.html(this.template({pipelineVersion: this.pipelineVersion}));
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

        if (this.pipelineVersion === '5.0') {
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
                    const count = parseInt(d.attributes['count']);
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

                if (processedData.enableSSU || processedData.isV2) {
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

        this.$loadingSpinner.show();
        this.$('.taxonomy-tabs-content').hide();

        const kronaUrl = api.getKronaURL(analysisID, category);
        const kronaChart = '<object class="krona_chart" ' +
            'data="' + kronaUrl + '" ' +
            'type="text/html"></object>';
        this.$('#krona').html(kronaChart);

        let promises = [];

        // ITS doesn't load Domain pie or charts
        if (_.indexOf(['/', '/ssu', '/lsu'], category) > -1) {
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

        if (_.indexOf(['/', '/ssu', '/lsu'], category) > -1) {
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
    render() {
        const that = this;
        // Order
        const groupsKeys = [
            'Sequence data',
            'Functional analysis',
            'Pathways and Systems',
            'Taxonomic analysis',
            'Taxonomic analysis SSU rRNA',
            'Taxonomic analysis LSU rRNA',
            'Taxonomic analysis ITS',
            'non-coding RNAs'
        ];
        const data = that.model.attributes.downloadGroups;
        const groups = {};
        _.each(groupsKeys, (k) => {
            // eslint-disable-next-line security/detect-object-injection
            if (data[k]) {
                // eslint-disable-next-line security/detect-object-injection
                groups[k] = data[k];
            }
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

        // TODO: add  CWL links depending on the type.

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
        'click .contig-browser': 'contigViewer',
        'click #contigs-filter': 'updateTable',
        'click .clear-filter': function() {
             this.$('.table-filter').val('').trigger('keyup');
        },
        'click #show-antismash': 'loadAntiSmash'
    },
    /**
     * Contigs Viewer and browser.
     * This tabls provides a contig browser and table for the analysis.
     * @param {string} analysisID The analysis id
     */
    initialize({analysisID}) {
        const that = this;
        that.analysisID = analysisID;
        that.collection = new api.ContigCollection({accession: analysisID});
    },
    /**
     * Render
     * @param {bool} viewFirst Load the first contig of the table
     */
    render() {
        const that = this;
        that.$el.html(that.template());
        /* DOM */
        this.$igvDiv = this.$('#genome-browser');
        this.$gbLoading = this.$('#gb-loading');
        this.$tblLoading = this.$('#table-loading');
        /* IGV Popup templates */
        this.$igvPopoverTpl = _.template($('#igv-popover-template').html());
        this.$igvPopoverEntryTpl = _.template($('#igv-popover-entry').html());

        /* Slider */
        this.$maxLen = this.$('#max-length');
        this.$minLen = this.$('#min-length');
        this.$lenSlider = this.$el.find('.slider').slider({
            range: true,
            min: MIN_CONTIG_LEN,
            change(event, ui) {
                that.$maxLen.val(ui.values[1]);
                that.$minLen.val(ui.values[0]);
            }
        });
        /* Features filters */
        this.$cog = this.$('#cog-filter');
        this.$kegg = this.$('#kegg-filter');
        this.$goFilter = this.$('#go-filter');
        this.$pfamFilter = this.$('#pfam-filter');
        this.$interproFilter = this.$('#interpro-filter');

        let tableOptions = {
            title: 'Contigs',
            headers: [
                {sortBy: 'name', name: 'Name'},
                {sortBy: 'length', name: 'Length (bp)'},
                {sortBy: 'coverage', name: 'Coverage'},
                {name: 'antiSMASH'},
                {name: 'KEGG Modules'}
            ],
            tableContainer: 'contigs-table',
            textFilter: true,
            initPageSize: DEFAULT_PAGE_SIZE,
            callback: function(page, pageSize, order, search) {
                that.updateTable({
                    page: page,
                    pageSize: pageSize,
                    ordering: order || that.contigsTable.getCurrentOrder(),
                    search: search
                });
            }
        };

        this.contigsTable = new GenericTable(this.$('#contigs-table'), tableOptions);

        // Fetch with no filters to get MAX contig length
        this.collection.fetch({
            data: {
                page: 1,
                page_size: 1,
                ordering: '-length'
            }, success(ignored, response) {
                const model = _.first(that.collection.models);
                that.$lenSlider.slider('option', 'max', model.get('length'));
                that.$lenSlider.slider('option', 'values', [MIN_CONTIG_LEN, model.get('length')]);
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Error while retrieving contigs data for: ' + that.analysisID,
                    that.el);
            }
        });

        this.updateTable({page: 1, pageSize: DEFAULT_PAGE_SIZE, viewFirst: true});
    },
    /**
     * Refresh the table data.
     * @param {Number} page page
     * @param {Number} pageSize pageSize
     * @param {Bool} viewFirst load the first contig on the browser
     */
    updateTable({page, pageSize, ordering, search, viewFirst}) {
        const that = this;
        that.contigsTable.showLoadingGif();

        this.collection.fetch({
            data: {
                gt: that.$minLen.val(),
                lt: that.$maxLen.val(),
                cog: that.$cog.val(),
                kegg: that.$kegg.val(),
                go: that.$goFilter.val(),
                interpro: that.$interproFilter.val(),
                pfam: that.$pfamFilter.val(),
                page: page || 1,
                page_size: pageSize || DEFAULT_PAGE_SIZE,
                ordering: ordering || that.contigsTable.getCurrentOrder(),
                search: search
            },
            success(ignored, response) {
                const pagination = response.meta.pagination;
                that.reloadTable({
                    viewFirst: viewFirst,
                    page: pagination.page,
                    pageSize: pageSize || DEFAULT_PAGE_SIZE,
                    resultsCount: pagination.count,
                    resultsDownloadLink: response.links.first
                });
                that.contigsTable.hideLoadingGif();
            },
            error(ignored, response) {
                util.displayError(
                    response.status,
                    'Error while retrieving contigs data for: ' + that.analysisID,
                    that.el);
            }
        });
    },
    /**
     * Render a contig
     * @param {Boolean} viewFirst load the first contig of the table
     */
    reloadTable({viewFirst, page, pageSize, resultsCount, resultsDownloadLink}) {
        const that = this;
        const data = _.reduce(that.collection.models, (arr, model) => {
            '<span>' + (model.get('antismash_geneclusters_count') || 0) + '</span>';
            '<span>' + (model.get('kegg_modules_count') || 0) + '</span>';
            arr.push([
                '<a href="#" class="contig-browser" data-name="' +
                    model.get('contig_id') +
                '">' +
                    model.get('contig_id') +
                '</a>',
                model.get('length'),
                model.get('coverage'),
                '<span>' + (model.get('antismash_geneclusters_count') || 0) + '</span>',
                '<span>' + (model.get('kegg_modules_count') || 0) + '</span>'
            ]);
            return arr;
        }, []);
        this.contigsTable.update(
            data,
            true,
            page,
            pageSize,
            resultsCount,
            resultsDownloadLink
        );
        if (viewFirst) {
            this.$('.contig-browser').first().trigger('click');
        }
        this.$tblLoading.hide();
    },
    /**
     * View a contig using IGV.
     * @param {Event} e the event
     */
    contigViewer(e) {
        e.preventDefault();
        const that = this;
        const $el = $(e.target);

        const contigName = $el.data('name');
        this.currentContigName = contigName;

        const displayName = $el.val();

        let options = {
            showChromosomeWidget: false,
            showTrackLabelButton: true,
            showTrackLabels: true,
            showCenterGuide: false,
            reference: {
                indexed: false,
                fastaURL: process.env.API_URL + 'analyses/' +
                          this.collection.accession + '/contigs/' + this.currentContigName
            },
            tracks: [{
                name: displayName,
                type: 'annotation',
                format: 'gff3',
                url: process.env.API_URL + 'analyses/' +
                     this.collection.accession + '/contigs/' + this.currentContigName +
                     '/annotations',
                displayMode: 'EXPANDED',
                label: ''
            }],
            ebi: {
                colorAttributes: [
                    'Colour by', /* Label */
                    'COG',
                    'GO',
                    'Pfam',
                    'InterPro',
                    'KEGG',
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
            browser.on('trackclick', (ignored, data) => {
                return igvPopup(data, that.$igvPopoverTpl, that.$igvPopoverEntryTpl);
            });
            that.igvBrowser = browser;
            that.$gbLoading.hide();
        }).catch((error) => {
            util.displayError(
                500,
                'Error loading the contigs on the browser. Detail: ' + error,
                that.el);
            that.igvBrowser = undefined;
            that.$gbLoading.hide();
        });
    },
    /**
     * Load the contig antiSMASH gff track
     * @param {Event} e the event
     */
    loadAntiSmash(e) {
        e.preventDefault();
        if (!this.igvBrowser) {
            util.displayError('IGV error',
                'Error loading the contigs on the browser.',
                this.$el('.message-area'));
        }
        this.igvBrowser.loadTrack({
            type: 'annotation',
            format: 'gff3',
            displayMode: 'EXPANDED',
            url: process.env.API_URL + 'analyses/' +
                 this.collection.accession + '/contigs/' + this.currentContigName +
                 '/annotations?antismash=True',
            label: 'antiSMASH'
        }).then((newTrack) => {
            console.log('Track loaded: ' + newTrack.name);
        }).catch((error) => {
            // Handle error
            console.log(error);
        });
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
