!function($) {

"use strict";

var FOUNDATION_VERSION = '6.3.1';

// Global Foundation object
// This is attached to the window, or used as a module for AMD/Browserify
var Foundation = {
  version: FOUNDATION_VERSION,

  /**
   * Stores initialized plugins.
   */
  _plugins: {***REMOVED***,

  /**
   * Stores generated unique ids for plugin instances
   */
  _uuids: [],

  /**
   * Returns a boolean for RTL support
   */
  rtl: function(){
    return $('html').attr('dir') === 'rtl';
  ***REMOVED***,
  /**
   * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
   * @param {Object***REMOVED*** plugin - The constructor of the plugin.
   */
  plugin: function(plugin, name) {
    // Object key to use when adding to global Foundation object
    // Examples: Foundation.Reveal, Foundation.OffCanvas
    var className = (name || functionName(plugin));
    // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
    // Examples: data-reveal, data-off-canvas
    var attrName  = hyphenate(className);

    // Add to the Foundation object and the plugins list (for reflowing)
    this._plugins[attrName] = this[className] = plugin;
  ***REMOVED***,
  /**
   * @function
   * Populates the _uuids array with pointers to each individual plugin instance.
   * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
   * Also fires the initialization event for each plugin, consolidating repetitive code.
   * @param {Object***REMOVED*** plugin - an instance of a plugin, usually `this` in context.
   * @param {String***REMOVED*** name - the name of the plugin, passed as a camelCased string.
   * @fires Plugin#init
   */
  registerPlugin: function(plugin, name){
    var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
    plugin.uuid = this.GetYoDigits(6, pluginName);

    if(!plugin.$element.attr(`data-${pluginName***REMOVED***`)){ plugin.$element.attr(`data-${pluginName***REMOVED***`, plugin.uuid); ***REMOVED***
    if(!plugin.$element.data('zfPlugin')){ plugin.$element.data('zfPlugin', plugin); ***REMOVED***
          /**
           * Fires when the plugin has initialized.
           * @event Plugin#init
           */
    plugin.$element.trigger(`init.zf.${pluginName***REMOVED***`);

    this._uuids.push(plugin.uuid);

    return;
  ***REMOVED***,
  /**
   * @function
   * Removes the plugins uuid from the _uuids array.
   * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
   * Also fires the destroyed event for the plugin, consolidating repetitive code.
   * @param {Object***REMOVED*** plugin - an instance of a plugin, usually `this` in context.
   * @fires Plugin#destroyed
   */
  unregisterPlugin: function(plugin){
    var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

    this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
    plugin.$element.removeAttr(`data-${pluginName***REMOVED***`).removeData('zfPlugin')
          /**
           * Fires when the plugin has been destroyed.
           * @event Plugin#destroyed
           */
          .trigger(`destroyed.zf.${pluginName***REMOVED***`);
    for(var prop in plugin){
      plugin[prop] = null;//clean up script to prep for garbage collection.
    ***REMOVED***
    return;
  ***REMOVED***,

  /**
   * @function
   * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
   * @param {String***REMOVED*** plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
   * @default If no argument is passed, reflow all currently active plugins.
   */
   reInit: function(plugins){
     var isJQ = plugins instanceof $;
     try{
       if(isJQ){
         plugins.each(function(){
           $(this).data('zfPlugin')._init();
         ***REMOVED***);
       ***REMOVED***else{
         var type = typeof plugins,
         _this = this,
         fns = {
           'object': function(plgs){
             plgs.forEach(function(p){
               p = hyphenate(p);
               $('[data-'+ p +']').foundation('_init');
             ***REMOVED***);
           ***REMOVED***,
           'string': function(){
             plugins = hyphenate(plugins);
             $('[data-'+ plugins +']').foundation('_init');
           ***REMOVED***,
           'undefined': function(){
             this['object'](Object.keys(_this._plugins));
           ***REMOVED***
         ***REMOVED***;
         fns[type](plugins);
       ***REMOVED***
     ***REMOVED***catch(err){
       console.error(err);
     ***REMOVED***finally{
       return plugins;
     ***REMOVED***
   ***REMOVED***,

  /**
   * returns a random base-36 uid with namespacing
   * @function
   * @param {Number***REMOVED*** length - number of random base-36 digits desired. Increase for more random strings.
   * @param {String***REMOVED*** namespace - name of plugin to be incorporated in uid, optional.
   * @default {String***REMOVED*** '' - if no plugin name is provided, nothing is appended to the uid.
   * @returns {String***REMOVED*** - unique id
   */
  GetYoDigits: function(length, namespace){
    length = length || 6;
    return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1) + (namespace ? `-${namespace***REMOVED***` : '');
  ***REMOVED***,
  /**
   * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
   * @param {Object***REMOVED*** elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
   * @param {String|Array***REMOVED*** plugins - A list of plugins to initialize. Leave this out to initialize everything.
   */
  reflow: function(elem, plugins) {

    // If plugins is undefined, just grab everything
    if (typeof plugins === 'undefined') {
      plugins = Object.keys(this._plugins);
    ***REMOVED***
    // If plugins is a string, convert it to an array with one item
    else if (typeof plugins === 'string') {
      plugins = [plugins];
    ***REMOVED***

    var _this = this;

    // Iterate through each plugin
    $.each(plugins, function(i, name) {
      // Get the current plugin
      var plugin = _this._plugins[name];

      // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
      var $elem = $(elem).find('[data-'+name+']').addBack('[data-'+name+']');

      // For each plugin found, initialize it
      $elem.each(function() {
        var $el = $(this),
            opts = {***REMOVED***;
        // Don't double-dip on plugins
        if ($el.data('zfPlugin')) {
          console.warn("Tried to initialize "+name+" on an element that already has a Foundation plugin.");
          return;
        ***REMOVED***

        if($el.attr('data-options')){
          var thing = $el.attr('data-options').split(';').forEach(function(e, i){
            var opt = e.split(':').map(function(el){ return el.trim(); ***REMOVED***);
            if(opt[0]) opts[opt[0]] = parseValue(opt[1]);
          ***REMOVED***);
        ***REMOVED***
        try{
          $el.data('zfPlugin', new plugin($(this), opts));
        ***REMOVED***catch(er){
          console.error(er);
        ***REMOVED***finally{
          return;
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***);
  ***REMOVED***,
  getFnName: functionName,
  transitionend: function($elem){
    var transitions = {
      'transition': 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd',
      'MozTransition': 'transitionend',
      'OTransition': 'otransitionend'
    ***REMOVED***;
    var elem = document.createElement('div'),
        end;

    for (var t in transitions){
      if (typeof elem.style[t] !== 'undefined'){
        end = transitions[t];
      ***REMOVED***
    ***REMOVED***
    if(end){
      return end;
    ***REMOVED***else{
      end = setTimeout(function(){
        $elem.triggerHandler('transitionend', [$elem]);
      ***REMOVED***, 1);
      return 'transitionend';
    ***REMOVED***
  ***REMOVED***
***REMOVED***;

Foundation.util = {
  /**
   * Function for applying a debounce effect to a function call.
   * @function
   * @param {Function***REMOVED*** func - Function to be called at end of timeout.
   * @param {Number***REMOVED*** delay - Time in ms to delay the call of `func`.
   * @returns function
   */
  throttle: function (func, delay) {
    var timer = null;

    return function () {
      var context = this, args = arguments;

      if (timer === null) {
        timer = setTimeout(function () {
          func.apply(context, args);
          timer = null;
        ***REMOVED***, delay);
      ***REMOVED***
    ***REMOVED***;
  ***REMOVED***
***REMOVED***;

// TODO: consider not making this a jQuery function
// TODO: need way to reflow vs. re-initialize
/**
 * The Foundation jQuery method.
 * @param {String|Array***REMOVED*** method - An action to perform on the current jQuery object.
 */
var foundation = function(method) {
  var type = typeof method,
      $meta = $('meta.foundation-mq'),
      $noJS = $('.no-js');

  if(!$meta.length){
    $('<meta class="foundation-mq">').appendTo(document.head);
  ***REMOVED***
  if($noJS.length){
    $noJS.removeClass('no-js');
  ***REMOVED***

  if(type === 'undefined'){//needs to initialize the Foundation object, or an individual plugin.
    Foundation.MediaQuery._init();
    Foundation.reflow(this);
  ***REMOVED***else if(type === 'string'){//an individual method to invoke on a plugin or group of plugins
    var args = Array.prototype.slice.call(arguments, 1);//collect all the arguments, if necessary
    var plugClass = this.data('zfPlugin');//determine the class of plugin

    if(plugClass !== undefined && plugClass[method] !== undefined){//make sure both the class and method exist
      if(this.length === 1){//if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
      ***REMOVED***else{
        this.each(function(i, el){//otherwise loop through the jQuery collection and invoke the method on each
          plugClass[method].apply($(el).data('zfPlugin'), args);
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***else{//error for no class or no method
      throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
    ***REMOVED***
  ***REMOVED***else{//error for invalid argument type
    throw new TypeError(`We're sorry, ${type***REMOVED*** is not a valid parameter. You must use a string representing the method you wish to invoke.`);
  ***REMOVED***
  return this;
***REMOVED***;

window.Foundation = Foundation;
$.fn.foundation = foundation;

// Polyfill for requestAnimationFrame
(function() {
  if (!Date.now || !window.Date.now)
    window.Date.now = Date.now = function() { return new Date().getTime(); ***REMOVED***;

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
  /**
   * Polyfill for performance.now, required by rAF
   */
  if(!window.performance || !window.performance.now){
    window.performance = {
      start: Date.now(),
      now: function(){ return Date.now() - this.start; ***REMOVED***
    ***REMOVED***;
  ***REMOVED***
***REMOVED***)();
if (!Function.prototype.bind) {
  Function.prototype.bind = function(oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    ***REMOVED***

    var aArgs   = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP    = function() {***REMOVED***,
        fBound  = function() {
          return fToBind.apply(this instanceof fNOP
                 ? this
                 : oThis,
                 aArgs.concat(Array.prototype.slice.call(arguments)));
        ***REMOVED***;

    if (this.prototype) {
      // native functions don't have a prototype
      fNOP.prototype = this.prototype;
    ***REMOVED***
    fBound.prototype = new fNOP();

    return fBound;
  ***REMOVED***;
***REMOVED***
// Polyfill to get the name of a function in IE9
function functionName(fn) {
  if (Function.prototype.name === undefined) {
    var funcNameRegex = /function\s([^(]{1,***REMOVED***)\(/;
    var results = (funcNameRegex).exec((fn).toString());
    return (results && results.length > 1) ? results[1].trim() : "";
  ***REMOVED***
  else if (fn.prototype === undefined) {
    return fn.constructor.name;
  ***REMOVED***
  else {
    return fn.prototype.constructor.name;
  ***REMOVED***
***REMOVED***
function parseValue(str){
  if ('true' === str) return true;
  else if ('false' === str) return false;
  else if (!isNaN(str * 1)) return parseFloat(str);
  return str;
***REMOVED***
// Convert PascalCase to kebab-case
// Thank you: http://stackoverflow.com/a/8955580
function hyphenate(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
***REMOVED***

***REMOVED***(jQuery);
