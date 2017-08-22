/***********************************************************/
/*                    LiveFilter Plugin                    */
/*                      Version: 1.4                       */
/*                      Mike Merritt                       */
/*        https://github.com/mikemerritt/LiveFilter        */
/***********************************************************/

/*
  NOTE: this has been forked from master for EBI needs:
  1) https://github.com/mikemerritt/LiveFilter/pull/14/
  2) https://github.com/mikemerritt/LiveFilter/pull/15
*/

(function($){
  $.fn.liveFilter = function (settings) {
    // Default settings
    var defaults = {
      delay: 0,
      defaultText: 'Type to Filter:',
      resetText: 'Reset',
      noMatches: 'No Matches',
      fitlerTargetCustomDiv: 'div',
      hideDefault: false,
      addInputs: false,
      ignore: false,
      zebra: {
        enabled: false,
        baseColor: false,
        altColor: false
      ***REMOVED***
    ***REMOVED***;

    // Overwrite default settings with user provided ones. Declare some vars.
    var options = $.extend(defaults, settings);
    var keyDelay, filter, child;

    // Cache our wrapper element and find our target list.
    var wrap = $(this);
    var filterTarget = wrap.find('ul, ol, table,div');

    // Add no matches text.
    wrap.append('<div class="nomatches">'+options.noMatches+'</div>');
    var nomatches = $('.nomatches');
    nomatches.hide();

    // Determine our child element type.
    if (options.fitlerTargetCustomDiv) {
      child = options.fitlerTargetCustomDiv;
    ***REMOVED*** else if (filterTarget.is('ul') || filterTarget.is('ol')) {
      child = 'li';
    ***REMOVED*** else if (filterTarget.is('table')) {
      child = 'tbody tr';
    ***REMOVED***

    // Hide the list/table by default. If not being hidden apply zebra striping if needed.
    if (options.hideDefault === true) {
      filterTarget.find(child).hide();
    ***REMOVED*** else if (options.hideDefault === false && options.zebra.enabled != false) {
      zebraStriping();
    ***REMOVED***

    // Add inputs if required
    if (options.addInputs === true) {
      var markup = '<input class="filter" type="text" value="" /><input class="reset" type="reset" value="' + options.resetText + '" />';
      wrap.prepend(markup);
    ***REMOVED***

    // Used to reset our text input and show all items in the filtered list
    wrap.find('input[type="reset"]').on("click", function() {
      nomatches.hide();

      if (options.defaultText === false) {

        wrap.find('input[type="text"]').attr('value', '');

        if (options.hideDefault === false) {
          list.each(function(i) {
            $(this).show();
          ***REMOVED***);
        ***REMOVED*** else if (options.hideDefault === true) {
          list.each(function(i) {
            $(this).hide();
          ***REMOVED***);
        ***REMOVED***

      ***REMOVED*** else {

        wrap.find('input[type="text"]').attr('value', options.defaultText);

        if (options.hideDefault === false) {
          list.each(function(i) {
            $(this).show();
          ***REMOVED***);
        ***REMOVED*** else if (options.hideDefault === true) {
          list.each(function(i) {
            $(this).hide();
          ***REMOVED***);
        ***REMOVED***

      ***REMOVED***

      return false;
    ***REMOVED***);

    // Used to set the default text of the text input if there is any
    if (options.defaultText != false) {

      var input = wrap.find('input[type="text"]');
      input.attr('value', options.defaultText);

      input.focus(function() {
        var currentVal = $(this).val();
        if (currentVal === options.defaultText) {
          $(this).val('');
        ***REMOVED***
      ***REMOVED***);

      input.blur(function() {
        var currentVal = $(this).val(); 
        if (currentVal === '') {
          $(this).val(options.defaultText);
        ***REMOVED***
      ***REMOVED***);

    ***REMOVED***

    // Cache list/table elements so we don't have to keep traversing the DOM.
    var list = filterTarget.find(child);

    // Keyup event - where the magic happens.
    wrap.find('input[type="text"]').on("keyup", function() {

      var input = $(this);
      clearTimeout(keyDelay);

      // Add a class that the text has been processed
      if (input.val() !== '') {
        wrap.addClass('live-filter-processed');
      ***REMOVED*** else {
        wrap.removeClass('live-filter-processed');
      ***REMOVED***

      // Setting timeout for performance reasons.
      keyDelay = setTimeout(function () { 

        filter = input.val().toLowerCase();
        var visible = 0;
        var words = filter.split(' ');

        if (filter === '' && options.hideDefault === true) {
          list.each(function(i) {
            $(this).hide();
          ***REMOVED***)
        ***REMOVED*** else {
          // Iterate through list and show/hide the proper elements.
          list.each(function(i) {
            text = $(this).text().toLowerCase();
              // Non consecutive filtering
              for (var t = 0; t < words.length; t++) {
                if (text.indexOf(words[t]) < 0) {
                  var match = false;
                  break;
                ***REMOVED*** else {
                  var match = true;
                ***REMOVED***
              ***REMOVED***

              if (match === true) {
                visible ++;
                $(this).show();
              ***REMOVED*** else if (match === false) {
                $(this).fadeOut(100);
              ***REMOVED***
          ***REMOVED***);

          if (visible === 0) {
            nomatches.show();
          ***REMOVED*** else if (visible > 0) {
            nomatches.hide();
          ***REMOVED***

          if (options.ignore != false) {
            options.ignore.show();
          ***REMOVED***

          if(options.zebra.enabled != false) {
            zebraStriping();
          ***REMOVED***
        ***REMOVED***

        clearTimeout(keyDelay);
      ***REMOVED***, options.delay);

    ***REMOVED***);

    // Used for zebra striping list/table.
    function zebraStriping() {
      filterTarget.find(child + ':visible:odd').css({ background: options.zebra.baseColor ***REMOVED***);
      filterTarget.find(child + ':visible:even').css({ background: options.zebra.altColor ***REMOVED***);
    ***REMOVED***

  ***REMOVED***
***REMOVED***)(jQuery);