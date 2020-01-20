const searchUrl = process.env.SEARCH_URL;

const _ = require('underscore');
const FilterBtnWidget = require('./rmvFilterWidget');
const createRmvButton = new FilterBtnWidget().create;
const removeFilterButton = new FilterBtnWidget().remove;

module.exports = function CheckboxTree() {
    const groupContainerTmpl = '<div class=\'facet-child-group\'></div>';
    const $elem = null;
    const callback = null;
    const allForms = ['#projectsFilters', '#samplesFilters', '#runsFilters'];

    const reset = function() {
        $elem.find('input[type=\'checkbox\']').prop('checked', false);
        callback();
    };

    const createTitle = function($elem, title) {
        $elem.append('<h5>' + title + '</h5>');
    };

    const createCheckbox = function(name, facet, node, $btnContainer, callback) {
        const id = name + '_' + node.value + '_' + facet;
        const $checkbox = $('<input/>', {
            'id': id,
            'name': name,
            'type': 'checkbox',
            'value': node.value,
            'class': 'facet-checkbox'
        });

        $checkbox.click(function(e) {
            setChildrenCheckboxes($checkbox);
            setParentCheckboxStatus($checkbox);
            if (e.originalEvent && e.originalEvent.isTrusted) {
                propagateToFacets($(this).attr('name'), $(this).val(), $(this).is(':checked'));
            }
            callback();
        });
        $checkbox.change(function() {
            setRmvButton($btnContainer, $(this));
        });

        const $label = $('<label></label>', {
            'for': id,
            'text': node.label + ' (' + node.count + ')'
        });
        const $divCheckbox = $('<div>', {'class': 'facet-checkbox-container'});
        $divCheckbox.append($checkbox);

        const $divLbl = $('<div>', {'class': 'facet-label-container'});
        $divLbl.append($label);

        return $().add($divCheckbox).add($divLbl);
    };

    const createExpandButton = function() {
        const $button = $('<button class=\'disp-children\'>&#9654;</button>');
        $button.click(function(e) {
            e.preventDefault();
            const $group = $(this).siblings('.facet-child-group');
            if ($(this).text() === '\u25BC') {
                $(this).text('\u25B6');
                $group.hide();
            } else {
                $(this).text('\u25BC');
                $group.show();
            }
        });
        return $button;
    };

    const drawAndPropagate = function($elem, facet, node, treeLabel, $btnContainer, callback) {
        const $checkbox = $(createCheckbox(treeLabel, facet, node, $btnContainer, callback));
        const $groupContainer = $(groupContainerTmpl);

        if (node.children) {
            // Button click handler
            const $button = createExpandButton();
            $button.appendTo($groupContainer);
        }
        $groupContainer.append($checkbox);
        _.each(node.children, function(node2) {
            node2.value = node.value + '/' + node2.value;
            drawAndPropagate($groupContainer, facet, node2, treeLabel, $btnContainer, callback);
        });
        $groupContainer.appendTo($elem);
    };

    const getChildrenCheckboxes = function($elem) {
        return $elem.siblings('.facet-child-group').children('.facet-checkbox');
    };

    const getParentCheckbox = function($elem) {
        return $elem.parent().siblings('.facet-checkbox');
    };

    const getSiblingsCheckboxes = function($elem) {
        return $elem.parent().siblings('div.facet-child-group').children('input');
    };

    const setRmvButton = function($btnContainer, $this) {
        const $parent = getParentCheckbox($this);
        const $siblings = getSiblingsCheckboxes($this);

        if ($parent.is(':checked')) {
            setRmvButton($btnContainer, $parent);
            _.map($siblings, function(e) {
                const $e = $(e);
                removeFilterButton($e);
            });
        } else if ($parent.length > 0) {
            // Edge case where the child of a (fully) checked node is unchecked
            let allChecked = true;
            $siblings.each(function(i, e) {
                allChecked = allChecked && $(e).is(':checked');
            });
            if (allChecked) {
                setRmvButton($btnContainer, $parent);
                $siblings.each(function(i, checkbox) {
                    const $checkbox = $(checkbox);
                    let $rmvButton = createRmvButton($checkbox.attr('name'), $checkbox.val(),
                        function() {
                            $checkbox.click();
                        });
                    $btnContainer.append($rmvButton);
                });
            }
        }

        if ($this.is(':checked') &&
            (($parent.length === 0) || (!getParentCheckbox($this).is(':checked')))) {
            if ($btnContainer.find('div[data-facet="' + $this.attr('name') + '"][data-value="' +
                    $this.val() + '"]').length === 0) {
                let $rmvButton = createRmvButton($this.attr('name'), $this.val(), function() {
                    $this.click();
                });
                $btnContainer.append($rmvButton);
            }
        } else {
            removeFilterButton($this);
            // $btnContainer.find("div[data-facet='"+$this.attr('name')+"']
            // [data-value='"+$this.val()+"']").remove();
        }
    };

    /**
     * Propagate checkbox event to other facets which have the same checkbox
     * @param {string} name of the checkbox
     * @param {string} value attribute of the checkbox
     * @param {boolean} checked boolean
     */
    function propagateToFacets(name, value, checked) {
        _.each(allForms, function(formId) {
            let $checkbox = $(formId).find('input[name="' + name + '"][value="' + value + '"]');
            if ($checkbox.length) {
                let updateCheckbox = $checkbox.is(':checked') !== checked;
                if (updateCheckbox) {
                    $checkbox.click();
                }
            }
        });
    }

    const setChildrenCheckboxes = function($elem) {
        const $children = getChildrenCheckboxes($elem);
        $children.prop('indeterminate', false);
        $children.prop('checked', $elem.is(':checked'));
        $children.trigger('change');
        $children.each(function(i, child) {
            setChildrenCheckboxes($(child));
        });
    };

    const setParentCheckboxStatus = function($elem) {
        const $parent = getParentCheckbox($elem);
        const children = getChildrenCheckboxes($parent);
        let checkedChildren = 0;
        let countChildren = children.length;
        let indeterminateChildren = 0;
        _.each(children, function(checkbox) {
            if (checkbox.checked) {
                checkedChildren++;
            }
            if ($(checkbox).prop('indeterminate')) {
                indeterminateChildren++;
            }
        });

        const $parentCheckbox = $($parent);

        switch (true) {
            case (indeterminateChildren > 0):
                $parentCheckbox.prop('indeterminate', true);
                $parentCheckbox.prop('checked', false);
                break;
            case (checkedChildren === 0):
                $parentCheckbox.prop('indeterminate', false);
                $parentCheckbox.prop('checked', false);
                break;
            case (checkedChildren < countChildren):
                $parentCheckbox.prop('indeterminate', true);
                $parentCheckbox.prop('checked', false);
                break;
            default:
                $parentCheckbox.prop('indeterminate', false);
                $parentCheckbox.prop('checked', true);
                break;
        }

        if (getParentCheckbox($parentCheckbox).val() !== undefined) {
            setParentCheckboxStatus($parentCheckbox);
        }
    };

    const getFacetFields = function(facet, field) {
        const fetch = $.get(searchUrl + facet +
            '?query=domain_source%3Ametagenomics_' + facet + '&format=json&size=0&facetfields=' +
            field + '&facetcount=1000&facetsdepth=10');
        return fetch.promise();
    };

    const init = function(facet, $elem, $btnContainer, tree, callback, values, inModal) {
        // console.log(facet, $elem, $btnContainer, tree, callback, values);

        this.callback = callback;
        const $treeContainer = $('<div class=\'facet-container\'></div>');
        // Create title
        createTitle($elem, tree.label);

        // Create and expand nodes
        _.each(tree.facetValues, function(node) {
            drawAndPropagate($treeContainer, facet, node, tree.id, $btnContainer, callback);
        });

        if (!inModal) {
            const $modalLink = $('<a data-open=\'filtersModal\'>More fields</a>');
            $modalLink.click(function() {
                const $modalElem = $('#' + $(this).attr('data-open')).find('.facets');
                $modalElem.empty();
                getFacetFields(facet, tree.id).done(function(response) {
                    const tree = response.facets[0];
                    const $tree = new CheckboxTree().init(facet, $modalElem, $btnContainer, tree,
                        callback, [], true);
                    $tree.find('input').off('click');
                    $tree.find('input').click(function(e) {
                        const name = $(this).attr('name');
                        const val = $(this).val();
                        const $formElem = $elem.find('input[name="' + name + '"][value="' + val +
                            '"]');
                        const checked = $(this).is(':checked');
                        if ($formElem.length === 0) {
                            if (checked) {
                                $treeContainer.append($(this).parent());
                            }
                        } else {
                            if (checked) {
                                $formElem.prop('checked', true);
                            }
                        }

                        if (e.originalEvent.isTrusted) {
                            propagateToFacets($(this).attr('name'), $(this).val(),
                                $(this).is(':checked'));
                        }
                        setRmvButton($btnContainer, $(this));
                        callback();
                    });
                });
            });
            $treeContainer.append($('<div class="more-fields"></div>').append($modalLink));
        }

        // Set checkbox values
        _.each(values, function(facetValue) {
            if (facetValue.id === tree.id) {
                let $checkbox = $treeContainer.find('input[value=\'' + facetValue.value + '\']');
                if ($checkbox.length > 0) {
                    $checkbox.prop('checked', true);
                    setChildrenCheckboxes($checkbox);
                    setParentCheckboxStatus($checkbox);
                } else {
                    const node = {
                        label: facetValue.value,
                        value: facetValue.value,
                        count: ''
                    };
                    drawAndPropagate($treeContainer, facet, node, tree.id, $btnContainer, callback);
                    $checkbox = $treeContainer.find('input[value=\'' + facetValue.value + '\']');
                    $checkbox.prop('checked', true);
                }
                setRmvButton($btnContainer, $checkbox);
            }
        });

        $treeContainer.children('.facet-child-group').addClass('show');
        $elem.append($treeContainer);

        return $treeContainer;
    };

    return {
        init: init,
        reset: reset
    };
};

