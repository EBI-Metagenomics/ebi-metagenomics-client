/*! Parser: network - updated 5/17/2015 (v2.22.0) */
/* IPv4, IPv6 and MAC Addresses */
/*global jQuery: false */
;(function($){
	'use strict';

	var ts = $.tablesorter,
		ipv4Format,
		ipv4Is;

	/*! IPv6 Address parser (WIP) *//*
	* IPv6 Address (ffff:0000:0000:0000:0000:0000:0000:0000)
	* needs to support short versions like '::8' or '1:2::7:8'
	* and '::00:192.168.10.184' (embedded IPv4 address)
	* see http://www.intermapper.com/support/tools/IPV6-Validator.aspx
	*/
	$.extend( ts.regex, {***REMOVED***, {
		ipv4Validate : /((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3***REMOVED***)/,
		ipv4Extract  : /([0-9]{1,3***REMOVED***)\.([0-9]{1,3***REMOVED***)\.([0-9]{1,3***REMOVED***)\.([0-9]{1,3***REMOVED***)/,

		// simplified regex from http://www.intermapper.com/support/tools/IPV6-Validator.aspx
		// (specifically from http://download.dartware.com/thirdparty/ipv6validator.js)
		ipv6Validate : /^\s*((([0-9a-f]{1,4***REMOVED***:){7***REMOVED***([0-9a-f]{1,4***REMOVED***|:))|(([0-9a-f]{1,4***REMOVED***:){6***REMOVED***(:[0-9a-f]{1,4***REMOVED***|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3***REMOVED***)|:))|(([0-9a-f]{1,4***REMOVED***:){5***REMOVED***(((:[0-9a-f]{1,4***REMOVED***){1,2***REMOVED***)|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3***REMOVED***)|:))|(([0-9a-f]{1,4***REMOVED***:){4***REMOVED***(((:[0-9a-f]{1,4***REMOVED***){1,3***REMOVED***)|((:[0-9a-f]{1,4***REMOVED***)?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3***REMOVED***))|:))|(([0-9a-f]{1,4***REMOVED***:){3***REMOVED***(((:[0-9a-f]{1,4***REMOVED***){1,4***REMOVED***)|((:[0-9a-f]{1,4***REMOVED***){0,2***REMOVED***:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3***REMOVED***))|:))|(([0-9a-f]{1,4***REMOVED***:){2***REMOVED***(((:[0-9a-f]{1,4***REMOVED***){1,5***REMOVED***)|((:[0-9a-f]{1,4***REMOVED***){0,3***REMOVED***:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3***REMOVED***))|:))|(([0-9a-f]{1,4***REMOVED***:){1***REMOVED***(((:[0-9a-f]{1,4***REMOVED***){1,6***REMOVED***)|((:[0-9a-f]{1,4***REMOVED***){0,4***REMOVED***:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3***REMOVED***))|:))|(:(((:[0-9a-f]{1,4***REMOVED***){1,7***REMOVED***)|((:[0-9a-f]{1,4***REMOVED***){0,5***REMOVED***:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3***REMOVED***))|:)))(%.+)?\s*$/i
	***REMOVED***);

	ts.addParser({
		id: 'ipv6Address',
		is: function(s) {
			return ts.regex.ipv6Validate.test(s);
		***REMOVED***,
		format: function(address, table) {
			// code modified from http://zurb.com/forrst/posts/JS_Expand_Abbreviated_IPv6_Addresses-1OR
			// Saved to https://gist.github.com/Mottie/7018157
			var i, t, sides, groups, groupsPresent,
				hex = table ? (typeof table === 'boolean' ? table : table && table.config.ipv6HexFormat || false) : false,
				fullAddress = '',
				expandedAddress = '',
				validGroupCount = 8;
			// validGroupSize = 4; <- removed while loop
			// remove any extra spaces
			address = address.replace(/\s*/g, '');
			// look for embedded ipv4
			if (ts.regex.ipv4Validate.test(address)) {
				groups = address.match(ts.regex.ipv4Extract);
				t = '';
				for (i = 1; i < groups.length; i++){
					t += ('00' + (parseInt(groups[i], 10).toString(16)) ).slice(-2) + ( i === 2 ? ':' : '' );
				***REMOVED***
				address = address.replace( ts.regex.ipv4Extract, t );
			***REMOVED***

			if (address.indexOf('::') == -1) {
				// All eight groups are present
				fullAddress = address;
			***REMOVED*** else {
				// Consecutive groups of zeroes have been collapsed with '::'.
				sides = address.split('::');
				groupsPresent = 0;
				for (i = 0; i < sides.length; i++) {
					groupsPresent += sides[i].split(':').length;
				***REMOVED***
				fullAddress += sides[0] + ':';
				for (i = 0; i < validGroupCount - groupsPresent; i++) {
					fullAddress += '0000:';
				***REMOVED***
				fullAddress += sides[1];
			***REMOVED***
			groups = fullAddress.split(':');
			for (i = 0; i < validGroupCount; i++) {
				// it's fastest & easiest for tablesorter to sort decimal values (vs hex)
				groups[i] = hex ? ('0000' + groups[i]).slice(-4) :
					('00000' + (parseInt(groups[i], 16) || 0)).slice(-5);
				expandedAddress += ( i != validGroupCount - 1) ? groups[i] + ':' : groups[i];
			***REMOVED***
			return hex ? expandedAddress : expandedAddress.replace(/:/g, '');
		***REMOVED***,
		// uses natural sort hex compare
		type: 'numeric'
	***REMOVED***);

	// ipv4 address
	// moved here from jquery.tablesorter.js (core file)
	ipv4Is = function(s) {
		return (/^\d{1,3***REMOVED***[\.]\d{1,3***REMOVED***[\.]\d{1,3***REMOVED***[\.]\d{1,3***REMOVED***$/).test(s);
	***REMOVED***;
	ipv4Format = function(s, table) {
		var i, a = s ? s.split('.') : '',
			r = '',
			l = a.length;
		for (i = 0; i < l; i++) {
			r += ('000' + a[i]).slice(-3);
		***REMOVED***
		return s ? ts.formatFloat(r, table) : s;
	***REMOVED***;

	/*! Parser: ipv4Address (a.k.a. ipAddress) */
	// duplicate 'ipAddress' as 'ipv4Address' (to maintain backwards compatility)
	ts.addParser({
		id: 'ipAddress',
		is: ipv4Is,
		format: ipv4Format,
		type: 'numeric'
	***REMOVED***);
	ts.addParser({
		id: 'ipv4Address',
		is: ipv4Is,
		format: ipv4Format,
		type: 'numeric'
	***REMOVED***);

	/*! Parser: MAC address */
	/* MAC examples: 12:34:56:78:9A:BC, 1234.5678.9ABC, 12-34-56-78-9A-BC, and 123456789ABC
	*/
	ts.addParser({
		id : 'MAC',
		is : function() {
			return false;
		***REMOVED***,
		format : function( str ) {
			var indx, len,
				mac = '',
				val = ( str || '' ).replace( /[:.-]/g, '' ).match( /\w{2***REMOVED***/g );
			if ( val ) {
				// not assuming all mac addresses in the column will end up with six
				// groups of two to process, so it's not actually validating the address
				len = val.length;
				for ( indx = 0; indx < len; indx++ ) {
					mac += ( '000' + parseInt( val[ indx ], 16 ) ).slice( -3 );
				***REMOVED***
				return mac;
			***REMOVED***
			return str;
		***REMOVED***,
		// uses natural sort hex compare
		type : 'numeric'
	***REMOVED***);

***REMOVED***)( jQuery );
