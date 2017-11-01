const _ = require('underscore');
// const util = require('../util');
const filterBtnWidget = require('./rmv_filter_widget');
const createRmvButton = new filterBtnWidget().create;
const removeFilterButton = new filterBtnWidget().remove;

module.exports = function CheckboxTree() {
    const groupContainerTmpl = "<div class='facet-child-group'></div>";
    const $elem = null;
    const callback = null;
    const allForms = ['#projectsFilters', '#samplesFilters', '#runsFilters'];

    const init = function ($elem, $btnContainer, tree, callback, values) {
        this.$elem = $elem;
        this.$btnContainer = $btnContainer;

        this.callback = callback;
        const $treeContainer = $("<div class='tree-container'></div>");
        // Create title
        createTitle($elem, tree.label);

        // Create and expand nodes
        _.each(tree.facetValues, function (node) {
            drawAndPropagate($treeContainer, node, tree.id, $btnContainer, callback);
        });

        // Set checbox values
        _.each(values, function (facetValue) {
            if (facetValue.id === tree.id) {
                const $checkbox = $treeContainer.find("input[value='" + facetValue.value + "']");
                $checkbox.prop('checked', true);
                setChildrenCheckboxes($checkbox);
                setParentCheckboxStatus($checkbox);
                setRmvButton($btnContainer, $checkbox);
            }
        });

        $treeContainer.children('.facet-child-group').addClass('show');
        $elem.append($treeContainer);

        return this;
    };

    const reset = function () {
        $elem.find("input[type='checkbox']").prop('checked', false);
        callback();
    };

    const createTitle = function ($elem, title) {
        $elem.append("<h5>" + title + "</h5>")
    };

    const drawAndPropagate = function ($elem, node, tree_label, $btnContainer, callback) {
        const $checkbox = $(createCheckbox(tree_label, node, $btnContainer, callback));
        const $groupContainer = $(groupContainerTmpl);

        if (node.children) {
            //Button click handler
            const $button = createExpandButton();
            $button.appendTo($groupContainer);
        }
        $groupContainer.append($checkbox);
        _.each(node.children, function (node2) {
            node2.value = node.value + '/' + node2.value;
            drawAndPropagate($groupContainer, node2, tree_label, callback);
        });
        $groupContainer.appendTo($elem);
    };

    const createCheckbox = function (name, node, $btnContainer, callback) {
        const id = name + '_' + node.value;
        const $checkbox = $("<input name='" + name + "' type='checkbox' value='" + node.value + "' class='facet-checkbox' id='" + id + "'/>");
        $checkbox.click(function (e) {
            setChildrenCheckboxes($checkbox);
            setParentCheckboxStatus($checkbox);
            // addClearButton($(this), $('.filter-clear'));
            if (e.originalEvent.isTrusted) {
                propagateToFacets($(this).attr('name'), $(this).val(), $(this).is(':checked'));
            }
            setRmvButton($btnContainer, $(this));
            callback();
        });
        const $label = $("<label for='" + id + "'>" + node.label + " (" + node.count + ")</label>");
        return $().add($checkbox).add($label);
    };

    const setRmvButton = function ($btnContainer, $this) {
        if ($this.is(':checked')) {
            let $rmvButton = createRmvButton($this.attr('name'), $this.val(), function () {
                $this.click();
            });
            $btnContainer.append($rmvButton);
        } else {
            removeFilterButton($this.attr('name'), $this.val());
            // $btnContainer.find("div[data-facet='"+$this.attr('name')+"'][data-value='"+$this.val()+"']").remove();
        }
    };

    function propagateToFacets(name, value, checked) {
        _.each(allForms, function (formId) {
            let $checkbox = $(formId).find("input[name='" + name + "'][value='" + value + "']");
            if ($checkbox.length) {
                let updateCheckbox = $checkbox.is(':checked') !== checked;
                if (updateCheckbox) {
                    $checkbox.click()
                }
            }
        });
    }

    const createExpandButton = function () {
        const $button = $("<button class='disp-children'>&#9654;</button>");
        $button.click(function (e) {
            e.preventDefault();
            const $group = $(this).siblings('.facet-child-group');

            $group.toggle();
            if ($group.is(":visible")) {
                $(this).text("\u25BC");
            } else {
                $(this).text("\u25B6");
            }
        });
        return $button;
    };

    const getChildrenCheckboxes = function ($elem) {
        return $elem.siblings('.facet-child-group').children('.facet-checkbox');
    };

    const getParentCheckbox = function ($elem) {
        return $elem.parent().siblings('.facet-checkbox');
    };

    // const getFacetCheckboxes = function ($elem) {
    //     return $elem.closest('.facet-group').find('input');
    // };

    const setChildrenCheckboxes = function ($elem) {
        const $children = getChildrenCheckboxes($elem);
        $children.prop('indeterminate', false);
        $children.prop('checked', $elem.is(':checked'));
        $children.each(function (i, child) {
            setChildrenCheckboxes($(child));
        })
    };

    const setParentCheckboxStatus = function ($elem) {
        const $parent = getParentCheckbox($elem);
        const children = getChildrenCheckboxes($parent);
        let checkedChildren = 0;
        let countChildren = children.length;
        let indeterminateChildren = 0;
        _.each(children, function (checkbox) {
            if (checkbox.checked) {
                checkedChildren++;
            }
            if ($(checkbox).prop('indeterminate')) {
                indeterminateChildren++;
            }
        });

        const $parentCheckbox = $($parent);

        if (indeterminateChildren > 0) {
            $parentCheckbox.prop('indeterminate', true);
            $parentCheckbox.prop('checked', false);
        } else if (checkedChildren === 0) {
            $parentCheckbox.prop('indeterminate', false);
            $parentCheckbox.prop('checked', false);
        } else if (checkedChildren < countChildren) {
            $parentCheckbox.prop('indeterminate', true);
            $parentCheckbox.prop('checked', false);
        } else {
            $parentCheckbox.prop('indeterminate', false);
            $parentCheckbox.prop('checked', true);
        }
        if (getParentCheckbox($parentCheckbox).val() !== undefined) {
            setParentCheckboxStatus($parentCheckbox);
        }
    };

    return {
        init: init,
        reset: reset
    }
};