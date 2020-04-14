const util = require('../util');
const _ = require('underscore');
const Backbone = require('backbone');

const commons = require('../commons');
const views = require('./search/views');
const collections = require('./search/collections');

require('webpack-jquery-ui/slider');
require('webpack-jquery-ui/css');

const Slider = require('../components/slider.js');

util.setupPage('#search-nav');
util.attachTabHandlers();

let queryText = util.getURLFilterParams()['query'];
$('#navbar-query').val(queryText);

$(document).ready(function() {
    // TODO convert to template argument
    $('#pagesize-text').hide();
});

$('#pageSize').append(commons.pagesize).find('#pagesize').change(function() {
    updateAll($(this).val());
});

/**
 * Show loading gif
 */
function showSpinner() {
    $('.loading-table').addClass('show');
}

/**
 * Hide loading gif
 */
function hideSpinner() {
    $('.loading-table').removeClass('show');
}

/**
 * Retrieve list of other facet form Ids other than specified id
 * @param {string} except id to exclude from list
 * @return {[string]} Array of form ids
 */
function getAllFormIds(except) {
    return $('form.search-filters:not(#' + except + ')').map((i, elem) => {
        return '#' + elem.id;
    }).get();
}

// TODO: this belongs in a VIEW
const $searchForm = $('#headerSearchForm');
$searchForm.on('reset', function() {
    window.location.href = 'search';
});

/**
 * Enable or disable a slider
 * @param {jQuery.HTMLElement} $checkbox jQuery elem of toggle button
 * @param {boolean} enabled
 */
function setSlider($checkbox, enabled) {
    const $groupContainer = $checkbox.parent().parent();
    const $elemGroup = $groupContainer.siblings('.slider-group');
    if (enabled) {
        $elemGroup.removeClass('disabled');
        $elemGroup.find('.slider').slider('enable');
    } else {
        $elemGroup.addClass('disabled');
        $elemGroup.find('.slider').slider('disable');
    }
    $elemGroup.find(':input').prop('disabled', !enabled);
}

/**
 * Callback for toggle button which enables/disables slider
 * @param {event} e
 */
function sliderToggleCallback(e) {
    const $checkbox = $(this);
    const dataFacetName = $checkbox.attr('data-facet-name');
    const enabled = $checkbox.is(':checked');

    setSlider($checkbox, enabled);
    const formId = $(this).closest('form').attr('id');
    if (e && e.originalEvent && e.originalEvent.isTrusted) {
        _.map(getAllFormIds(formId), function(otherFacetForm) {
            const $checkbox = $(otherFacetForm)
                .find('input.switch-input[data-facet-name="' + dataFacetName +
                    '"]');
            $checkbox.trigger('click');
            setSlider($checkbox, enabled);
        });
        updateAll();
    }
}

/**
 * Pre-load filter forms with formData
 * @param {string} formId id of form in facet
 * @param {*} formData
 */
function setFacetFilters(formId, formData) {
    let setSliders = [];
    if (formData.query) {
        const facets = formData.query.split(' AND ');
        const $form = $(formId);
        _.each(facets, function(facet) {
            const data = views.SLIDER_PARAM_RE.exec(facet);
            if (data && data.length === 4) {
                const facetName = data[1];
                setSliders.push(facetName);
                const valueMin = data[2];
                const valueMax = data[3];
                $form.find('[name=' + facetName + 'min]')
                    .val(valueMin)
                    .prop('disabled', false);
                $form.find('[name=' + facetName + 'max]')
                    .val(valueMax)
                    .prop('disabled', false);
                $form.find('.slider[data-facet-slider=' + facetName + ']')
                    .slider({
                        values: [valueMin, valueMax],
                        disabled: false
                    });
                $form.find('.switch-input[data-facet-name=' + facetName + ']')
                    .prop('checked', true);
            }
        });
    }
    _.each(['temperature', 'depth'], function(facetName) {
        $(formId)
            .find('.' + facetName + '-group')
            .find('input.switch-input')
            .each(function() {
                const enabled = setSliders.indexOf(facetName) > -1;
                $(this).prop('checked', enabled);
                setSlider($(this), enabled, false);
                // addClearButton($(this), $(".filter-clear"));
            });
    });
    $(formId).find('.switch-input').click(sliderToggleCallback);
}

