/*! Widget: editable - updated 4/4/2017 (v2.28.7) *//*
 * Requires tablesorter v2.8+ and jQuery 1.7+
 * by Rob Garrison
 */
/*jshint browser:true, jquery:true, unused:false */
/*global jQuery: false */
;( function( $ ) {
	'use strict';

	var tse = $.tablesorter.editable = {
		namespace : '.tseditable',
		// last edited class name
		lastEdited: 'tseditable-last-edited-cell',

		editComplete: function( c, wo, $cell, refocus ) {
			c.$table
				.find( '.' + tse.lastEdited )
				.removeClass( tse.lastEdited )
				.trigger( wo.editable_editComplete, [ c ] );
			// restore focus last cell after updating
			if ( refocus ) {
				setTimeout( function() {
					$cell.focus();
				***REMOVED***, 50 );
			***REMOVED***
		***REMOVED***,

		selectAll: function( cell ) {
			setTimeout( function() {
				if ( document.queryCommandSupported( 'SelectAll' ) ) {
					document.execCommand( 'selectAll', false, null );
				***REMOVED*** else {
					// select all text in contenteditable
					// see http://stackoverflow.com/a/6150060/145346
					var range, selection;
					if ( document.body.createTextRange ) {
						range = document.body.createTextRange();
						range.moveToElementText( cell );
						range.select();
					***REMOVED*** else if ( window.getSelection ) {
						selection = window.getSelection();
						range = document.createRange();
						range.selectNodeContents( cell );
						selection.removeAllRanges();
						selection.addRange( range );
					***REMOVED***
				***REMOVED***
				// need delay of at least 100ms or last contenteditable will get refocused
			***REMOVED***, 100 );
		***REMOVED***,

		getColumns : function( c, wo ) {
			var list, indx, range, len, tmp,
				editableColumns = wo.editable_columns,
				cols = [];
			if ( typeof editableColumns === 'string' ) {
				// editable_columns can contain a range string, or comma separated values (e.g. '1,2-4,7')
				list = editableColumns.replace( /\s+/, '' ).split( /,/ );
				len = list.length - 1;
				while ( len >= 0 ) {
					if ( list[ len ].indexOf( '-' ) >= 0 ) {
						range = list[ len ].split( '-' );
						indx = parseInt( range[ 0 ], 10 ) || 0;
						range = parseInt( range[ 1 ], 10) || c.columns - 1;
						if ( indx > range ) {
							// in case someone does '5-3'
							tmp = indx; indx = range; range = tmp;
						***REMOVED***
						for ( ; indx <= range; indx++ ) {
							cols.push( 'td:nth-child(' + ( indx + 1 ) + ')' );
						***REMOVED***
					***REMOVED*** else {
						cols.push( 'td:nth-child(' + ( ( parseInt( list[ len ], 10 ) || 0 ) + 1 ) + ')' );
					***REMOVED***
					len--;
				***REMOVED***
			***REMOVED*** else if ( $.isArray( editableColumns ) ) {
				len = editableColumns.length;
				for ( indx = 0; indx < len; indx++ ) {
					if ( editableColumns[ indx ] < c.columns ) {
						cols.push( 'td:nth-child(' + ( editableColumns[ indx ] + 1 ) + ')' );
					***REMOVED***
				***REMOVED***
			***REMOVED***
			return cols;
		***REMOVED***,

		update: function( c, wo ) {
			var $t, $cells, cellIndex, cellLen, $editable, editableIndex, editableLen,
				tmp = $( '<div>' ).wrapInner( wo.editable_wrapContent ).children().length || $.isFunction( wo.editable_wrapContent ),
				cols = tse.getColumns( c, wo ).join( ',' );

			// turn off contenteditable to allow dynamically setting the wo.editable_noEdit
			// class on table cells - see issue #900
			c.$tbodies.find( cols ).find( '[contenteditable]' ).prop( 'contenteditable', false );

			// IE does not allow making TR/TH/TD cells directly editable ( issue #404 )
			// so add a div or span inside ( it's faster than using wrapInner() )
			$cells = c.$tbodies.find( cols ).not( '.' + wo.editable_noEdit );
			cellLen = $cells.length;
			for ( cellIndex = 0; cellIndex < cellLen; cellIndex++ ) {
				/*jshint loopfunc:true */
				// test for children, if they exist, then make the children editable
				$t = $cells.eq( cellIndex );
				if ( tmp && $t.children( 'div, span' ).length === 0 ) {
					$t.wrapInner( wo.editable_wrapContent );
				***REMOVED***
				$editable = $t.children( 'div, span' ).not( '.' + wo.editable_noEdit );
				editableLen = $editable.length;
				if ( editableLen ) {
					// make div/span children content editable
					for ( editableIndex = 0; editableIndex < editableLen; editableIndex++ ) {
						var $this = $editable.eq( editableIndex );
						if ( wo.editable_trimContent ) {
							$this.html( function( i, txt ) {
								return $.trim( txt );
							***REMOVED***);
						***REMOVED***
						$this.prop( 'contenteditable', true );
					***REMOVED***
				***REMOVED*** else {
					if ( wo.editable_trimContent ) {
						$t.html( function( i, txt ) {
							return $.trim( txt );
						***REMOVED***);
					***REMOVED***
					$t.prop( 'contenteditable', true );
				***REMOVED***
			***REMOVED***
		***REMOVED***,

		bindEvents: function( c, wo ) {
			var namespace = tse.namespace;
			c.$table
				.off( ( 'updateComplete pagerComplete '.split( ' ' ).join( namespace + ' ' ) ).replace( /\s+/g, ' ' ) )
				.on( 'updateComplete pagerComplete '.split( ' ' ).join( namespace + ' ' ), function() {
					tse.update( c, c.widgetOptions );
				***REMOVED***)
				// prevent sort initialized by user click on the header from changing the row indexing before
				// updateCell can finish processing the change
				.children( 'thead' )
				.add( $( c.namespace + '_extra_table' ).children( 'thead' ) )
				.off( 'mouseenter' + namespace )
				.on( 'mouseenter' + namespace, function() {
					if ( c.$table.data( 'contentFocused' ) ) {
						// change to 'true' instead of element to allow focusout to process
						c.$table.data( 'contentFocused', true );
						$( ':focus' ).trigger( 'focusout' );
					***REMOVED***
				***REMOVED***);

			c.$tbodies
				.off( ( 'focus focusout keydown '.split( ' ' ).join( namespace + ' ' ) ).replace( /\s+/g, ' ' ) )
				.on( 'focus' + namespace, '[contenteditable]', function( e ) {
					clearTimeout( $( this ).data( 'timer' ) );
					c.$table.data( 'contentFocused', e.target );
					c.table.isUpdating = true; // prevent sorting while editing
					var $this = $( this ),
						selAll = wo.editable_selectAll,
						column = $this.closest( 'td' ).index(),
						txt = $this.html();
					if ( wo.editable_trimContent ) {
						txt = $.trim( txt );
					***REMOVED***
					// prevent enter from adding into the content
					$this
						.off( 'keydown' + namespace )
						.on( 'keydown' + namespace, function( e ) {
							if ( wo.editable_enterToAccept && e.which === 13 && !e.shiftKey ) {
								e.preventDefault();
							***REMOVED***
						***REMOVED***);
					$this.data({ before : txt, original: txt ***REMOVED***);

					if ( typeof wo.editable_focused === 'function' ) {
						wo.editable_focused( txt, column, $this );
					***REMOVED***

					if ( selAll ) {
						if ( typeof selAll === 'function' ) {
							if ( selAll( txt, column, $this ) ) {
								tse.selectAll( $this[0] );
							***REMOVED***
						***REMOVED*** else {
							tse.selectAll( $this[0] );
						***REMOVED***
					***REMOVED***
				***REMOVED***)
				.on( 'focusout keydown '.split( ' ' ).join( namespace + ' ' ), '[contenteditable]', function( e ) {
					if ( !c.$table.data( 'contentFocused' ) ) { return; ***REMOVED***
					var t, validate,
						valid = false,
						$this = $( e.target ),
						txt = $this.html(),
						column = $this.closest( 'td' ).index();
					if ( wo.editable_trimContent ) {
						txt = $.trim( txt );
					***REMOVED***
					if ( e.which === 27 ) {
						// user cancelled
						$this
							.html( $this.data( 'original' ) )
							.trigger( 'blur' + namespace );
						c.$table.data( 'contentFocused', false );
						c.table.isUpdating = false;
						return false;
					***REMOVED***
					// accept on enter ( if set ), alt-enter ( always ) or if autoAccept is set and element is blurred or unfocused
					t = e.which === 13 && !e.shiftKey && ( wo.editable_enterToAccept || e.altKey ) || wo.editable_autoAccept && e.type !== 'keydown';
					// change if new or user hits enter ( if option set )
					if ( t && $this.data( 'before' ) !== txt ) {

						validate = wo.editable_validate;
						valid = txt;

						if ( typeof validate === 'function' ) {
							valid = validate( txt, $this.data( 'original' ), column, $this );
						***REMOVED*** else if ( typeof ( validate = $.tablesorter.getColumnData( c.table, validate, column ) ) === 'function' ) {
							valid = validate( txt, $this.data( 'original' ), column, $this );
						***REMOVED***

						if ( t && valid !== false ) {
							c.$table.find( '.' + tse.lastEdited ).removeClass( tse.lastEdited );
							$this
								.addClass( tse.lastEdited )
								.html( valid )
								.data( 'before', valid )
								.data( 'original', valid )
								.trigger( 'change' );
							// prevent error if table was destroyed - see #1099
							if ( c.table.hasInitialized ) {
								$.tablesorter.updateCell( c, $this.closest( 'td' ), false, function() {
									if ( wo.editable_autoResort ) {
										setTimeout( function() {
											$.tablesorter.sortOn( c, c.sortList, function() {
												tse.editComplete( c, wo, c.$table.data( 'contentFocused' ), true );
											***REMOVED***, true );
										***REMOVED***, 10 );
									***REMOVED*** else {
										tse.editComplete( c, wo, c.$table.data( 'contentFocused' ) );
									***REMOVED***
								***REMOVED***);
							***REMOVED***
							return false;
						***REMOVED***
					***REMOVED*** else if ( !valid && e.type !== 'keydown' ) {
						clearTimeout( $this.data( 'timer' ) );
						$this.data( 'timer', setTimeout( function() {
							c.table.isUpdating = false; // clear flag or sorting will be disabled

							if ( $.isFunction( wo.editable_blur ) ) {
								txt = $this.html();
								wo.editable_blur( wo.editable_trimContent ? $.trim( txt ) : txt, column, $this );
							***REMOVED***
						***REMOVED***, 100 ) );
						// restore original content on blur
						$this.html( $this.data( 'original' ) );
					***REMOVED***
				***REMOVED***)
				// paste plain text from Excel - fixes #994
				.on('paste' + namespace, '[contenteditable]', function() {
					var content,
						$this = $(this);
					// setTimeout needed to get pasted-in content
					setTimeout(function() {
						if ($this.is(':focus')) {
							content = '<div>' + $this.html() + '</div>';
							$this.html( $(content).text().trim() );
						***REMOVED***
					***REMOVED***, 0);
				***REMOVED***);
		***REMOVED***,
		destroy : function( c, wo ) {
			var namespace = tse.namespace,
				cols = tse.getColumns( c, wo ),

			tmp = ( 'updateComplete pagerComplete '.split( ' ' ).join( namespace + ' ' ) ).replace( /\s+/g, ' ' );
			c.$table.off( tmp );

			tmp = ( 'focus focusout keydown paste '.split( ' ' ).join( namespace + ' ' ) ).replace( /\s+/g, ' ' );
			c.$tbodies
				.off( tmp )
				.find( cols.join( ',' ) )
				.find( '[contenteditable]' )
				.prop( 'contenteditable', false );
		***REMOVED***

	***REMOVED***;

	$.tablesorter.addWidget({
		id: 'editable',
		options : {
			editable_columns       : [],
			editable_enterToAccept : true,
			editable_autoAccept    : true,
			editable_autoResort    : false,
			editable_wrapContent   : '<div>', // wrap the cell content... makes this widget work in IE, and with autocomplete
			editable_trimContent   : true,    // trim content inside of contenteditable ( remove tabs & carriage returns )
			editable_validate      : null,    // function( text, originalText ) { return text; ***REMOVED***
			editable_focused       : null,    // function( text, columnIndex, $element ) {***REMOVED***
			editable_blur          : null,    // function( text, columnIndex, $element ) { ***REMOVED***
			editable_selectAll     : false,   // true/false or function( text, columnIndex, $element ) { return true; ***REMOVED***
			editable_noEdit        : 'no-edit',
			editable_editComplete  : 'editComplete'
		***REMOVED***,
		init: function( table, thisWidget, c, wo ) {
			if ( !wo.editable_columns.length ) { return; ***REMOVED***
			tse.update( c, wo );
			tse.bindEvents( c, wo );
		***REMOVED***,
		remove : function( table, c, wo, refreshing ) {
			if ( !refreshing ) {
				tse.destroy( c, wo ) ;
			***REMOVED***
		***REMOVED***
	***REMOVED***);

***REMOVED***)( jQuery );
