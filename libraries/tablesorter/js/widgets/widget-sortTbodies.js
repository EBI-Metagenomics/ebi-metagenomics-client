/*! tablesorter tbody sorting widget (BETA) - 11/26/2016 (v2.28.0)
 * Requires tablesorter v2.22.2+ and jQuery 1.4+
 * by Rob Garrison
 * Contributors: Chris Rogers
 */
/*jshint browser:true, jquery:true, unused:false */
/*global jQuery: false */
;( function( $ ) {
	'use strict';
	var ts = $.tablesorter;

	ts.sortTbodies = {
		init: function( c, wo ) {

			var index, rows, txt, max, $rows,
				namespace = c.namespace + 'sortTbody',
				$tbodies = c.$table.children( 'tbody' ),
				len = $tbodies.length;

			// save serverSideSorting value; use to toggle internal row sorting
			wo.sortTbody_original_serverSideSorting = c.serverSideSorting;

			// include info-only tbodies - we need parsed data from *all* tbodies
			wo.sortTbody_original_cssInfoBlock = c.cssInfoBlock;
			c.cssInfoBlock = wo.sortTbody_noSort;
			ts.sortTbodies.setTbodies( c, wo );

			// add original order index for stable sort
			for ( index = 0; index < len; index++ ) {
				$tbodies.eq( index ).attr( 'data-ts-original-order', index );
			***REMOVED***

			c.$table
				.unbind( 'sortBegin updateComplete '.split( ' ' ).join( namespace + ' ' ) )
				.bind( 'sortBegin' + namespace, function() {
					ts.sortTbodies.sorter( c );
				***REMOVED***)
				.bind( 'updateComplete' + namespace, function() {
					// find parsers for each column
					ts.sortTbodies.setTbodies( c, wo );
					ts.updateCache( c, null, c.$tbodies );
				***REMOVED***)
				.bind('sortEnd', function() {
					// Moves the head row back to the top of the tbody
					var primaryRow = wo.sortTbody_primaryRow;
					if ( wo.sortTbody_lockHead && primaryRow ) {
						c.$table.find( primaryRow ).each( function() {
							$( this ).parents( 'tbody' ).prepend( this );
						***REMOVED***);
					***REMOVED***
				***REMOVED***);

			// detect parsers - in case the table contains only info-only tbodies
			if ( $.isEmptyObject( c.parsers ) || c.$tbodies.length !== $tbodies.length ) {
				ts.sortTbodies.setTbodies( c, wo );
				ts.updateCache( c, null, c.$tbodies );
			***REMOVED***

			// find colMax; this only matter for numeric columns
			$rows = $tbodies.children( 'tr' );
			len = $rows.length;
			for ( index = 0; index < c.columns; index++ ) {
				max = 0;
				if ( c.parsers[ index ].type === 'numeric' ) {
					for ( rows = 0; rows < len; rows++ ) {
						// update column max value (ignore sign)
						txt = ts.getParsedText( c, $rows.eq( rows ).children()[ index ], index );
						max = Math.max( Math.abs( txt ) || 0, max );
					***REMOVED***
				***REMOVED***
				c.$headerIndexed[ index ].attr( 'data-ts-col-max-value', max );
			***REMOVED***

		***REMOVED***,

		// make sure c.$tbodies is up-to-date (init & after updates)
		setTbodies: function( c, wo ) {
			c.$tbodies = c.$table.children( 'tbody' ).not( '.' + wo.sortTbody_noSort );
		***REMOVED***,

		sorter: function( c ) {
			var $table = c.$table,
				wo = c.widgetOptions;

			// prevent multiple calls while processing
			if ( wo.sortTbody_busy !== true ) {
				wo.sortTbody_busy = true;
				var $tbodies = $table.children( 'tbody' ).not( '.' + wo.sortTbody_noSort ),
					primary = wo.sortTbody_primaryRow || 'tr:eq(0)',
					sortList = c.sortList || [],
					len = sortList.length;

				if ( len ) {

					// toggle internal row sorting
					c.serverSideSorting = !wo.sortTbody_sortRows;

					$tbodies.sort( function( a, b ) {
						var sortListIndex, txt, dir, num, colMax, sort, col, order, colA, colB, x, y,
							table = c.table,
							parsers = c.parsers,
							cts = c.textSorter || '',
							$tbodyA = $( a ),
							$tbodyB = $( b ),
							$a = $tbodyA.find( primary ).children( 'td, th' ),
							$b = $tbodyB.find( primary ).children( 'td, th' );
						for ( sortListIndex = 0; sortListIndex < len; sortListIndex++ ) {
							col = sortList[ sortListIndex ][0];
							order = sortList[ sortListIndex ][1];
							// sort direction, true = asc, false = desc
							dir = order === 0;
							// column txt - tbody A
							txt = ts.getElementText( c, $a.eq( col ), col );
							colA = parsers[ col ].format( txt, table, $a[ col ], col );
							// column txt - tbody B
							txt = ts.getElementText( c, $b.eq( col ), col );
							colB = parsers[ col ].format( txt, table, $b[ col ], col );

							if (c.sortStable && colA === colB && len === 1) {
								return $tbodyA.attr( 'data-ts-original-order' ) - $tbodyB.attr( 'data-ts-original-order' );
							***REMOVED***

							// fallback to natural sort since it is more robust
							num = /n/i.test( parsers && parsers[ col ] ? parsers[ col ].type || '' : '' );
							if ( num && c.strings[ col ] ) {
								colMax = c.$headerIndexed[ col ].attr( 'data-ts-col-max-value' ) ||
									1.79E+308; // close to Number.MAX_VALUE
								// sort strings in numerical columns
								if ( typeof ( ts.string[ c.strings[ col ] ] ) === 'boolean' ) {
									num = ( dir ? 1 : -1 ) * ( ts.string[ c.strings[ col ] ] ? -1 : 1 );
								***REMOVED*** else {
									num = ( c.strings[ col ] ) ? ts.string[ c.strings[ col ] ] || 0 : 0;
								***REMOVED***
								// fall back to built-in numeric sort
								// var sort = $.tablesorter['sort' + s](a, b, dir, colMax, table);
								sort = c.numberSorter ? c.numberSorter( colA, colB, dir, colMax, table ) :
									ts[ 'sortNumeric' + ( dir ? 'Asc' : 'Desc' ) ]( colA, colB, num, colMax, col, c );
							***REMOVED*** else {
								// set a & b depending on sort direction
								x = dir ? colA : colB;
								y = dir ? colB : colA;
								// text sort function
								if ( typeof ( cts ) === 'function' ) {
									// custom OVERALL text sorter
									sort = cts( x, y, dir, col, table );
								***REMOVED*** else if ( typeof ( cts ) === 'object' && cts.hasOwnProperty( col ) ) {
									// custom text sorter for a SPECIFIC COLUMN
									sort = cts[ col ]( x, y, dir, col, table );
								***REMOVED*** else {
									// fall back to natural sort
									sort = ts[ 'sortNatural' + ( dir ? 'Asc' : 'Desc' ) ]( colA, colB, col, c );
								***REMOVED***
							***REMOVED***
							if ( sort ) { return sort; ***REMOVED***
						***REMOVED***
						return $tbodyA.attr( 'data-ts-original-order' ) - $tbodyB.attr( 'data-ts-original-order' );
					***REMOVED***);

					ts.sortTbodies.restoreTbodies( c, wo, $tbodies );
					wo.sortTbody_busy = false;
				***REMOVED***
			***REMOVED***
		***REMOVED***,

		restoreTbodies : function ( c, wo, $sortedTbodies ) {
			var $nosort, $tbodies, $thisTbody, tbLen, nsLen, index, targetIndex,
				$table = c.$table,
				hasShuffled = true,
				indx = 0;

			// hide entire table to improve sort performance
			$table.hide();
			$sortedTbodies.appendTo( $table );

			// reposition no-sort tbodies
			$tbodies = $table.children( 'tbody' );
			tbLen = $tbodies.length;
			$nosort = $tbodies.filter( '.' + wo.sortTbody_noSort ).appendTo( $table );
			nsLen = $nosort.length;

			if ( nsLen ) {
				// don't allow the while loop to cycle more times than the set number of no-sort tbodies
				while ( hasShuffled && indx < nsLen ) {
					hasShuffled = false;
					for ( index = 0; index < nsLen; index++ ) {
						targetIndex = parseInt( $nosort.eq( index ).attr( 'data-ts-original-order' ), 10 );
						// if target index > number of tbodies, make it last
						targetIndex = targetIndex >= tbLen ? tbLen : targetIndex < 0 ? 0 : targetIndex;

						if ( targetIndex !== $nosort.eq( index ).index() ) {
							hasShuffled = true;
							$thisTbody = $nosort.eq( index ).detach();

							if ( targetIndex >= tbLen ) {
								// Are we trying to be the last tbody?
								$thisTbody.appendTo( $table );
							***REMOVED*** else if ( targetIndex === 0 ) {
								// Are we trying to be the first tbody?
								$thisTbody.prependTo( $table );
							***REMOVED*** else {
								// No, we want to be somewhere in the middle!
								$thisTbody.insertBefore( $table.children( 'tbody:eq(' + targetIndex + ')' ) );
							***REMOVED***

						***REMOVED***
					***REMOVED***
					indx++;
				***REMOVED***
			***REMOVED***

			$table.show();
		***REMOVED***

	***REMOVED***;

	ts.addWidget({
		id: 'sortTbody',
		// priority < 50 (filter widget), so c.$tbodies has the correct elements
		priority: 40,
		options: {
			// lock primary row as a header when sorting
			sortTbody_lockHead   : false,
			// point to a row within the tbody that matches the number of header columns
			sortTbody_primaryRow : null,
			// sort tbody internal rows
			sortTbody_sortRows   : false,
			// static tbodies (like static rows)
			sortTbody_noSort     : 'tablesorter-no-sort-tbody'
		***REMOVED***,
		init : function( table, thisWidget, c, wo ) {
			ts.sortTbodies.init( c, wo );
		***REMOVED***,
		remove : function( table, c, wo, refreshing ) {
			c.$table.unbind( 'sortBegin updateComplete '.split( ' ' ).join( c.namespace + 'sortTbody ' ) );
			c.serverSideSorting = wo.sortTbody_original_serverSideSorting;
			c.cssInfoBlock = wo.sortTbody_original_cssInfoBlock;
		***REMOVED***
	***REMOVED***);

***REMOVED***)( jQuery );
