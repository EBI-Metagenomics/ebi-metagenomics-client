const _ = require('underscore');
const Backbone = require('backbone');
const util = require('../../util');

const {Pagination} = require('../../components/pagination');
const FilterBtnWidget = require('../../components/rmvFilterWidget');
const createRmvButton = new FilterBtnWidget().create;

const commons = require('../../commons');
const Cookies = require('js-cookie');
const cookieName = commons.COOKIE_NAME;

require('style-loader!../../../../static/css/modules/search.css');
require('style-loader!../../../../static/css/modules/table.css');

const collections = require('./collections');

export const SLIDER_PARAM_RE = /(\w+):\[\s*([-]?\d+) TO ([-]?\d+)]/;

/**
 * View for a FacetItemModel, the checkboxes within the tree
 */
export const FacetItemView = Backbone.View.extend({
    tagName: 'div',
    className() {
        let cls = 'facet-group';
        if (this.model.isRoot()) {
            cls += ' show';
        }
        return cls;
    },
    template: _.template($('#facetItemTmpl').html()),
    events: {
        'change input:first': function() {
            this.model.toggleChecked();
        },
        'click > .toggle-tree-node': 'toggleExpanded',
        'click > .load-more': 'loadMore'
    },
    initialize() {
        this.listenTo(this.model.get('children'), 'update', () => {
            this.render();
        });
        this.listenTo(this.model, 'change:checked', () => {
            this.$('#' + this.model.cid).prop('checked', this.model.get('checked'));
            // Events per {projects,samples,analyses}
            const event = 'facet-item:change:' + this.model.get('queryDomain');
            Backbone.trigger(event, this.model);
        });
        this.listenTo(this.model, 'change:visible', () => {
            this.$el.toggle(this.model.get('visible'));
        });
        this.loadedMore = false;
    },
    render() {
        this.$el.html(this.template({
            entry: this.model
        }));
        if (this.model.hasChildren()) {
            this.model.get('children').each((child) => {
                const itemView = new FacetItemView({
                    model: child
                });
                this.$el.append(itemView.render().el);
            });
            if (!this.loadedMore) {
                this.$el.append(
                    $('<a href="#" class="load-more">Load more</a>')
                );
            }
        }
        return this;
    },
    loadMore(e) {
        e.preventDefault();
        const colFacet = this.model.getFacetPathRoot(); // i.e. organism from organism/Bacteria
        // event used to show the loading banner
        Backbone.trigger('facet:load-more:loading:' + colFacet);
        this.model.loadMore().always(() => {
            // event used to show the loading banner
            Backbone.trigger('facet:load-more:done:' + colFacet);
        });
        return this;
    },
    toggleExpanded(event) {
        this.model.toggleExpanded();
        if (event) {
            // &#9660; => closed
            // &#9654; => opened
            if (this.model.get('expanded')) {
                $(event.currentTarget).html('&#9660;');
            } else {
                $(event.currentTarget).html('&#9654;');
            }
            event.preventDefault();
        }
        this.$('> .facet-group').toggle();
        this.$('> .load-more').toggleClass('show', this.model.get('expanded'));
        return this;
    }
});

/**
 * On facet filter, such as biome or organism
 */
