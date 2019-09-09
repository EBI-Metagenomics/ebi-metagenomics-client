const Backbone = require('backbone');
const _ = require('underscore');
const INTERPRO_URL = process.env.INTERPRO_URL;
const Commons = require('../commons');
const api = require('mgnify').api(process.env.API_URL);
const charts = require('mgnify').charts;
const util = require('../util');

const ClientSideTable = require('../components/clientSideTable');
const DetailList = require('../components/detailList');
const AnnotationTableView = require('../components/annotationTable');
require('tablesorter');

const TAXONOMY_COLOURS = Commons.TAXONOMY_COLOURS;

const DEFAULT_PAGE_SIZE = 25;

const analysisID = util.getURLParameter();

util.setupPage('#browse-nav');
util.specifyPageTitle('Analysis', analysisID);

/**
 * Tabs Manager.
 * Common methods to manage tabs.
 */
const TabsManagerMixin = {
    tabs: {},
    router: undefined,
    /**
     * Boot and hook the Tabs properties and methods.
     * @param {string} elementId DOM element id for the containter.
     */
    hookTabs(elementId) {
        this.$tabsTitleContainer = this.$(elementId);
        this.$tabsTitleContainer.attr({
            'role': 'tablist'
        });
        this.$tabTitles = this.$(elementId + ' .tabs-title');
        _.each(this.$tabTitles, (title) => {
            const $title = $(title);
            const $link = $title.children(':first');
            $title.attr({
                'role': 'tab',
                'aria-controls': $link.attr('href').slice(1), //TODO CHECK!
                'aria-selected': false,
                'tabindex': '-1'
            });
            $link.attr({
                'role': 'presentation'
            });
        });

        this.$tabTitles.on('click', this.selectTabHandler.bind(this));

        const cont = this.$('[data-tabs-content="'+ elementId.slice(1) + '"]');
        this.$tabsContainterEls = cont.children('.tabs-panel');
        _.each(this.$tabsContainterEls, (el) => {
            const $el = $(el);
            $el.attr({
                'role': 'tabpanel',
                'aria-labelledby': $el.attr('id')
            });
        });
    },
    /**
     * Add a tab with the corresponding tab isntance and route.
     * Provide a routingHandler if you want to customize the callback.
     * This is used for inner tabs at the moment:
     * For example for FnTab view inner tabs:
     *  FnTab inner tabs are url are #functional/interpro, interpro is the actual
     *  tabId so for FnTab the routing handler the app has to:
     *      - route to FnTab
     *      - FnTab has to route to interpro
     * so the routingHandler for FnTab would be:
     * ```js
     * routingHandler(tabId) {
     *  // tabId is interpro
     *  // this is Fn inner changeTab
     *  this.changeTab(subTabId);
     * }
     * ```
     * @param {string} tabId the tab id
     * @param {TabView} tab the tab instance
     * @param {string} route backbone-type route (for example "/tabs/:name")
     * @param {function} routingHandler route navigate handler
     */
    registerTab({tabId, tab, route, routingHandler, baseRoute}) {
        this.tabs = this.tabs || {};
        this.tabs[tabId] = {
            tab: tab,
            route: route,
            baseRoute: baseRoute
        };

        this.router.route(route, tabId, (args) => {
            this.changeTab(tabId);
            if (_.isFunction(routingHandler)) {
                routingHandler.apply(tab, [args]); /* route parameters */
            }
        });
    },
    /**
    * Switch to the selected tabId.
    * This method will:
    * - call the renderTab method on the selected tab
    * - update the DOM elements with the is-active and other visual changes required
    * @param {string} tabId the tab Id selector
    * @param {[string]} routes the routes
    * @return {Object} view This view.
    */
    changeTab(tabId) {
        const tabData = this.tabs[tabId];
        if (!tabData) {
            // TODO: show error banner!
            return this;
        }
        const tab = tabData.tab;
        tab.renderTab();
        _.each(this.$tabsContainterEls, (el) => {
            const $el = $(el);
            const isActive = $el.attr('id') === tabId;
            $el.attr('aria-hidden', !isActive);
            $el.toggleClass('is-active', isActive);
        });
        _.each(this.$tabTitles, (el) => {
            const $el = $(el).children(':first');
            const isActive = $el.data('tab-id') === tabId;
            $el.toggleClass('is-active', isActive);
            $el.attr({
                'aria-selected': isActive,
                'tabindex': isActive ? '0' : '-1'
            });
        });
        return this;
    },
    /**
     * Tab selection Handler.
     * This will trigger the router to change, that will
     * then trigger the changeTab as a callback
     * @param {Event} event click event
    */
    selectTabHandler(event) {
        event.preventDefault();
        const $tabAnchor = $(event.currentTarget);
        const tabId = $tabAnchor.children(':first').data('tab-id');

        const tabData = this.tabs[tabId];

        this.router.navigate(tabData.baseRoute || tabData.route, {trigger: true});
    },
    /**
     * Enable tab by id
     * @param {string} tabId of tab
     */
    enableTab(tabId) {
        this.$('[data-tab-id="' + tabId + '"]').parent('li').removeClass('disabled');
    },
    /**
     * Disable tab by id
     * @param {string} tabId of tab
     */
    removeTab(tabId) {
        this.$('[data-tab-id="' + tabId + '"]').parent('li').remove();
    }
};

