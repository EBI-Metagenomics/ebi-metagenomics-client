;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  ***REMOVED*** else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'));
  ***REMOVED*** else {
    root.MotionUI = factory(root.jQuery);
  ***REMOVED***
***REMOVED***(this, function($) {
'use strict';

// Polyfill for requestAnimationFrame
(function() {
  if (!Date.now)
    Date.now = function() { return new Date().getTime(); ***REMOVED***;

  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp+'RequestAnimationFrame'];
      window.cancelAnimationFrame = (window[vp+'CancelAnimationFrame']
                                 || window[vp+'CancelRequestAnimationFrame']);
  ***REMOVED***
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent)
    || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function(callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function() { callback(lastTime = nextTime); ***REMOVED***,
                          nextTime - now);
    ***REMOVED***;
    window.cancelAnimationFrame = clearTimeout;
  ***REMOVED***
***REMOVED***)();

var initClasses   = ['mui-enter', 'mui-leave'];
var activeClasses = ['mui-enter-active', 'mui-leave-active'];

// Find the right "transitionend" event for this browser
var endEvent = (function() {
  var transitions = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'otransitionend'
  ***REMOVED***
  var elem = window.document.createElement('div');

  for (var t in transitions) {
    if (typeof elem.style[t] !== 'undefined') {
      return transitions[t];
    ***REMOVED***
  ***REMOVED***

  return null;
***REMOVED***)();

function animate(isIn, element, animation, cb) {
  element = $(element).eq(0);

  if (!element.length) return;

  if (endEvent === null) {
    isIn ? element.show() : element.hide();
    cb();
    return;
  ***REMOVED***

  var initClass = isIn ? initClasses[0] : initClasses[1];
  var activeClass = isIn ? activeClasses[0] : activeClasses[1];

  // Set up the animation
  reset();
  element.addClass(animation);
  element.css('transition', 'none');
  requestAnimationFrame(function() {
    element.addClass(initClass);
    if (isIn) element.show();
  ***REMOVED***);

  // Start the animation
  requestAnimationFrame(function() {
    element[0].offsetWidth;
    element.css('transition', '');
    element.addClass(activeClass);
  ***REMOVED***);

  // Clean up the animation when it finishes
  element.one('transitionend', finish);

  // Hides the element (for out animations), resets the element, and runs a callback
  function finish() {
    if (!isIn) element.hide();
    reset();
    if (cb) cb.apply(element);
  ***REMOVED***

  // Resets transitions and removes motion-specific classes
  function reset() {
    element[0].style.transitionDuration = 0;
    element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
  ***REMOVED***
***REMOVED***

var MotionUI = {
  animateIn: function(element, animation, cb) {
    animate(true, element, animation, cb);
  ***REMOVED***,

  animateOut: function(element, animation, cb) {
    animate(false, element, animation, cb);
  ***REMOVED***
***REMOVED***

return MotionUI;
***REMOVED***));
