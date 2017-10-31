const tmpl = require('../../partials/slider.handlebars');
const filterBtnWidget = require('./rmv_filter_widget');
const createRmvButton = new filterBtnWidget().create;
let _ = require('underscore');


module.exports = function Slier() {
    const containerDiv = "<div class='facet-group'></div>";
    const toggleContainer = "<div class='switch tiny'></div>";
    const allForms = ['#projectsFilters', '#samplesFilters', '#runsFilters'];

    const init = function ($elem, facet, label, name, min, max, units, callback, $btnContainer) {
        const sliderId = $elem.attr('id') + label;
        const context = {
            slider_id: sliderId,
            switch_id: facet + label + 'Switch',
            facet_label: label,
            name: name,
            min: min,
            max: max,
            units: units,
        };

        const $sliderContainer = $(tmpl(context));
        const $minInput = $sliderContainer.find('input.left');
        const $maxInput = $sliderContainer.find('input.right');
        const $slider = $sliderContainer.find('.slider');
        $slider.slider({
            range: true,
            min: min,
            max: max,
            values: [min, max],
            slide: function (event, ui) {
                $minInput.val(ui.values[0]);
                $maxInput.val(ui.values[1]);
                propagateValues(label, sliderId, ui.values);
                callback();
            }
        });

        attachInputHandler($minInput, $slider, 'min', callback);

        const $switch = $sliderContainer.find('.switch-input');
        attachSwitchHandler($switch, $slider, $minInput, $maxInput, allForms, $btnContainer, label, name);
        setRmvButton($btnContainer, $switch, $slider, label, name);
        $elem.append($sliderContainer);
        return this;
    };

    const propagateValues = function (label, sliderId, values) {
        const $slider = $(".slider[data-facet-slider='" + label + "']:not('#" + sliderId + "')");
        $slider.slider('values', values);
        const $sliderContainer = $slider.parent();
        const $minInput = $sliderContainer.find('input.left');
        const $maxInput = $sliderContainer.find('input.right');
        $minInput.val(values[0]);
        $maxInput.val(values[1]);
    };

    const attachInputHandler = function ($input, $slider, minOrMax, callback) {
        const i = minOrMax === 'max' ? 1 : 0;
        $input.change(function () {
            $slider.slider('values', i, $input.val());
            callback();
        });
    };

    const attachSwitchHandler = function ($switch, $slider, $minInput, $maxInput, allFormIds, $btnContainer, label, name) {
        $switch.click(function (e) {
            const state = $slider.slider('option', 'disabled');
            $slider.slider('option', 'disabled', !state);
            $minInput.prop('disabled', !state);
            $maxInput.prop('disabled', !state);
            if (!state) {
                $btnContainer.find("div[data-facet='" + label + "'][data-value='" + name + "']").remove();
            } else {
                setRmvButton($btnContainer, $switch, $slider, label, name);
            }
            if (e.originalEvent.isTrusted) {
                _.each(allFormIds, function (formId) {
                    const $facetButton = $(formId).find(".switch-input[data-facet-name='" + label + "']");
                    $facetButton.click();
                })
            }
        });
    };

    const setRmvButton = function ($btnContainer, $switch, $slider, label, name) {
        $btnContainer.append(createRmvButton(label, name, function () {
            $switch.click();
        }));
    };

    return {
        init: init,
    }
};

