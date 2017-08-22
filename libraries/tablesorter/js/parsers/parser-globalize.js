/*! Parser: jQuery Globalize - updated 11/2/2015 (v2.24.1) */
/* Extract localized data using jQuery's Globalize parsers; set
 Globalize.locale( 'xx' ) in the globalize settings */
/*jshint jquery:true, newcap: false */
/*global Globalize:false */
;( function( $ ) {
	'use strict';

	/*! jQuery Globalize date parser (https://github.com/jquery/globalize#date-module) */
	$.tablesorter.addParser({
		id: 'globalize-date',
		is: function () {
			return false;
		***REMOVED***,
		format: function ( str, table, cell, cellIndex ) {
			var globalize, date,
				c = table.config,
				// add options to 'config.globalize' for all columns --> globalize : { skeleton: 'GyMMMd' ***REMOVED***
				// or per column by using the column index --> globalize : { 0 : { datetime: 'medium' ***REMOVED*** ***REMOVED***
				options = c.globalize && ( c.globalize[ cellIndex ] || c.globalize ) || {***REMOVED***;
			if ( Globalize ) {
				globalize = typeof options.Globalize === 'object' ?
					// initialized Globalize object
					options.Globalize :
					// Globalize initialized from "lang" option
					Globalize( options.lang || 'en' );
				if ( !options.Globalize ) {
					// cache the object
					options.Globalize = globalize;
				***REMOVED***
			***REMOVED***
			date = globalize && globalize.dateParser ? globalize.dateParser( options )( str ) :
				str ? new Date( str ) : str;
			return date instanceof Date && isFinite( date ) ? date.getTime() : str;
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

	/*! jQuery Globalize number parser (https://github.com/jquery/globalize#number-module) */
	$.tablesorter.addParser({
		id: 'globalize-number',
		is: function () {
			return false;
		***REMOVED***,
		format: function ( str, table, cell, cellIndex ) {
			var globalize, num,
				c = table.config,
				// add options to 'config.globalize' for all columns --> globalize : { skeleton: 'GyMMMd' ***REMOVED***
				// or per column by using the column index --> globalize : { 0 : { datetime: 'medium' ***REMOVED*** ***REMOVED***
				options = c.globalize && ( c.globalize[ cellIndex ] || c.globalize ) || {***REMOVED***;
			if ( Globalize ) {
				globalize = typeof options.Globalize === 'object' ?
					// initialized Globalize object
					options.Globalize :
					// Globalize initialized from "lang" option
					Globalize( options.lang || 'en' );
				if ( !options.Globalize ) {
					// cache the object
					options.Globalize = globalize;
				***REMOVED***
			***REMOVED***
			num = globalize && globalize.numberParser ? globalize.numberParser( options )( str ) :
				str ? $.tablesorter.formatFloat( ( str || '' ).replace( /[^\w,. \-()]/g, '' ), table ) : str;
			return str && typeof num === 'number' ? num : str;
		***REMOVED***,
		type: 'numeric'
	***REMOVED***);

***REMOVED***)( jQuery );