export const FacetView = Backbone.View.extend({
    template: _.template($('#facetViewTmpl').html()),
    initialize(options) {
        this.queryDomain = options.queryDomain;
        this.facetField = options.facetField;
        this.facetFieldLabel = options.facetFieldLabel;
        this.views = [];
        this.facetCollection = new collections.FacetsCollection([], {
            facetField: options.facetField,
            facetFieldLabel: options.facetFieldLabel,
            queryDomain: options.queryDomain
        });
        this.listenTo(this.facetCollection, 'reset', () => {
            this.render();
        });
        // top level loading
        // inner facets trigger this event
        this.listenTo(Backbone, 'facet:load-more:loading:' + this.facetField, () => {
            this.$('.loading-hover').addClass('show');
        });
        this.listenTo(Backbone, 'facet:load-more:done:' + this.facetField, () => {
            _.delay(() => {
                this.$('.loading-hover').removeClass('show');
            }, 1000);
        });
        // view state vars
        this.loadedMore = false;
        this.enableFilter = options.enableFilter;
        return this;
    },
    events: {
        'keyup .filter': 'filter',
        'click .facets > .load-more': 'loadMore'
    },
    filter: _.debounce(function(e) {
        // Only working on the first level (not searching in children of children...)
        const search = e.currentTarget.value.toLowerCase();
        if (search.length === 0) {
            this.facetCollection.each((model) => model.set('visible', true));
        }
        if (search.length <= 2) {
            return this;
        }
        this.facetCollection.each((model) => {
            model.set('visible', model.get('label').toLowerCase().indexOf(search) > -1);
        });
        return this;
    }, 500),
    loadMore(e) {
        e.preventDefault();
        this.loadedMore = true;
        this.$('.loading-hover').toggleClass('show', true);
        this.facetCollection.fetch({
            data: {
                facetcount: 500,
                facetsdepth: 1
            },
            reset: true
        }).always(() => {
            this.$('.loading-hover').toggleClass('show', false);
        });
        return this;
    },
    render(onlyCollection) {
        if (!onlyCollection) {
            this.$el.html(
                this.template({
                    cid: this.cid,
                    queryDomain: this.queryDomain,
                    facetFieldLabel: this.facetFieldLabel,
                    enableFilter: this.enableFilter
                })
            );
        }
        this.views.forEach((view) => view.remove());
        this.views = [];
        this.facetCollection.forEach((item) => {
            if (!item.get('visible')) return;
            const itemView = new FacetItemView({
              model: item
            });
            this.views.push(itemView);
            this.$('.columns').append(itemView.render().el);
        });
        // only for refresh
        if (!onlyCollection && !this.loadedMore && this.facetCollection.length >= 10) {
            this.$('.columns').append(
                $('<a href="#" class="load-more show">Load more</a>')
            );
        }
        return this;
    }
});

/**
 * Container view for facet views.
 * For example the facets for Samples
 */
export const FacetFiltersView = Backbone.View.extend({
    initialize(options) {
        this.queryDomain = options.queryDomain;
        this.facets = [];
        _.each(options.facets, (facetOptions) => {
            const facetView = new FacetView(
                _.extend(facetOptions, {
                    queryDomain: options.queryDomain
                })
            );
            this.facets.push(facetView);
        });
        return this;
    },
    fetchFacets() {
        const deferred = $.Deferred();
        let promises = [];
        _.each(this.facets, (facetView) => {
            promises.push(facetView.facetCollection.fetch());
        });
        $.when(...promises).then(()=> {
            deferred.resolve();
        }).catch((err) => {
            deferred.reject(err);
        });
        return deferred.promise();
    },
    render() {
        _.each(this.facets, (facet) => {
            this.$el.append($('<div/>', {
                'id': facet.cid,
                'class': 'facet-group-container'
            }));
            facet.setElement('#' + facet.cid);
            facet.render();
        });
        return this;
    }
});

/**
 * Generic view of search results, should only be instantiated via subclass
 */
