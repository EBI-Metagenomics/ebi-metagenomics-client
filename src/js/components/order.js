let _ = require('underscore');

var Order = module.exports = {
    orderSelector: "#sortBy",
    getValue: function(){
        return $(this.orderSelector).val();
    },
    initSelector: function (fields, initOption, onChangeCallback){
        let opts = [];
        fields.map(function(field){
            opts.push($("<option value=\'"+field.value+"\'>"+field.name+" (asc)</option>"));
            opts.push($("<option value=\'-"+field.value+"\'>"+field.name+" (desc)</option>"));
        });
        $(this.orderSelector).append(opts);
        $(this.orderSelector).val(initOption);
        const that = this;
        $(this.orderSelector).on('change', function(){
            onChangeCallback(that.getValue());
        });
    },

};
