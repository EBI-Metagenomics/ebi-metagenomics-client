/*! Parser: input & select - updated 5/16/2017 (v2.28.10) *//*
 * for jQuery 1.7+ & tablesorter 2.7.11+
 * Demo: http://mottie.github.com/tablesorter/docs/example-widget-grouping.html
 */
/*jshint browser: true, jquery:true, unused:false */
;( function( $ ) {
	'use strict';

	var updateServer = function( event, $table, $input ) {
		// do something here to update your server, if needed
		// event = change event object
		// $table = jQuery object of the table that was just updated
		// $input = jQuery object(s) of the input or select that was modified; in v2.24.6,
		//   if the thead has a checkbox, $input may include multiple elements
	***REMOVED***;

	// Custom parser for parsing input values
	// updated dynamically using the 'change' function below
	$.tablesorter.addParser({
		id : 'inputs',
		is : function() {
			return false;
		***REMOVED***,
		format : function( txt, table, cell ) {
			var $input = $( cell ).find( 'input' );
			return $input.length ? $input.val() : txt;
		***REMOVED***,
		parsed : true, // filter widget flag
		type : 'text'
	***REMOVED***);

	$.tablesorter.addParser({
		id : 'inputs-numeric',
		is : function() {
			return false;
		***REMOVED***,
		format : function( txt, table, cell ) {
			var $input = $( cell ).find( 'input' );
			var val = $input.length ? $input.val() : txt,
				num = $.tablesorter.formatFloat( ( val || '' ).replace( /[^\w,. \-()]/g, '' ), table );
			return txt && typeof num === 'number' ? num :
				txt ? $.trim( txt && table.config.ignoreCase ? txt.toLocaleLowerCase() : txt ) : txt;
		***REMOVED***,
		parsed : true, // filter widget flag
		type : 'numeric'
	***REMOVED***);

	// Custom parser for including checkbox status if using the grouping widget
	// updated dynamically using the 'change' function below
	$.tablesorter.addParser({
		id : 'checkbox',
		is : function() {
			return false;
		***REMOVED***,
		format : function( txt, table, cell ) {
			var $cell = $( cell ),
				wo = table.config.widgetOptions,
				// returning plain language here because this is what is shown in the
				// group headers - change it as desired
				status = wo.group_checkbox ? wo.group_checkbox : [ 'checked', 'unchecked' ],
				$input = $cell.find( 'input[type="checkbox"]' ),
				isChecked = $input.length ? $input[ 0 ].checked : '';
			return $input.length ? status[ isChecked ? 0 : 1 ] : txt;
		***REMOVED***,
		parsed : true, // filter widget flag
		type : 'text'
	***REMOVED***);

	// Custom parser which returns the currently selected options
	// updated dynamically using the 'change' function below
	$.tablesorter.addParser({
		id : 'select',
		is : function() {
			return false;
		***REMOVED***,
		format : function( txt, table, cell ) {
			var $select = $( cell ).find( 'select' );
			return $select.length ? $select.val() : txt;
		***REMOVED***,
		parsed : true, // filter widget flag
		type : 'text'
	***REMOVED***);

	// Select parser to get the selected text
	$.tablesorter.addParser({
		id : 'select-text',
		is : function() {
			return false;
		***REMOVED***,
		format : function( txt, table, cell ) {
			var $select = $( cell ).find( 'select' );
			return $select.length ? $select.find( 'option:selected' ).text() || '' : txt;
		***REMOVED***,
		parsed : true, // filter widget flag
		type : 'text'
	***REMOVED***);

	// Custom parser for parsing textarea values
	// updated dynamically using the 'change' function below
	$.tablesorter.addParser({
		id : 'textarea',
		is : function() {
			return false;
		***REMOVED***,
		format : function( txt, table, cell ) {
			var $textarea = $( cell ).find( 'textarea' );
			return $textarea.length ? $textarea.val() : txt;
		***REMOVED***,
		parsed : true, // filter widget flag
		type : 'text'
	***REMOVED***);

	// update defaults for validator; values must be falsy
	$.tablesorter.defaults.checkboxClass = '';
	$.tablesorter.defaults.checkboxVisible = '';

	// update select and all input types in the tablesorter cache when the change event fires.
	// This method only works with jQuery 1.7+
	// you can change it to use delegate (v1.4.3+) or live (v1.3+) as desired
	// if this code interferes somehow, target the specific table $('#mytable'), instead of $('table')
	$( function() {
		if ( !$.fn.on ) { return; ***REMOVED***
		var toggleRowClass = function( $row, checkboxClass, indx, isChecked ) {
			// adding class to row, indicating that a checkbox is checked; includes
			// a column index in case more than one checkbox happens to be in a row
			$row.toggleClass( checkboxClass + '-' + indx, isChecked );
			// don't remove checked class if other columns have a check
			if ( ( $row[0].className || '' ).match( checkboxClass + '-' ) ) {
				$row.addClass( checkboxClass );
			***REMOVED*** else {
				$row.removeClass( checkboxClass );
			***REMOVED***
		***REMOVED***,
		updateCheckbox = function($el, state) {
			if ($el[0].nodeName !== 'INPUT') {
				$el = $el.find( 'input[type="checkbox"]' );
			***REMOVED***
			if ($el.length) {
				var ua = window.navigator.userAgent;
				if (state === 'indeterminate') {
					// needed for IE
					$el.prop('checked', !(ua.indexOf('Trident/') > -1 || ua.indexOf('Edge/') > -1));
					$el.prop('indeterminate', true);
				***REMOVED*** else {
					$el.prop('checked', state);
					$el.prop('indeterminate', false);
				***REMOVED***
			***REMOVED***
		***REMOVED***,
		updateHeaderCheckbox = function( $table, checkboxClass ) {
			var $rows = $table.children( 'tbody' ).children( ':visible' ), // (include child rows?)
				len = $rows.length,
				hasSticky = $table[0].config.widgetOptions.$sticky;
			// set indeterminate state on header checkbox
			$table.children( 'thead' ).find( 'input[type="checkbox"]' ).each( function() {
				var column = $( this ).closest( 'td, th' ).attr( 'data-column' ),
					$sticky = hasSticky.find( '[data-column="' + column + '"]' ),
					vis = $rows.filter( '.' + checkboxClass + '-' + column ).length,
					allChecked = vis === len && len > 0;
				if ( vis === 0 || allChecked ) {
					updateCheckbox($(this), allChecked);
					if ($sticky) {
						updateCheckbox($sticky, allChecked);
					***REMOVED***
				***REMOVED*** else {
					updateCheckbox($(this), 'indeterminate');
					if ($sticky) {
						updateCheckbox($sticky, 'indeterminate');
					***REMOVED***
				***REMOVED***
			***REMOVED***);

		***REMOVED***;

		$( 'table' ).on( 'tablesorter-initialized updateComplete', function() {
			this.tablesorterBusy = false;
			var namespace = '.parser-forms';
			$( this )
			// add namespace to table in case of version mismatch (v2.28.10)
			.addClass( this.config.namespace.slice(1) )
			.children( 'tbody' )
			.off( namespace )
			.on( 'mouseleave' + namespace, function( event ) {
				// make sure we restore original values (trigger blur)
				// isTbody is needed to prevent the select from closing in IE
				// see https://connect.microsoft.com/IE/feedbackdetail/view/962618/
				if ( event.target.nodeName === 'TBODY' ) {
					$( ':focus' ).blur();
				***REMOVED***
			***REMOVED***)
			.on( 'focus' + namespace, 'select, input:not([type=checkbox]), textarea', function( event ) {
				var $row = $( event.target ).closest( 'tr' ),
					c = $row.closest( 'table' )[0].config;
				if ( !c || c && c.ignoreChildRow && $row.hasClass( c.cssChildRow ) ) {
					return;
				***REMOVED***
				$( this ).data( 'ts-original-value', this.value );
			***REMOVED***)
			.on( 'blur' + namespace, 'input:not([type=checkbox]), textarea', function( event ) {
				var $row = $( event.target ).closest( 'tr' ),
					c = $row.closest( 'table' )[0].config;
				if ( !c || c && c.ignoreChildRow && $row.hasClass( c.cssChildRow ) ) {
					return;
				***REMOVED***
				// restore input value;
				// 'change' is triggered before 'blur' so this doesn't replace the new update with the original
				this.value = $( this ).data( 'ts-original-value' );
			***REMOVED***)
			.on( 'change keyup '.split( ' ' ).join( namespace + ' ' ), 'select, input, textarea', function( event ) {
				var $row = $( this ).closest( 'tr' ),
					c = $row.closest( 'table' )[0].config;
				if ( !c || c && c.ignoreChildRow && $row.hasClass( c.cssChildRow ) ) {
					return;
				***REMOVED***
				if ( event.which === 27 && !( this.nodeName === 'INPUT' && this.type === 'checkbox' ) ) {
					// escape: restore original value
					this.value = $( this ).data( 'ts-original-value' );
					return;
				***REMOVED***
				// Update cell cache using... select: change, input: enter or textarea: alt + enter
				if ( event.type === 'change' ||
					( event.type === 'keyup' && event.which === 13 &&
					( event.target.nodeName === 'INPUT' || event.target.nodeName === 'TEXTAREA' && event.altKey ) ) ) {
					var undef, checkboxClass,
						$target = $( event.target ),
						isCheckbox = event.target.type === 'checkbox',
						$cell = $target.closest( 'td' ),
						indx = $cell[ 0 ].cellIndex,
						busy = c.table.tablesorterBusy,
						$hdr = c.$headerIndexed && c.$headerIndexed[ indx ] || [],
						val = isCheckbox ? event.target.checked : $target.val();
					// abort if not a tablesorter table, or busy
					if ( $.isEmptyObject( c ) || busy !== false ) {
						return;
					***REMOVED***
					if ( isCheckbox ) {
						checkboxClass = c.checkboxClass || 'checked';
						toggleRowClass( $cell.closest( 'tr' ), checkboxClass, indx, val );
						updateHeaderCheckbox( c.$table, checkboxClass );
					***REMOVED***
					// don't use updateCell if column is set to 'sorter-false' and 'filter-false',
					// or column is set to 'parser-false'
					if ( $hdr.length && ( $hdr.hasClass( 'parser-false' ) ||
						( $hdr.hasClass( 'sorter-false' ) && $hdr.hasClass( 'filter-false' ) ) ) ||
						// table already updating; get out of here, we might be in an endless loop (in IE)! See #971
						( event.type === 'change' && c.table.isUpdating ) ) {
						return;
					***REMOVED***
					// ignore change event if nothing changed
					if ( c && val !== $target.data( 'ts-original-value' ) || isCheckbox ) {
						$target.data( 'ts-original-value', val );
						c.table.tablesorterBusy = true;
						// pass undefined resort value so it falls back to config.resort setting
						$.tablesorter.updateCell( c, $cell, undef, function() {
							updateServer( event, c.$table, $target );
							c.table.tablesorterBusy = false;
						***REMOVED***);
					***REMOVED***
				***REMOVED***
			***REMOVED***);

			// add code for a checkbox in the header to set/unset all checkboxes in a column
			if ( $( this ).children( 'thead' ).find( 'input[type="checkbox"]' ) ) {
				$( this )
				.off( namespace )
				.on( 'tablesorter-ready' + namespace, function() {
					var checkboxClass,
						$table = $( this ),
						c = $table.length && $table[ 0 ].config;
					if ( !$.isEmptyObject( c ) ) {
						this.tablesorterBusy = true;
						checkboxClass = c && c.checkboxClass || 'checked';
						// set indeterminate state on header checkbox
						updateHeaderCheckbox( $table, checkboxClass );
						this.tablesorterBusy = false;
					***REMOVED***
				***REMOVED***)
				.children( 'thead' )
				.add( this.config.widgetOptions.$sticky )
				.off( namespace )
				// modified from http://jsfiddle.net/abkNM/6163/
				// click needed for IE; a change isn't fired when going from an indeterminate checkbox to
				// either checked or unchecked
				.on( 'click' + namespace + ' change' + namespace, 'input[type="checkbox"]', function( event ) {
					var c, undef, onlyVisible, column, $target, isParsed, checkboxClass,
						$checkbox = $( this ),
						isChecked = this.checked,
						$table = $checkbox.closest( 'table' ),
						isSticky = $table.length && $table[0].className.match(/(tablesorter\w+)_extra_table/);
					if (isSticky) {
						isSticky = isSticky[1];
						$table = $('.' + isSticky + ':not(.' + isSticky + '_extra_table)');
					***REMOVED***
					c = $table.length && $table[ 0 ].config;
					if ( $table.length && c && !$table[ 0 ].tablesorterBusy ) {
						column = parseInt( $checkbox.closest( 'td, th' ).attr( 'data-column' ), 10 );
						isParsed = c.parsers[ column ].id === 'checkbox';
						onlyVisible = c.checkboxVisible;
						$table[ 0 ].tablesorterBusy = true; // prevent "change" event from calling updateCell numerous times (see #971)
						updateCheckbox(
							$target = $table
								.children( 'tbody' )
								.children( 'tr' + ( typeof onlyVisible === 'undefined' || onlyVisible === true ? ':visible' : '' ) )
								.children( ':nth-child(' + ( column + 1 ) + ')' ),
							isChecked
						);
						// add checkbox class names to row
						checkboxClass = c.checkboxClass || 'checked';
						$target.each( function() {
							toggleRowClass( $( this ).closest( 'tr' ), checkboxClass, column, isChecked );
						***REMOVED***);
						if (isSticky) {
							// make main table checkbox match sticky header checkbox
							updateCheckbox($table.children( 'thead' ).find( '[data-column="' + column + '"]' ), isChecked);
						***REMOVED*** else if (c.widgetOptions.$sticky) {
							updateCheckbox(c.widgetOptions.$sticky.find( 'thead' ).find( '[data-column="' + column + '"]' ), isChecked);
						***REMOVED***
						updateHeaderCheckbox( $table, checkboxClass );
						if ( isParsed ) {
							// only update cache if checkboxes are being sorted
							$.tablesorter.update( c, undef, function() {
								updateServer( event, $table, $target );
								$table[ 0 ].tablesorterBusy = false;
							***REMOVED***);
						***REMOVED*** else {
							updateServer( event, $table, $target );
							$table[ 0 ].tablesorterBusy = false;
						***REMOVED***
						// needed for IE8
						return true;
					***REMOVED***
					// update already going on, don't do anything!
					return false;
				***REMOVED***);
			***REMOVED***

		***REMOVED***);
	***REMOVED***);

***REMOVED***)( jQuery );