/**
 * Instantiate sliders in form
 * @param {jQuery.HTMLElement} $form jQuery elem of form
 * @param {string} facet {projects, samples, analyses}
 * @param {callback} callback action required on slider value change
 * @param {jQuery.HTMLElement} $btnContainer container of button
 */
function createSliders($form, facet, callback, $btnContainer) {
    let tempSliderOptions = {
        facet: facet,
        label: 'Temperature',
        name: 'temperature',
        min: -20,
        max: 110,
        units: '°C',
        callback: callback,
        $btnContainer: $btnContainer
    };
    new Slider().init($form, tempSliderOptions);
    let depthSliderOptions = {
        facet: facet,
        label: 'Depth',
        name: 'depth',
        min: 0,
        max: 2000,
        units: 'meters',
        callback: callback,
        $btnContainer: $btnContainer
    };
    new Slider().init($form, depthSliderOptions);
}

/**
 * Method to update all views following form events
 * @param {number} pagesize
 * @return {jQuery.promise}
 */
function updateAll(pagesize) {
    showSpinner();
    return $.when(
        projectsView.update(null, pagesize),
        samplesView.update(null, pagesize),
        analysesView.update(null, pagesize)
    ).done(function() {
        hideSpinner();
    });
}

/**
 * Method to instantiate all views on page load
 * @param {Backbone.View} projectsView
 * @param {Backbone.View} samplesView
 * @param {Backbone.View} analysesView
 * @return {jQuery.promise}
 */
function initAll(projectsView, samplesView, analysesView) {
    showSpinner();

    const projectFacetView = new views.FacetFiltersView({
        el: () => '#projectsFilters',
        queryDomain: 'projects',
        facets: [
            ['biome', 'Biome'],
            ['centre_name', 'Centre name']
        ]
    });

    const sampleFacetView = new views.FacetFiltersView({
        el: () => '#samplesFilters',
        queryDomain: 'samples',
        facets: [
            ['biome', 'Biome'],
            ['experiment_type', 'Experiment type']
        ]
    });

    const analysisFacetView = new views.FacetFiltersView({
        el: () => '#analysesFilters',
        queryDomain: 'analyses',
        facets: [
            ['biome', 'Biome'],
            ['organism', 'Organism'],
            ['pipeline_version', 'Pipeline version'],
            ['experiment_type', 'Experiment type'],
            ['GO', 'GO'],
            ['INTERPRO', 'InterPro']
        ]
    });

    return $.when(
        projectsView.fetchAndRender(true),
        samplesView.fetchAndRender(true),
        analysesView.fetchAndRender(true),
        projectFacetView.fetchFacets(),
        sampleFacetView.fetchFacets(),
        analysisFacetView.fetchFacets()
    ).done(function() {
        hideSpinner();

        setFacetFilters(projectFacetView.formEl, projectsView.params);

        createSliders(
            $(samplesView.formEl),
            'samples',
            samplesView.update.bind(samplesView),
            $(samplesView.buttonsContainerEl)
        );

        setFacetFilters(samplesView.formEl, samplesView.params);

        createSliders(
            $(analysesView.formEl),
            'analyses',
            analysesView.update.bind(analysesView),
            $(analysesView.buttonsContainerEl)
        );
        setFacetFilters(analysesView.formEl, analysesView.params);

        projectFacetView.render();
        sampleFacetView.render();
        analysisFacetView.render();

        // Hooks events
        /**
         * Handler
         * @param {FacetItem} facet FacetItem Model instance
         */
        function facetEventHandler(facet) {
            this.toggleFilterButton(
                facet.getFacetPathRoot(),
                facet.get('value'),
                facet.get('checked'),
                function setFalse() {
                    facet.set('checked', false);
                });
            this.update();
        }

        projectsView.listenTo(
            Backbone,
            'facet-item:change:projects',
            facetEventHandler
        );
        samplesView.listenTo(
            Backbone,
            'facet-item:change:samples',
            facetEventHandler
        );
        analysesView.listenTo(
            Backbone,
            'facet-item:change:analyses',
            facetEventHandler
        );
    });
}

let projectsView = new views.ProjectsView({
    collection: new collections.Projects()
});

let samplesView = new views.SamplesView({
    collection: new collections.Samples()
});

let analysesView = new views.AnalysesView({
    collection: new collections.Analyses()
});

initAll(projectsView, samplesView, analysesView);
