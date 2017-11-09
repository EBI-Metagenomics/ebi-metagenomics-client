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
        name = name.toLowerCase();
        const context = {
            slider_id: sliderId,
            switch_id: facet + label + 'Switch',
            facet_label: name,
            facet_name_min: (name+'min'),
            facet_name_max: (name+'max'),
            name: label,
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
            disabled: true,
            slide: function (e, ui) {
                $minInput.val(ui.values[0]);
                $maxInput.val(ui.values[1]);
                if (e.originalEvent) {
                    propagateValues(name, sliderId, ui.values);
                    callback();
                }
            }
        });
        attachInputHandler($minInput, $slider, 'min', callback);
        attachInputHandler($maxInput, $slider, 'max', callback);

        // $slider.slider('option', 'disabled', true);
        $minInput.prop('disabled', true);
        $maxInput.prop('disabled', true);

        const $switch = $sliderContainer.find('.switch-input');
        attachSwitchHandler($switch, $slider, $minInput, $maxInput, allForms, $btnContainer, label, name, callback);
        // setRmvButton($btnContainer, $switch, $slider, label, name);
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
        $minInput.trigger('change');
        $slider.trigger('slide').trigger('change')
    };

    const attachInputHandler = function ($input, $slider, minOrMax, callback) {
        const i = minOrMax === 'max' ? 1 : 0;
        $input.change(function (e) {
            $slider.slider('values', i, $input.val());
            if (e.originalEvent) {
                propagateValues($slider.attr('data-facet-slider'), $slider.attr('id'), $slider.slider('values'));
                callback();
            }
        });
    };

    const attachSwitchHandler = function ($switch, $slider, $minInput, $maxInput, allFormIds, $btnContainer, label, name, callback) {
        $switch.click(function (e) {
            const disabled = !$switch.is(':checked');
            // const disabled = $slider.slider('option', 'disabled');
            $slider.slider('option', 'disabled', disabled);
            $minInput.prop('disabled', disabled);
            $maxInput.prop('disabled', disabled);
            if (disabled) {
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
            callback();
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

