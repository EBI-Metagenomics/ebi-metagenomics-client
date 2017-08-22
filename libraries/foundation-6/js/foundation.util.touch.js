//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function($) {

  $.spotSwipe = {
    version: '1.0.0',
    enabled: 'ontouchstart' in document.documentElement,
    preventDefault: false,
    moveThreshold: 75,
    timeThreshold: 200
  ***REMOVED***;

  var   startPosX,
        startPosY,
        startTime,
        elapsedTime,
        isMoving = false;

  function onTouchEnd() {
    //  alert(this);
    this.removeEventListener('touchmove', onTouchMove);
    this.removeEventListener('touchend', onTouchEnd);
    isMoving = false;
  ***REMOVED***

  function onTouchMove(e) {
    if ($.spotSwipe.preventDefault) { e.preventDefault(); ***REMOVED***
    if(isMoving) {
      var x = e.touches[0].pageX;
      var y = e.touches[0].pageY;
      var dx = startPosX - x;
      var dy = startPosY - y;
      var dir;
      elapsedTime = new Date().getTime() - startTime;
      if(Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
        dir = dx > 0 ? 'left' : 'right';
      ***REMOVED***
      // else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
      //   dir = dy > 0 ? 'down' : 'up';
      // ***REMOVED***
      if(dir) {
        e.preventDefault();
        onTouchEnd.call(this);
        $(this).trigger('swipe', dir).trigger(`swipe${dir***REMOVED***`);
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***

  function onTouchStart(e) {
    if (e.touches.length == 1) {
      startPosX = e.touches[0].pageX;
      startPosY = e.touches[0].pageY;
      isMoving = true;
      startTime = new Date().getTime();
      this.addEventListener('touchmove', onTouchMove, false);
      this.addEventListener('touchend', onTouchEnd, false);
    ***REMOVED***
  ***REMOVED***

  function init() {
    this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
  ***REMOVED***

  function teardown() {
    this.removeEventListener('touchstart', onTouchStart);
  ***REMOVED***

  $.event.special.swipe = { setup: init ***REMOVED***;

  $.each(['left', 'up', 'down', 'right'], function () {
    $.event.special[`swipe${this***REMOVED***`] = { setup: function(){
      $(this).on('swipe', $.noop);
    ***REMOVED*** ***REMOVED***;
  ***REMOVED***);
***REMOVED***)(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function($){
  $.fn.addTouch = function(){
    this.each(function(i,el){
      $(el).bind('touchstart touchmove touchend touchcancel',function(){
        //we pass the original event object because the jQuery event
        //object is normalized to w3c specs and does not provide the TouchList
        handleTouch(event);
      ***REMOVED***);
    ***REMOVED***);

    var handleTouch = function(event){
      var touches = event.changedTouches,
          first = touches[0],
          eventTypes = {
            touchstart: 'mousedown',
            touchmove: 'mousemove',
            touchend: 'mouseup'
          ***REMOVED***,
          type = eventTypes[event.type],
          simulatedEvent
        ;

      if('MouseEvent' in window && typeof window.MouseEvent === 'function') {
        simulatedEvent = new window.MouseEvent(type, {
          'bubbles': true,
          'cancelable': true,
          'screenX': first.screenX,
          'screenY': first.screenY,
          'clientX': first.clientX,
          'clientY': first.clientY
        ***REMOVED***);
      ***REMOVED*** else {
        simulatedEvent = document.createEvent('MouseEvent');
        simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
      ***REMOVED***
      first.target.dispatchEvent(simulatedEvent);
    ***REMOVED***;
  ***REMOVED***;
***REMOVED***(jQuery);


//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		***REMOVED***;

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		***REMOVED***
	***REMOVED***);

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		***REMOVED*** else {
			$.event.dispatch.call( obj, event );
		***REMOVED***
		event.type = originalType;
	***REMOVED***

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			***REMOVED*** else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			***REMOVED***

			return {
				x: x,
				y: y
			***REMOVED***;
		***REMOVED***,

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					***REMOVED***;
		***REMOVED***,

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					***REMOVED***;
		***REMOVED***,

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop ***REMOVED***), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop ***REMOVED*** ), true );
				return true;
			***REMOVED***
			return false;

		***REMOVED***,

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {***REMOVED***;

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 ***REMOVED***;
				$.data( this, "mobile-events", events );
			***REMOVED***
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				***REMOVED***
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					***REMOVED***

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						***REMOVED***
					***REMOVED***
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					***REMOVED***
				***REMOVED***;

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				***REMOVED***;

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			***REMOVED***;
			$this.on( touchStartEvent, context.start );
		***REMOVED***,

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				***REMOVED***
			***REMOVED***

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				***REMOVED***
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				***REMOVED***
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				***REMOVED***
			***REMOVED***
		***REMOVED***
	***REMOVED***;
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	***REMOVED***, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			***REMOVED***,
			teardown: function() {
				$( this ).unbind( sourceEvent );
			***REMOVED***
		***REMOVED***;
	***REMOVED***);
***REMOVED***)( jQuery, this );
*/
