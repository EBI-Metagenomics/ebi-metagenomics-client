'use strict';

!function($) {

function Timer(elem, options, cb) {
  var _this = this,
      duration = options.duration,//options is an object for easily adding features later.
      nameSpace = Object.keys(elem.data())[0] || 'timer',
      remain = -1,
      start,
      timer;

  this.isPaused = false;

  this.restart = function() {
    remain = -1;
    clearTimeout(timer);
    this.start();
  ***REMOVED***

  this.start = function() {
    this.isPaused = false;
    // if(!elem.data('paused')){ return false; ***REMOVED***//maybe implement this sanity check if used for other things.
    clearTimeout(timer);
    remain = remain <= 0 ? duration : remain;
    elem.data('paused', false);
    start = Date.now();
    timer = setTimeout(function(){
      if(options.infinite){
        _this.restart();//rerun the timer.
      ***REMOVED***
      if (cb && typeof cb === 'function') { cb(); ***REMOVED***
    ***REMOVED***, remain);
    elem.trigger(`timerstart.zf.${nameSpace***REMOVED***`);
  ***REMOVED***

  this.pause = function() {
    this.isPaused = true;
    //if(elem.data('paused')){ return false; ***REMOVED***//maybe implement this sanity check if used for other things.
    clearTimeout(timer);
    elem.data('paused', true);
    var end = Date.now();
    remain = remain - (end - start);
    elem.trigger(`timerpaused.zf.${nameSpace***REMOVED***`);
  ***REMOVED***
***REMOVED***

/**
 * Runs a callback function when images are fully loaded.
 * @param {Object***REMOVED*** images - Image(s) to check if loaded.
 * @param {Func***REMOVED*** callback - Function to execute when image is fully loaded.
 */
function onImagesLoaded(images, callback){
  var self = this,
      unloaded = images.length;

  if (unloaded === 0) {
    callback();
  ***REMOVED***

  images.each(function() {
    // Check if image is loaded
    if (this.complete || (this.readyState === 4) || (this.readyState === 'complete')) {
      singleImageLoaded();
    ***REMOVED***
    // Force load the image
    else {
      // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
      var src = $(this).attr('src');
      $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + (new Date().getTime()));
      $(this).one('load', function() {
        singleImageLoaded();
      ***REMOVED***);
    ***REMOVED***
  ***REMOVED***);

  function singleImageLoaded() {
    unloaded--;
    if (unloaded === 0) {
      callback();
    ***REMOVED***
  ***REMOVED***
***REMOVED***

Foundation.Timer = Timer;
Foundation.onImagesLoaded = onImagesLoaded;

***REMOVED***(jQuery);
