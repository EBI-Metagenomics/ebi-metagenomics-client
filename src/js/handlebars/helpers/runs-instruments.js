module.exports = function(runs) {
  if (!runs || runs.length === 0) {
    return '';
  }

  let html = '';
  let itemClass = 'column small-12 medium-8 large-8';
  let dict = {};

  runs.forEach((el, index) => {
    const iterationClass = itemClass;
    if (index === 0) {
      html += '<div class="column small-12 medium-4 large-4"> Instruments: </div>';
    } else {
      itemClass += 'small-offset-12 medium-offset-4 large-offset-4';
    }
    const hashKey = (el.instrument_platform + el.instrument_model).replace(/ /g, '_').toLowerCase();
    if (!(hashKey in dict)) {
      html += `<div data-cy="instrument" class="${iterationClass}">` +
      `platform: ${el.instrument_platform}, model: ${el.instrument_model}` +
      '</div>';
    }
    // eslint-disable-next-line security/detect-object-injection
    dict[hashKey] = 1;
  });
  return html;
};
