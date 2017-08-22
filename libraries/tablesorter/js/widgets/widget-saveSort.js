/*! Widget: saveSort - updated 10/31/2015 (v2.24.0) *//*
* Requires tablesorter v2.16+
* by Rob Garrison
*/
;(function ($) {
	'use strict';
	var ts = $.tablesorter || {***REMOVED***;

	// this widget saves the last sort only if the
	// saveSort widget option is true AND the
	// $.tablesorter.storage function is included
	// **************************
	ts.addWidget({
		id: 'saveSort',
		priority: 20,
		options: {
			saveSort : true
		***REMOVED***,
		init: function(table, thisWidget, c, wo) {
			// run widget format before all other widgets are applied to the table
			thisWidget.format(table, c, wo, true);
		***REMOVED***,
		format: function(table, c, wo, init) {
			var stored, time,
				$table = c.$table,
				saveSort = wo.saveSort !== false, // make saveSort active/inactive; default to true
				sortList = { 'sortList' : c.sortList ***REMOVED***;
			if (c.debug) {
				time = new Date();
			***REMOVED***
			if ($table.hasClass('hasSaveSort')) {
				if (saveSort && table.hasInitialized && ts.storage) {
					ts.storage( table, 'tablesorter-savesort', sortList );
					if (c.debug) {
						console.log('saveSort widget: Saving last sort: ' + c.sortList + ts.benchmark(time));
					***REMOVED***
				***REMOVED***
			***REMOVED*** else {
				// set table sort on initial run of the widget
				$table.addClass('hasSaveSort');
				sortList = '';
				// get data
				if (ts.storage) {
					stored = ts.storage( table, 'tablesorter-savesort' );
					sortList = (stored && stored.hasOwnProperty('sortList') && $.isArray(stored.sortList)) ? stored.sortList : '';
					if (c.debug) {
						console.log('saveSort: Last sort loaded: "' + sortList + '"' + ts.benchmark(time));
					***REMOVED***
					$table.bind('saveSortReset', function(event) {
						event.stopPropagation();
						ts.storage( table, 'tablesorter-savesort', '' );
					***REMOVED***);
				***REMOVED***
				// init is true when widget init is run, this will run this widget before all other widgets have initialized
				// this method allows using this widget in the original tablesorter plugin; but then it will run all widgets twice.
				if (init && sortList && sortList.length > 0) {
					c.sortList = sortList;
				***REMOVED*** else if (table.hasInitialized && sortList && sortList.length > 0) {
					// update sort change
					ts.sortOn( c, sortList );
				***REMOVED***
			***REMOVED***
		***REMOVED***,
		remove: function(table, c) {
			c.$table.removeClass('hasSaveSort');
			// clear storage
			if (ts.storage) { ts.storage( table, 'tablesorter-savesort', '' ); ***REMOVED***
		***REMOVED***
	***REMOVED***);

***REMOVED***)(jQuery);
