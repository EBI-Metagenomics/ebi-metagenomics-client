module.exports = function FilterButtonCtnr() {
    const create = function(facet, value, callback) {
        const $button = $('<button class=\'facet-remove-button button\'>' + facet + ': ' + value +
            ' <span class="icon icon-functional" data-icon="x"/></button>');
        $button.click(function() {
            const $parent = $(this).parent();
            const facet = $parent.attr('data-facet');
            const value = $parent.attr('data-value');
            $(this).parent().remove();
            $('div[data-facet=\'' + facet + '\'][data-value=\'' + value + '\']')
                .children('button')
                .click();
            callback();
        });
        const $toggleContainer = $('<div data-facet=\'' + facet + '\' data-value=\'' + value +
            '\'></div>');
        $toggleContainer.append($button);
        return $toggleContainer;
    };

    const remove = function($elem) {
        const name = $elem.attr('name');
        const val = $elem.val();
        $('div[data-facet=\'' + name + '\'][data-value=\'' + val + '\']').remove();
    };

    return {
        create: create,
        remove: remove
    };
};

