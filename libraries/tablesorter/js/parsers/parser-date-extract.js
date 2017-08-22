/*! Parser: Extract out date - updated 10/26/2014 (v2.18.0) */
/*jshint jquery:true */
;(function($){
	'use strict';

	var regex = {
		usLong     : /[A-Z]{3,10***REMOVED***\.?\s+\d{1,2***REMOVED***,?\s+(?:\d{4***REMOVED***)(?:\s+\d{1,2***REMOVED***:\d{2***REMOVED***(?::\d{2***REMOVED***)?(?:\s+[AP]M)?)?/i,
		mdy        : /(\d{1,2***REMOVED***[\/\s]\d{1,2***REMOVED***[\/\s]\d{4***REMOVED***(\s+\d{1,2***REMOVED***:\d{2***REMOVED***(:\d{2***REMOVED***)?(\s+[AP]M)?)?)/i,

		dmy        : /(\d{1,2***REMOVED***[\/\s]\d{1,2***REMOVED***[\/\s]\d{4***REMOVED***(\s+\d{1,2***REMOVED***:\d{2***REMOVED***(:\d{2***REMOVED***)?(\s+[AP]M)?)?)/i,
		dmyreplace : /(\d{1,2***REMOVED***)[\/\s](\d{1,2***REMOVED***)[\/\s](\d{4***REMOVED***)/,

		ymd        : /(\d{4***REMOVED***[\/\s]\d{1,2***REMOVED***[\/\s]\d{1,2***REMOVED***(\s+\d{1,2***REMOVED***:\d{2***REMOVED***(:\d{2***REMOVED***)?(\s+[AP]M)?)?)/i,
		ymdreplace : /(\d{4***REMOVED***)[\/\s](\d{1,2***REMOVED***)[\/\s](\d{1,2***REMOVED***)/
	***REMOVED***;

	/*! extract US Long Date *//* (ignore any other text)
	* e.g. 'Sue's Birthday! Jun 26, 2004 7:22 AM (8# 2oz)'
	* demo: http://jsfiddle.net/Mottie/abkNM/4165/ */
	$.tablesorter.addParser({
		id: 'extractUSLongDate',
		is: function () {
			// don't auto detect this parser
			return false;
		***REMOVED***,
		format: function (s) {
			var date,
				str = s ? s.match(regex.usLong) : s;
			if (str) {
				date = new Date( str[0] );
				return date instanceof Date && isFinite(date) ? date.getTime() : s;
			***REMOVED***
			return s;
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

	/*! extract MMDDYYYY *//* (ignore any other text)
	* demo: http://jsfiddle.net/Mottie/abkNM/4166/ */
	$.tablesorter.addParser({
		id: 'extractMMDDYYYY',
		is: function () {
			// don't auto detect this parser
			return false;
		***REMOVED***,
		format: function (s) {
			var date,
				str = s ? s.replace(/\s+/g, ' ').replace(/[\-.,]/g, '/').match(regex.mdy) : s;
			if (str) {
				date = new Date( str[0] );
				return date instanceof Date && isFinite(date) ? date.getTime() : s;
			***REMOVED***
			return s;
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

	/*! extract DDMMYYYY *//* (ignore any other text)
	* demo: http://jsfiddle.net/Mottie/abkNM/4167/ */
	$.tablesorter.addParser({
		id: 'extractDDMMYYYY',
		is: function () {
			// don't auto detect this parser
			return false;
		***REMOVED***,
		format: function (s) {
			var date,
				str = s ? s.replace(/\s+/g, ' ').replace(/[\-.,]/g, '/').match(regex.dmy) : s;
			if (str) {
				date = new Date( str[0].replace(regex.dmyreplace, '$2/$1/$3') );
				return date instanceof Date && isFinite(date) ? date.getTime() : s;
			***REMOVED***
			return s;
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

	/*! extract YYYYMMDD *//* (ignore any other text)
	* demo: http://jsfiddle.net/Mottie/abkNM/4168/ */
	$.tablesorter.addParser({
		id: 'extractYYYYMMDD',
		is: function () {
			// don't auto detect this parser
			return false;
		***REMOVED***,
		format: function (s) {
			var date,
				str = s ? s.replace(/\s+/g, ' ').replace(/[\-.,]/g, '/').match(regex.ymd) : s;
			if (str) {
				date = new Date( str[0].replace(regex.ymdreplace, '$2/$3/$1') );
				return date instanceof Date && isFinite(date) ? date.getTime() : s;
			***REMOVED***
			return s;
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

***REMOVED***)(jQuery);