/**
 * Tab mixin.
 * Provides the common view methods and properties.
 */
const TabMixin = {
    route: undefined, // The route that should trigger this view
    rendered: false,
    /**
     * Cached render fn.
     * @return {Object} This view
     */
    renderTab() {
        if (!this.rendered) {
            this.render();
            this.rendered = true;
        }
        return this;
    }
};


/**
 * Main view.
 * This view handles the tabs and the general data managment.
 */
const AnalysisView = Backbone.View.extend(TabsManagerMixin).extend({
    model: api.Analysis,
    template: _.template($('#analysisTmpl').html()),
    el: '#main-content-area',
    initialize() {
        this.router = new Backbone.Router();
    },
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

                if (attr.experiment_type !== 'Xamplicon') {
                    that.functionaTabView = new FunctionalTabView(analysisID, that.router);
                    that.registerTab({
                        tabId: 'functional',
                        tab: that.functionaTabView,
                        route: 'functional(/:innerTabId)',
                        baseRoute: 'functional',
                        routingHandler: function(innerTabId) {
                            this.changeTab(innerTabId);
                        }
                    });
                    that.enableTab('functional');
                } else {
                    that.removeTab('functional');
                }

                if (attr.experiment_type !== 'Xassembly') {
                    that.pathSystemsTabView = new PathSystemsTabView(analysisID, that.router);
                    that.registerTab({
                        tabId: 'path-systems',
                        tab: that.pathSystemsTabView,
                        route: 'path-systems(/:innerTabId)',
                        baseRoute: 'path-systems',
                        routingHandler: function(innerTabId) {
                            this.changeTab(innerTabId);
                        }
                    });
                    that.enableTab('path-systems');
                } else {
                    that.removeTab('path-systems');
                }
                that.registerTab({
                    tabId: 'overview',
                    tab: that.overviewTabView,
                    route: 'overview'
                });
                that.registerTab({
                    tabId: 'qc',
                    tab: that.qcTabView,
                    route: 'qc'
                });
                that.registerTab({
                    tabId: 'taxonomic',
                    tab: that.taxonomyTabView,
                    route: 'taxonomic'
                });

                that.registerTab({
                    tabId: 'download',
                    tab: that.downloadTabView,
                    route: 'download'
                });
                that.registerTab({
                    tabId: 'abundance',
                    tab: that.abundanceTab,
                    route: 'abundance'
                });

                // enable the selected tab
                let initial = (window.location.hash || '#overview');
                if (initial === '#functional' &&
                    attr.experiment_type === 'amplicon') {
                    that.changeTab('overview');
                } else if (initial === '#abundance' &&
                          !that.abundanceTab.enable) {
                    that.changeTab('overview');
                } else if (!window.location.hash) {
                    that.changeTab('overview');
                } else {
                    that.changeTab(initial);
                }
                Backbone.history.start({root: window.location.pathname});
                // Backbone.history.start();
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
const OverviewTabView = Backbone.View.extend(TabMixin).extend({
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
const QCTabView = Backbone.View.extend(TabMixin).extend({
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
let FunctionalTabView = Backbone.View.extend({
    template: _.template($('#functionalTmpl').html()),
    el: '#functional',
    initialize(analysisID, router) {
        this.analysisID = analysisID;
        this.router = router;
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
        this.pfamTab = new PfamTabView(this.analysisID);
        this.koTab = new KOTabView(this.analysisID);

        // this.tabs = {
        //     '#interpro': this.interProTab,
        //     '#go': this.goTermsTab,
        //     '#pfam': this.pfamTab,
        //     '#ko': this.koTab
        // };

        this.registerTab({
            tabId: 'interpro',
            tab: this.interProTab,
            route: 'functional/interpro'
        });

        this.registerTab({
            tabId: 'go',
            tab: this.goTermsTab,
            route: 'functional/go'
        });

        this.registerTab({
            tabId: 'pfam',
            tab: this.pfamTab,
            route: 'functional/pfam'
        });

        this.registerTab({
            tabId: 'ko',
            tab: this.koTab,
            route: 'functional/ko'
        });

        // this.$('#interpro').trigger('click');
    }
})
.extend(TabsManagerMixin)
.extend(TabMixin);

// ------------------------- //
// -- Functional sub tabs -- //
// ------------------------- //

const InterProTabView = Backbone.View.extend(TabMixin).extend({
    el: '#interpro',
    tabLevel: 2,
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

const GOTermsTabView = Backbone.View.extend(TabMixin).extend({
    el: '#go',
    tabLevel: 2,
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

const PfamTabView = Backbone.View.extend(TabMixin).extend({
    el: '#pfam',
    tabLevel: 2,
    model: api.Pfam,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.Pfam({
            id: analysisID
        });
    },
    render() {
        const that = this;

        this.tableView = new AnnotationTableView({
            el: '#pfam-table',
            model: api.Pfam,
            analysisID: this.analysisID
        });

        this.tableView.render();

        this.model.fetch({
            data: {
                page_size: 10 // Top 10.
            },
            success() {
                const data = that.model.attributes.data.map((d) => {
                    const attributes = d.attributes;
                    return [
                        attributes['accession'],
                        attributes['description'],
                        attributes['count']
                    ];
                });
                const chartOptions = {
                    title: 'Top 10 Pfam entries',
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Number of matches'
                        }
                    },
                    xAxis: {
                        categories: data.map((d) => d[0])
                    },
                    tooltip: {
                        formatter() {
                            return `${this.series.name}<br/> Count ${this.y}`;
                        }
                    },
                    series: [{
                        name: `Analysis ${that.analysisID} Pfam entries`,
                        data: data.map((d) => d[2]),
                        colors: Commons.TAXONOMY_COLOURS[1]
                    }]
                };

                this.chart = new charts.GenericColumnChart('pfam-chart', chartOptions);
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve taxonomic analysis for: ' + analysisID,
                    that.el);
            }
        });
        return this;
    }
});

const KOTabView = Backbone.View.extend(TabMixin).extend({
    el: '#ko',
    tabLevel: 2,
    model: api.KeggOrtholog,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.KeggOrtholog({
            id: analysisID
        });
    },
    render() {
        const that = this;

        this.tableView = new AnnotationTableView({
            el: '#ko-table',
            model: api.KeggOrtholog,
            analysisID: this.analysisID
        });

        this.tableView.render();

        this.model.fetch({
            data: {
                page_size: 10 // Top 10.
            },
            success() {
                const data = that.model.attributes.data.map((d) => {
                    const attributes = d.attributes;
                    return [
                        attributes['accession'],
                        attributes['description'],
                        attributes['count']
                    ];
                });
                const chartOptions = {
                    title: 'Top 10 KO entries',
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Number of matches'
                        }
                    },
                    xAxis: {
                        categories: data.map((d) => d[0])
                    },
                    tooltip: {
                        formatter() {
                            return `${this.series.name}<br/> Count ${this.y}`;
                        }
                    },
                    series: [{
                        name: `Analysis ${that.analysisID} KO entries`,
                        data: data.map((d) => d[2]),
                        colors: Commons.TAXONOMY_COLOURS[1]
                    }]
                };

                this.chart = new charts.GenericColumnChart('ko-chart', chartOptions);
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve KO analysis for: ' + analysisID,
                    that.el);
            }
        });
        return this;
    }
});

// ------------------------- //
// -- Path/Systems sub tabs //
// -------------------------//

let PathSystemsTabView = Backbone.View.extend({
    template: _.template($('#pathSystemsTmpl').html()),
    el: '#path-systems',
    initialize(analysisID) {
        this.analysisID = analysisID;
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

        this.tabs = {
            '#kegg-modules': this.keggTab,
            '#genome-properties': this.genomePropertiesTab
        };

        this.$('#kegg-modules').trigger('click');
    }
})
.extend(TabMixin)
.extend(TabsManagerMixin);

const KEGGModuleTabView = Backbone.View.extend(TabMixin).extend({
    el: '#kegg-module',
    model: api.KeggModule,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.KeggModule({
            id: analysisID
        });
    },
    render() {
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
        this.tableView.render();

        this.chart = new charts.AnalysisKeggColumnChart('kegg-module-chart', {
            accession: this.analysisID
        });
        return this;
    }
})
.extend(TabsManagerMixin)
.extend(TabMixin);

const GenomePropertiesTabView = Backbone.View.extend(TabMixin).extend({
    el: '#genome-properties',
    model: api.GenomeProperties,
    initialize(analysisID) {
        this.analysisID = analysisID;
        this.model = new api.GenomeProperties({
            id: analysisID
        });
    },
    render() {
        const that = this;

        this.tableView = new AnnotationTableView({
            el: '#genome-properties-table',
            model: api.GenomeProperties,
            analysisID: this.analysisID
        });

        this.tableView.render();

        this.model.fetch({
            data: {
                page_size: 10 // Top 10.
            },
            success() {
                const data = that.model.attributes.data.map((d) => {
                    const attributes = d.attributes;
                    return [
                        attributes['accession'],
                        attributes['description'],
                        attributes['count']
                    ];
                });
                const chartOptions = {
                    title: 'Top 10 Genomes properties',
                    yAxis: {
                        min: 0,
                        title: {
                            text: 'Number of matches'
                        }
                    },
                    xAxis: {
                        categories: data.map((d) => d[0])
                    },
                    tooltip: {
                        formatter() {
                            return `${this.series.name}<br/> Count ${this.y}`;
                        }
                    },
                    series: [{
                        name: `Analysis ${that.analysisID} Genome properties`,
                        data: data.map((d) => d[2]),
                        colors: Commons.TAXONOMY_COLOURS[1]
                    }]
                };

                this.chart = new charts.GenericColumnChart('genome-properties-chart', chartOptions);
            }, error(ignored, response) {
                util.displayError(
                    response.status,
                    'Could not retrieve genome properties analysis for: ' + analysisID,
                    that.el);
            }
        });
        return this;
    }
});

/**
 * Taxonomy results tab
 */
const TaxonomyTabView = Backbone.View.extend(TabMixin).extend({
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
const DownloadTabView = Backbone.View.extend(TabMixin).extend({
    template: _.template($('#downloadsTmpl').html()),
    el: '#download',
    render() {
        const that = this;
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
const AbundanceTabView = Backbone.View.extend(TabMixin).extend({
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
