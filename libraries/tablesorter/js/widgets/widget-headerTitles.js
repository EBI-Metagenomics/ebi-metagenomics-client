/*! Widget: headerTitles - updated 11/10/2015 (v2.24.4) *//*
 * Requires tablesorter v2.8+ and jQuery 1.7+
 * by Rob Garrison
 */
/*jshint browser:true, jquery:true, unused:false */
/*global jQuery: false */
;(function($){
	'use strict';
	var ts = $.tablesorter;

	ts.addWidget({
		id: 'headerTitles',
		options: {
			// use aria-label text
			// e.g. 'First Name: Ascending sort applied, activate to apply a descending sort'
			headerTitle_useAria  : false,
			// add tooltip class
			headerTitle_tooltip  : '',
			// custom titles [ ascending, descending, unsorted ]
			headerTitle_cur_text     : [ ' sort: A - Z', ' sort: Z - A', 'ly unsorted' ],
			headerTitle_cur_numeric  : [ ' sort: 0 - 9', ' sort: 9 - 0', 'ly unsorted' ],
			headerTitle_nxt_text     : [ ' sort: A - Z', ' sort: Z - A', 'remove sort' ],
			headerTitle_nxt_numeric  : [ ' sort: 0 - 9', ' sort: 9 - 0', 'remove sort' ],

			// title display; {prefix***REMOVED*** adds above prefix
			// {type***REMOVED*** adds the current sort order from above (text or numeric)
			// {next***REMOVED*** adds the next sort direction using the sort order above
			headerTitle_output_sorted   : 'current{current***REMOVED***; activate to {next***REMOVED***',
			headerTitle_output_unsorted : 'current{current***REMOVED***; activate to {next***REMOVED*** ',
			headerTitle_output_nosort   : 'No sort available',
			// use this type to override the parser detection result
			// e.g. use for numerically parsed columns (e.g. dates), but you
			// want the user to see a text sort, e.g. [ 'text', 'numeric' ]
			headerTitle_type     : [],
			// manipulate the title as desired
			headerTitle_callback : null // function($cell, txt) { return txt; ***REMOVED***
		***REMOVED***,
		init: function(table, thisWidget, c, wo){
			// force refresh
			c.$table.on('refreshHeaderTitle', function(){
				thisWidget.format(table, c, wo);
			***REMOVED***);
			// add tooltip class
			if ($.isArray(wo.headerTitle_tooltip)) {
				c.$headers.each(function(){
					$(this).addClass( wo.headerTitle_tooltip[this.column] || '' );
				***REMOVED***);
			***REMOVED*** else if (wo.headerTitle_tooltip !== '') {
				c.$headers.addClass( wo.headerTitle_tooltip );
			***REMOVED***
		***REMOVED***,
		format: function (table, c, wo) {
			var txt;
			c.$headers.each(function(){
				var t = this,
					$this = $(this),
					col = parseInt( $this.attr( 'data-column' ), 10 ),
					sortType = wo.headerTitle_type[ col ] || c.parsers[ col ].type || 'text',
					sortDirection = $this.hasClass(ts.css.sortAsc) ? 0 : $this.hasClass(ts.css.sortDesc) ? 1 : 2,
					sortNext = c.sortVars[ col ].order[ ( c.sortVars[ col ].count + 1 ) % ( c.sortReset ? 3 : 2 ) ];
				if (wo.headerTitle_useAria) {
					txt = $this.attr('aria-label') || wo.headerTitle_output_nosort || '';
				***REMOVED*** else {
					txt = (wo.headerTitle_prefix || '') + // now deprecated
						($this.hasClass('sorter-false') ? wo.headerTitle_output_nosort :
						ts.isValueInArray( col, c.sortList ) >= 0 ? wo.headerTitle_output_sorted : wo.headerTitle_output_unsorted);
					txt = txt.replace(/\{(current|next|name)\***REMOVED***/gi, function(m){
						return {
							'{name***REMOVED***'    : $this.text(),
							'{current***REMOVED***' : wo[ 'headerTitle_cur_' + sortType ][ sortDirection ] || '',
							'{next***REMOVED***'    : wo[ 'headerTitle_nxt_' + sortType ][ sortNext ] || ''
						***REMOVED***[m.toLowerCase()];
					***REMOVED***);
				***REMOVED***
				$this.attr('title', $.isFunction(wo.headerTitle_callback) ? wo.headerTitle_callback($this, txt) : txt);
			***REMOVED***);
		***REMOVED***,
		remove: function (table, c, wo) {
			c.$headers.attr('title', '');
			c.$table.off('refreshHeaderTitle');
			// remove tooltip class
			if ($.isArray(wo.headerTitle_tooltip)) {
				c.$headers.each(function(){
					$(this).removeClass( wo.headerTitle_tooltip[this.column] || '' );
				***REMOVED***);
			***REMOVED*** else if (wo.headerTitle_tooltip !== '') {
				c.$headers.removeClass( wo.headerTitle_tooltip );
			***REMOVED***
		***REMOVED***
	***REMOVED***);

***REMOVED***)(jQuery);
