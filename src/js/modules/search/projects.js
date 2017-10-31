import {Search, ResultsView, loadSearchParams, saveSearchParams} from './search_util'

const Pagination = require('../../components/pagination').Pagination;
const _ = require('underscore');
const Backbone = require('backbone');

let queryText = util.getURLFilterParams().get('query');
$("#navbar-query").val(queryText);

export const Project = function () {
    const model = Backbone.Model.extend({
        parse: function (d) {
            // d.biomes = [];
            // _.each(d.fields.biome, function(biome){
            //     biome = 'root:'+biome.replace(/\/([^\/]*)$/, '').replace(/\//g, ':');
            //     d.biomes.push({
            //         name: util.formatLineage(biome),
            //         icon: util.getBiomeIcon(biome)
            //     });
            // });
            d.biomes = convertBiomes(d);
            d.study_link = '/study/' + d.id;
            return d;
        }
    });

    const collection = Search.extend({
        tab: 'projects',
        parse: function (response) {
            let data = response.entries.map(Project.prototype.parse);
            return data;
        }
    });

    const view = ResultsView.extend({
        el: '#projects',
        formEl: 'projectsForm',
        params: {},
        pagination: new Pagination(),
        template: _.template($("#projectResultsTmpl").html()),
        defaultQuery: 'domain_source:metagenomics_projects',

        initialize: function () {
            this.pagination.setPaginationElem('#projects-pagination');
            const cookieParams = loadSearchParams('projects', queryText);
            if (cookieParams) {
                this.params = cookieParams;
            } else {
                this.params = $.extend(true, {}, Search.prototype.params);
                this.params.fields = "ENA_PROJECT,METAGENOMICS_RUNS,METAGENOMICS_SAMPLES,biome,biome_name,centre_name,creation_date,description,domain_source,id,last_modification_date,name,releaseDate_date";
            }
            this.params.query = queryText || this.defaultQuery;
        },

        update: function (page, pagesize) {
            var formData = removeRedundantBiomes($('#' + this.formEl).serializeArray());
            this.params.facets = joinFilters(formData);
            if (!this.params.query.length) {
                this.params.query = this.defaultQuery;
            }
            if (pagesize) {
                this.params.size = pagesize;
            }
            if (page) {
                this.params.start = parseInt(this.params.size) * (page - 1);
            }
            return this.fetchAndRender(false, false);
        },

        fetchAndRender: function (renderFilter, setFilters) {
            const that = this;
            return this.collection.fetch({
                data: $.param(that.params),
                success: function (collection, response) {
                    console.log(response);
                    that.totalResults = response.hitCount;

                    saveSearchParams('projects', that.params);
                    if (renderFilter) {
                        filters.render('#projectsFilters', response, that.formEl, that.params.query);
                        const $form = $('#' + that.formEl);

                        $form.find("input[type=checkbox]:not('.switch-input')").on('click', function () {
                            setChildrenCheckboxes(this);
                            setParentCheckboxStatus(this);
                            addClearButton($(this), $('.filter-clear'));
                            propagateToFacets($(this).attr('type'), $(this).attr('name'), $(this).val(), $(this).is(':checked'), ['#samplesFilters', '#runsFilters']);
                            updateAll();
                        });

                        // $form.find('button.reset').click(function () {
                        //     resetAllForms();
                        // });

                        that.pagination.initPagination(1, that.params.size, Math.ceil(response.hitCount / that.params.size), response.hitCount, function (page) {
                            that.update(page);
                        });
                        that.pagination.setPageSizeChangeCallback(updateAll);

                        let $modal = $('#projectsModal');
                        let elem = new Foundation.Reveal($modal);
                        $modal.on('closed.zf.reveal', function () {
                            console.log('closed');
                        });

                    }
                    if (setFilters) {
                        setFacetFilters('#' + that.formEl, that.params);
                    }
                    that.render(response, that.params);
                    $(that.el).find("button[name='download']").click(function () {
                        that.fetchCSV($(this));
                    });
                }
            }).promise();
        },
    });
};


let projects = new Projects();
let projectsView = new ProjectsView({collection: projects});