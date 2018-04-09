let _ = require('underscore');

module.exports = {
    // orderSelector: "#sortBy",
    // getValue(){
    //     return $(this.orderSelector).val();
    // },
    // initSelector (fields, initOption, onChangeCallback){
    //     let opts = [];
    //     fields.map(function(field){
    //         opts.push($("<option value=\'"+field.value+"\'>"+field.name+" (asc)</option>"));
    //         opts.push($("<option value=\'-"+field.value+"\'>"+field.name+" (desc)</option>"));
    //     });
    //     $(this.orderSelector).append(opts);
    //     $(this.orderSelector).val(initOption);
    //     const that = this;
    //     $(this.orderSelector).on('change', function(){
    //         onChangeCallback(that.getValue());
    //     });
    // },

    currentOrder: null,

    initHeaders(initialSort, onChangeCallback) {
        const that = this;
        that.currentOrder = initialSort;

        $('th.sort-both').on('click', function() {
            const siblings = $(this).siblings('[data-sortby]');
            _.each(siblings, function(s) {
                const sibling = $(s);
                if (sibling.hasClass('sort-desc') || sibling.hasClass('sort-asc')) {
                    siblings.removeClass('sort-desc');
                    siblings.removeClass('sort-asc');
                    siblings.addClass('sort-both');
                }
            });

            const elem = $(this);
            let sort = null;
            if (elem.hasClass('sort-both') || elem.hasClass('sort-desc')) {
                elem.removeClass('sort-both');
                elem.removeClass('sort-desc');
                elem.addClass('sort-asc');
                sort = elem.attr('data-sortby');
                onChangeCallback(sort);
            } else {
                elem.removeClass('sort-asc');
                elem.addClass('sort-desc');
                sort = '-'+elem.attr('data-sortby');
                onChangeCallback(sort);
            }
            that.currentOrder = sort;
        });
        const sortby = initialSort.replace('-', '');
        $('[data-sortby=\''+sortby+'\']').removeClass('sort-both').addClass(initialSort.charAt(0)==='-' ? 'sort-desc' : 'sort-asc');
    }
};