const ResultsView = Backbone.View.extend({

    render(response, params, noDisplay, columns) {
        $(this.numResultDisp).text('(' + response['hitCount'] + ')');
        let templateData = $.extend({}, response);
        const defaultQueries = [
            ProjectsView.prototype.defaultQuery,
            SamplesView.prototype.defaultQuery,
            AnalysesView.prototype.defaultQuery
        ];

        if (defaultQueries.indexOf(params.query) === -1) {
            const splitParams = params.query.split(' AND ');

            templateData.queryText = _.reject(
                splitParams,
                this.isSliderParam)[0];

            const sliderParams = _.filter(splitParams, this.isSliderParam);
            templateData.sliderText = sliderParams.join(', ');
        } else {
            templateData.queryText = null;
            templateData.sliderText = null;
        }

        if (params.facets && params.facets.length > 0) {
            templateData.filterText = params.facets.replace(/,/g, ', ');
        } else {
            templateData.filterText = null;
        }
        templateData['subfolder'] = util.subfolder;
        templateData['queryString'] = this.formatSearchSummaryStr(templateData);
        if (!noDisplay) {
            const $data = $(this.template(templateData));
            $data.find('td').map(function() {
                if (columns.indexOf($(this).attr('data-column')) === -1) {
                    $(this).hide();
                }
            });
            this.$el.html($data);
        } else {
            return this.template(templateData);
        }
    },

    getQueryText() {
        return $('#headerSearchForm').find('#navbar-query').val();
    },

    getHash() {
        const hash = util.getHashFromLocation();
        return hash || '#projects'; // DEFAULT
    },

    /**
     * Load filters from the querystring
     * @param {string} facet {projects, samples, analyses}
     * @return {{filters: *, query: *}}
     */
    loadSearchParams(facet) {
        // TODO: not functional.
        //      requires the package query-string
        // const qs = queryString.parse(location.search) || {};
        // return {
        //     filters: _.pick(qs, facet),
        //     query: qs.query
        // };
        return {
            filters: undefined,
            query: undefined
        };
    },

    /**
     * Format search summary from params
     * @param {object} params with properties queryText, filterText and sliderText
     * @return {string}
     */
    formatSearchSummaryStr(params) {
        let str = '';
        const queryText = params.queryText || '';
        const validQueryText = queryText.length > 0;
        const filterText = params.filterText || '';
        const validFilterText = filterText.length > 0;
        const sliderText = params.sliderText || '';
        const validSliderText = sliderText.length > 0;

        if (validQueryText) {
            str += ' with keyword: ' + queryText;
        }
        if (validFilterText) {
            if (validQueryText) {
                str += ' and ';
            } else {
                str += ' with ';
            }
            str += 'filters: ' + filterText;
        }
        if (validSliderText) {
            if (validQueryText || validFilterText) {
                str += ' and ';
            } else {
                str += ' with ';
            }
            str += sliderText;
        }
        if (!(validQueryText || validFilterText || validSliderText)) {
            str += ' with no parameters';
        }
        str += '.';
        return str;
    },

    /**
     * Method to generate initial search parameters for a
     * view, either from stored cookie or defaults
     * @param {{}} queryStringParams
     */
    genInitParams(queryStringParams) {
        this.params = $.extend(true, {}, collections.Search.prototype.params);

        if (queryStringParams) {
            this.params.facets = queryStringParams.filters || '';
            this.params.query = this.getQueryText() || queryStringParams.query ||
                this.defaultQuery;
        } else {
            this.params.facets = '';
            this.params.query = this.getQueryText() || this.defaultQuery;
        }
        this.params.fields += this.defaultParamFields;
    },

    /**
     * Returns true if parameter name is that of a slider
     * @param {string} name
     * @return {boolean}
     */
    isSliderParam(name) {
        const res = SLIDER_PARAM_RE.exec(name);
        return res !== null && res.length === 4;
    },

    /**
     * Simplify filters (i.e do not query by sub-biome if parent biome is already included in filter
     * @param {[string]} formData list of filters
     * @return {[string]} simplified list of filters
     */
    removeRedundantFilters(formData) {
        let newData = [];
        _.each(formData, function(biome) {
            let parent = null;
            let biomeValue = biome.value;
            if (biomeValue.indexOf('/') > -1) {
                let pos = biomeValue.lastIndexOf('/');
                parent = biomeValue.substring(0, pos);
            } else {
                parent = '';
            }
            let parentExists = _.find(formData, function(biome2) {
                return biome2.value === parent;
            });

            if (!parentExists) {
                newData.push(biome);
            }
        });
        return newData;
    },

    /**
     * Store list of visible colums to cookie
     * @param {[string]} columns list of column names
     */
    saveVisibleColumns(columns) {
        let cookieData = Cookies.get(cookieName);
        if (cookieData) {
            cookieData = JSON.parse(cookieData);
        } else {
            cookieData = {};
        }
        if (cookieData[this.facetName]) {
            cookieData[this.facetName] = {
                columns,
                data: cookieData[this.facetName]['data']
            };
        } else {
            cookieData[this.facetName] = {
                columns
            };
        }
        Cookies.set(cookieName, cookieData);
    },

    /**
     * Retrieve names of visible columns of facets
     * @param {string} facet string  should be in [projects, samples, analyses]
     * @return {[string]} of visible columns or null
     */
    getVisibleColumns(facet) {
        let cookieData = Cookies.get(cookieName);
        let columns = null;
        if (cookieData) {
            cookieData = JSON.parse(cookieData);
            if (cookieData[facet]) {
                columns = cookieData[facet]['columns'];
            }
        }
        return columns;
    },

    /**
     * Method to update search parameters for a view based on form data, pagination data or defaults
     * @param {number} page currentPage (1-indexed)
     * @param {number} pagesize
     * @param {{}} formData
     */
    updateParams(page, pagesize, formData) {
        this.params.facets = formData.map(function(elem) {
            // The value has the facet path
            // i.e. biome/host-xxx/fff
            // => to search the sintax is different
            // biome:host-xxx/fff instead of the path
            return elem.value.replace('/', ':');
        }).join(',');

        if (pagesize) {
            this.params.size = pagesize;
        } else {
            this.params.size = $('#pagesize').val();
        }
        if (page) {
            this.params.start = parseInt(this.params.size) * (page - 1);
        } else {
            this.params.start = 0;
        }
    },

    /**
     * Instantiate result view with modal for column toggling
     * @param {jQuery.HTMLElement} $table jQuery elem of table for facet
     * @param {jQuery.HTMLElement} $modal jQuery elem of modal for table and facet
     * @param {[string]} initColumns initially visible columns
     */
    createDataTable($table, $modal, initColumns) {
        const that = this;
        _.each($table.find('thead').find('td'), function(column) {
            const text = $(column).text();
            const chkId = _.uniqueId(that.tableEl); // for the label
            const label = $(column).attr('data-column');
            const checked = initColumns.indexOf(label) !== -1;

            $table.find('td[data-column="' + label + '"]').toggle(checked);

            const $checkbox = $('<input>', {
                'id': chkId,
                'data-column': label,
                'type': 'checkbox',
                'class': 'toggle-visibility'
            });
            $checkbox.prop('checked', checked);

            // Toggle columns visibility handler
            $checkbox.on('click', function() {
                const $table = $(that.tableEl);
                const $modal = $(that.tableModal);
                $table.find('td[data-column="' + $(this).attr('data-column') + '"]')
                      .toggle($(this).is(':checked'));
                const visibleColumns = _.map($modal.find('input[type=checkbox]:checked'), (el) => {
                    return el.dataset.column;
                });
                that.saveVisibleColumns(visibleColumns);
            });

            const $label = $('<label>', {
                'for': chkId,
                'text': text,
                'class': 'text-right'
            });
            const $container = $('<div class="row column"></div>')
                .append($checkbox)
                .append($label);
            $modal.append($container);
        });
    },

    /**
     * Toggle selected filter clear buttons
     * on top of the table.
     * @param {string} label well... the label
     * @param {string} value Filter value (biome:Hist-associated)
     * @param {bool} switchOn add or remove
     * @param {function} closeCallback callback (i.e. model.set unchecked)
     * @return {object} the view
     */
    toggleFilterButton(label, value, switchOn, closeCallback) {
        const $container = $(this.buttonsContainerEl);
        if (switchOn) {
            $container.append(
                createRmvButton(label, value, closeCallback)
            );
        } else {
            let $btn = $('[data-facet="' + label + '"][data-value="'+ value +'"]', $container);
            $btn.remove();
        }
        return this;
    },

    fetchCSV($buttonElem) {
        $buttonElem.prop('disabled', true);
        $buttonElem.addClass('loading-cursor');

        let parameters = $.extend(true, {
            total: this.totalResults
        }, this.params);

        const domain = this.defaultQuery.replace('domain_source:', '');

        delete parameters.facetcount;
        delete parameters.facetsdepth;

        const queryString = $.param(parameters);

        window.open(
            process.env.SEARCH_CSV_ENDPOINT +
            domain + '?' +
            queryString, '_blank'
        );

        _.delay(function() {
            $buttonElem.removeClass('loading-cursor');
            $buttonElem.prop('disabled', false);
        }, 500);
    },

    /**
     * Calculate pagination metrics
     * @param {number} hitcount total number of results
     * @param {number} start starting
     * @param {number} pagesize pagesize
     * @return {{page: number, pages: number}}
     */
    getPagesObj(hitcount, start, pagesize) {
        let page = (parseInt(start) / parseInt(pagesize)) + 1;
        let pages = Math.ceil(parseInt(hitcount) / parseInt(pagesize)) || 1;
        return {
            page,
            pages
        };
    },

    fetchAndRender(renderFilter) {
        const that = this;
        // TODO:  not functional.
        //        requires the package query-string
        // // update the query string
        // window.history.replaceState('',
        //     document.title,
        //     location.pathname +
        //     '#' + that.getHash() +
        //     '?' + queryString.stringify({
        //         [that.facetName]: that.params.facets,
        //         query: that.params.query
        //     })
        // );
        $('.loading-table').addClass('show');

        return this.collection.fetch({
            data: $.param(this.params),
            success(ignored, response) {
                that.totalResults = response.hitCount;
                const columns = that.getVisibleColumns(that.facetName) ||
                    that.initColumns;

                that.render(response, that.params, false, columns);

                if (renderFilter) {
                    that.createDataTable(
                        $(that.tableEl),
                        $(that.tableModal),
                        columns
                    );
                    that.pagination.init(
                        1,
                        that.params.size,
                        Math.ceil(response.hitCount / that.params.size),
                        response.hitCount,
                        function(page) {
                            that.update(page);
                        });
                } else {
                    const pageObj = that.getPagesObj(
                        response.hitCount,
                        that.params.start,
                        that.params.size
                    );
                    that.pagination.update(pageObj, function(page) {
                        that.update(page);
                    });
                }

                // Until the backend is fixed (EMG-1542) we are capping the 
                // total numer of results users can download
                // using the CSV button
                var $csvButton = $(that.el).find('button[name="download"]');
                $csvButton.prop('title', '');
                if (that.totalResults > 100) {
                    $csvButton.prop('disabled', true);
                    $csvButton.prop('title', 'CSV download limited to 100 results.');
                } else {
                    $csvButton.prop('disabled', false);
                    $csvButton.on('click', function() {
                        that.fetchCSV($(this));
                    });
                }

                $('.loading-table').removeClass('show');
            },
            error() {
                $('.loading-table').removeClass('show');
            }
        }).promise();
    }
});


