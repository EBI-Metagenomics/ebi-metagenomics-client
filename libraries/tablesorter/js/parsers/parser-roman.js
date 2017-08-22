/*! Parser: roman - updated 6/28/MMXIV (v2.17.3) *//*
 * code modified from both:
 * Steven Levithan @ http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter
 * Jonathan Snook comment @ http://blog.stevenlevithan.com/archives/javascript-roman-numeral-converter#comment-16140
 */
/*jshint jquery:true, unused:false */
;(function($){
	'use strict';

	// allow lower case roman numerals, since lists use i, ii, iii, etc.
	var validator = /^M*(?:D?C{0,3***REMOVED***|C[MD])(?:L?X{0,3***REMOVED***|X[CL])(?:V?I{0,3***REMOVED***|I[XV])$/i,
		matcher = /\b([MCDLXVI]+\b)/gi,
		lookup = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 ***REMOVED***;

	$.tablesorter.addParser({
		id: 'roman',
		is: function(){
			return false;
		***REMOVED***,
		format: function(s) {
			var val,
				roman = s.toUpperCase().split(''),
				num = 0;

			// roman numerals not found!
			if ( !(s && validator.test(s)) ) {
				return s;
			***REMOVED***

			while (roman.length) {
				val = lookup[roman.shift()];
				num += val * (val < lookup[roman[0]] ? -1 : 1);
			***REMOVED***

			return num;
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

	$.tablesorter.addParser({
		id: 'roman-ignore',
		is: function(){
			return false;
		***REMOVED***,
		format: function(s, table, cell, column) {
			var val, orig,
				c = table.config,
				ignore = $.isArray(c.roman_ignore) ? c.roman_ignore[column] : 0,
				// find roman numerals
				roman = ( isNaN(ignore) ?
					// ignore can be a regex or string
					$.trim( s.replace(ignore, '') ) :
					// or a number to ignore the last x letters...
					$.trim( s.substring(0, s.length - ignore) )
				).match(matcher),
				v = validator.test(roman),
				num = 0;

			// roman numerals not found!
			if ( !(v) ) {
				return s;
			***REMOVED***

			// save roman numeral for replacement
			orig = roman[0];
			roman = orig.toUpperCase().split('');

			while (roman.length) {
				val = lookup[roman.shift()];
				// ignore non-roman numerals
				if (val) {
					num += val * (val < lookup[roman[0]] ? -1 : 1);
				***REMOVED***
			***REMOVED***

			return num ? s.replace(orig, num) : s;
		***REMOVED***,
		type: 'text'
	***REMOVED***);

	$.tablesorter.addParser({
		id: 'roman-extract',
		is: function(){
			return false;
		***REMOVED***,
		format: function(s) {
			var val,
				// find roman numerals
				roman = $.grep(s.split(/\b/), function(v, i){
					return validator.test(v) ? v : '';
				***REMOVED***).join('').match(matcher),

				v = roman ? validator.test(roman) : 0,
				num = 0;

			// roman numerals not found!
			if ( !(v) ) {
				return s;
			***REMOVED***

			// save roman numeral for replacement
			roman = roman[0].toUpperCase().split('');

			while (roman.length) {
				val = lookup[roman.shift()];
				// ignore non-roman numerals
				if (val) {
					num += val * (val < lookup[roman[0]] ? -1 : 1);
				***REMOVED***
			***REMOVED***

			return num ? num : s;
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

***REMOVED***)(jQuery);
