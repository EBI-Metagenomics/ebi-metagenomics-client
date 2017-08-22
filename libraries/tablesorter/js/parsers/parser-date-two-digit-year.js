/*! Parser: two digit year - updated 11/26/2016 (v2.28.0) */
/* Demo: http://mottie.github.io/tablesorter/docs/example-parsers-dates.html */
/*jshint jquery:true */
;(function($){
	'use strict';

	// Make the date be within +/- range of the 2 digit year
	// so if the current year is 2020, and the 2 digit year is 80 (2080 - 2020 > 50), it becomes 1980
	// if the 2 digit year is 50 (2050 - 2020 < 50), then it becomes 2050.
	var range = 50,

	// no need to change any of the code below
	ts = $.tablesorter,
	now = new Date().getFullYear();

	// add dateRange to defaults for validator; value must be falsy
	ts.defaults.dataRange = '';

	if ( !ts.dates ) { ts.dates = {***REMOVED***; ***REMOVED***
	ts.dates.regxxxxyy = /(\d{1,2***REMOVED***)[\/\s](\d{1,2***REMOVED***)[\/\s](\d{2***REMOVED***)/;
	ts.dates.regyyxxxx = /(\d{2***REMOVED***)[\/\s](\d{1,2***REMOVED***)[\/\s](\d{1,2***REMOVED***)/;

	ts.formatDate = function(s, regex, format, table){
		if (s) {
			var y, rng,
				n = s
					// replace separators
					.replace(/\s+/g, ' ').replace(/[-.,]/g, '/')
					// reformat xx/xx/xx to mm/dd/19yy;
					.replace(regex, format),
				d = new Date(n);
			if ( d instanceof Date && isFinite(d) ) {
				y = d.getFullYear();
				rng = table && table.config.dateRange || range;
				// if date > 50 years old (set range), add 100 years
				// this will work when people start using '50' and mean '2050'
				while (now - y > rng) {
					y += 100;
				***REMOVED***
				return d.setFullYear(y);
			***REMOVED***
		***REMOVED***
		return s;
	***REMOVED***;

	$.tablesorter.addParser({
		id: 'ddmmyy',
		is: function() {
			return false;
		***REMOVED***,
		format: function(s, table) {
			// reformat dd/mm/yy to mm/dd/19yy;
			return ts.formatDate(s, ts.dates.regxxxxyy, '$2/$1/19$3', table);
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

	$.tablesorter.addParser({
		id: 'mmddyy',
		is: function() {
			return false;
		***REMOVED***,
		format: function(s, table) {
			// reformat mm/dd/yy to mm/dd/19yy
			return ts.formatDate(s, ts.dates.regxxxxyy, '$1/$2/19$3', table);
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

	$.tablesorter.addParser({
		id: 'yymmdd',
		is: function() {
			return false;
		***REMOVED***,
		format: function(s, table) {
			// reformat yy/mm/dd to mm/dd/19yy
			return ts.formatDate(s, ts.dates.regyyxxxx, '$2/$3/19$1', table);
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

***REMOVED***)(jQuery);