/**
 * Generic results view with slider handling, should be parametrised via subclass
 * (see SamplesView, AnalysesView)
 */
const ComplexResultsView = ResultsView.extend({
    params: {},
    pagination: null,

    setDefaultParams() {
        this.params = $.extend(true, {}, collections.Search.prototype.params);
        this.params.fields += this.defaultParamFields;
        this.params.searchQuery = this.defaultQuery;
    },

    initialize() {
        this.pagination = new Pagination();
        this.pagination.setPaginationElem(this.paginationElem);

        const qsParameters = this.loadSearchParams(this.facetName);
        this.genInitParams(this, qsParameters);
    },
    /**
     * Retrieve value from slider and facets to which the slider is applied,
     * and the query text for the slider
     * @param {object} formData
     * @return {{facets, queryParams: Array}}
     */
    processSliders(formData) {
        const queryNames = [
            'temperaturemin',
            'temperaturemax',
            'depthmin',
            'depthmax'
        ];
        const temp = [null, null];
        const depth = [null, null];
        _.each(formData, function(elem) {
            switch (elem.name) {
                case 'temperaturemin':
                    temp[0] = elem.value;
                    break;
                case 'temperaturemax':
                    temp[1] = elem.value;
                    break;
                case 'depthmin':
                    depth[0] = elem.value;
                    break;
                case 'depthmax':
                    depth[1] = elem.value;
                    break;
                default:
            }
        });
        let queryParams = [];

        if (temp.indexOf(null) === -1) {
            queryParams.push('temperature:[' + temp[0] + ' TO ' + temp[1] + ']');
        }
        if (depth.indexOf(null) === -1) {
            queryParams.push('depth:[' + depth[0] + ' TO ' + depth[1] + ']');
        }
        return {
            facets: formData.filter(function(elem) {
                return (queryNames.indexOf(elem.name) === -1);
            }),
            queryParams
        };
    },
    update(page, pagesize) {
        const data = this.removeRedundantFilters(
            $(this.formEl).serializeArray()
        );
        let formData = this.processSliders(data);

        const queryText = this.getQueryText();

        if (queryText) {
            formData.queryParams.push(queryText);
        }
        this.params.query = formData.queryParams.join(' AND ');

        if (this.params.query === '') {
            this.params.query = this.defaultQuery;
        }

        this.updateParams(page, pagesize, formData.facets || []);

        return this.fetchAndRender(false, false);
    }
});

