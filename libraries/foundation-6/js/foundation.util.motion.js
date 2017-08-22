'use strict';

!function($) {

/**
 * Motion module.
 * @module foundation.motion
 */

const initClasses   = ['mui-enter', 'mui-leave'];
const activeClasses = ['mui-enter-active', 'mui-leave-active'];

const Motion = {
  animateIn: function(element, animation, cb) {
    animate(true, element, animation, cb);
  ***REMOVED***,

  animateOut: function(element, animation, cb) {
    animate(false, element, animation, cb);
  ***REMOVED***
***REMOVED***

function Move(duration, elem, fn){
  var anim, prog, start = null;
  // console.log('called');

  if (duration === 0) {
    fn.apply(elem);
    elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
    return;
  ***REMOVED***

  function move(ts){
    if(!start) start = ts;
    // console.log(start, ts);
    prog = ts - start;
    fn.apply(elem);

    if(prog < duration){ anim = window.requestAnimationFrame(move, elem); ***REMOVED***
    else{
      window.cancelAnimationFrame(anim);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
    ***REMOVED***
  ***REMOVED***
  anim = window.requestAnimationFrame(move);
***REMOVED***

/**
 * Animates an element in or out using a CSS transition class.
 * @function
 * @private
 * @param {Boolean***REMOVED*** isIn - Defines if the animation is in or out.
 * @param {Object***REMOVED*** element - jQuery or HTML object to animate.
 * @param {String***REMOVED*** animation - CSS class to use.
 * @param {Function***REMOVED*** cb - Callback to run when animation is finished.
 */
function animate(isIn, element, animation, cb) {
  element = $(element).eq(0);

  if (!element.length) return;

  var initClass = isIn ? initClasses[0] : initClasses[1];
  var activeClass = isIn ? activeClasses[0] : activeClasses[1];

  // Set up the animation
  reset();

  element
    .addClass(animation)
    .css('transition', 'none');

  requestAnimationFrame(() => {
    element.addClass(initClass);
    if (isIn) element.show();
  ***REMOVED***);

  // Start the animation
  requestAnimationFrame(() => {
    element[0].offsetWidth;
    element
      .css('transition', '')
      .addClass(activeClass);
  ***REMOVED***);

  // Clean up the animation when it finishes
  element.one(Foundation.transitionend(element), finish);

  // Hides the element (for out animations), resets the element, and runs a callback
  function finish() {
    if (!isIn) element.hide();
    reset();
    if (cb) cb.apply(element);
  ***REMOVED***

  // Resets transitions and removes motion-specific classes
  function reset() {
    element[0].style.transitionDuration = 0;
    element.removeClass(`${initClass***REMOVED*** ${activeClass***REMOVED*** ${animation***REMOVED***`);
  ***REMOVED***
***REMOVED***

Foundation.Move = Move;
Foundation.Motion = Motion;

***REMOVED***(jQuery);
