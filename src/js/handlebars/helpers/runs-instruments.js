module.exports = function(runs) {
  if (!runs || runs.length == 0) {
    return "";
  }

  var html = "";
  var itemClass = "column small-12 medium-8 large-8";
  var dict = {}

  runs.forEach((el, index) => {
    iterationClass = itemClass;
    if (index === 0) {
      html += '<div class="column small-12 medium-4 large-4"> Instruments: </div>';
    } else {
      itemClass += "small-offset-12 medium-offset-4 large-offset-4";
    }
    var hash_key = (el.instrument_platform + el.instrument_model).replace(/ /g, '_').toLowerCase();
    if (!(hash_key in dict)) {
      html += `<div data-cy="instrument" class="${iterationClass}">` +
      `platform: ${el.instrument_platform}, model: ${el.instrument_model}` +
      '</div>';
    }
    dict[hash_key] = 1;
  });
  return html;
};