/**
 * Parametrised subclass of results view w/ sliders
 */
export const SamplesView = ComplexResultsView.extend({
    facetName: 'samples',
    el: '#samplesResults',
    formEl: '#samplesFilters',
    buttonsContainerEl: '#samples-search-params',
    template: _.template($('#samplesResultsTmpl').html()),
    defaultQuery: 'domain_source:metagenomics_samples',
    tableEl: '#samplesTable',
    tableModal: '#samplesModal',
    initColumns: [
        'sample-id',
        'sample-projects',
        'sample-name',
        'sample-desc'],
    paginationElem: '#samples-pagination',
    defaultParamFields: ',METAGENOMICS_PROJECTS,project_name,biome_name',
    numResultDisp: '#numSampleResults'

});

/**
 * Parametrised subclass of results view w/ sliders
 */
export const AnalysesView = ComplexResultsView.extend({
    facetName: 'analyses',
    el: '#analysesResults',
    formEl: '#analysesFilters',
    buttonsContainerEl: '#analyses-search-params',
    template: _.template($('#analysesResultsTmpl').html()),
    defaultQuery: 'domain_source:metagenomics_analyses',
    tableEl: '#analysesTable',
    tableModal: '#analysesModal',
    initColumns: [
        'analysis-id',
        'analysis-sample',
        'analysis-project',
        'analysis-experiment-type',
        'analysis-pipeline-vers'],
    paginationElem: '#analyses-pagination',
    defaultParamFields: ',METAGENOMICS_PROJECTS,METAGENOMICS_SAMPLES,' +
    'experiment_type,pipeline_version,ASSEMBLY,ENA_RUN,ENA_WGS_SEQUENCE_SET',
    numResultDisp: '#numAnalysisResults'

});

/**
 * View for projects search results
 */
export const ProjectsView = ResultsView.extend({
    facetName: 'projects',
    el: '#projectsResults',
    formEl: '#projectsFilters',
    buttonsContainerEl: '#projects-search-params',
    params: {},
    pagination: new Pagination(),
    template: _.template($('#projectResultsTmpl').html()),
    defaultQuery: 'domain_source:metagenomics_projects',
    initColumns: [
        'project-ena-accession',
        'project-id',
        'project-biome',
        'project-centre-name'
    ],
    tableEl: '#projectsTable',
    tableModal: '#projectsModal',
    numResultDisp: '#numStudyResults',

    initialize() {
        this.pagination.setPaginationElem('#projects-pagination');

        const qsParameters = this.loadSearchParams('projects');
        this.genInitParams(this, qsParameters);

        this.params.fields = [
            'ENA_PROJECT',
            'METAGENOMICS_ANALYSES',
            'METAGENOMICS_SAMPLES',
            'biome_name',
            'centre_name',
            'creation_date',
            'description',
            'domain_source',
            'id',
            'last_modification_date',
            'name',
            'releaseDate_date'
        ].join(',');
    },

    update(page, pagesize) {
        let formData = this.removeRedundantFilters(
            $(this.formEl).serializeArray()
        );
        if (!this.params.query.length) {
            this.params.query = this.defaultQuery;
        }

        this.updateParams(page, pagesize, formData);

        return this.fetchAndRender(false, false);
    }
});
