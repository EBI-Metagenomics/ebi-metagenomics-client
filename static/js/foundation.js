/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {***REMOVED***;
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		***REMOVED***
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {***REMOVED***
/******/ 		***REMOVED***;
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	***REMOVED***
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; ***REMOVED***;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			***REMOVED***);
/******/ 		***REMOVED***
/******/ 	***REMOVED***;
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; ***REMOVED*** :
/******/ 			function getModuleExports() { return module; ***REMOVED***;
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	***REMOVED***;
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); ***REMOVED***;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 35);
/******/ ***REMOVED***)
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = jQuery;

/***/ ***REMOVED***),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return rtl; ***REMOVED***);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GetYoDigits; ***REMOVED***);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return transitionend; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);




// Core Foundation Utilities, utilized in a number of places.

/**
 * Returns a boolean for RTL support
 */
function rtl() {
  return __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html').attr('dir') === 'rtl';
***REMOVED***

/**
 * returns a random base-36 uid with namespacing
 * @function
 * @param {Number***REMOVED*** length - number of random base-36 digits desired. Increase for more random strings.
 * @param {String***REMOVED*** namespace - name of plugin to be incorporated in uid, optional.
 * @default {String***REMOVED*** '' - if no plugin name is provided, nothing is appended to the uid.
 * @returns {String***REMOVED*** - unique id
 */
function GetYoDigits(length, namespace) {
  length = length || 6;
  return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
***REMOVED***

function transitionend($elem) {
  var transitions = {
    'transition': 'transitionend',
    'WebkitTransition': 'webkitTransitionEnd',
    'MozTransition': 'transitionend',
    'OTransition': 'otransitionend'
  ***REMOVED***;
  var elem = document.createElement('div'),
      end;

  for (var t in transitions) {
    if (typeof elem.style[t] !== 'undefined') {
      end = transitions[t];
    ***REMOVED***
  ***REMOVED***
  if (end) {
    return end;
  ***REMOVED*** else {
    end = setTimeout(function () {
      $elem.triggerHandler('transitionend', [$elem]);
    ***REMOVED***, 1);
    return 'transitionend';
  ***REMOVED***
***REMOVED***



/***/ ***REMOVED***),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Plugin; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***




// Abstract class for providing lifecycle hooks. Expect plugins to define AT LEAST
// {function***REMOVED*** _setup (replaces previous constructor),
// {function***REMOVED*** _destroy (replaces previous destroy)

var Plugin = function () {
  function Plugin(element, options) {
    _classCallCheck(this, Plugin);

    this._setup(element, options);
    var pluginName = getPluginName(this);
    this.uuid = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["a" /* GetYoDigits */])(6, pluginName);

    if (!this.$element.attr('data-' + pluginName)) {
      this.$element.attr('data-' + pluginName, this.uuid);
    ***REMOVED***
    if (!this.$element.data('zfPlugin')) {
      this.$element.data('zfPlugin', this);
    ***REMOVED***
    /**
     * Fires when the plugin has initialized.
     * @event Plugin#init
     */
    this.$element.trigger('init.zf.' + pluginName);
  ***REMOVED***

  _createClass(Plugin, [{
    key: 'destroy',
    value: function destroy() {
      this._destroy();
      var pluginName = getPluginName(this);
      this.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in this) {
        this[prop] = null; //clean up script to prep for garbage collection.
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***]);

  return Plugin;
***REMOVED***();

// Convert PascalCase to kebab-case
// Thank you: http://stackoverflow.com/a/8955580


function hyphenate(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
***REMOVED***

function getPluginName(obj) {
  if (typeof obj.constructor.name !== 'undefined') {
    return hyphenate(obj.constructor.name);
  ***REMOVED*** else {
    return hyphenate(obj.className);
  ***REMOVED***
***REMOVED***



/***/ ***REMOVED***),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MediaQuery; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);




// Default set of media queries
var defaultQueries = {
  'default': 'only screen',
  landscape: 'only screen and (orientation: landscape)',
  portrait: 'only screen and (orientation: portrait)',
  retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
***REMOVED***;

// matchMedia() polyfill - Test a CSS media type/query in JS.
// Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
var matchMedia = window.matchMedia || function () {
  'use strict';

  // For browsers that support matchMedium api such as IE 9 and webkit

  var styleMedia = window.styleMedia || window.media;

  // For those that don't support matchMedium
  if (!styleMedia) {
    var style = document.createElement('style'),
        script = document.getElementsByTagName('script')[0],
        info = null;

    style.type = 'text/css';
    style.id = 'matchmediajs-test';

    script && script.parentNode && script.parentNode.insertBefore(style, script);

    // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
    info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

    styleMedia = {
      matchMedium: function (media) {
        var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; ***REMOVED*** ***REMOVED***';

        // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
        if (style.styleSheet) {
          style.styleSheet.cssText = text;
        ***REMOVED*** else {
          style.textContent = text;
        ***REMOVED***

        // Test if media query is true or false
        return info.width === '1px';
      ***REMOVED***
    ***REMOVED***;
  ***REMOVED***

  return function (media) {
    return {
      matches: styleMedia.matchMedium(media || 'all'),
      media: media || 'all'
    ***REMOVED***;
  ***REMOVED***;
***REMOVED***();

var MediaQuery = {
  queries: [],

  current: '',

  /**
   * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
   * @function
   * @private
   */
  _init: function () {
    var self = this;
    var $meta = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('meta.foundation-mq');
    if (!$meta.length) {
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('<meta class="foundation-mq">').appendTo(document.head);
    ***REMOVED***

    var extractedStyles = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('.foundation-mq').css('font-family');
    var namedQueries;

    namedQueries = parseStyleToObject(extractedStyles);

    for (var key in namedQueries) {
      if (namedQueries.hasOwnProperty(key)) {
        self.queries.push({
          name: key,
          value: 'only screen and (min-width: ' + namedQueries[key] + ')'
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***

    this.current = this._getCurrentSize();

    this._watcher();
  ***REMOVED***,


  /**
   * Checks if the screen is at least as wide as a breakpoint.
   * @function
   * @param {String***REMOVED*** size - Name of the breakpoint to check.
   * @returns {Boolean***REMOVED*** `true` if the breakpoint matches, `false` if it's smaller.
   */
  atLeast: function (size) {
    var query = this.get(size);

    if (query) {
      return matchMedia(query).matches;
    ***REMOVED***

    return false;
  ***REMOVED***,


  /**
   * Checks if the screen matches to a breakpoint.
   * @function
   * @param {String***REMOVED*** size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
   * @returns {Boolean***REMOVED*** `true` if the breakpoint matches, `false` if it does not.
   */
  is: function (size) {
    size = size.trim().split(' ');
    if (size.length > 1 && size[1] === 'only') {
      if (size[0] === this._getCurrentSize()) return true;
    ***REMOVED*** else {
      return this.atLeast(size[0]);
    ***REMOVED***
    return false;
  ***REMOVED***,


  /**
   * Gets the media query of a breakpoint.
   * @function
   * @param {String***REMOVED*** size - Name of the breakpoint to get.
   * @returns {String|null***REMOVED*** - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
   */
  get: function (size) {
    for (var i in this.queries) {
      if (this.queries.hasOwnProperty(i)) {
        var query = this.queries[i];
        if (size === query.name) return query.value;
      ***REMOVED***
    ***REMOVED***

    return null;
  ***REMOVED***,


  /**
   * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
   * @function
   * @private
   * @returns {String***REMOVED*** Name of the current breakpoint.
   */
  _getCurrentSize: function () {
    var matched;

    for (var i = 0; i < this.queries.length; i++) {
      var query = this.queries[i];

      if (matchMedia(query.value).matches) {
        matched = query;
      ***REMOVED***
    ***REMOVED***

    if (typeof matched === 'object') {
      return matched.name;
    ***REMOVED*** else {
      return matched;
    ***REMOVED***
  ***REMOVED***,


  /**
   * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
   * @function
   * @private
   */
  _watcher: function () {
    var _this = this;

    __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('resize.zf.mediaquery').on('resize.zf.mediaquery', function () {
      var newSize = _this._getCurrentSize(),
          currentSize = _this.current;

      if (newSize !== currentSize) {
        // Change the current media query
        _this.current = newSize;

        // Broadcast the media query change on the window
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
      ***REMOVED***
    ***REMOVED***);
  ***REMOVED***
***REMOVED***;

// Thank you: https://github.com/sindresorhus/query-string
function parseStyleToObject(str) {
  var styleObject = {***REMOVED***;

  if (typeof str !== 'string') {
    return styleObject;
  ***REMOVED***

  str = str.trim().slice(1, -1); // browsers re-quote string style values

  if (!str) {
    return styleObject;
  ***REMOVED***

  styleObject = str.split('&').reduce(function (ret, param) {
    var parts = param.replace(/\+/g, ' ').split('=');
    var key = parts[0];
    var val = parts[1];
    key = decodeURIComponent(key);

    // missing `=` should be `null`:
    // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
    val = val === undefined ? null : decodeURIComponent(val);

    if (!ret.hasOwnProperty(key)) {
      ret[key] = val;
    ***REMOVED*** else if (Array.isArray(ret[key])) {
      ret[key].push(val);
    ***REMOVED*** else {
      ret[key] = [ret[key], val];
    ***REMOVED***
    return ret;
  ***REMOVED***, {***REMOVED***);

  return styleObject;
***REMOVED***



/***/ ***REMOVED***),
/* 4 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Keyboard; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/






var keyCodes = {
  9: 'TAB',
  13: 'ENTER',
  27: 'ESCAPE',
  32: 'SPACE',
  35: 'END',
  36: 'HOME',
  37: 'ARROW_LEFT',
  38: 'ARROW_UP',
  39: 'ARROW_RIGHT',
  40: 'ARROW_DOWN'
***REMOVED***;

var commands = {***REMOVED***;

// Functions pulled out to be referenceable from internals
function findFocusable($element) {
  if (!$element) {
    return false;
  ***REMOVED***
  return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
    if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is(':visible') || __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).attr('tabindex') < 0) {
      return false;
    ***REMOVED*** //only have visible elements and those that have a tabindex greater or equal 0
    return true;
  ***REMOVED***);
***REMOVED***

function parseKey(event) {
  var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

  // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
  key = key.replace(/\W+/, '');

  if (event.shiftKey) key = 'SHIFT_' + key;
  if (event.ctrlKey) key = 'CTRL_' + key;
  if (event.altKey) key = 'ALT_' + key;

  // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
  key = key.replace(/_$/, '');

  return key;
***REMOVED***

var Keyboard = {
  keys: getKeyCodes(keyCodes),

  /**
   * Parses the (keyboard) event and returns a String that represents its key
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   * @param {Event***REMOVED*** event - the event generated by the event handler
   * @return String key - String that represents the key pressed
   */
  parseKey: parseKey,

  /**
   * Handles the given (keyboard) event
   * @param {Event***REMOVED*** event - the event generated by the event handler
   * @param {String***REMOVED*** component - Foundation component's name, e.g. Slider or Reveal
   * @param {Objects***REMOVED*** functions - collection of functions that are to be executed
   */
  handleKey: function (event, component, functions) {
    var commandList = commands[component],
        keyCode = this.parseKey(event),
        cmds,
        command,
        fn;

    if (!commandList) return console.warn('Component not defined!');

    if (typeof commandList.ltr === 'undefined') {
      // this component does not differentiate between ltr and rtl
      cmds = commandList; // use plain list
    ***REMOVED*** else {
      // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
      if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["b" /* rtl */])()) cmds = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, commandList.ltr, commandList.rtl);else cmds = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, commandList.rtl, commandList.ltr);
    ***REMOVED***
    command = cmds[keyCode];

    fn = functions[command];
    if (fn && typeof fn === 'function') {
      // execute function  if exists
      var returnValue = fn.apply();
      if (functions.handled || typeof functions.handled === 'function') {
        // execute function when event was handled
        functions.handled(returnValue);
      ***REMOVED***
    ***REMOVED*** else {
      if (functions.unhandled || typeof functions.unhandled === 'function') {
        // execute function when event was not handled
        functions.unhandled();
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***,


  /**
   * Finds all focusable elements within the given `$element`
   * @param {jQuery***REMOVED*** $element - jQuery object to search within
   * @return {jQuery***REMOVED*** $focusable - all focusable elements within `$element`
   */

  findFocusable: findFocusable,

  /**
   * Returns the component name name
   * @param {Object***REMOVED*** component - Foundation component, e.g. Slider or Reveal
   * @return String componentName
   */

  register: function (componentName, cmds) {
    commands[componentName] = cmds;
  ***REMOVED***,


  // TODO9438: These references to Keyboard need to not require global. Will 'this' work in this context?
  //
  /**
   * Traps the focus in the given element.
   * @param  {jQuery***REMOVED*** $element  jQuery object to trap the foucs into.
   */
  trapFocus: function ($element) {
    var $focusable = findFocusable($element),
        $firstFocusable = $focusable.eq(0),
        $lastFocusable = $focusable.eq(-1);

    $element.on('keydown.zf.trapfocus', function (event) {
      if (event.target === $lastFocusable[0] && parseKey(event) === 'TAB') {
        event.preventDefault();
        $firstFocusable.focus();
      ***REMOVED*** else if (event.target === $firstFocusable[0] && parseKey(event) === 'SHIFT_TAB') {
        event.preventDefault();
        $lastFocusable.focus();
      ***REMOVED***
    ***REMOVED***);
  ***REMOVED***,

  /**
   * Releases the trapped focus from the given element.
   * @param  {jQuery***REMOVED*** $element  jQuery object to release the focus for.
   */
  releaseFocus: function ($element) {
    $element.off('keydown.zf.trapfocus');
  ***REMOVED***
***REMOVED***;

/*
 * Constants for easier comparing.
 * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
 */
function getKeyCodes(kcs) {
  var k = {***REMOVED***;
  for (var kc in kcs) {
    k[kcs[kc]] = kcs[kc];
  ***REMOVED***return k;
***REMOVED***



/***/ ***REMOVED***),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Triggers; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__ = __webpack_require__(6);





var MutationObserver = function () {
  var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
  for (var i = 0; i < prefixes.length; i++) {
    if (prefixes[i] + 'MutationObserver' in window) {
      return window[prefixes[i] + 'MutationObserver'];
    ***REMOVED***
  ***REMOVED***
  return false;
***REMOVED***();

var triggers = function (el, type) {
  el.data(type).split(' ').forEach(function (id) {
    __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
  ***REMOVED***);
***REMOVED***;

var Triggers = {
  Listeners: {
    Basic: {***REMOVED***,
    Global: {***REMOVED***
  ***REMOVED***,
  Initializers: {***REMOVED***
***REMOVED***;

Triggers.Listeners.Basic = {
  openListener: function () {
    triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'open');
  ***REMOVED***,
  closeListener: function () {
    var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('close');
    if (id) {
      triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'close');
    ***REMOVED*** else {
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('close.zf.trigger');
    ***REMOVED***
  ***REMOVED***,
  toggleListener: function () {
    var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('toggle');
    if (id) {
      triggers(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), 'toggle');
    ***REMOVED*** else {
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('toggle.zf.trigger');
    ***REMOVED***
  ***REMOVED***,
  closeableListener: function (e) {
    e.stopPropagation();
    var animation = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('closable');

    if (animation !== '') {
      __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__["a" /* Motion */].animateOut(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), animation, function () {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('closed.zf');
      ***REMOVED***);
    ***REMOVED*** else {
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).fadeOut().trigger('closed.zf');
    ***REMOVED***
  ***REMOVED***,
  toggleFocusListener: function () {
    var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('toggle-focus');
    __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + id).triggerHandler('toggle.zf.trigger', [__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this)]);
  ***REMOVED***
***REMOVED***;

// Elements with [data-open] will reveal a plugin that supports it when clicked.
Triggers.Initializers.addOpenListener = function ($elem) {
  $elem.off('click.zf.trigger', Triggers.Listeners.Basic.openListener);
  $elem.on('click.zf.trigger', '[data-open]', Triggers.Listeners.Basic.openListener);
***REMOVED***;

// Elements with [data-close] will close a plugin that supports it when clicked.
// If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
Triggers.Initializers.addCloseListener = function ($elem) {
  $elem.off('click.zf.trigger', Triggers.Listeners.Basic.closeListener);
  $elem.on('click.zf.trigger', '[data-close]', Triggers.Listeners.Basic.closeListener);
***REMOVED***;

// Elements with [data-toggle] will toggle a plugin that supports it when clicked.
Triggers.Initializers.addToggleListener = function ($elem) {
  $elem.off('click.zf.trigger', Triggers.Listeners.Basic.toggleListener);
  $elem.on('click.zf.trigger', '[data-toggle]', Triggers.Listeners.Basic.toggleListener);
***REMOVED***;

// Elements with [data-closable] will respond to close.zf.trigger events.
Triggers.Initializers.addCloseableListener = function ($elem) {
  $elem.off('close.zf.trigger', Triggers.Listeners.Basic.closeableListener);
  $elem.on('close.zf.trigger', '[data-closeable], [data-closable]', Triggers.Listeners.Basic.closeableListener);
***REMOVED***;

// Elements with [data-toggle-focus] will respond to coming in and out of focus
Triggers.Initializers.addToggleFocusListener = function ($elem) {
  $elem.off('focus.zf.trigger blur.zf.trigger', Triggers.Listeners.Basic.toggleFocusListener);
  $elem.on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', Triggers.Listeners.Basic.toggleFocusListener);
***REMOVED***;

// More Global/complex listeners and triggers
Triggers.Listeners.Global = {
  resizeListener: function ($nodes) {
    if (!MutationObserver) {
      //fallback for IE 9
      $nodes.each(function () {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).triggerHandler('resizeme.zf.trigger');
      ***REMOVED***);
    ***REMOVED***
    //trigger all listening elements and signal a resize event
    $nodes.attr('data-events', "resize");
  ***REMOVED***,
  scrollListener: function ($nodes) {
    if (!MutationObserver) {
      //fallback for IE 9
      $nodes.each(function () {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).triggerHandler('scrollme.zf.trigger');
      ***REMOVED***);
    ***REMOVED***
    //trigger all listening elements and signal a scroll event
    $nodes.attr('data-events', "scroll");
  ***REMOVED***,
  closeMeListener: function (e, pluginId) {
    var plugin = e.namespace.split('.')[0];
    var plugins = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

    plugins.each(function () {
      var _this = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this);
      _this.triggerHandler('close.zf.trigger', [_this]);
    ***REMOVED***);
  ***REMOVED***
***REMOVED***;

// Global, parses whole document.
Triggers.Initializers.addClosemeListener = function (pluginName) {
  var yetiBoxes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-yeti-box]'),
      plugNames = ['dropdown', 'tooltip', 'reveal'];

  if (pluginName) {
    if (typeof pluginName === 'string') {
      plugNames.push(pluginName);
    ***REMOVED*** else if (typeof pluginName === 'object' && typeof pluginName[0] === 'string') {
      plugNames.concat(pluginName);
    ***REMOVED*** else {
      console.error('Plugin names must be strings');
    ***REMOVED***
  ***REMOVED***
  if (yetiBoxes.length) {
    var listeners = plugNames.map(function (name) {
      return 'closeme.zf.' + name;
    ***REMOVED***).join(' ');

    __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(listeners).on(listeners, Triggers.Listeners.Global.closeMeListener);
  ***REMOVED***
***REMOVED***;

function debounceGlobalListener(debounce, trigger, listener) {
  var timer = void 0,
      args = Array.prototype.slice.call(arguments, 3);
  __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(trigger).on(trigger, function (e) {
    if (timer) {
      clearTimeout(timer);
    ***REMOVED***
    timer = setTimeout(function () {
      listener.apply(null, args);
    ***REMOVED***, debounce || 10); //default time to emit scroll event
  ***REMOVED***);
***REMOVED***

Triggers.Initializers.addResizeListener = function (debounce) {
  var $nodes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-resize]');
  if ($nodes.length) {
    debounceGlobalListener(debounce, 'resize.zf.trigger', Triggers.Listeners.Global.resizeListener, $nodes);
  ***REMOVED***
***REMOVED***;

Triggers.Initializers.addScrollListener = function (debounce) {
  var $nodes = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-scroll]');
  if ($nodes.length) {
    debounceGlobalListener(debounce, 'scroll.zf.trigger', Triggers.Listeners.Global.scrollListener, $nodes);
  ***REMOVED***
***REMOVED***;

Triggers.Initializers.addMutationEventsListener = function ($elem) {
  if (!MutationObserver) {
    return false;
  ***REMOVED***
  var $nodes = $elem.find('[data-resize], [data-scroll], [data-mutate]');

  //element callback
  var listeningElementsMutation = function (mutationRecordsList) {
    var $target = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(mutationRecordsList[0].target);

    //trigger the event handler for the element depending on type
    switch (mutationRecordsList[0].type) {
      case "attributes":
        if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
          $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
        ***REMOVED***
        if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
          $target.triggerHandler('resizeme.zf.trigger', [$target]);
        ***REMOVED***
        if (mutationRecordsList[0].attributeName === "style") {
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
        ***REMOVED***
        break;

      case "childList":
        $target.closest("[data-mutate]").attr("data-events", "mutate");
        $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
        break;

      default:
        return false;
      //nothing
    ***REMOVED***
  ***REMOVED***;

  if ($nodes.length) {
    //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
    for (var i = 0; i <= $nodes.length - 1; i++) {
      var elementObserver = new MutationObserver(listeningElementsMutation);
      elementObserver.observe($nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] ***REMOVED***);
    ***REMOVED***
  ***REMOVED***
***REMOVED***;

Triggers.Initializers.addSimpleListeners = function () {
  var $document = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document);

  Triggers.Initializers.addOpenListener($document);
  Triggers.Initializers.addCloseListener($document);
  Triggers.Initializers.addToggleListener($document);
  Triggers.Initializers.addCloseableListener($document);
  Triggers.Initializers.addToggleFocusListener($document);
***REMOVED***;

Triggers.Initializers.addGlobalListeners = function () {
  var $document = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document);
  Triggers.Initializers.addMutationEventsListener($document);
  Triggers.Initializers.addResizeListener();
  Triggers.Initializers.addScrollListener();
  Triggers.Initializers.addClosemeListener();
***REMOVED***;

Triggers.init = function ($, Foundation) {
  if (typeof $.triggersInitialized === 'undefined') {
    var $document = $(document);

    if (document.readyState === "complete") {
      Triggers.Initializers.addSimpleListeners();
      Triggers.Initializers.addGlobalListeners();
    ***REMOVED*** else {
      $(window).on('load', function () {
        Triggers.Initializers.addSimpleListeners();
        Triggers.Initializers.addGlobalListeners();
      ***REMOVED***);
    ***REMOVED***

    $.triggersInitialized = true;
  ***REMOVED***

  if (Foundation) {
    Foundation.Triggers = Triggers;
    // Legacy included to be backwards compatible for now.
    Foundation.IHearYou = Triggers.Initializers.addGlobalListeners;
  ***REMOVED***
***REMOVED***;



/***/ ***REMOVED***),
/* 6 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Move; ***REMOVED***);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Motion; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);





/**
 * Motion module.
 * @module foundation.motion
 */

var initClasses = ['mui-enter', 'mui-leave'];
var activeClasses = ['mui-enter-active', 'mui-leave-active'];

var Motion = {
  animateIn: function (element, animation, cb) {
    animate(true, element, animation, cb);
  ***REMOVED***,

  animateOut: function (element, animation, cb) {
    animate(false, element, animation, cb);
  ***REMOVED***
***REMOVED***;

function Move(duration, elem, fn) {
  var anim,
      prog,
      start = null;
  // console.log('called');

  if (duration === 0) {
    fn.apply(elem);
    elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
    return;
  ***REMOVED***

  function move(ts) {
    if (!start) start = ts;
    // console.log(start, ts);
    prog = ts - start;
    fn.apply(elem);

    if (prog < duration) {
      anim = window.requestAnimationFrame(move, elem);
    ***REMOVED*** else {
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
  element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(element).eq(0);

  if (!element.length) return;

  var initClass = isIn ? initClasses[0] : initClasses[1];
  var activeClass = isIn ? activeClasses[0] : activeClasses[1];

  // Set up the animation
  reset();

  element.addClass(animation).css('transition', 'none');

  requestAnimationFrame(function () {
    element.addClass(initClass);
    if (isIn) element.show();
  ***REMOVED***);

  // Start the animation
  requestAnimationFrame(function () {
    element[0].offsetWidth;
    element.css('transition', '').addClass(activeClass);
  ***REMOVED***);

  // Clean up the animation when it finishes
  element.one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["c" /* transitionend */])(element), finish);

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



/***/ ***REMOVED***),
/* 7 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Box; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__foundation_util_core__ = __webpack_require__(1);




var Box = {
  ImNotTouchingYou: ImNotTouchingYou,
  OverlapArea: OverlapArea,
  GetDimensions: GetDimensions,
  GetOffsets: GetOffsets,
  GetExplicitOffsets: GetExplicitOffsets
***REMOVED***;

/**
 * Compares the dimensions of an element to a container and determines collision events with container.
 * @function
 * @param {jQuery***REMOVED*** element - jQuery object to test for collisions.
 * @param {jQuery***REMOVED*** parent - jQuery object to use as bounding container.
 * @param {Boolean***REMOVED*** lrOnly - set to true to check left and right values only.
 * @param {Boolean***REMOVED*** tbOnly - set to true to check top and bottom values only.
 * @default if no parent object passed, detects collisions with `window`.
 * @returns {Boolean***REMOVED*** - true if collision free, false if a collision in any direction.
 */
function ImNotTouchingYou(element, parent, lrOnly, tbOnly, ignoreBottom) {
  return OverlapArea(element, parent, lrOnly, tbOnly, ignoreBottom) === 0;
***REMOVED***;

function OverlapArea(element, parent, lrOnly, tbOnly, ignoreBottom) {
  var eleDims = GetDimensions(element),
      topOver,
      bottomOver,
      leftOver,
      rightOver;
  if (parent) {
    var parDims = GetDimensions(parent);

    bottomOver = parDims.height + parDims.offset.top - (eleDims.offset.top + eleDims.height);
    topOver = eleDims.offset.top - parDims.offset.top;
    leftOver = eleDims.offset.left - parDims.offset.left;
    rightOver = parDims.width + parDims.offset.left - (eleDims.offset.left + eleDims.width);
  ***REMOVED*** else {
    bottomOver = eleDims.windowDims.height + eleDims.windowDims.offset.top - (eleDims.offset.top + eleDims.height);
    topOver = eleDims.offset.top - eleDims.windowDims.offset.top;
    leftOver = eleDims.offset.left - eleDims.windowDims.offset.left;
    rightOver = eleDims.windowDims.width - (eleDims.offset.left + eleDims.width);
  ***REMOVED***

  bottomOver = ignoreBottom ? 0 : Math.min(bottomOver, 0);
  topOver = Math.min(topOver, 0);
  leftOver = Math.min(leftOver, 0);
  rightOver = Math.min(rightOver, 0);

  if (lrOnly) {
    return leftOver + rightOver;
  ***REMOVED***
  if (tbOnly) {
    return topOver + bottomOver;
  ***REMOVED***

  // use sum of squares b/c we care about overlap area.
  return Math.sqrt(topOver * topOver + bottomOver * bottomOver + leftOver * leftOver + rightOver * rightOver);
***REMOVED***

/**
 * Uses native methods to return an object of dimension values.
 * @function
 * @param {jQuery || HTML***REMOVED*** element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
 * @returns {Object***REMOVED*** - nested object of integer pixel values
 * TODO - if element is window, return only those values.
 */
function GetDimensions(elem) {
  elem = elem.length ? elem[0] : elem;

  if (elem === window || elem === document) {
    throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
  ***REMOVED***

  var rect = elem.getBoundingClientRect(),
      parRect = elem.parentNode.getBoundingClientRect(),
      winRect = document.body.getBoundingClientRect(),
      winY = window.pageYOffset,
      winX = window.pageXOffset;

  return {
    width: rect.width,
    height: rect.height,
    offset: {
      top: rect.top + winY,
      left: rect.left + winX
    ***REMOVED***,
    parentDims: {
      width: parRect.width,
      height: parRect.height,
      offset: {
        top: parRect.top + winY,
        left: parRect.left + winX
      ***REMOVED***
    ***REMOVED***,
    windowDims: {
      width: winRect.width,
      height: winRect.height,
      offset: {
        top: winY,
        left: winX
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***;
***REMOVED***

/**
 * Returns an object of top and left integer pixel values for dynamically rendered elements,
 * such as: Tooltip, Reveal, and Dropdown. Maintained for backwards compatibility, and where
 * you don't know alignment, but generally from
 * 6.4 forward you should use GetExplicitOffsets, as GetOffsets conflates position and alignment.
 * @function
 * @param {jQuery***REMOVED*** element - jQuery object for the element being positioned.
 * @param {jQuery***REMOVED*** anchor - jQuery object for the element's anchor point.
 * @param {String***REMOVED*** position - a string relating to the desired position of the element, relative to it's anchor
 * @param {Number***REMOVED*** vOffset - integer pixel value of desired vertical separation between anchor and element.
 * @param {Number***REMOVED*** hOffset - integer pixel value of desired horizontal separation between anchor and element.
 * @param {Boolean***REMOVED*** isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
 * TODO alter/rewrite to work with `em` values as well/instead of pixels
 */
function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
  console.log("NOTE: GetOffsets is deprecated in favor of GetExplicitOffsets and will be removed in 6.5");
  switch (position) {
    case 'top':
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__foundation_util_core__["b" /* rtl */])() ? GetExplicitOffsets(element, anchor, 'top', 'left', vOffset, hOffset, isOverflow) : GetExplicitOffsets(element, anchor, 'top', 'right', vOffset, hOffset, isOverflow);
    case 'bottom':
      return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__foundation_util_core__["b" /* rtl */])() ? GetExplicitOffsets(element, anchor, 'bottom', 'left', vOffset, hOffset, isOverflow) : GetExplicitOffsets(element, anchor, 'bottom', 'right', vOffset, hOffset, isOverflow);
    case 'center top':
      return GetExplicitOffsets(element, anchor, 'top', 'center', vOffset, hOffset, isOverflow);
    case 'center bottom':
      return GetExplicitOffsets(element, anchor, 'bottom', 'center', vOffset, hOffset, isOverflow);
    case 'center left':
      return GetExplicitOffsets(element, anchor, 'left', 'center', vOffset, hOffset, isOverflow);
    case 'center right':
      return GetExplicitOffsets(element, anchor, 'right', 'center', vOffset, hOffset, isOverflow);
    case 'left bottom':
      return GetExplicitOffsets(element, anchor, 'bottom', 'left', vOffset, hOffset, isOverflow);
    case 'right bottom':
      return GetExplicitOffsets(element, anchor, 'bottom', 'right', vOffset, hOffset, isOverflow);
    // Backwards compatibility... this along with the reveal and reveal full
    // classes are the only ones that didn't reference anchor
    case 'center':
      return {
        left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2 + hOffset,
        top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - ($eleDims.height / 2 + vOffset)
      ***REMOVED***;
    case 'reveal':
      return {
        left: ($eleDims.windowDims.width - $eleDims.width) / 2 + hOffset,
        top: $eleDims.windowDims.offset.top + vOffset
      ***REMOVED***;
    case 'reveal full':
      return {
        left: $eleDims.windowDims.offset.left,
        top: $eleDims.windowDims.offset.top
      ***REMOVED***;
      break;
    default:
      return {
        left: __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__foundation_util_core__["b" /* rtl */])() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width - hOffset : $anchorDims.offset.left + hOffset,
        top: $anchorDims.offset.top + $anchorDims.height + vOffset
      ***REMOVED***;

  ***REMOVED***
***REMOVED***

function GetExplicitOffsets(element, anchor, position, alignment, vOffset, hOffset, isOverflow) {
  var $eleDims = GetDimensions(element),
      $anchorDims = anchor ? GetDimensions(anchor) : null;

  var topVal, leftVal;

  // set position related attribute

  switch (position) {
    case 'top':
      topVal = $anchorDims.offset.top - ($eleDims.height + vOffset);
      break;
    case 'bottom':
      topVal = $anchorDims.offset.top + $anchorDims.height + vOffset;
      break;
    case 'left':
      leftVal = $anchorDims.offset.left - ($eleDims.width + hOffset);
      break;
    case 'right':
      leftVal = $anchorDims.offset.left + $anchorDims.width + hOffset;
      break;
  ***REMOVED***

  // set alignment related attribute
  switch (position) {
    case 'top':
    case 'bottom':
      switch (alignment) {
        case 'left':
          leftVal = $anchorDims.offset.left + hOffset;
          break;
        case 'right':
          leftVal = $anchorDims.offset.left - $eleDims.width + $anchorDims.width - hOffset;
          break;
        case 'center':
          leftVal = isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2 + hOffset;
          break;
      ***REMOVED***
      break;
    case 'right':
    case 'left':
      switch (alignment) {
        case 'bottom':
          topVal = $anchorDims.offset.top - vOffset + $anchorDims.height - $eleDims.height;
          break;
        case 'top':
          topVal = $anchorDims.offset.top + vOffset;
          break;
        case 'center':
          topVal = $anchorDims.offset.top + vOffset + $anchorDims.height / 2 - $eleDims.height / 2;
          break;
      ***REMOVED***
      break;
  ***REMOVED***
  return { top: topVal, left: leftVal ***REMOVED***;
***REMOVED***



/***/ ***REMOVED***),
/* 8 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return onImagesLoaded; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);




/**
 * Runs a callback function when images are fully loaded.
 * @param {Object***REMOVED*** images - Image(s) to check if loaded.
 * @param {Func***REMOVED*** callback - Function to execute when image is fully loaded.
 */
function onImagesLoaded(images, callback) {
  var self = this,
      unloaded = images.length;

  if (unloaded === 0) {
    callback();
  ***REMOVED***

  images.each(function () {
    // Check if image is loaded
    if (this.complete && this.naturalWidth !== undefined) {
      singleImageLoaded();
    ***REMOVED*** else {
      // If the above check failed, simulate loading on detached element.
      var image = new Image();
      // Still count image as loaded if it finalizes with an error.
      var events = "load.zf.images error.zf.images";
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(image).one(events, function me(event) {
        // Unbind the event listeners. We're using 'one' but only one of the two events will have fired.
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).off(events, me);
        singleImageLoaded();
      ***REMOVED***);
      image.src = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).attr('src');
    ***REMOVED***
  ***REMOVED***);

  function singleImageLoaded() {
    unloaded--;
    if (unloaded === 0) {
      callback();
    ***REMOVED***
  ***REMOVED***
***REMOVED***



/***/ ***REMOVED***),
/* 9 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Nest; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);




var Nest = {
  Feather: function (menu) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

    menu.attr('role', 'menubar');

    var items = menu.find('li').attr({ 'role': 'menuitem' ***REMOVED***),
        subMenuClass = 'is-' + type + '-submenu',
        subItemClass = subMenuClass + '-item',
        hasSubClass = 'is-' + type + '-submenu-parent',
        applyAria = type !== 'accordion'; // Accordions handle their own ARIA attriutes.

    items.each(function () {
      var $item = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
          $sub = $item.children('ul');

      if ($sub.length) {
        $item.addClass(hasSubClass);
        $sub.addClass('submenu ' + subMenuClass).attr({ 'data-submenu': '' ***REMOVED***);
        if (applyAria) {
          $item.attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          ***REMOVED***);
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false ***REMOVED***);
          ***REMOVED***
        ***REMOVED***
        $sub.addClass('submenu ' + subMenuClass).attr({
          'data-submenu': '',
          'role': 'menu'
        ***REMOVED***);
        if (type === 'drilldown') {
          $sub.attr({ 'aria-hidden': true ***REMOVED***);
        ***REMOVED***
      ***REMOVED***

      if ($item.parent('[data-submenu]').length) {
        $item.addClass('is-submenu-item ' + subItemClass);
      ***REMOVED***
    ***REMOVED***);

    return;
  ***REMOVED***,
  Burn: function (menu, type) {
    var //items = menu.find('li'),
    subMenuClass = 'is-' + type + '-submenu',
        subItemClass = subMenuClass + '-item',
        hasSubClass = 'is-' + type + '-submenu-parent';

    menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');
  ***REMOVED***
***REMOVED***;



/***/ ***REMOVED***),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Accordion; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***






/**
 * Accordion module.
 * @module foundation.accordion
 * @requires foundation.util.keyboard
 */

var Accordion = function (_Plugin) {
  _inherits(Accordion, _Plugin);

  function Accordion() {
    _classCallCheck(this, Accordion);

    return _possibleConstructorReturn(this, (Accordion.__proto__ || Object.getPrototypeOf(Accordion)).apply(this, arguments));
  ***REMOVED***

  _createClass(Accordion, [{
    key: '_setup',

    /**
     * Creates a new instance of an accordion.
     * @class
     * @name Accordion
     * @fires Accordion#init
     * @param {jQuery***REMOVED*** element - jQuery object to make into an accordion.
     * @param {Object***REMOVED*** options - a plain object with settings to override the default options.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Accordion.defaults, this.$element.data(), options);

      this.className = 'Accordion'; // ie9 back compat
      this._init();

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      var _this3 = this;

      this.$element.attr('role', 'tablist');
      this.$tabs = this.$element.children('[data-accordion-item]');

      this.$tabs.each(function (idx, el) {
        var $el = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(el),
            $content = $el.children('[data-tab-content]'),
            id = $content[0].id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["a" /* GetYoDigits */])(6, 'accordion'),
            linkId = el.id || id + '-label';

        $el.find('a:first').attr({
          'aria-controls': id,
          'role': 'tab',
          'id': linkId,
          'aria-expanded': false,
          'aria-selected': false
        ***REMOVED***);

        $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id ***REMOVED***);
      ***REMOVED***);
      var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
      this.firstTimeInit = true;
      if ($initActive.length) {
        this.down($initActive, this.firstTimeInit);
        this.firstTimeInit = false;
      ***REMOVED***

      this._checkDeepLink = function () {
        var anchor = window.location.hash;
        //need a hash and a relevant anchor in this tabset
        if (anchor.length) {
          var $link = _this3.$element.find('[href$="' + anchor + '"]'),
              $anchor = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(anchor);

          if ($link.length && $anchor) {
            if (!$link.parent('[data-accordion-item]').hasClass('is-active')) {
              _this3.down($anchor, _this3.firstTimeInit);
              _this3.firstTimeInit = false;
            ***REMOVED***;

            //roll up a little to show the titles
            if (_this3.options.deepLinkSmudge) {
              var _this = _this3;
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).load(function () {
                var offset = _this.$element.offset();
                __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body').animate({ scrollTop: offset.top ***REMOVED***, _this.options.deepLinkSmudgeDelay);
              ***REMOVED***);
            ***REMOVED***

            /**
              * Fires when the zplugin has deeplinked at pageload
              * @event Accordion#deeplink
              */
            _this3.$element.trigger('deeplink.zf.accordion', [$link, $anchor]);
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***;

      //use browser to open a tab, if it exists in this tabset
      if (this.options.deepLink) {
        this._checkDeepLink();
      ***REMOVED***

      this._events();
    ***REMOVED***

    /**
     * Adds event handlers for items within the accordion.
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;

      this.$tabs.each(function () {
        var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this);
        var $tabContent = $elem.children('[data-tab-content]');
        if ($tabContent.length) {
          $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
            e.preventDefault();
            _this.toggle($tabContent);
          ***REMOVED***).on('keydown.zf.accordion', function (e) {
            __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'Accordion', {
              toggle: function () {
                _this.toggle($tabContent);
              ***REMOVED***,
              next: function () {
                var $a = $elem.next().find('a').focus();
                if (!_this.options.multiExpand) {
                  $a.trigger('click.zf.accordion');
                ***REMOVED***
              ***REMOVED***,
              previous: function () {
                var $a = $elem.prev().find('a').focus();
                if (!_this.options.multiExpand) {
                  $a.trigger('click.zf.accordion');
                ***REMOVED***
              ***REMOVED***,
              handled: function () {
                e.preventDefault();
                e.stopPropagation();
              ***REMOVED***
            ***REMOVED***);
          ***REMOVED***);
        ***REMOVED***
      ***REMOVED***);
      if (this.options.deepLink) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('popstate', this._checkDeepLink);
      ***REMOVED***
    ***REMOVED***

    /**
     * Toggles the selected content pane's open/close state.
     * @param {jQuery***REMOVED*** $target - jQuery object of the pane to toggle (`.accordion-content`).
     * @function
     */

  ***REMOVED***, {
    key: 'toggle',
    value: function toggle($target) {
      if ($target.closest('[data-accordion]').is('[disabled]')) {
        console.info('Cannot toggle an accordion that is disabled.');
        return;
      ***REMOVED***
      if ($target.parent().hasClass('is-active')) {
        this.up($target);
      ***REMOVED*** else {
        this.down($target);
      ***REMOVED***
      //either replace or update browser history
      if (this.options.deepLink) {
        var anchor = $target.prev('a').attr('href');

        if (this.options.updateHistory) {
          history.pushState({***REMOVED***, '', anchor);
        ***REMOVED*** else {
          history.replaceState({***REMOVED***, '', anchor);
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

    /**
     * Opens the accordion tab defined by `$target`.
     * @param {jQuery***REMOVED*** $target - Accordion pane to open (`.accordion-content`).
     * @param {Boolean***REMOVED*** firstTime - flag to determine if reflow should happen.
     * @fires Accordion#down
     * @function
     */

  ***REMOVED***, {
    key: 'down',
    value: function down($target, firstTime) {
      var _this4 = this;

      /**
       * checking firstTime allows for initial render of the accordion
       * to render preset is-active panes.
       */
      if ($target.closest('[data-accordion]').is('[disabled]') && !firstTime) {
        console.info('Cannot call down on an accordion that is disabled.');
        return;
      ***REMOVED***
      $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

      if (!this.options.multiExpand && !firstTime) {
        var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
        if ($currentActive.length) {
          this.up($currentActive.not($target));
        ***REMOVED***
      ***REMOVED***

      $target.slideDown(this.options.slideSpeed, function () {
        /**
         * Fires when the tab is done opening.
         * @event Accordion#down
         */
        _this4.$element.trigger('down.zf.accordion', [$target]);
      ***REMOVED***);

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + $target.attr('aria-labelledby')).attr({
        'aria-expanded': true,
        'aria-selected': true
      ***REMOVED***);
    ***REMOVED***

    /**
     * Closes the tab defined by `$target`.
     * @param {jQuery***REMOVED*** $target - Accordion tab to close (`.accordion-content`).
     * @fires Accordion#up
     * @function
     */

  ***REMOVED***, {
    key: 'up',
    value: function up($target) {
      if ($target.closest('[data-accordion]').is('[disabled]')) {
        console.info('Cannot call up on an accordion that is disabled.');
        return;
      ***REMOVED***

      var $aunts = $target.parent().siblings(),
          _this = this;

      if (!this.options.allowAllClosed && !$aunts.hasClass('is-active') || !$target.parent().hasClass('is-active')) {
        return;
      ***REMOVED***

      $target.slideUp(_this.options.slideSpeed, function () {
        /**
         * Fires when the tab is done collapsing up.
         * @event Accordion#up
         */
        _this.$element.trigger('up.zf.accordion', [$target]);
      ***REMOVED***);

      $target.attr('aria-hidden', true).parent().removeClass('is-active');

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + $target.attr('aria-labelledby')).attr({
        'aria-expanded': false,
        'aria-selected': false
      ***REMOVED***);
    ***REMOVED***

    /**
     * Destroys an instance of an accordion.
     * @fires Accordion#destroyed
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
      this.$element.find('a').off('.zf.accordion');
      if (this.options.deepLink) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('popstate', this._checkDeepLink);
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***]);

  return Accordion;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_3__foundation_plugin__["a" /* Plugin */]);

Accordion.defaults = {
  /**
   * Amount of time to animate the opening of an accordion pane.
   * @option
   * @type {number***REMOVED***
   * @default 250
   */
  slideSpeed: 250,
  /**
   * Allow the accordion to have multiple open panes.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  multiExpand: false,
  /**
   * Allow the accordion to close all panes.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  allowAllClosed: false,
  /**
   * Allows the window to scroll to content of pane specified by hash anchor
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  deepLink: false,

  /**
   * Adjust the deep link scroll to make sure the top of the accordion panel is visible
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  deepLinkSmudge: false,

  /**
   * Animation time (ms) for the deep link adjustment
   * @option
   * @type {number***REMOVED***
   * @default 300
   */
  deepLinkSmudgeDelay: 300,

  /**
   * Update the browser history with the open accordion
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  updateHistory: false
***REMOVED***;



/***/ ***REMOVED***),
/* 11 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AccordionMenu; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***







/**
 * AccordionMenu module.
 * @module foundation.accordionMenu
 * @requires foundation.util.keyboard
 * @requires foundation.util.nest
 */

var AccordionMenu = function (_Plugin) {
  _inherits(AccordionMenu, _Plugin);

  function AccordionMenu() {
    _classCallCheck(this, AccordionMenu);

    return _possibleConstructorReturn(this, (AccordionMenu.__proto__ || Object.getPrototypeOf(AccordionMenu)).apply(this, arguments));
  ***REMOVED***

  _createClass(AccordionMenu, [{
    key: '_setup',

    /**
     * Creates a new instance of an accordion menu.
     * @class
     * @name AccordionMenu
     * @fires AccordionMenu#init
     * @param {jQuery***REMOVED*** element - jQuery object to make into an accordion menu.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, AccordionMenu.defaults, this.$element.data(), options);
      this.className = 'AccordionMenu'; // ie9 back compat

      this._init();

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('AccordionMenu', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_RIGHT': 'open',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'close',
        'ESCAPE': 'closeAll'
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes the accordion menu by hiding all nested menus.
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__["a" /* Nest */].Feather(this.$element, 'accordion');

      var _this = this;

      this.$element.find('[data-submenu]').not('.is-active').slideUp(0); //.find('a').css('padding-left', '1rem');
      this.$element.attr({
        'role': 'tree',
        'aria-multiselectable': this.options.multiOpen
      ***REMOVED***);

      this.$menuLinks = this.$element.find('.is-accordion-submenu-parent');
      this.$menuLinks.each(function () {
        var linkId = this.id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["a" /* GetYoDigits */])(6, 'acc-menu-link'),
            $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            $sub = $elem.children('[data-submenu]'),
            subId = $sub[0].id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["a" /* GetYoDigits */])(6, 'acc-menu'),
            isActive = $sub.hasClass('is-active');

        if (_this.options.submenuToggle) {
          $elem.addClass('has-submenu-toggle');
          $elem.children('a').after('<button id="' + linkId + '" class="submenu-toggle" aria-controls="' + subId + '" aria-expanded="' + isActive + '" title="' + _this.options.submenuToggleText + '"><span class="submenu-toggle-text">' + _this.options.submenuToggleText + '</span></button>');
        ***REMOVED*** else {
          $elem.attr({
            'aria-controls': subId,
            'aria-expanded': isActive,
            'id': linkId
          ***REMOVED***);
        ***REMOVED***
        $sub.attr({
          'aria-labelledby': linkId,
          'aria-hidden': !isActive,
          'role': 'group',
          'id': subId
        ***REMOVED***);
      ***REMOVED***);
      this.$element.find('li').attr({
        'role': 'treeitem'
      ***REMOVED***);
      var initPanes = this.$element.find('.is-active');
      if (initPanes.length) {
        var _this = this;
        initPanes.each(function () {
          _this.down(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this));
        ***REMOVED***);
      ***REMOVED***
      this._events();
    ***REMOVED***

    /**
     * Adds event handlers for items within the menu.
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;

      this.$element.find('li').each(function () {
        var $submenu = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).children('[data-submenu]');

        if ($submenu.length) {
          if (_this.options.submenuToggle) {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).children('.submenu-toggle').off('click.zf.accordionMenu').on('click.zf.accordionMenu', function (e) {
              _this.toggle($submenu);
            ***REMOVED***);
          ***REMOVED*** else {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).children('a').off('click.zf.accordionMenu').on('click.zf.accordionMenu', function (e) {
              e.preventDefault();
              _this.toggle($submenu);
            ***REMOVED***);
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***).on('keydown.zf.accordionmenu', function (e) {
        var $element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            $elements = $element.parent('ul').children('li'),
            $prevElement,
            $nextElement,
            $target = $element.children('[data-submenu]');

        $elements.each(function (i) {
          if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is($element)) {
            $prevElement = $elements.eq(Math.max(0, i - 1)).find('a').first();
            $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1)).find('a').first();

            if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).children('[data-submenu]:visible').length) {
              // has open sub menu
              $nextElement = $element.find('li:first-child').find('a').first();
            ***REMOVED***
            if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is(':first-child')) {
              // is first element of sub menu
              $prevElement = $element.parents('li').first().find('a').first();
            ***REMOVED*** else if ($prevElement.parents('li').first().children('[data-submenu]:visible').length) {
              // if previous element has open sub menu
              $prevElement = $prevElement.parents('li').find('li:last-child').find('a').first();
            ***REMOVED***
            if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is(':last-child')) {
              // is last element of sub menu
              $nextElement = $element.parents('li').first().next('li').find('a').first();
            ***REMOVED***

            return;
          ***REMOVED***
        ***REMOVED***);

        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'AccordionMenu', {
          open: function () {
            if ($target.is(':hidden')) {
              _this.down($target);
              $target.find('li').first().find('a').first().focus();
            ***REMOVED***
          ***REMOVED***,
          close: function () {
            if ($target.length && !$target.is(':hidden')) {
              // close active sub of this item
              _this.up($target);
            ***REMOVED*** else if ($element.parent('[data-submenu]').length) {
              // close currently open sub
              _this.up($element.parent('[data-submenu]'));
              $element.parents('li').first().find('a').first().focus();
            ***REMOVED***
          ***REMOVED***,
          up: function () {
            $prevElement.focus();
            return true;
          ***REMOVED***,
          down: function () {
            $nextElement.focus();
            return true;
          ***REMOVED***,
          toggle: function () {
            if (_this.options.submenuToggle) {
              return false;
            ***REMOVED***
            if ($element.children('[data-submenu]').length) {
              _this.toggle($element.children('[data-submenu]'));
              return true;
            ***REMOVED***
          ***REMOVED***,
          closeAll: function () {
            _this.hideAll();
          ***REMOVED***,
          handled: function (preventDefault) {
            if (preventDefault) {
              e.preventDefault();
            ***REMOVED***
            e.stopImmediatePropagation();
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***); //.attr('tabindex', 0);
    ***REMOVED***

    /**
     * Closes all panes of the menu.
     * @function
     */

  ***REMOVED***, {
    key: 'hideAll',
    value: function hideAll() {
      this.up(this.$element.find('[data-submenu]'));
    ***REMOVED***

    /**
     * Opens all panes of the menu.
     * @function
     */

  ***REMOVED***, {
    key: 'showAll',
    value: function showAll() {
      this.down(this.$element.find('[data-submenu]'));
    ***REMOVED***

    /**
     * Toggles the open/close state of a submenu.
     * @function
     * @param {jQuery***REMOVED*** $target - the submenu to toggle
     */

  ***REMOVED***, {
    key: 'toggle',
    value: function toggle($target) {
      if (!$target.is(':animated')) {
        if (!$target.is(':hidden')) {
          this.up($target);
        ***REMOVED*** else {
          this.down($target);
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

    /**
     * Opens the sub-menu defined by `$target`.
     * @param {jQuery***REMOVED*** $target - Sub-menu to open.
     * @fires AccordionMenu#down
     */

  ***REMOVED***, {
    key: 'down',
    value: function down($target) {
      var _this = this;

      if (!this.options.multiOpen) {
        this.up(this.$element.find('.is-active').not($target.parentsUntil(this.$element).add($target)));
      ***REMOVED***

      $target.addClass('is-active').attr({ 'aria-hidden': false ***REMOVED***);

      if (this.options.submenuToggle) {
        $target.prev('.submenu-toggle').attr({ 'aria-expanded': true ***REMOVED***);
      ***REMOVED*** else {
        $target.parent('.is-accordion-submenu-parent').attr({ 'aria-expanded': true ***REMOVED***);
      ***REMOVED***

      $target.slideDown(_this.options.slideSpeed, function () {
        /**
         * Fires when the menu is done opening.
         * @event AccordionMenu#down
         */
        _this.$element.trigger('down.zf.accordionMenu', [$target]);
      ***REMOVED***);
    ***REMOVED***

    /**
     * Closes the sub-menu defined by `$target`. All sub-menus inside the target will be closed as well.
     * @param {jQuery***REMOVED*** $target - Sub-menu to close.
     * @fires AccordionMenu#up
     */

  ***REMOVED***, {
    key: 'up',
    value: function up($target) {
      var _this = this;
      $target.slideUp(_this.options.slideSpeed, function () {
        /**
         * Fires when the menu is done collapsing up.
         * @event AccordionMenu#up
         */
        _this.$element.trigger('up.zf.accordionMenu', [$target]);
      ***REMOVED***);

      var $menus = $target.find('[data-submenu]').slideUp(0).addBack().attr('aria-hidden', true);

      if (this.options.submenuToggle) {
        $menus.prev('.submenu-toggle').attr('aria-expanded', false);
      ***REMOVED*** else {
        $menus.parent('.is-accordion-submenu-parent').attr('aria-expanded', false);
      ***REMOVED***
    ***REMOVED***

    /**
     * Destroys an instance of accordion menu.
     * @fires AccordionMenu#destroyed
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.find('[data-submenu]').slideDown(0).css('display', '');
      this.$element.find('a').off('click.zf.accordionMenu');

      if (this.options.submenuToggle) {
        this.$element.find('.has-submenu-toggle').removeClass('has-submenu-toggle');
        this.$element.find('.submenu-toggle').remove();
      ***REMOVED***

      __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__["a" /* Nest */].Burn(this.$element, 'accordion');
    ***REMOVED***
  ***REMOVED***]);

  return AccordionMenu;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_4__foundation_plugin__["a" /* Plugin */]);

AccordionMenu.defaults = {
  /**
   * Amount of time to animate the opening of a submenu in ms.
   * @option
   * @type {number***REMOVED***
   * @default 250
   */
  slideSpeed: 250,
  /**
   * Adds a separate submenu toggle button. This allows the parent item to have a link.
   * @option
   * @example true
   */
  submenuToggle: false,
  /**
   * The text used for the submenu toggle if enabled. This is used for screen readers only.
   * @option
   * @example true
   */
  submenuToggleText: 'Toggle menu',
  /**
   * Allow the menu to have multiple open panes.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  multiOpen: true
***REMOVED***;



/***/ ***REMOVED***),
/* 12 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Drilldown; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_util_box__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***








/**
 * Drilldown module.
 * @module foundation.drilldown
 * @requires foundation.util.keyboard
 * @requires foundation.util.nest
 * @requires foundation.util.box
 */

var Drilldown = function (_Plugin) {
  _inherits(Drilldown, _Plugin);

  function Drilldown() {
    _classCallCheck(this, Drilldown);

    return _possibleConstructorReturn(this, (Drilldown.__proto__ || Object.getPrototypeOf(Drilldown)).apply(this, arguments));
  ***REMOVED***

  _createClass(Drilldown, [{
    key: '_setup',

    /**
     * Creates a new instance of a drilldown menu.
     * @class
     * @name Drilldown
     * @param {jQuery***REMOVED*** element - jQuery object to make into an accordion menu.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Drilldown.defaults, this.$element.data(), options);
      this.className = 'Drilldown'; // ie9 back compat

      this._init();

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('Drilldown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close',
        'TAB': 'down',
        'SHIFT_TAB': 'up'
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes the drilldown by creating jQuery collections of elements
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__["a" /* Nest */].Feather(this.$element, 'drilldown');

      if (this.options.autoApplyClass) {
        this.$element.addClass('drilldown');
      ***REMOVED***

      this.$element.attr({
        'role': 'tree',
        'aria-multiselectable': false
      ***REMOVED***);
      this.$submenuAnchors = this.$element.find('li.is-drilldown-submenu-parent').children('a');
      this.$submenus = this.$submenuAnchors.parent('li').children('[data-submenu]').attr('role', 'group');
      this.$menuItems = this.$element.find('li').not('.js-drilldown-back').attr('role', 'treeitem').find('a');
      this.$element.attr('data-mutate', this.$element.attr('data-drilldown') || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["a" /* GetYoDigits */])(6, 'drilldown'));

      this._prepareMenu();
      this._registerEvents();

      this._keyboardEvents();
    ***REMOVED***

    /**
     * prepares drilldown menu by setting attributes to links and elements
     * sets a min height to prevent content jumping
     * wraps the element if not already wrapped
     * @private
     * @function
     */

  ***REMOVED***, {
    key: '_prepareMenu',
    value: function _prepareMenu() {
      var _this = this;
      // if(!this.options.holdOpen){
      //   this._menuLinkEvents();
      // ***REMOVED***
      this.$submenuAnchors.each(function () {
        var $link = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this);
        var $sub = $link.parent();
        if (_this.options.parentLink) {
          $link.clone().prependTo($sub.children('[data-submenu]')).wrap('<li class="is-submenu-parent-item is-submenu-item is-drilldown-submenu-item" role="menuitem"></li>');
        ***REMOVED***
        $link.data('savedHref', $link.attr('href')).removeAttr('href').attr('tabindex', 0);
        $link.children('[data-submenu]').attr({
          'aria-hidden': true,
          'tabindex': 0,
          'role': 'group'
        ***REMOVED***);
        _this._events($link);
      ***REMOVED***);
      this.$submenus.each(function () {
        var $menu = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            $back = $menu.find('.js-drilldown-back');
        if (!$back.length) {
          switch (_this.options.backButtonPosition) {
            case "bottom":
              $menu.append(_this.options.backButton);
              break;
            case "top":
              $menu.prepend(_this.options.backButton);
              break;
            default:
              console.error("Unsupported backButtonPosition value '" + _this.options.backButtonPosition + "'");
          ***REMOVED***
        ***REMOVED***
        _this._back($menu);
      ***REMOVED***);

      this.$submenus.addClass('invisible');
      if (!this.options.autoHeight) {
        this.$submenus.addClass('drilldown-submenu-cover-previous');
      ***REMOVED***

      // create a wrapper on element if it doesn't exist.
      if (!this.$element.parent().hasClass('is-drilldown')) {
        this.$wrapper = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.options.wrapper).addClass('is-drilldown');
        if (this.options.animateHeight) this.$wrapper.addClass('animate-height');
        this.$element.wrap(this.$wrapper);
      ***REMOVED***
      // set wrapper
      this.$wrapper = this.$element.parent();
      this.$wrapper.css(this._getMaxDims());
    ***REMOVED***
  ***REMOVED***, {
    key: '_resize',
    value: function _resize() {
      this.$wrapper.css({ 'max-width': 'none', 'min-height': 'none' ***REMOVED***);
      // _getMaxDims has side effects (boo) but calling it should update all other necessary heights & widths
      this.$wrapper.css(this._getMaxDims());
    ***REMOVED***

    /**
     * Adds event handlers to elements in the menu.
     * @function
     * @private
     * @param {jQuery***REMOVED*** $elem - the current menu item to add handlers to.
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events($elem) {
      var _this = this;

      $elem.off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
        if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target).parentsUntil('ul', 'li').hasClass('is-drilldown-submenu-parent')) {
          e.stopImmediatePropagation();
          e.preventDefault();
        ***REMOVED***

        // if(e.target !== e.currentTarget.firstElementChild){
        //   return false;
        // ***REMOVED***
        _this._show($elem.parent('li'));

        if (_this.options.closeOnClick) {
          var $body = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body');
          $body.off('.zf.drilldown').on('click.zf.drilldown', function (e) {
            if (e.target === _this.$element[0] || __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.contains(_this.$element[0], e.target)) {
              return;
            ***REMOVED***
            e.preventDefault();
            _this._hideAll();
            $body.off('.zf.drilldown');
          ***REMOVED***);
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
     * Adds event handlers to the menu element.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_registerEvents',
    value: function _registerEvents() {
      if (this.options.scrollTop) {
        this._bindHandler = this._scrollTop.bind(this);
        this.$element.on('open.zf.drilldown hide.zf.drilldown closed.zf.drilldown', this._bindHandler);
      ***REMOVED***
      this.$element.on('mutateme.zf.trigger', this._resize.bind(this));
    ***REMOVED***

    /**
     * Scroll to Top of Element or data-scroll-top-element
     * @function
     * @fires Drilldown#scrollme
     */

  ***REMOVED***, {
    key: '_scrollTop',
    value: function _scrollTop() {
      var _this = this;
      var $scrollTopElement = _this.options.scrollTopElement != '' ? __WEBPACK_IMPORTED_MODULE_0_jquery___default()(_this.options.scrollTopElement) : _this.$element,
          scrollPos = parseInt($scrollTopElement.offset().top + _this.options.scrollTopOffset, 10);
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body').stop(true).animate({ scrollTop: scrollPos ***REMOVED***, _this.options.animationDuration, _this.options.animationEasing, function () {
        /**
          * Fires after the menu has scrolled
          * @event Drilldown#scrollme
          */
        if (this === __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html')[0]) _this.$element.trigger('scrollme.zf.drilldown');
      ***REMOVED***);
    ***REMOVED***

    /**
     * Adds keydown event listener to `li`'s in the menu.
     * @private
     */

  ***REMOVED***, {
    key: '_keyboardEvents',
    value: function _keyboardEvents() {
      var _this = this;

      this.$menuItems.add(this.$element.find('.js-drilldown-back > a, .is-submenu-parent-item > a')).on('keydown.zf.drilldown', function (e) {
        var $element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            $elements = $element.parent('li').parent('ul').children('li').children('a'),
            $prevElement,
            $nextElement;

        $elements.each(function (i) {
          if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is($element)) {
            $prevElement = $elements.eq(Math.max(0, i - 1));
            $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
            return;
          ***REMOVED***
        ***REMOVED***);

        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'Drilldown', {
          next: function () {
            if ($element.is(_this.$submenuAnchors)) {
              _this._show($element.parent('li'));
              $element.parent('li').one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["c" /* transitionend */])($element), function () {
                $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
              ***REMOVED***);
              return true;
            ***REMOVED***
          ***REMOVED***,
          previous: function () {
            _this._hide($element.parent('li').parent('ul'));
            $element.parent('li').parent('ul').one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["c" /* transitionend */])($element), function () {
              setTimeout(function () {
                $element.parent('li').parent('ul').parent('li').children('a').first().focus();
              ***REMOVED***, 1);
            ***REMOVED***);
            return true;
          ***REMOVED***,
          up: function () {
            $prevElement.focus();
            // Don't tap focus on first element in root ul
            return !$element.is(_this.$element.find('> li:first-child > a'));
          ***REMOVED***,
          down: function () {
            $nextElement.focus();
            // Don't tap focus on last element in root ul
            return !$element.is(_this.$element.find('> li:last-child > a'));
          ***REMOVED***,
          close: function () {
            // Don't close on element in root ul
            if (!$element.is(_this.$element.find('> li > a'))) {
              _this._hide($element.parent().parent());
              $element.parent().parent().siblings('a').focus();
            ***REMOVED***
          ***REMOVED***,
          open: function () {
            if (!$element.is(_this.$menuItems)) {
              // not menu item means back button
              _this._hide($element.parent('li').parent('ul'));
              $element.parent('li').parent('ul').one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["c" /* transitionend */])($element), function () {
                setTimeout(function () {
                  $element.parent('li').parent('ul').parent('li').children('a').first().focus();
                ***REMOVED***, 1);
              ***REMOVED***);
              return true;
            ***REMOVED*** else if ($element.is(_this.$submenuAnchors)) {
              _this._show($element.parent('li'));
              $element.parent('li').one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["c" /* transitionend */])($element), function () {
                $element.parent('li').find('ul li a').filter(_this.$menuItems).first().focus();
              ***REMOVED***);
              return true;
            ***REMOVED***
          ***REMOVED***,
          handled: function (preventDefault) {
            if (preventDefault) {
              e.preventDefault();
            ***REMOVED***
            e.stopImmediatePropagation();
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***); // end keyboardAccess
    ***REMOVED***

    /**
     * Closes all open elements, and returns to root menu.
     * @function
     * @fires Drilldown#closed
     */

  ***REMOVED***, {
    key: '_hideAll',
    value: function _hideAll() {
      var $elem = this.$element.find('.is-drilldown-submenu.is-active').addClass('is-closing');
      if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') ***REMOVED***);
      $elem.one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["c" /* transitionend */])($elem), function (e) {
        $elem.removeClass('is-active is-closing');
      ***REMOVED***);
      /**
       * Fires when the menu is fully closed.
       * @event Drilldown#closed
       */
      this.$element.trigger('closed.zf.drilldown');
    ***REMOVED***

    /**
     * Adds event listener for each `back` button, and closes open menus.
     * @function
     * @fires Drilldown#back
     * @param {jQuery***REMOVED*** $elem - the current sub-menu to add `back` event.
     */

  ***REMOVED***, {
    key: '_back',
    value: function _back($elem) {
      var _this = this;
      $elem.off('click.zf.drilldown');
      $elem.children('.js-drilldown-back').on('click.zf.drilldown', function (e) {
        e.stopImmediatePropagation();
        // console.log('mouseup on back');
        _this._hide($elem);

        // If there is a parent submenu, call show
        var parentSubMenu = $elem.parent('li').parent('ul').parent('li');
        if (parentSubMenu.length) {
          _this._show(parentSubMenu);
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
     * Adds event listener to menu items w/o submenus to close open menus on click.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_menuLinkEvents',
    value: function _menuLinkEvents() {
      var _this = this;
      this.$menuItems.not('.is-drilldown-submenu-parent').off('click.zf.drilldown').on('click.zf.drilldown', function (e) {
        // e.stopImmediatePropagation();
        setTimeout(function () {
          _this._hideAll();
        ***REMOVED***, 0);
      ***REMOVED***);
    ***REMOVED***

    /**
     * Opens a submenu.
     * @function
     * @fires Drilldown#open
     * @param {jQuery***REMOVED*** $elem - the current element with a submenu to open, i.e. the `li` tag.
     */

  ***REMOVED***, {
    key: '_show',
    value: function _show($elem) {
      if (this.options.autoHeight) this.$wrapper.css({ height: $elem.children('[data-submenu]').data('calcHeight') ***REMOVED***);
      $elem.attr('aria-expanded', true);
      $elem.children('[data-submenu]').addClass('is-active').removeClass('invisible').attr('aria-hidden', false);
      /**
       * Fires when the submenu has opened.
       * @event Drilldown#open
       */
      this.$element.trigger('open.zf.drilldown', [$elem]);
    ***REMOVED***
  ***REMOVED***, {
    key: '_hide',


    /**
     * Hides a submenu
     * @function
     * @fires Drilldown#hide
     * @param {jQuery***REMOVED*** $elem - the current sub-menu to hide, i.e. the `ul` tag.
     */
    value: function _hide($elem) {
      if (this.options.autoHeight) this.$wrapper.css({ height: $elem.parent().closest('ul').data('calcHeight') ***REMOVED***);
      var _this = this;
      $elem.parent('li').attr('aria-expanded', false);
      $elem.attr('aria-hidden', true).addClass('is-closing');
      $elem.addClass('is-closing').one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["c" /* transitionend */])($elem), function () {
        $elem.removeClass('is-active is-closing');
        $elem.blur().addClass('invisible');
      ***REMOVED***);
      /**
       * Fires when the submenu has closed.
       * @event Drilldown#hide
       */
      $elem.trigger('hide.zf.drilldown', [$elem]);
    ***REMOVED***

    /**
     * Iterates through the nested menus to calculate the min-height, and max-width for the menu.
     * Prevents content jumping.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_getMaxDims',
    value: function _getMaxDims() {
      var maxHeight = 0,
          result = {***REMOVED***,
          _this = this;
      this.$submenus.add(this.$element).each(function () {
        var numOfElems = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).children('li').length;
        var height = __WEBPACK_IMPORTED_MODULE_4__foundation_util_box__["a" /* Box */].GetDimensions(this).height;
        maxHeight = height > maxHeight ? height : maxHeight;
        if (_this.options.autoHeight) {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('calcHeight', height);
          if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).hasClass('is-drilldown-submenu')) result['height'] = height;
        ***REMOVED***
      ***REMOVED***);

      if (!this.options.autoHeight) result['min-height'] = maxHeight + 'px';

      result['max-width'] = this.$element[0].getBoundingClientRect().width + 'px';

      return result;
    ***REMOVED***

    /**
     * Destroys the Drilldown Menu
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      if (this.options.scrollTop) this.$element.off('.zf.drilldown', this._bindHandler);
      this._hideAll();
      this.$element.off('mutateme.zf.trigger');
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__["a" /* Nest */].Burn(this.$element, 'drilldown');
      this.$element.unwrap().find('.js-drilldown-back, .is-submenu-parent-item').remove().end().find('.is-active, .is-closing, .is-drilldown-submenu').removeClass('is-active is-closing is-drilldown-submenu').end().find('[data-submenu]').removeAttr('aria-hidden tabindex role');
      this.$submenuAnchors.each(function () {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).off('.zf.drilldown');
      ***REMOVED***);

      this.$submenus.removeClass('drilldown-submenu-cover-previous invisible');

      this.$element.find('a').each(function () {
        var $link = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this);
        $link.removeAttr('tabindex');
        if ($link.data('savedHref')) {
          $link.attr('href', $link.data('savedHref')).removeData('savedHref');
        ***REMOVED*** else {
          return;
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***
  ***REMOVED***]);

  return Drilldown;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_5__foundation_plugin__["a" /* Plugin */]);

Drilldown.defaults = {
  /**
   * Drilldowns depend on styles in order to function properly; in the default build of Foundation these are
   * on the `drilldown` class. This option auto-applies this class to the drilldown upon initialization.
   * @option
   * @type {boolian***REMOVED***
   * @default true
   */
  autoApplyClass: true,
  /**
   * Markup used for JS generated back button. Prepended  or appended (see backButtonPosition) to submenu lists and deleted on `destroy` method, 'js-drilldown-back' class required. Remove the backslash (`\`) if copy and pasting.
   * @option
   * @type {string***REMOVED***
   * @default '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>'
   */
  backButton: '<li class="js-drilldown-back"><a tabindex="0">Back</a></li>',
  /**
   * Position the back button either at the top or bottom of drilldown submenus. Can be `'left'` or `'bottom'`.
   * @option
   * @type {string***REMOVED***
   * @default top
   */
  backButtonPosition: 'top',
  /**
   * Markup used to wrap drilldown menu. Use a class name for independent styling; the JS applied class: `is-drilldown` is required. Remove the backslash (`\`) if copy and pasting.
   * @option
   * @type {string***REMOVED***
   * @default '<div></div>'
   */
  wrapper: '<div></div>',
  /**
   * Adds the parent link to the submenu.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  parentLink: false,
  /**
   * Allow the menu to return to root list on body click.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  closeOnClick: false,
  /**
   * Allow the menu to auto adjust height.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  autoHeight: false,
  /**
   * Animate the auto adjust height.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  animateHeight: false,
  /**
   * Scroll to the top of the menu after opening a submenu or navigating back using the menu back button
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  scrollTop: false,
  /**
   * String jquery selector (for example 'body') of element to take offset().top from, if empty string the drilldown menu offset().top is taken
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  scrollTopElement: '',
  /**
   * ScrollTop offset
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  scrollTopOffset: 0,
  /**
   * Scroll animation duration
   * @option
   * @type {number***REMOVED***
   * @default 500
   */
  animationDuration: 500,
  /**
   * Scroll animation easing. Can be `'swing'` or `'linear'`.
   * @option
   * @type {string***REMOVED***
   * @see {@link https://api.jquery.com/animate|JQuery animate***REMOVED***
   * @default 'swing'
   */
  animationEasing: 'swing'
  // holdOpen: false
***REMOVED***;



/***/ ***REMOVED***),
/* 13 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return DropdownMenu; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__ = __webpack_require__(9);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_box__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***








/**
 * DropdownMenu module.
 * @module foundation.dropdown-menu
 * @requires foundation.util.keyboard
 * @requires foundation.util.box
 * @requires foundation.util.nest
 */

var DropdownMenu = function (_Plugin) {
  _inherits(DropdownMenu, _Plugin);

  function DropdownMenu() {
    _classCallCheck(this, DropdownMenu);

    return _possibleConstructorReturn(this, (DropdownMenu.__proto__ || Object.getPrototypeOf(DropdownMenu)).apply(this, arguments));
  ***REMOVED***

  _createClass(DropdownMenu, [{
    key: '_setup',

    /**
     * Creates a new instance of DropdownMenu.
     * @class
     * @name DropdownMenu
     * @fires DropdownMenu#init
     * @param {jQuery***REMOVED*** element - jQuery object to make into a dropdown menu.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, DropdownMenu.defaults, this.$element.data(), options);
      this.className = 'DropdownMenu'; // ie9 back compat

      this._init();

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('DropdownMenu', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'up',
        'ARROW_DOWN': 'down',
        'ARROW_LEFT': 'previous',
        'ESCAPE': 'close'
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes the plugin, and calls _prepareMenu
     * @private
     * @function
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__["a" /* Nest */].Feather(this.$element, 'dropdown');

      var subs = this.$element.find('li.is-dropdown-submenu-parent');
      this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

      this.$menuItems = this.$element.find('[role="menuitem"]');
      this.$tabs = this.$element.children('[role="menuitem"]');
      this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

      if (this.options.alignment === 'auto') {
        if (this.$element.hasClass(this.options.rightClass) || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__foundation_util_core__["b" /* rtl */])() || this.$element.parents('.top-bar-right').is('*')) {
          this.options.alignment = 'right';
          subs.addClass('opens-left');
        ***REMOVED*** else {
          this.options.alignment = 'left';
          subs.addClass('opens-right');
        ***REMOVED***
      ***REMOVED*** else {
        if (this.options.alignment === 'right') {
          subs.addClass('opens-left');
        ***REMOVED*** else {
          subs.addClass('opens-right');
        ***REMOVED***
      ***REMOVED***
      this.changed = false;
      this._events();
    ***REMOVED***
  ***REMOVED***, {
    key: '_isVertical',
    value: function _isVertical() {
      return this.$tabs.css('display') === 'block' || this.$element.css('flex-direction') === 'column';
    ***REMOVED***
  ***REMOVED***, {
    key: '_isRtl',
    value: function _isRtl() {
      return this.$element.hasClass('align-right') || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__foundation_util_core__["b" /* rtl */])() && !this.$element.hasClass('align-left');
    ***REMOVED***

    /**
     * Adds event listeners to elements within the menu
     * @private
     * @function
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this,
          hasTouch = 'ontouchstart' in window || typeof window.ontouchstart !== 'undefined',
          parClass = 'is-dropdown-submenu-parent';

      // used for onClick and in the keyboard handlers
      var handleClickFn = function (e) {
        var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target).parentsUntil('ul', '.' + parClass),
            hasSub = $elem.hasClass(parClass),
            hasClicked = $elem.attr('data-is-click') === 'true',
            $sub = $elem.children('.is-dropdown-submenu');

        if (hasSub) {
          if (hasClicked) {
            if (!_this.options.closeOnClick || !_this.options.clickOpen && !hasTouch || _this.options.forceFollow && hasTouch) {
              return;
            ***REMOVED*** else {
              e.stopImmediatePropagation();
              e.preventDefault();
              _this._hide($elem);
            ***REMOVED***
          ***REMOVED*** else {
            e.preventDefault();
            e.stopImmediatePropagation();
            _this._show($sub);
            $elem.add($elem.parentsUntil(_this.$element, '.' + parClass)).attr('data-is-click', true);
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***;

      if (this.options.clickOpen || hasTouch) {
        this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
      ***REMOVED***

      // Handle Leaf element Clicks
      if (_this.options.closeOnClickInside) {
        this.$menuItems.on('click.zf.dropdownmenu', function (e) {
          var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
              hasSub = $elem.hasClass(parClass);
          if (!hasSub) {
            _this._hide();
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***

      if (!this.options.disableHover) {
        this.$menuItems.on('mouseenter.zf.dropdownmenu', function (e) {
          var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
              hasSub = $elem.hasClass(parClass);

          if (hasSub) {
            clearTimeout($elem.data('_delay'));
            $elem.data('_delay', setTimeout(function () {
              _this._show($elem.children('.is-dropdown-submenu'));
            ***REMOVED***, _this.options.hoverDelay));
          ***REMOVED***
        ***REMOVED***).on('mouseleave.zf.dropdownmenu', function (e) {
          var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
              hasSub = $elem.hasClass(parClass);
          if (hasSub && _this.options.autoclose) {
            if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) {
              return false;
            ***REMOVED***

            clearTimeout($elem.data('_delay'));
            $elem.data('_delay', setTimeout(function () {
              _this._hide($elem);
            ***REMOVED***, _this.options.closingTime));
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***
      this.$menuItems.on('keydown.zf.dropdownmenu', function (e) {
        var $element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target).parentsUntil('ul', '[role="menuitem"]'),
            isTab = _this.$tabs.index($element) > -1,
            $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
            $prevElement,
            $nextElement;

        $elements.each(function (i) {
          if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is($element)) {
            $prevElement = $elements.eq(i - 1);
            $nextElement = $elements.eq(i + 1);
            return;
          ***REMOVED***
        ***REMOVED***);

        var nextSibling = function () {
          $nextElement.children('a:first').focus();
          e.preventDefault();
        ***REMOVED***,
            prevSibling = function () {
          $prevElement.children('a:first').focus();
          e.preventDefault();
        ***REMOVED***,
            openSub = function () {
          var $sub = $element.children('ul.is-dropdown-submenu');
          if ($sub.length) {
            _this._show($sub);
            $element.find('li > a:first').focus();
            e.preventDefault();
          ***REMOVED*** else {
            return;
          ***REMOVED***
        ***REMOVED***,
            closeSub = function () {
          //if ($element.is(':first-child')) {
          var close = $element.parent('ul').parent('li');
          close.children('a:first').focus();
          _this._hide(close);
          e.preventDefault();
          //***REMOVED***
        ***REMOVED***;
        var functions = {
          open: openSub,
          close: function () {
            _this._hide(_this.$element);
            _this.$menuItems.eq(0).children('a').focus(); // focus to first element
            e.preventDefault();
          ***REMOVED***,
          handled: function () {
            e.stopImmediatePropagation();
          ***REMOVED***
        ***REMOVED***;

        if (isTab) {
          if (_this._isVertical()) {
            // vertical menu
            if (_this._isRtl()) {
              // right aligned
              __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                down: nextSibling,
                up: prevSibling,
                next: closeSub,
                previous: openSub
              ***REMOVED***);
            ***REMOVED*** else {
              // left aligned
              __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                down: nextSibling,
                up: prevSibling,
                next: openSub,
                previous: closeSub
              ***REMOVED***);
            ***REMOVED***
          ***REMOVED*** else {
            // horizontal menu
            if (_this._isRtl()) {
              // right aligned
              __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                next: prevSibling,
                previous: nextSibling,
                down: openSub,
                up: closeSub
              ***REMOVED***);
            ***REMOVED*** else {
              // left aligned
              __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
                next: nextSibling,
                previous: prevSibling,
                down: openSub,
                up: closeSub
              ***REMOVED***);
            ***REMOVED***
          ***REMOVED***
        ***REMOVED*** else {
          // not tabs -> one sub
          if (_this._isRtl()) {
            // right aligned
            __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
              next: closeSub,
              previous: openSub,
              down: nextSibling,
              up: prevSibling
            ***REMOVED***);
          ***REMOVED*** else {
            // left aligned
            __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(functions, {
              next: openSub,
              previous: closeSub,
              down: nextSibling,
              up: prevSibling
            ***REMOVED***);
          ***REMOVED***
        ***REMOVED***
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'DropdownMenu', functions);
      ***REMOVED***);
    ***REMOVED***

    /**
     * Adds an event handler to the body to close any dropdowns on a click.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_addBodyHandler',
    value: function _addBodyHandler() {
      var $body = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document.body),
          _this = this;
      $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu').on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function (e) {
        var $link = _this.$element.find(e.target);
        if ($link.length) {
          return;
        ***REMOVED***

        _this._hide();
        $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu');
      ***REMOVED***);
    ***REMOVED***

    /**
     * Opens a dropdown pane, and checks for collisions first.
     * @param {jQuery***REMOVED*** $sub - ul element that is a submenu to show
     * @function
     * @private
     * @fires DropdownMenu#show
     */

  ***REMOVED***, {
    key: '_show',
    value: function _show($sub) {
      var idx = this.$tabs.index(this.$tabs.filter(function (i, el) {
        return __WEBPACK_IMPORTED_MODULE_0_jquery___default()(el).find($sub).length > 0;
      ***REMOVED***));
      var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
      this._hide($sibs, idx);
      $sub.css('visibility', 'hidden').addClass('js-dropdown-active').parent('li.is-dropdown-submenu-parent').addClass('is-active');
      var clear = __WEBPACK_IMPORTED_MODULE_3__foundation_util_box__["a" /* Box */].ImNotTouchingYou($sub, null, true);
      if (!clear) {
        var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
            $parentLi = $sub.parent('.is-dropdown-submenu-parent');
        $parentLi.removeClass('opens' + oldClass).addClass('opens-' + this.options.alignment);
        clear = __WEBPACK_IMPORTED_MODULE_3__foundation_util_box__["a" /* Box */].ImNotTouchingYou($sub, null, true);
        if (!clear) {
          $parentLi.removeClass('opens-' + this.options.alignment).addClass('opens-inner');
        ***REMOVED***
        this.changed = true;
      ***REMOVED***
      $sub.css('visibility', '');
      if (this.options.closeOnClick) {
        this._addBodyHandler();
      ***REMOVED***
      /**
       * Fires when the new dropdown pane is visible.
       * @event DropdownMenu#show
       */
      this.$element.trigger('show.zf.dropdownmenu', [$sub]);
    ***REMOVED***

    /**
     * Hides a single, currently open dropdown pane, if passed a parameter, otherwise, hides everything.
     * @function
     * @param {jQuery***REMOVED*** $elem - element with a submenu to hide
     * @param {Number***REMOVED*** idx - index of the $tabs collection to hide
     * @private
     */

  ***REMOVED***, {
    key: '_hide',
    value: function _hide($elem, idx) {
      var $toClose;
      if ($elem && $elem.length) {
        $toClose = $elem;
      ***REMOVED*** else if (idx !== undefined) {
        $toClose = this.$tabs.not(function (i, el) {
          return i === idx;
        ***REMOVED***);
      ***REMOVED*** else {
        $toClose = this.$element;
      ***REMOVED***
      var somethingToClose = $toClose.hasClass('is-active') || $toClose.find('.is-active').length > 0;

      if (somethingToClose) {
        $toClose.find('li.is-active').add($toClose).attr({
          'data-is-click': false
        ***REMOVED***).removeClass('is-active');

        $toClose.find('ul.js-dropdown-active').removeClass('js-dropdown-active');

        if (this.changed || $toClose.find('opens-inner').length) {
          var oldClass = this.options.alignment === 'left' ? 'right' : 'left';
          $toClose.find('li.is-dropdown-submenu-parent').add($toClose).removeClass('opens-inner opens-' + this.options.alignment).addClass('opens-' + oldClass);
          this.changed = false;
        ***REMOVED***
        /**
         * Fires when the open menus are closed.
         * @event DropdownMenu#hide
         */
        this.$element.trigger('hide.zf.dropdownmenu', [$toClose]);
      ***REMOVED***
    ***REMOVED***

    /**
     * Destroys the plugin.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click').removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document.body).off('.zf.dropdownmenu');
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_nest__["a" /* Nest */].Burn(this.$element, 'dropdown');
    ***REMOVED***
  ***REMOVED***]);

  return DropdownMenu;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_5__foundation_plugin__["a" /* Plugin */]);

/**
 * Default settings for plugin
 */


DropdownMenu.defaults = {
  /**
   * Disallows hover events from opening submenus
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  disableHover: false,
  /**
   * Allow a submenu to automatically close on a mouseleave event, if not clicked open.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  autoclose: true,
  /**
   * Amount of time to delay opening a submenu on hover event.
   * @option
   * @type {number***REMOVED***
   * @default 50
   */
  hoverDelay: 50,
  /**
   * Allow a submenu to open/remain open on parent click event. Allows cursor to move away from menu.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  clickOpen: false,
  /**
   * Amount of time to delay closing a submenu on a mouseleave event.
   * @option
   * @type {number***REMOVED***
   * @default 500
   */

  closingTime: 500,
  /**
   * Position of the menu relative to what direction the submenus should open. Handled by JS. Can be `'auto'`, `'left'` or `'right'`.
   * @option
   * @type {string***REMOVED***
   * @default 'auto'
   */
  alignment: 'auto',
  /**
   * Allow clicks on the body to close any open submenus.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  closeOnClick: true,
  /**
   * Allow clicks on leaf anchor links to close any open submenus.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  closeOnClickInside: true,
  /**
   * Class applied to vertical oriented menus, Foundation default is `vertical`. Update this if using your own class.
   * @option
   * @type {string***REMOVED***
   * @default 'vertical'
   */
  verticalClass: 'vertical',
  /**
   * Class applied to right-side oriented menus, Foundation default is `align-right`. Update this if using your own class.
   * @option
   * @type {string***REMOVED***
   * @default 'align-right'
   */
  rightClass: 'align-right',
  /**
   * Boolean to force overide the clicking of links to perform default action, on second touch event for mobile.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  forceFollow: true
***REMOVED***;



/***/ ***REMOVED***),
/* 14 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Tabs; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_imageLoader__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***





/**
 * Tabs module.
 * @module foundation.tabs
 * @requires foundation.util.keyboard
 * @requires foundation.util.imageLoader if tabs contain images
 */

var Tabs = function (_Plugin) {
  _inherits(Tabs, _Plugin);

  function Tabs() {
    _classCallCheck(this, Tabs);

    return _possibleConstructorReturn(this, (Tabs.__proto__ || Object.getPrototypeOf(Tabs)).apply(this, arguments));
  ***REMOVED***

  _createClass(Tabs, [{
    key: '_setup',

    /**
     * Creates a new instance of tabs.
     * @class
     * @name Tabs
     * @fires Tabs#init
     * @param {jQuery***REMOVED*** element - jQuery object to make into tabs.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Tabs.defaults, this.$element.data(), options);
      this.className = 'Tabs'; // ie9 back compat

      this._init();
      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      var _this3 = this;

      var _this = this;

      this.$element.attr({ 'role': 'tablist' ***REMOVED***);
      this.$tabTitles = this.$element.find('.' + this.options.linkClass);
      this.$tabContent = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-tabs-content="' + this.$element[0].id + '"]');

      this.$tabTitles.each(function () {
        var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            $link = $elem.find('a'),
            isActive = $elem.hasClass('' + _this.options.linkActiveClass),
            hash = $link.attr('data-tabs-target') || $link[0].hash.slice(1),
            linkId = $link[0].id ? $link[0].id : hash + '-label',
            $tabContent = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + hash);

        $elem.attr({ 'role': 'presentation' ***REMOVED***);

        $link.attr({
          'role': 'tab',
          'aria-controls': hash,
          'aria-selected': isActive,
          'id': linkId,
          'tabindex': isActive ? '0' : '-1'
        ***REMOVED***);

        $tabContent.attr({
          'role': 'tabpanel',
          'aria-labelledby': linkId
        ***REMOVED***);

        if (!isActive) {
          $tabContent.attr('aria-hidden', 'true');
        ***REMOVED***

        if (isActive && _this.options.autoFocus) {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).load(function () {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body').animate({ scrollTop: $elem.offset().top ***REMOVED***, _this.options.deepLinkSmudgeDelay, function () {
              $link.focus();
            ***REMOVED***);
          ***REMOVED***);
        ***REMOVED***
      ***REMOVED***);
      if (this.options.matchHeight) {
        var $images = this.$tabContent.find('img');

        if ($images.length) {
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_imageLoader__["a" /* onImagesLoaded */])($images, this._setHeight.bind(this));
        ***REMOVED*** else {
          this._setHeight();
        ***REMOVED***
      ***REMOVED***

      //current context-bound function to open tabs on page load or history popstate
      this._checkDeepLink = function () {
        var anchor = window.location.hash;
        //need a hash and a relevant anchor in this tabset
        if (anchor.length) {
          var $link = _this3.$element.find('[href$="' + anchor + '"]');
          if ($link.length) {
            _this3.selectTab(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(anchor), true);

            //roll up a little to show the titles
            if (_this3.options.deepLinkSmudge) {
              var offset = _this3.$element.offset();
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body').animate({ scrollTop: offset.top ***REMOVED***, _this3.options.deepLinkSmudgeDelay);
            ***REMOVED***

            /**
              * Fires when the zplugin has deeplinked at pageload
              * @event Tabs#deeplink
              */
            _this3.$element.trigger('deeplink.zf.tabs', [$link, __WEBPACK_IMPORTED_MODULE_0_jquery___default()(anchor)]);
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***;

      //use browser to open a tab, if it exists in this tabset
      if (this.options.deepLink) {
        this._checkDeepLink();
      ***REMOVED***

      this._events();
    ***REMOVED***

    /**
     * Adds event handlers for items within the tabs.
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      this._addKeyHandler();
      this._addClickHandler();
      this._setHeightMqHandler = null;

      if (this.options.matchHeight) {
        this._setHeightMqHandler = this._setHeight.bind(this);

        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('changed.zf.mediaquery', this._setHeightMqHandler);
      ***REMOVED***

      if (this.options.deepLink) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('popstate', this._checkDeepLink);
      ***REMOVED***
    ***REMOVED***

    /**
     * Adds click handlers for items within the tabs.
     * @private
     */

  ***REMOVED***, {
    key: '_addClickHandler',
    value: function _addClickHandler() {
      var _this = this;

      this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
        e.preventDefault();
        e.stopPropagation();
        _this._handleTabChange(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this));
      ***REMOVED***);
    ***REMOVED***

    /**
     * Adds keyboard event handlers for items within the tabs.
     * @private
     */

  ***REMOVED***, {
    key: '_addKeyHandler',
    value: function _addKeyHandler() {
      var _this = this;

      this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
        if (e.which === 9) return;

        var $element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            $elements = $element.parent('ul').children('li'),
            $prevElement,
            $nextElement;

        $elements.each(function (i) {
          if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is($element)) {
            if (_this.options.wrapOnKeys) {
              $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
              $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
            ***REMOVED*** else {
              $prevElement = $elements.eq(Math.max(0, i - 1));
              $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
            ***REMOVED***
            return;
          ***REMOVED***
        ***REMOVED***);

        // handle keyboard event with keyboard util
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'Tabs', {
          open: function () {
            $element.find('[role="tab"]').focus();
            _this._handleTabChange($element);
          ***REMOVED***,
          previous: function () {
            $prevElement.find('[role="tab"]').focus();
            _this._handleTabChange($prevElement);
          ***REMOVED***,
          next: function () {
            $nextElement.find('[role="tab"]').focus();
            _this._handleTabChange($nextElement);
          ***REMOVED***,
          handled: function () {
            e.stopPropagation();
            e.preventDefault();
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***);
    ***REMOVED***

    /**
     * Opens the tab `$targetContent` defined by `$target`. Collapses active tab.
     * @param {jQuery***REMOVED*** $target - Tab to open.
     * @param {boolean***REMOVED*** historyHandled - browser has already handled a history update
     * @fires Tabs#change
     * @function
     */

  ***REMOVED***, {
    key: '_handleTabChange',
    value: function _handleTabChange($target, historyHandled) {

      /**
       * Check for active class on target. Collapse if exists.
       */
      if ($target.hasClass('' + this.options.linkActiveClass)) {
        if (this.options.activeCollapse) {
          this._collapseTab($target);

          /**
           * Fires when the zplugin has successfully collapsed tabs.
           * @event Tabs#collapse
           */
          this.$element.trigger('collapse.zf.tabs', [$target]);
        ***REMOVED***
        return;
      ***REMOVED***

      var $oldTab = this.$element.find('.' + this.options.linkClass + '.' + this.options.linkActiveClass),
          $tabLink = $target.find('[role="tab"]'),
          hash = $tabLink.attr('data-tabs-target') || $tabLink[0].hash.slice(1),
          $targetContent = this.$tabContent.find('#' + hash);

      //close old tab
      this._collapseTab($oldTab);

      //open new tab
      this._openTab($target);

      //either replace or update browser history
      if (this.options.deepLink && !historyHandled) {
        var anchor = $target.find('a').attr('href');

        if (this.options.updateHistory) {
          history.pushState({***REMOVED***, '', anchor);
        ***REMOVED*** else {
          history.replaceState({***REMOVED***, '', anchor);
        ***REMOVED***
      ***REMOVED***

      /**
       * Fires when the plugin has successfully changed tabs.
       * @event Tabs#change
       */
      this.$element.trigger('change.zf.tabs', [$target, $targetContent]);

      //fire to children a mutation event
      $targetContent.find("[data-mutate]").trigger("mutateme.zf.trigger");
    ***REMOVED***

    /**
     * Opens the tab `$targetContent` defined by `$target`.
     * @param {jQuery***REMOVED*** $target - Tab to Open.
     * @function
     */

  ***REMOVED***, {
    key: '_openTab',
    value: function _openTab($target) {
      var $tabLink = $target.find('[role="tab"]'),
          hash = $tabLink.attr('data-tabs-target') || $tabLink[0].hash.slice(1),
          $targetContent = this.$tabContent.find('#' + hash);

      $target.addClass('' + this.options.linkActiveClass);

      $tabLink.attr({
        'aria-selected': 'true',
        'tabindex': '0'
      ***REMOVED***);

      $targetContent.addClass('' + this.options.panelActiveClass).removeAttr('aria-hidden');
    ***REMOVED***

    /**
     * Collapses `$targetContent` defined by `$target`.
     * @param {jQuery***REMOVED*** $target - Tab to Open.
     * @function
     */

  ***REMOVED***, {
    key: '_collapseTab',
    value: function _collapseTab($target) {
      var $target_anchor = $target.removeClass('' + this.options.linkActiveClass).find('[role="tab"]').attr({
        'aria-selected': 'false',
        'tabindex': -1
      ***REMOVED***);

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + $target_anchor.attr('aria-controls')).removeClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'true' ***REMOVED***);
    ***REMOVED***

    /**
     * Public method for selecting a content pane to display.
     * @param {jQuery | String***REMOVED*** elem - jQuery object or string of the id of the pane to display.
     * @param {boolean***REMOVED*** historyHandled - browser has already handled a history update
     * @function
     */

  ***REMOVED***, {
    key: 'selectTab',
    value: function selectTab(elem, historyHandled) {
      var idStr;

      if (typeof elem === 'object') {
        idStr = elem[0].id;
      ***REMOVED*** else {
        idStr = elem;
      ***REMOVED***

      if (idStr.indexOf('#') < 0) {
        idStr = '#' + idStr;
      ***REMOVED***

      var $target = this.$tabTitles.find('[href$="' + idStr + '"]').parent('.' + this.options.linkClass);

      this._handleTabChange($target, historyHandled);
    ***REMOVED***
  ***REMOVED***, {
    key: '_setHeight',

    /**
     * Sets the height of each panel to the height of the tallest panel.
     * If enabled in options, gets called on media query change.
     * If loading content via external source, can be called directly or with _reflow.
     * If enabled with `data-match-height="true"`, tabs sets to equal height
     * @function
     * @private
     */
    value: function _setHeight() {
      var max = 0,
          _this = this; // Lock down the `this` value for the root tabs object

      this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {

        var panel = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            isActive = panel.hasClass('' + _this.options.panelActiveClass); // get the options from the parent instead of trying to get them from the child

        if (!isActive) {
          panel.css({ 'visibility': 'hidden', 'display': 'block' ***REMOVED***);
        ***REMOVED***

        var temp = this.getBoundingClientRect().height;

        if (!isActive) {
          panel.css({
            'visibility': '',
            'display': ''
          ***REMOVED***);
        ***REMOVED***

        max = temp > max ? temp : max;
      ***REMOVED***).css('height', max + 'px');
    ***REMOVED***

    /**
     * Destroys an instance of an tabs.
     * @fires Tabs#destroyed
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

      if (this.options.matchHeight) {
        if (this._setHeightMqHandler != null) {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('changed.zf.mediaquery', this._setHeightMqHandler);
        ***REMOVED***
      ***REMOVED***

      if (this.options.deepLink) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('popstate', this._checkDeepLink);
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***]);

  return Tabs;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_3__foundation_plugin__["a" /* Plugin */]);

Tabs.defaults = {
  /**
   * Allows the window to scroll to content of pane specified by hash anchor
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  deepLink: false,

  /**
   * Adjust the deep link scroll to make sure the top of the tab panel is visible
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  deepLinkSmudge: false,

  /**
   * Animation time (ms) for the deep link adjustment
   * @option
   * @type {number***REMOVED***
   * @default 300
   */
  deepLinkSmudgeDelay: 300,

  /**
   * Update the browser history with the open tab
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  updateHistory: false,

  /**
   * Allows the window to scroll to content of active pane on load if set to true.
   * Not recommended if more than one tab panel per page.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  autoFocus: false,

  /**
   * Allows keyboard input to 'wrap' around the tab links.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  wrapOnKeys: true,

  /**
   * Allows the tab content panes to match heights if set to true.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  matchHeight: false,

  /**
   * Allows active tabs to collapse when clicked.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  activeCollapse: false,

  /**
   * Class applied to `li`'s in tab link list.
   * @option
   * @type {string***REMOVED***
   * @default 'tabs-title'
   */
  linkClass: 'tabs-title',

  /**
   * Class applied to the active `li` in tab link list.
   * @option
   * @type {string***REMOVED***
   * @default 'is-active'
   */
  linkActiveClass: 'is-active',

  /**
   * Class applied to the content containers.
   * @option
   * @type {string***REMOVED***
   * @default 'tabs-panel'
   */
  panelClass: 'tabs-panel',

  /**
   * Class applied to the active content container.
   * @option
   * @type {string***REMOVED***
   * @default 'is-active'
   */
  panelActiveClass: 'is-active'
***REMOVED***;



/***/ ***REMOVED***),
/* 15 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Positionable; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__foundation_util_box__ = __webpack_require__(7);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__ = __webpack_require__(1);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***





var POSITIONS = ['left', 'right', 'top', 'bottom'];
var VERTICAL_ALIGNMENTS = ['top', 'bottom', 'center'];
var HORIZONTAL_ALIGNMENTS = ['left', 'right', 'center'];

var ALIGNMENTS = {
  'left': VERTICAL_ALIGNMENTS,
  'right': VERTICAL_ALIGNMENTS,
  'top': HORIZONTAL_ALIGNMENTS,
  'bottom': HORIZONTAL_ALIGNMENTS
***REMOVED***;

function nextItem(item, array) {
  var currentIdx = array.indexOf(item);
  if (currentIdx === array.length - 1) {
    return array[0];
  ***REMOVED*** else {
    return array[currentIdx + 1];
  ***REMOVED***
***REMOVED***

var Positionable = function (_Plugin) {
  _inherits(Positionable, _Plugin);

  function Positionable() {
    _classCallCheck(this, Positionable);

    return _possibleConstructorReturn(this, (Positionable.__proto__ || Object.getPrototypeOf(Positionable)).apply(this, arguments));
  ***REMOVED***

  _createClass(Positionable, [{
    key: '_init',

    /**
     * Abstract class encapsulating the tether-like explicit positioning logic
     * including repositioning based on overlap.
     * Expects classes to define defaults for vOffset, hOffset, position,
     * alignment, allowOverlap, and allowBottomOverlap. They can do this by
     * extending the defaults, or (for now recommended due to the way docs are
     * generated) by explicitly declaring them.
     *
     **/

    value: function _init() {
      this.triedPositions = {***REMOVED***;
      this.position = this.options.position === 'auto' ? this._getDefaultPosition() : this.options.position;
      this.alignment = this.options.alignment === 'auto' ? this._getDefaultAlignment() : this.options.alignment;
    ***REMOVED***
  ***REMOVED***, {
    key: '_getDefaultPosition',
    value: function _getDefaultPosition() {
      return 'bottom';
    ***REMOVED***
  ***REMOVED***, {
    key: '_getDefaultAlignment',
    value: function _getDefaultAlignment() {
      switch (this.position) {
        case 'bottom':
        case 'top':
          return __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["b" /* rtl */])() ? 'right' : 'left';
        case 'left':
        case 'right':
          return 'bottom';
      ***REMOVED***
    ***REMOVED***

    /**
     * Adjusts the positionable possible positions by iterating through alignments
     * and positions.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_reposition',
    value: function _reposition() {
      if (this._alignmentsExhausted(this.position)) {
        this.position = nextItem(this.position, POSITIONS);
        this.alignment = ALIGNMENTS[this.position][0];
      ***REMOVED*** else {
        this._realign();
      ***REMOVED***
    ***REMOVED***

    /**
     * Adjusts the dropdown pane possible positions by iterating through alignments
     * on the current position.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_realign',
    value: function _realign() {
      this._addTriedPosition(this.position, this.alignment);
      this.alignment = nextItem(this.alignment, ALIGNMENTS[this.position]);
    ***REMOVED***
  ***REMOVED***, {
    key: '_addTriedPosition',
    value: function _addTriedPosition(position, alignment) {
      this.triedPositions[position] = this.triedPositions[position] || [];
      this.triedPositions[position].push(alignment);
    ***REMOVED***
  ***REMOVED***, {
    key: '_positionsExhausted',
    value: function _positionsExhausted() {
      var isExhausted = true;
      for (var i = 0; i < POSITIONS.length; i++) {
        isExhausted = isExhausted && this._alignmentsExhausted(POSITIONS[i]);
      ***REMOVED***
      return isExhausted;
    ***REMOVED***
  ***REMOVED***, {
    key: '_alignmentsExhausted',
    value: function _alignmentsExhausted(position) {
      return this.triedPositions[position] && this.triedPositions[position].length == ALIGNMENTS[position].length;
    ***REMOVED***

    // When we're trying to center, we don't want to apply offset that's going to
    // take us just off center, so wrap around to return 0 for the appropriate
    // offset in those alignments.  TODO: Figure out if we want to make this
    // configurable behavior... it feels more intuitive, especially for tooltips, but
    // it's possible someone might actually want to start from center and then nudge
    // slightly off.

  ***REMOVED***, {
    key: '_getVOffset',
    value: function _getVOffset() {
      return this.options.vOffset;
    ***REMOVED***
  ***REMOVED***, {
    key: '_getHOffset',
    value: function _getHOffset() {
      return this.options.hOffset;
    ***REMOVED***
  ***REMOVED***, {
    key: '_setPosition',
    value: function _setPosition($anchor, $element, $parent) {
      if ($anchor.attr('aria-expanded') === 'false') {
        return false;
      ***REMOVED***
      var $eleDims = __WEBPACK_IMPORTED_MODULE_0__foundation_util_box__["a" /* Box */].GetDimensions($element),
          $anchorDims = __WEBPACK_IMPORTED_MODULE_0__foundation_util_box__["a" /* Box */].GetDimensions($anchor);

      $element.offset(__WEBPACK_IMPORTED_MODULE_0__foundation_util_box__["a" /* Box */].GetExplicitOffsets($element, $anchor, this.position, this.alignment, this._getVOffset(), this._getHOffset()));

      if (!this.options.allowOverlap) {
        var overlaps = {***REMOVED***;
        var minOverlap = 100000000;
        // default coordinates to how we start, in case we can't figure out better
        var minCoordinates = { position: this.position, alignment: this.alignment ***REMOVED***;
        while (!this._positionsExhausted()) {
          var overlap = __WEBPACK_IMPORTED_MODULE_0__foundation_util_box__["a" /* Box */].OverlapArea($element, $parent, false, false, this.options.allowBottomOverlap);
          if (overlap === 0) {
            return;
          ***REMOVED***

          if (overlap < minOverlap) {
            minOverlap = overlap;
            minCoordinates = { position: this.position, alignment: this.alignment ***REMOVED***;
          ***REMOVED***

          this._reposition();

          $element.offset(__WEBPACK_IMPORTED_MODULE_0__foundation_util_box__["a" /* Box */].GetExplicitOffsets($element, $anchor, this.position, this.alignment, this._getVOffset(), this._getHOffset()));
        ***REMOVED***
        // If we get through the entire loop, there was no non-overlapping
        // position available. Pick the version with least overlap.
        this.position = minCoordinates.position;
        this.alignment = minCoordinates.alignment;
        $element.offset(__WEBPACK_IMPORTED_MODULE_0__foundation_util_box__["a" /* Box */].GetExplicitOffsets($element, $anchor, this.position, this.alignment, this._getVOffset(), this._getHOffset()));
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***]);

  return Positionable;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_1__foundation_plugin__["a" /* Plugin */]);

Positionable.defaults = {
  /**
   * Position of positionable relative to anchor. Can be left, right, bottom, top, or auto.
   * @option
   * @type {string***REMOVED***
   * @default 'auto'
   */
  position: 'auto',
  /**
   * Alignment of positionable relative to anchor. Can be left, right, bottom, top, center, or auto.
   * @option
   * @type {string***REMOVED***
   * @default 'auto'
   */
  alignment: 'auto',
  /**
   * Allow overlap of container/window. If false, dropdown positionable first
   * try to position as defined by data-position and data-alignment, but
   * reposition if it would cause an overflow.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  allowOverlap: false,
  /**
   * Allow overlap of only the bottom of the container. This is the most common
   * behavior for dropdowns, allowing the dropdown to extend the bottom of the
   * screen but not otherwise influence or break out of the container.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  allowBottomOverlap: true,
  /**
   * Number of pixels the positionable should be separated vertically from anchor
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  vOffset: 0,
  /**
   * Number of pixels the positionable should be separated horizontally from anchor
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  hOffset: 0
***REMOVED***;



/***/ ***REMOVED***),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Touch; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************



var Touch = {***REMOVED***;

var startPosX,
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
  if (__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.spotSwipe.preventDefault) {
    e.preventDefault();
  ***REMOVED***
  if (isMoving) {
    var x = e.touches[0].pageX;
    var y = e.touches[0].pageY;
    var dx = startPosX - x;
    var dy = startPosY - y;
    var dir;
    elapsedTime = new Date().getTime() - startTime;
    if (Math.abs(dx) >= __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.spotSwipe.moveThreshold && elapsedTime <= __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.spotSwipe.timeThreshold) {
      dir = dx > 0 ? 'left' : 'right';
    ***REMOVED***
    // else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
    //   dir = dy > 0 ? 'down' : 'up';
    // ***REMOVED***
    if (dir) {
      e.preventDefault();
      onTouchEnd.call(this);
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).trigger('swipe', dir).trigger('swipe' + dir);
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

var SpotSwipe = function () {
  function SpotSwipe($) {
    _classCallCheck(this, SpotSwipe);

    this.version = '1.0.0';
    this.enabled = 'ontouchstart' in document.documentElement;
    this.preventDefault = false;
    this.moveThreshold = 75;
    this.timeThreshold = 200;
    this.$ = $;
    this._init();
  ***REMOVED***

  _createClass(SpotSwipe, [{
    key: '_init',
    value: function _init() {
      var $ = this.$;
      $.event.special.swipe = { setup: init ***REMOVED***;

      $.each(['left', 'up', 'down', 'right'], function () {
        $.event.special['swipe' + this] = { setup: function () {
            $(this).on('swipe', $.noop);
          ***REMOVED*** ***REMOVED***;
      ***REMOVED***);
    ***REMOVED***
  ***REMOVED***]);

  return SpotSwipe;
***REMOVED***();

/****************************************************
 * As far as I can tell, both setupSpotSwipe and    *
 * setupTouchHandler should be idempotent,          *
 * because they directly replace functions &        *
 * values, and do not add event handlers directly.  *
 ****************************************************/

Touch.setupSpotSwipe = function ($) {
  $.spotSwipe = new SpotSwipe($);
***REMOVED***;

/****************************************************
 * Method for adding pseudo drag events to elements *
 ***************************************************/
Touch.setupTouchHandler = function ($) {
  $.fn.addTouch = function () {
    this.each(function (i, el) {
      $(el).bind('touchstart touchmove touchend touchcancel', function () {
        //we pass the original event object because the jQuery event
        //object is normalized to w3c specs and does not provide the TouchList
        handleTouch(event);
      ***REMOVED***);
    ***REMOVED***);

    var handleTouch = function (event) {
      var touches = event.changedTouches,
          first = touches[0],
          eventTypes = {
        touchstart: 'mousedown',
        touchmove: 'mousemove',
        touchend: 'mouseup'
      ***REMOVED***,
          type = eventTypes[event.type],
          simulatedEvent;

      if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
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
        simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
      ***REMOVED***
      first.target.dispatchEvent(simulatedEvent);
    ***REMOVED***;
  ***REMOVED***;
***REMOVED***;

Touch.init = function ($) {
  if (typeof $.spotSwipe === 'undefined') {
    Touch.setupSpotSwipe($);
    Touch.setupTouchHandler($);
  ***REMOVED***
***REMOVED***;



/***/ ***REMOVED***),
/* 17 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Abide; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***




/**
 * Abide module.
 * @module foundation.abide
 */

var Abide = function (_Plugin) {
  _inherits(Abide, _Plugin);

  function Abide() {
    _classCallCheck(this, Abide);

    return _possibleConstructorReturn(this, (Abide.__proto__ || Object.getPrototypeOf(Abide)).apply(this, arguments));
  ***REMOVED***

  _createClass(Abide, [{
    key: '_setup',

    /**
     * Creates a new instance of Abide.
     * @class
     * @name Abide
     * @fires Abide#init
     * @param {Object***REMOVED*** element - jQuery object to add the trigger to.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {***REMOVED***;

      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend(true, {***REMOVED***, Abide.defaults, this.$element.data(), options);

      this.className = 'Abide'; // ie9 back compat
      this._init();
    ***REMOVED***

    /**
     * Initializes the Abide plugin and calls functions to get Abide functioning on load.
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      this.$inputs = this.$element.find('input, textarea, select');

      this._events();
    ***REMOVED***

    /**
     * Initializes events for Abide.
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this3 = this;

      this.$element.off('.abide').on('reset.zf.abide', function () {
        _this3.resetForm();
      ***REMOVED***).on('submit.zf.abide', function () {
        return _this3.validateForm();
      ***REMOVED***);

      if (this.options.validateOn === 'fieldChange') {
        this.$inputs.off('change.zf.abide').on('change.zf.abide', function (e) {
          _this3.validateInput(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target));
        ***REMOVED***);
      ***REMOVED***

      if (this.options.liveValidate) {
        this.$inputs.off('input.zf.abide').on('input.zf.abide', function (e) {
          _this3.validateInput(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target));
        ***REMOVED***);
      ***REMOVED***

      if (this.options.validateOnBlur) {
        this.$inputs.off('blur.zf.abide').on('blur.zf.abide', function (e) {
          _this3.validateInput(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target));
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***

    /**
     * Calls necessary functions to update Abide upon DOM change
     * @private
     */

  ***REMOVED***, {
    key: '_reflow',
    value: function _reflow() {
      this._init();
    ***REMOVED***

    /**
     * Checks whether or not a form element has the required attribute and if it's checked or not
     * @param {Object***REMOVED*** element - jQuery object to check for required attribute
     * @returns {Boolean***REMOVED*** Boolean value depends on whether or not attribute is checked or empty
     */

  ***REMOVED***, {
    key: 'requiredCheck',
    value: function requiredCheck($el) {
      if (!$el.attr('required')) return true;

      var isGood = true;

      switch ($el[0].type) {
        case 'checkbox':
          isGood = $el[0].checked;
          break;

        case 'select':
        case 'select-one':
        case 'select-multiple':
          var opt = $el.find('option:selected');
          if (!opt.length || !opt.val()) isGood = false;
          break;

        default:
          if (!$el.val() || !$el.val().length) isGood = false;
      ***REMOVED***

      return isGood;
    ***REMOVED***

    /**
     * Get:
     * - Based on $el, the first element(s) corresponding to `formErrorSelector` in this order:
     *   1. The element's direct sibling('s).
     *   2. The element's parent's children.
     * - Element(s) with the attribute `[data-form-error-for]` set with the element's id.
     *
     * This allows for multiple form errors per input, though if none are found, no form errors will be shown.
     *
     * @param {Object***REMOVED*** $el - jQuery object to use as reference to find the form error selector.
     * @returns {Object***REMOVED*** jQuery object with the selector.
     */

  ***REMOVED***, {
    key: 'findFormError',
    value: function findFormError($el) {
      var id = $el[0].id;
      var $error = $el.siblings(this.options.formErrorSelector);

      if (!$error.length) {
        $error = $el.parent().find(this.options.formErrorSelector);
      ***REMOVED***

      $error = $error.add(this.$element.find('[data-form-error-for="' + id + '"]'));

      return $error;
    ***REMOVED***

    /**
     * Get the first element in this order:
     * 2. The <label> with the attribute `[for="someInputId"]`
     * 3. The `.closest()` <label>
     *
     * @param {Object***REMOVED*** $el - jQuery object to check for required attribute
     * @returns {Boolean***REMOVED*** Boolean value depends on whether or not attribute is checked or empty
     */

  ***REMOVED***, {
    key: 'findLabel',
    value: function findLabel($el) {
      var id = $el[0].id;
      var $label = this.$element.find('label[for="' + id + '"]');

      if (!$label.length) {
        return $el.closest('label');
      ***REMOVED***

      return $label;
    ***REMOVED***

    /**
     * Get the set of labels associated with a set of radio els in this order
     * 2. The <label> with the attribute `[for="someInputId"]`
     * 3. The `.closest()` <label>
     *
     * @param {Object***REMOVED*** $el - jQuery object to check for required attribute
     * @returns {Boolean***REMOVED*** Boolean value depends on whether or not attribute is checked or empty
     */

  ***REMOVED***, {
    key: 'findRadioLabels',
    value: function findRadioLabels($els) {
      var _this4 = this;

      var labels = $els.map(function (i, el) {
        var id = el.id;
        var $label = _this4.$element.find('label[for="' + id + '"]');

        if (!$label.length) {
          $label = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(el).closest('label');
        ***REMOVED***
        return $label[0];
      ***REMOVED***);

      return __WEBPACK_IMPORTED_MODULE_0_jquery___default()(labels);
    ***REMOVED***

    /**
     * Adds the CSS error class as specified by the Abide settings to the label, input, and the form
     * @param {Object***REMOVED*** $el - jQuery object to add the class to
     */

  ***REMOVED***, {
    key: 'addErrorClasses',
    value: function addErrorClasses($el) {
      var $label = this.findLabel($el);
      var $formError = this.findFormError($el);

      if ($label.length) {
        $label.addClass(this.options.labelErrorClass);
      ***REMOVED***

      if ($formError.length) {
        $formError.addClass(this.options.formErrorClass);
      ***REMOVED***

      $el.addClass(this.options.inputErrorClass).attr('data-invalid', '');
    ***REMOVED***

    /**
     * Remove CSS error classes etc from an entire radio button group
     * @param {String***REMOVED*** groupName - A string that specifies the name of a radio button group
     *
     */

  ***REMOVED***, {
    key: 'removeRadioErrorClasses',
    value: function removeRadioErrorClasses(groupName) {
      var $els = this.$element.find(':radio[name="' + groupName + '"]');
      var $labels = this.findRadioLabels($els);
      var $formErrors = this.findFormError($els);

      if ($labels.length) {
        $labels.removeClass(this.options.labelErrorClass);
      ***REMOVED***

      if ($formErrors.length) {
        $formErrors.removeClass(this.options.formErrorClass);
      ***REMOVED***

      $els.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
    ***REMOVED***

    /**
     * Removes CSS error class as specified by the Abide settings from the label, input, and the form
     * @param {Object***REMOVED*** $el - jQuery object to remove the class from
     */

  ***REMOVED***, {
    key: 'removeErrorClasses',
    value: function removeErrorClasses($el) {
      // radios need to clear all of the els
      if ($el[0].type == 'radio') {
        return this.removeRadioErrorClasses($el.attr('name'));
      ***REMOVED***

      var $label = this.findLabel($el);
      var $formError = this.findFormError($el);

      if ($label.length) {
        $label.removeClass(this.options.labelErrorClass);
      ***REMOVED***

      if ($formError.length) {
        $formError.removeClass(this.options.formErrorClass);
      ***REMOVED***

      $el.removeClass(this.options.inputErrorClass).removeAttr('data-invalid');
    ***REMOVED***

    /**
     * Goes through a form to find inputs and proceeds to validate them in ways specific to their type.
     * Ignores inputs with data-abide-ignore, type="hidden" or disabled attributes set
     * @fires Abide#invalid
     * @fires Abide#valid
     * @param {Object***REMOVED*** element - jQuery object to validate, should be an HTML input
     * @returns {Boolean***REMOVED*** goodToGo - If the input is valid or not.
     */

  ***REMOVED***, {
    key: 'validateInput',
    value: function validateInput($el) {
      var _this5 = this;

      var clearRequire = this.requiredCheck($el),
          validated = false,
          customValidator = true,
          validator = $el.attr('data-validator'),
          equalTo = true;

      // don't validate ignored inputs or hidden inputs or disabled inputs
      if ($el.is('[data-abide-ignore]') || $el.is('[type="hidden"]') || $el.is('[disabled]')) {
        return true;
      ***REMOVED***

      switch ($el[0].type) {
        case 'radio':
          validated = this.validateRadio($el.attr('name'));
          break;

        case 'checkbox':
          validated = clearRequire;
          break;

        case 'select':
        case 'select-one':
        case 'select-multiple':
          validated = clearRequire;
          break;

        default:
          validated = this.validateText($el);
      ***REMOVED***

      if (validator) {
        customValidator = this.matchValidation($el, validator, $el.attr('required'));
      ***REMOVED***

      if ($el.attr('data-equalto')) {
        equalTo = this.options.validators.equalTo($el);
      ***REMOVED***

      var goodToGo = [clearRequire, validated, customValidator, equalTo].indexOf(false) === -1;
      var message = (goodToGo ? 'valid' : 'invalid') + '.zf.abide';

      if (goodToGo) {
        // Re-validate inputs that depend on this one with equalto
        var dependentElements = this.$element.find('[data-equalto="' + $el.attr('id') + '"]');
        if (dependentElements.length) {
          (function () {
            var _this = _this5;
            dependentElements.each(function () {
              if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).val()) {
                _this.validateInput(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this));
              ***REMOVED***
            ***REMOVED***);
          ***REMOVED***)();
        ***REMOVED***
      ***REMOVED***

      this[goodToGo ? 'removeErrorClasses' : 'addErrorClasses']($el);

      /**
       * Fires when the input is done checking for validation. Event trigger is either `valid.zf.abide` or `invalid.zf.abide`
       * Trigger includes the DOM element of the input.
       * @event Abide#valid
       * @event Abide#invalid
       */
      $el.trigger(message, [$el]);

      return goodToGo;
    ***REMOVED***

    /**
     * Goes through a form and if there are any invalid inputs, it will display the form error element
     * @returns {Boolean***REMOVED*** noError - true if no errors were detected...
     * @fires Abide#formvalid
     * @fires Abide#forminvalid
     */

  ***REMOVED***, {
    key: 'validateForm',
    value: function validateForm() {
      var acc = [];
      var _this = this;

      this.$inputs.each(function () {
        acc.push(_this.validateInput(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this)));
      ***REMOVED***);

      var noError = acc.indexOf(false) === -1;

      this.$element.find('[data-abide-error]').css('display', noError ? 'none' : 'block');

      /**
       * Fires when the form is finished validating. Event trigger is either `formvalid.zf.abide` or `forminvalid.zf.abide`.
       * Trigger includes the element of the form.
       * @event Abide#formvalid
       * @event Abide#forminvalid
       */
      this.$element.trigger((noError ? 'formvalid' : 'forminvalid') + '.zf.abide', [this.$element]);

      return noError;
    ***REMOVED***

    /**
     * Determines whether or a not a text input is valid based on the pattern specified in the attribute. If no matching pattern is found, returns true.
     * @param {Object***REMOVED*** $el - jQuery object to validate, should be a text input HTML element
     * @param {String***REMOVED*** pattern - string value of one of the RegEx patterns in Abide.options.patterns
     * @returns {Boolean***REMOVED*** Boolean value depends on whether or not the input value matches the pattern specified
     */

  ***REMOVED***, {
    key: 'validateText',
    value: function validateText($el, pattern) {
      // A pattern can be passed to this function, or it will be infered from the input's "pattern" attribute, or it's "type" attribute
      pattern = pattern || $el.attr('pattern') || $el.attr('type');
      var inputText = $el.val();
      var valid = false;

      if (inputText.length) {
        // If the pattern attribute on the element is in Abide's list of patterns, then test that regexp
        if (this.options.patterns.hasOwnProperty(pattern)) {
          valid = this.options.patterns[pattern].test(inputText);
        ***REMOVED***
        // If the pattern name isn't also the type attribute of the field, then test it as a regexp
        else if (pattern !== $el.attr('type')) {
            valid = new RegExp(pattern).test(inputText);
          ***REMOVED*** else {
            valid = true;
          ***REMOVED***
      ***REMOVED***
      // An empty field is valid if it's not required
      else if (!$el.prop('required')) {
          valid = true;
        ***REMOVED***

      return valid;
    ***REMOVED***

    /**
     * Determines whether or a not a radio input is valid based on whether or not it is required and selected. Although the function targets a single `<input>`, it validates by checking the `required` and `checked` properties of all radio buttons in its group.
     * @param {String***REMOVED*** groupName - A string that specifies the name of a radio button group
     * @returns {Boolean***REMOVED*** Boolean value depends on whether or not at least one radio input has been selected (if it's required)
     */

  ***REMOVED***, {
    key: 'validateRadio',
    value: function validateRadio(groupName) {
      // If at least one radio in the group has the `required` attribute, the group is considered required
      // Per W3C spec, all radio buttons in a group should have `required`, but we're being nice
      var $group = this.$element.find(':radio[name="' + groupName + '"]');
      var valid = false,
          required = false;

      // For the group to be required, at least one radio needs to be required
      $group.each(function (i, e) {
        if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e).attr('required')) {
          required = true;
        ***REMOVED***
      ***REMOVED***);
      if (!required) valid = true;

      if (!valid) {
        // For the group to be valid, at least one radio needs to be checked
        $group.each(function (i, e) {
          if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e).prop('checked')) {
            valid = true;
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***;

      return valid;
    ***REMOVED***

    /**
     * Determines if a selected input passes a custom validation function. Multiple validations can be used, if passed to the element with `data-validator="foo bar baz"` in a space separated listed.
     * @param {Object***REMOVED*** $el - jQuery input element.
     * @param {String***REMOVED*** validators - a string of function names matching functions in the Abide.options.validators object.
     * @param {Boolean***REMOVED*** required - self explanatory?
     * @returns {Boolean***REMOVED*** - true if validations passed.
     */

  ***REMOVED***, {
    key: 'matchValidation',
    value: function matchValidation($el, validators, required) {
      var _this6 = this;

      required = required ? true : false;

      var clear = validators.split(' ').map(function (v) {
        return _this6.options.validators[v]($el, required, $el.parent());
      ***REMOVED***);
      return clear.indexOf(false) === -1;
    ***REMOVED***

    /**
     * Resets form inputs and styles
     * @fires Abide#formreset
     */

  ***REMOVED***, {
    key: 'resetForm',
    value: function resetForm() {
      var $form = this.$element,
          opts = this.options;

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('.' + opts.labelErrorClass, $form).not('small').removeClass(opts.labelErrorClass);
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('.' + opts.inputErrorClass, $form).not('small').removeClass(opts.inputErrorClass);
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(opts.formErrorSelector + '.' + opts.formErrorClass).removeClass(opts.formErrorClass);
      $form.find('[data-abide-error]').css('display', 'none');
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(':input', $form).not(':button, :submit, :reset, :hidden, :radio, :checkbox, [data-abide-ignore]').val('').removeAttr('data-invalid');
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(':input:radio', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(':input:checkbox', $form).not('[data-abide-ignore]').prop('checked', false).removeAttr('data-invalid');
      /**
       * Fires when the form has been reset.
       * @event Abide#formreset
       */
      $form.trigger('formreset.zf.abide', [$form]);
    ***REMOVED***

    /**
     * Destroys an instance of Abide.
     * Removes error styles and classes from elements, without resetting their values.
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      var _this = this;
      this.$element.off('.abide').find('[data-abide-error]').css('display', 'none');

      this.$inputs.off('.abide').each(function () {
        _this.removeErrorClasses(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this));
      ***REMOVED***);
    ***REMOVED***
  ***REMOVED***]);

  return Abide;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_1__foundation_plugin__["a" /* Plugin */]);

/**
 * Default settings for plugin
 */


Abide.defaults = {
  /**
   * The default event to validate inputs. Checkboxes and radios validate immediately.
   * Remove or change this value for manual validation.
   * @option
   * @type {?string***REMOVED***
   * @default 'fieldChange'
   */
  validateOn: 'fieldChange',

  /**
   * Class to be applied to input labels on failed validation.
   * @option
   * @type {string***REMOVED***
   * @default 'is-invalid-label'
   */
  labelErrorClass: 'is-invalid-label',

  /**
   * Class to be applied to inputs on failed validation.
   * @option
   * @type {string***REMOVED***
   * @default 'is-invalid-input'
   */
  inputErrorClass: 'is-invalid-input',

  /**
   * Class selector to use to target Form Errors for show/hide.
   * @option
   * @type {string***REMOVED***
   * @default '.form-error'
   */
  formErrorSelector: '.form-error',

  /**
   * Class added to Form Errors on failed validation.
   * @option
   * @type {string***REMOVED***
   * @default 'is-visible'
   */
  formErrorClass: 'is-visible',

  /**
   * Set to true to validate text inputs on any value change.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  liveValidate: false,

  /**
   * Set to true to validate inputs on blur.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  validateOnBlur: false,

  patterns: {
    alpha: /^[a-zA-Z]+$/,
    alpha_numeric: /^[a-zA-Z0-9]+$/,
    integer: /^[-+]?\d+$/,
    number: /^[-+]?\d*(?:[\.\,]\d+)?$/,

    // amex, visa, diners
    card: /^(?:4[0-9]{12***REMOVED***(?:[0-9]{3***REMOVED***)?|5[1-5][0-9]{14***REMOVED***|(?:222[1-9]|2[3-6][0-9]{2***REMOVED***|27[0-1][0-9]|2720)[0-9]{12***REMOVED***|6(?:011|5[0-9][0-9])[0-9]{12***REMOVED***|3[47][0-9]{13***REMOVED***|3(?:0[0-5]|[68][0-9])[0-9]{11***REMOVED***|(?:2131|1800|35\d{3***REMOVED***)\d{11***REMOVED***)$/,
    cvv: /^([0-9]){3,4***REMOVED***$/,

    // http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#valid-e-mail-address
    email: /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|***REMOVED***~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61***REMOVED***[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61***REMOVED***[a-zA-Z0-9])?)+$/,

    url: /^(https?|ftp|file|ssh):\/\/(((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2***REMOVED***)|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-zA-Z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2***REMOVED***)|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2***REMOVED***)|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2***REMOVED***)|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-zA-Z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2***REMOVED***)|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/,
    // abc.de
    domain: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61***REMOVED***[a-zA-Z0-9])?\.)+[a-zA-Z]{2,8***REMOVED***$/,

    datetime: /^([0-2][0-9]{3***REMOVED***)\-([0-1][0-9])\-([0-3][0-9])T([0-5][0-9])\:([0-5][0-9])\:([0-5][0-9])(Z|([\-\+]([0-1][0-9])\:00))$/,
    // YYYY-MM-DD
    date: /(?:19|20)[0-9]{2***REMOVED***-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-9])|(?:(?!02)(?:0[1-9]|1[0-2])-(?:30))|(?:(?:0[13578]|1[02])-31))$/,
    // HH:MM:SS
    time: /^(0[0-9]|1[0-9]|2[0-3])(:[0-5][0-9]){2***REMOVED***$/,
    dateISO: /^\d{4***REMOVED***[\/\-]\d{1,2***REMOVED***[\/\-]\d{1,2***REMOVED***$/,
    // MM/DD/YYYY
    month_day_year: /^(0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d{4***REMOVED***$/,
    // DD/MM/YYYY
    day_month_year: /^(0[1-9]|[12][0-9]|3[01])[- \/.](0[1-9]|1[012])[- \/.]\d{4***REMOVED***$/,

    // #FFF or #FFFFFF
    color: /^#?([a-fA-F0-9]{6***REMOVED***|[a-fA-F0-9]{3***REMOVED***)$/,

    // Domain || URL
    website: {
      test: function (text) {
        return Abide.defaults.patterns['domain'].test(text) || Abide.defaults.patterns['url'].test(text);
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***,

  /**
   * Optional validation functions to be used. `equalTo` being the only default included function.
   * Functions should return only a boolean if the input is valid or not. Functions are given the following arguments:
   * el : The jQuery element to validate.
   * required : Boolean value of the required attribute be present or not.
   * parent : The direct parent of the input.
   * @option
   */
  validators: {
    equalTo: function (el, required, parent) {
      return __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + el.attr('data-equalto')).val() === el.val();
    ***REMOVED***
  ***REMOVED***
***REMOVED***;



/***/ ***REMOVED***),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Foundation; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__ = __webpack_require__(3);






var FOUNDATION_VERSION = '6.4.2';

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
   * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
   * @param {Object***REMOVED*** plugin - The constructor of the plugin.
   */
  plugin: function (plugin, name) {
    // Object key to use when adding to global Foundation object
    // Examples: Foundation.Reveal, Foundation.OffCanvas
    var className = name || functionName(plugin);
    // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
    // Examples: data-reveal, data-off-canvas
    var attrName = hyphenate(className);

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
  registerPlugin: function (plugin, name) {
    var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
    plugin.uuid = __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["a" /* GetYoDigits */])(6, pluginName);

    if (!plugin.$element.attr('data-' + pluginName)) {
      plugin.$element.attr('data-' + pluginName, plugin.uuid);
    ***REMOVED***
    if (!plugin.$element.data('zfPlugin')) {
      plugin.$element.data('zfPlugin', plugin);
    ***REMOVED***
    /**
     * Fires when the plugin has initialized.
     * @event Plugin#init
     */
    plugin.$element.trigger('init.zf.' + pluginName);

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
  unregisterPlugin: function (plugin) {
    var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

    this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
    plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
    /**
     * Fires when the plugin has been destroyed.
     * @event Plugin#destroyed
     */
    .trigger('destroyed.zf.' + pluginName);
    for (var prop in plugin) {
      plugin[prop] = null; //clean up script to prep for garbage collection.
    ***REMOVED***
    return;
  ***REMOVED***,

  /**
   * @function
   * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
   * @param {String***REMOVED*** plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
   * @default If no argument is passed, reflow all currently active plugins.
   */
  reInit: function (plugins) {
    var isJQ = plugins instanceof __WEBPACK_IMPORTED_MODULE_0_jquery___default.a;
    try {
      if (isJQ) {
        plugins.each(function () {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('zfPlugin')._init();
        ***REMOVED***);
      ***REMOVED*** else {
        var type = typeof plugins,
            _this = this,
            fns = {
          'object': function (plgs) {
            plgs.forEach(function (p) {
              p = hyphenate(p);
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-' + p + ']').foundation('_init');
            ***REMOVED***);
          ***REMOVED***,
          'string': function () {
            plugins = hyphenate(plugins);
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-' + plugins + ']').foundation('_init');
          ***REMOVED***,
          'undefined': function () {
            this['object'](Object.keys(_this._plugins));
          ***REMOVED***
        ***REMOVED***;
        fns[type](plugins);
      ***REMOVED***
    ***REMOVED*** catch (err) {
      console.error(err);
    ***REMOVED*** finally {
      return plugins;
    ***REMOVED***
  ***REMOVED***,

  /**
   * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
   * @param {Object***REMOVED*** elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
   * @param {String|Array***REMOVED*** plugins - A list of plugins to initialize. Leave this out to initialize everything.
   */
  reflow: function (elem, plugins) {

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
    __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.each(plugins, function (i, name) {
      // Get the current plugin
      var plugin = _this._plugins[name];

      // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
      var $elem = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

      // For each plugin found, initialize it
      $elem.each(function () {
        var $el = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            opts = {***REMOVED***;
        // Don't double-dip on plugins
        if ($el.data('zfPlugin')) {
          console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
          return;
        ***REMOVED***

        if ($el.attr('data-options')) {
          var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
            var opt = e.split(':').map(function (el) {
              return el.trim();
            ***REMOVED***);
            if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
          ***REMOVED***);
        ***REMOVED***
        try {
          $el.data('zfPlugin', new plugin(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this), opts));
        ***REMOVED*** catch (er) {
          console.error(er);
        ***REMOVED*** finally {
          return;
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***);
  ***REMOVED***,
  getFnName: functionName,

  addToJquery: function ($) {
    // TODO: consider not making this a jQuery function
    // TODO: need way to reflow vs. re-initialize
    /**
     * The Foundation jQuery method.
     * @param {String|Array***REMOVED*** method - An action to perform on the current jQuery object.
     */
    var foundation = function (method) {
      var type = typeof method,
          $noJS = $('.no-js');

      if ($noJS.length) {
        $noJS.removeClass('no-js');
      ***REMOVED***

      if (type === 'undefined') {
        //needs to initialize the Foundation object, or an individual plugin.
        __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();
        Foundation.reflow(this);
      ***REMOVED*** else if (type === 'string') {
        //an individual method to invoke on a plugin or group of plugins
        var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
        var plugClass = this.data('zfPlugin'); //determine the class of plugin

        if (plugClass !== undefined && plugClass[method] !== undefined) {
          //make sure both the class and method exist
          if (this.length === 1) {
            //if there's only one, call it directly.
            plugClass[method].apply(plugClass, args);
          ***REMOVED*** else {
            this.each(function (i, el) {
              //otherwise loop through the jQuery collection and invoke the method on each
              plugClass[method].apply($(el).data('zfPlugin'), args);
            ***REMOVED***);
          ***REMOVED***
        ***REMOVED*** else {
          //error for no class or no method
          throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
        ***REMOVED***
      ***REMOVED*** else {
        //error for invalid argument type
        throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
      ***REMOVED***
      return this;
    ***REMOVED***;
    $.fn.foundation = foundation;
    return $;
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
      var context = this,
          args = arguments;

      if (timer === null) {
        timer = setTimeout(function () {
          func.apply(context, args);
          timer = null;
        ***REMOVED***, delay);
      ***REMOVED***
    ***REMOVED***;
  ***REMOVED***
***REMOVED***;

window.Foundation = Foundation;

// Polyfill for requestAnimationFrame
(function () {
  if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
    return new Date().getTime();
  ***REMOVED***;

  var vendors = ['webkit', 'moz'];
  for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
  ***REMOVED***
  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
    var lastTime = 0;
    window.requestAnimationFrame = function (callback) {
      var now = Date.now();
      var nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function () {
        callback(lastTime = nextTime);
      ***REMOVED***, nextTime - now);
    ***REMOVED***;
    window.cancelAnimationFrame = clearTimeout;
  ***REMOVED***
  /**
   * Polyfill for performance.now, required by rAF
   */
  if (!window.performance || !window.performance.now) {
    window.performance = {
      start: Date.now(),
      now: function () {
        return Date.now() - this.start;
      ***REMOVED***
    ***REMOVED***;
  ***REMOVED***
***REMOVED***)();
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== 'function') {
      // closest thing possible to the ECMAScript 5
      // internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
    ***REMOVED***

    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {***REMOVED***,
        fBound = function () {
      return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
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
    var results = funcNameRegex.exec(fn.toString());
    return results && results.length > 1 ? results[1].trim() : "";
  ***REMOVED*** else if (fn.prototype === undefined) {
    return fn.constructor.name;
  ***REMOVED*** else {
    return fn.prototype.constructor.name;
  ***REMOVED***
***REMOVED***
function parseValue(str) {
  if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
  return str;
***REMOVED***
// Convert PascalCase to kebab-case
// Thank you: http://stackoverflow.com/a/8955580
function hyphenate(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
***REMOVED***



/***/ ***REMOVED***),
/* 19 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Dropdown; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_positionable__ = __webpack_require__(15);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_util_triggers__ = __webpack_require__(5);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; ***REMOVED*** else { return get(parent, property, receiver); ***REMOVED*** ***REMOVED*** else if ("value" in desc) { return desc.value; ***REMOVED*** else { var getter = desc.get; if (getter === undefined) { return undefined; ***REMOVED*** return getter.call(receiver); ***REMOVED*** ***REMOVED***;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***








/**
 * Dropdown module.
 * @module foundation.dropdown
 * @requires foundation.util.keyboard
 * @requires foundation.util.box
 * @requires foundation.util.triggers
 */

var Dropdown = function (_Positionable) {
  _inherits(Dropdown, _Positionable);

  function Dropdown() {
    _classCallCheck(this, Dropdown);

    return _possibleConstructorReturn(this, (Dropdown.__proto__ || Object.getPrototypeOf(Dropdown)).apply(this, arguments));
  ***REMOVED***

  _createClass(Dropdown, [{
    key: '_setup',

    /**
     * Creates a new instance of a dropdown.
     * @class
     * @name Dropdown
     * @param {jQuery***REMOVED*** element - jQuery object to make into a dropdown.
     *        Object should be of the dropdown panel, rather than its anchor.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Dropdown.defaults, this.$element.data(), options);
      this.className = 'Dropdown'; // ie9 back compat

      // Triggers init is idempotent, just need to make sure it is initialized
      __WEBPACK_IMPORTED_MODULE_4__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

      this._init();

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('Dropdown', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ESCAPE': 'close'
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes the plugin by setting/checking options and attributes, adding helper variables, and saving the anchor.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      var $id = this.$element.attr('id');

      this.$anchors = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-toggle="' + $id + '"]').length ? __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-toggle="' + $id + '"]') : __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-open="' + $id + '"]');
      this.$anchors.attr({
        'aria-controls': $id,
        'data-is-focus': false,
        'data-yeti-box': $id,
        'aria-haspopup': true,
        'aria-expanded': false
      ***REMOVED***);

      this._setCurrentAnchor(this.$anchors.first());

      if (this.options.parentClass) {
        this.$parent = this.$element.parents('.' + this.options.parentClass);
      ***REMOVED*** else {
        this.$parent = null;
      ***REMOVED***

      this.$element.attr({
        'aria-hidden': 'true',
        'data-yeti-box': $id,
        'data-resize': $id,
        'aria-labelledby': this.$currentAnchor.id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["a" /* GetYoDigits */])(6, 'dd-anchor')
      ***REMOVED***);
      _get(Dropdown.prototype.__proto__ || Object.getPrototypeOf(Dropdown.prototype), '_init', this).call(this);
      this._events();
    ***REMOVED***
  ***REMOVED***, {
    key: '_getDefaultPosition',
    value: function _getDefaultPosition() {
      // handle legacy classnames
      var position = this.$element[0].className.match(/(top|left|right|bottom)/g);
      if (position) {
        return position[0];
      ***REMOVED*** else {
        return 'bottom';
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***, {
    key: '_getDefaultAlignment',
    value: function _getDefaultAlignment() {
      // handle legacy float approach
      var horizontalPosition = /float-(\S+)/.exec(this.$currentAnchor.className);
      if (horizontalPosition) {
        return horizontalPosition[1];
      ***REMOVED***

      return _get(Dropdown.prototype.__proto__ || Object.getPrototypeOf(Dropdown.prototype), '_getDefaultAlignment', this).call(this);
    ***REMOVED***

    /**
     * Sets the position and orientation of the dropdown pane, checks for collisions if allow-overlap is not true.
     * Recursively calls itself if a collision is detected, with a new position class.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_setPosition',
    value: function _setPosition() {
      _get(Dropdown.prototype.__proto__ || Object.getPrototypeOf(Dropdown.prototype), '_setPosition', this).call(this, this.$currentAnchor, this.$element, this.$parent);
    ***REMOVED***

    /**
     * Make it a current anchor.
     * Current anchor as the reference for the position of Dropdown panes.
     * @param {HTML***REMOVED*** el - DOM element of the anchor.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_setCurrentAnchor',
    value: function _setCurrentAnchor(el) {
      this.$currentAnchor = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(el);
    ***REMOVED***

    /**
     * Adds event listeners to the element utilizing the triggers utility library.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;
      this.$element.on({
        'open.zf.trigger': this.open.bind(this),
        'close.zf.trigger': this.close.bind(this),
        'toggle.zf.trigger': this.toggle.bind(this),
        'resizeme.zf.trigger': this._setPosition.bind(this)
      ***REMOVED***);

      this.$anchors.off('click.zf.trigger').on('click.zf.trigger', function () {
        _this._setCurrentAnchor(this);
      ***REMOVED***);

      if (this.options.hover) {
        this.$anchors.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function () {
          _this._setCurrentAnchor(this);

          var bodyData = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').data();
          if (typeof bodyData.whatinput === 'undefined' || bodyData.whatinput === 'mouse') {
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function () {
              _this.open();
              _this.$anchors.data('hover', true);
            ***REMOVED***, _this.options.hoverDelay);
          ***REMOVED***
        ***REMOVED***).on('mouseleave.zf.dropdown', function () {
          clearTimeout(_this.timeout);
          _this.timeout = setTimeout(function () {
            _this.close();
            _this.$anchors.data('hover', false);
          ***REMOVED***, _this.options.hoverDelay);
        ***REMOVED***);
        if (this.options.hoverPane) {
          this.$element.off('mouseenter.zf.dropdown mouseleave.zf.dropdown').on('mouseenter.zf.dropdown', function () {
            clearTimeout(_this.timeout);
          ***REMOVED***).on('mouseleave.zf.dropdown', function () {
            clearTimeout(_this.timeout);
            _this.timeout = setTimeout(function () {
              _this.close();
              _this.$anchors.data('hover', false);
            ***REMOVED***, _this.options.hoverDelay);
          ***REMOVED***);
        ***REMOVED***
      ***REMOVED***
      this.$anchors.add(this.$element).on('keydown.zf.dropdown', function (e) {

        var $target = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            visibleFocusableElements = __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].findFocusable(_this.$element);

        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'Dropdown', {
          open: function () {
            if ($target.is(_this.$anchors)) {
              _this.open();
              _this.$element.attr('tabindex', -1).focus();
              e.preventDefault();
            ***REMOVED***
          ***REMOVED***,
          close: function () {
            _this.close();
            _this.$anchors.focus();
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***);
    ***REMOVED***

    /**
     * Adds an event handler to the body to close any dropdowns on a click.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_addBodyHandler',
    value: function _addBodyHandler() {
      var $body = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document.body).not(this.$element),
          _this = this;
      $body.off('click.zf.dropdown').on('click.zf.dropdown', function (e) {
        if (_this.$anchors.is(e.target) || _this.$anchors.find(e.target).length) {
          return;
        ***REMOVED***
        if (_this.$element.find(e.target).length) {
          return;
        ***REMOVED***
        _this.close();
        $body.off('click.zf.dropdown');
      ***REMOVED***);
    ***REMOVED***

    /**
     * Opens the dropdown pane, and fires a bubbling event to close other dropdowns.
     * @function
     * @fires Dropdown#closeme
     * @fires Dropdown#show
     */

  ***REMOVED***, {
    key: 'open',
    value: function open() {
      // var _this = this;
      /**
       * Fires to close other open dropdowns, typically when dropdown is opening
       * @event Dropdown#closeme
       */
      this.$element.trigger('closeme.zf.dropdown', this.$element.attr('id'));
      this.$anchors.addClass('hover').attr({ 'aria-expanded': true ***REMOVED***);
      // this.$element/*.show()*/;

      this.$element.addClass('is-opening');
      this._setPosition();
      this.$element.removeClass('is-opening').addClass('is-open').attr({ 'aria-hidden': false ***REMOVED***);

      if (this.options.autoFocus) {
        var $focusable = __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].findFocusable(this.$element);
        if ($focusable.length) {
          $focusable.eq(0).focus();
        ***REMOVED***
      ***REMOVED***

      if (this.options.closeOnClick) {
        this._addBodyHandler();
      ***REMOVED***

      if (this.options.trapFocus) {
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].trapFocus(this.$element);
      ***REMOVED***

      /**
       * Fires once the dropdown is visible.
       * @event Dropdown#show
       */
      this.$element.trigger('show.zf.dropdown', [this.$element]);
    ***REMOVED***

    /**
     * Closes the open dropdown pane.
     * @function
     * @fires Dropdown#hide
     */

  ***REMOVED***, {
    key: 'close',
    value: function close() {
      if (!this.$element.hasClass('is-open')) {
        return false;
      ***REMOVED***
      this.$element.removeClass('is-open').attr({ 'aria-hidden': true ***REMOVED***);

      this.$anchors.removeClass('hover').attr('aria-expanded', false);

      /**
       * Fires once the dropdown is no longer visible.
       * @event Dropdown#hide
       */
      this.$element.trigger('hide.zf.dropdown', [this.$element]);

      if (this.options.trapFocus) {
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].releaseFocus(this.$element);
      ***REMOVED***
    ***REMOVED***

    /**
     * Toggles the dropdown pane's visibility.
     * @function
     */

  ***REMOVED***, {
    key: 'toggle',
    value: function toggle() {
      if (this.$element.hasClass('is-open')) {
        if (this.$anchors.data('hover')) return;
        this.close();
      ***REMOVED*** else {
        this.open();
      ***REMOVED***
    ***REMOVED***

    /**
     * Destroys the dropdown.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.off('.zf.trigger').hide();
      this.$anchors.off('.zf.dropdown');
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document.body).off('click.zf.dropdown');
    ***REMOVED***
  ***REMOVED***]);

  return Dropdown;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_3__foundation_positionable__["a" /* Positionable */]);

Dropdown.defaults = {
  /**
   * Class that designates bounding container of Dropdown (default: window)
   * @option
   * @type {?string***REMOVED***
   * @default null
   */
  parentClass: null,
  /**
   * Amount of time to delay opening a submenu on hover event.
   * @option
   * @type {number***REMOVED***
   * @default 250
   */
  hoverDelay: 250,
  /**
   * Allow submenus to open on hover events
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  hover: false,
  /**
   * Don't close dropdown when hovering over dropdown pane
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  hoverPane: false,
  /**
   * Number of pixels between the dropdown pane and the triggering element on open.
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  vOffset: 0,
  /**
   * Number of pixels between the dropdown pane and the triggering element on open.
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  hOffset: 0,
  /**
   * DEPRECATED: Class applied to adjust open position.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  positionClass: '',

  /**
   * Position of dropdown. Can be left, right, bottom, top, or auto.
   * @option
   * @type {string***REMOVED***
   * @default 'auto'
   */
  position: 'auto',
  /**
   * Alignment of dropdown relative to anchor. Can be left, right, bottom, top, center, or auto.
   * @option
   * @type {string***REMOVED***
   * @default 'auto'
   */
  alignment: 'auto',
  /**
   * Allow overlap of container/window. If false, dropdown will first try to position as defined by data-position and data-alignment, but reposition if it would cause an overflow.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  allowOverlap: false,
  /**
   * Allow overlap of only the bottom of the container. This is the most common
   * behavior for dropdowns, allowing the dropdown to extend the bottom of the
   * screen but not otherwise influence or break out of the container.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  allowBottomOverlap: true,
  /**
   * Allow the plugin to trap focus to the dropdown pane if opened with keyboard commands.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  trapFocus: false,
  /**
   * Allow the plugin to set focus to the first focusable element within the pane, regardless of method of opening.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  autoFocus: false,
  /**
   * Allows a click on the body to close the dropdown.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  closeOnClick: false
***REMOVED***;



/***/ ***REMOVED***),
/* 20 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Equalizer; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_imageLoader__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***







/**
 * Equalizer module.
 * @module foundation.equalizer
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.imageLoader if equalizer contains images
 */

var Equalizer = function (_Plugin) {
  _inherits(Equalizer, _Plugin);

  function Equalizer() {
    _classCallCheck(this, Equalizer);

    return _possibleConstructorReturn(this, (Equalizer.__proto__ || Object.getPrototypeOf(Equalizer)).apply(this, arguments));
  ***REMOVED***

  _createClass(Equalizer, [{
    key: '_setup',

    /**
     * Creates a new instance of Equalizer.
     * @class
     * @name Equalizer
     * @fires Equalizer#init
     * @param {Object***REMOVED*** element - jQuery object to add the trigger to.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Equalizer.defaults, this.$element.data(), options);
      this.className = 'Equalizer'; // ie9 back compat

      this._init();
    ***REMOVED***

    /**
     * Initializes the Equalizer plugin and calls functions to get equalizer functioning on load.
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      var eqId = this.$element.attr('data-equalizer') || '';
      var $watched = this.$element.find('[data-equalizer-watch="' + eqId + '"]');

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();

      this.$watched = $watched.length ? $watched : this.$element.find('[data-equalizer-watch]');
      this.$element.attr('data-resize', eqId || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["a" /* GetYoDigits */])(6, 'eq'));
      this.$element.attr('data-mutate', eqId || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["a" /* GetYoDigits */])(6, 'eq'));

      this.hasNested = this.$element.find('[data-equalizer]').length > 0;
      this.isNested = this.$element.parentsUntil(document.body, '[data-equalizer]').length > 0;
      this.isOn = false;
      this._bindHandler = {
        onResizeMeBound: this._onResizeMe.bind(this),
        onPostEqualizedBound: this._onPostEqualized.bind(this)
      ***REMOVED***;

      var imgs = this.$element.find('img');
      var tooSmall;
      if (this.options.equalizeOn) {
        tooSmall = this._checkMQ();
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('changed.zf.mediaquery', this._checkMQ.bind(this));
      ***REMOVED*** else {
        this._events();
      ***REMOVED***
      if (tooSmall !== undefined && tooSmall === false || tooSmall === undefined) {
        if (imgs.length) {
          __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_imageLoader__["a" /* onImagesLoaded */])(imgs, this._reflow.bind(this));
        ***REMOVED*** else {
          this._reflow();
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

    /**
     * Removes event listeners if the breakpoint is too small.
     * @private
     */

  ***REMOVED***, {
    key: '_pauseEvents',
    value: function _pauseEvents() {
      this.isOn = false;
      this.$element.off({
        '.zf.equalizer': this._bindHandler.onPostEqualizedBound,
        'resizeme.zf.trigger': this._bindHandler.onResizeMeBound,
        'mutateme.zf.trigger': this._bindHandler.onResizeMeBound
      ***REMOVED***);
    ***REMOVED***

    /**
     * function to handle $elements resizeme.zf.trigger, with bound this on _bindHandler.onResizeMeBound
     * @private
     */

  ***REMOVED***, {
    key: '_onResizeMe',
    value: function _onResizeMe(e) {
      this._reflow();
    ***REMOVED***

    /**
     * function to handle $elements postequalized.zf.equalizer, with bound this on _bindHandler.onPostEqualizedBound
     * @private
     */

  ***REMOVED***, {
    key: '_onPostEqualized',
    value: function _onPostEqualized(e) {
      if (e.target !== this.$element[0]) {
        this._reflow();
      ***REMOVED***
    ***REMOVED***

    /**
     * Initializes events for Equalizer.
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;
      this._pauseEvents();
      if (this.hasNested) {
        this.$element.on('postequalized.zf.equalizer', this._bindHandler.onPostEqualizedBound);
      ***REMOVED*** else {
        this.$element.on('resizeme.zf.trigger', this._bindHandler.onResizeMeBound);
        this.$element.on('mutateme.zf.trigger', this._bindHandler.onResizeMeBound);
      ***REMOVED***
      this.isOn = true;
    ***REMOVED***

    /**
     * Checks the current breakpoint to the minimum required size.
     * @private
     */

  ***REMOVED***, {
    key: '_checkMQ',
    value: function _checkMQ() {
      var tooSmall = !__WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */].is(this.options.equalizeOn);
      if (tooSmall) {
        if (this.isOn) {
          this._pauseEvents();
          this.$watched.css('height', 'auto');
        ***REMOVED***
      ***REMOVED*** else {
        if (!this.isOn) {
          this._events();
        ***REMOVED***
      ***REMOVED***
      return tooSmall;
    ***REMOVED***

    /**
     * A noop version for the plugin
     * @private
     */

  ***REMOVED***, {
    key: '_killswitch',
    value: function _killswitch() {
      return;
    ***REMOVED***

    /**
     * Calls necessary functions to update Equalizer upon DOM change
     * @private
     */

  ***REMOVED***, {
    key: '_reflow',
    value: function _reflow() {
      if (!this.options.equalizeOnStack) {
        if (this._isStacked()) {
          this.$watched.css('height', 'auto');
          return false;
        ***REMOVED***
      ***REMOVED***
      if (this.options.equalizeByRow) {
        this.getHeightsByRow(this.applyHeightByRow.bind(this));
      ***REMOVED*** else {
        this.getHeights(this.applyHeight.bind(this));
      ***REMOVED***
    ***REMOVED***

    /**
     * Manually determines if the first 2 elements are *NOT* stacked.
     * @private
     */

  ***REMOVED***, {
    key: '_isStacked',
    value: function _isStacked() {
      if (!this.$watched[0] || !this.$watched[1]) {
        return true;
      ***REMOVED***
      return this.$watched[0].getBoundingClientRect().top !== this.$watched[1].getBoundingClientRect().top;
    ***REMOVED***

    /**
     * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
     * @param {Function***REMOVED*** cb - A non-optional callback to return the heights array to.
     * @returns {Array***REMOVED*** heights - An array of heights of children within Equalizer container
     */

  ***REMOVED***, {
    key: 'getHeights',
    value: function getHeights(cb) {
      var heights = [];
      for (var i = 0, len = this.$watched.length; i < len; i++) {
        this.$watched[i].style.height = 'auto';
        heights.push(this.$watched[i].offsetHeight);
      ***REMOVED***
      cb(heights);
    ***REMOVED***

    /**
     * Finds the outer heights of children contained within an Equalizer parent and returns them in an array
     * @param {Function***REMOVED*** cb - A non-optional callback to return the heights array to.
     * @returns {Array***REMOVED*** groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
     */

  ***REMOVED***, {
    key: 'getHeightsByRow',
    value: function getHeightsByRow(cb) {
      var lastElTopOffset = this.$watched.length ? this.$watched.first().offset().top : 0,
          groups = [],
          group = 0;
      //group by Row
      groups[group] = [];
      for (var i = 0, len = this.$watched.length; i < len; i++) {
        this.$watched[i].style.height = 'auto';
        //maybe could use this.$watched[i].offsetTop
        var elOffsetTop = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.$watched[i]).offset().top;
        if (elOffsetTop != lastElTopOffset) {
          group++;
          groups[group] = [];
          lastElTopOffset = elOffsetTop;
        ***REMOVED***
        groups[group].push([this.$watched[i], this.$watched[i].offsetHeight]);
      ***REMOVED***

      for (var j = 0, ln = groups.length; j < ln; j++) {
        var heights = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(groups[j]).map(function () {
          return this[1];
        ***REMOVED***).get();
        var max = Math.max.apply(null, heights);
        groups[j].push(max);
      ***REMOVED***
      cb(groups);
    ***REMOVED***

    /**
     * Changes the CSS height property of each child in an Equalizer parent to match the tallest
     * @param {array***REMOVED*** heights - An array of heights of children within Equalizer container
     * @fires Equalizer#preequalized
     * @fires Equalizer#postequalized
     */

  ***REMOVED***, {
    key: 'applyHeight',
    value: function applyHeight(heights) {
      var max = Math.max.apply(null, heights);
      /**
       * Fires before the heights are applied
       * @event Equalizer#preequalized
       */
      this.$element.trigger('preequalized.zf.equalizer');

      this.$watched.css('height', max);

      /**
       * Fires when the heights have been applied
       * @event Equalizer#postequalized
       */
      this.$element.trigger('postequalized.zf.equalizer');
    ***REMOVED***

    /**
     * Changes the CSS height property of each child in an Equalizer parent to match the tallest by row
     * @param {array***REMOVED*** groups - An array of heights of children within Equalizer container grouped by row with element,height and max as last child
     * @fires Equalizer#preequalized
     * @fires Equalizer#preequalizedrow
     * @fires Equalizer#postequalizedrow
     * @fires Equalizer#postequalized
     */

  ***REMOVED***, {
    key: 'applyHeightByRow',
    value: function applyHeightByRow(groups) {
      /**
       * Fires before the heights are applied
       */
      this.$element.trigger('preequalized.zf.equalizer');
      for (var i = 0, len = groups.length; i < len; i++) {
        var groupsILength = groups[i].length,
            max = groups[i][groupsILength - 1];
        if (groupsILength <= 2) {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(groups[i][0][0]).css({ 'height': 'auto' ***REMOVED***);
          continue;
        ***REMOVED***
        /**
          * Fires before the heights per row are applied
          * @event Equalizer#preequalizedrow
          */
        this.$element.trigger('preequalizedrow.zf.equalizer');
        for (var j = 0, lenJ = groupsILength - 1; j < lenJ; j++) {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(groups[i][j][0]).css({ 'height': max ***REMOVED***);
        ***REMOVED***
        /**
          * Fires when the heights per row have been applied
          * @event Equalizer#postequalizedrow
          */
        this.$element.trigger('postequalizedrow.zf.equalizer');
      ***REMOVED***
      /**
       * Fires when the heights have been applied
       */
      this.$element.trigger('postequalized.zf.equalizer');
    ***REMOVED***

    /**
     * Destroys an instance of Equalizer.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this._pauseEvents();
      this.$watched.css('height', 'auto');
    ***REMOVED***
  ***REMOVED***]);

  return Equalizer;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_4__foundation_plugin__["a" /* Plugin */]);

/**
 * Default settings for plugin
 */


Equalizer.defaults = {
  /**
   * Enable height equalization when stacked on smaller screens.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  equalizeOnStack: false,
  /**
   * Enable height equalization row by row.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  equalizeByRow: false,
  /**
   * String representing the minimum breakpoint size the plugin should equalize heights on.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  equalizeOn: ''
***REMOVED***;



/***/ ***REMOVED***),
/* 21 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Interchange; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_core__ = __webpack_require__(1);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***






/**
 * Interchange module.
 * @module foundation.interchange
 * @requires foundation.util.mediaQuery
 */

var Interchange = function (_Plugin) {
  _inherits(Interchange, _Plugin);

  function Interchange() {
    _classCallCheck(this, Interchange);

    return _possibleConstructorReturn(this, (Interchange.__proto__ || Object.getPrototypeOf(Interchange)).apply(this, arguments));
  ***REMOVED***

  _createClass(Interchange, [{
    key: '_setup',

    /**
     * Creates a new instance of Interchange.
     * @class
     * @name Interchange
     * @fires Interchange#init
     * @param {Object***REMOVED*** element - jQuery object to add the trigger to.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Interchange.defaults, options);
      this.rules = [];
      this.currentPath = '';
      this.className = 'Interchange'; // ie9 back compat

      this._init();
      this._events();
    ***REMOVED***

    /**
     * Initializes the Interchange plugin and calls functions to get interchange functioning on load.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();

      var id = this.$element[0].id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["a" /* GetYoDigits */])(6, 'interchange');
      this.$element.attr({
        'data-resize': id,
        'id': id
      ***REMOVED***);

      this._addBreakpoints();
      this._generateRules();
      this._reflow();
    ***REMOVED***

    /**
     * Initializes events for Interchange.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this3 = this;

      this.$element.off('resizeme.zf.trigger').on('resizeme.zf.trigger', function () {
        return _this3._reflow();
      ***REMOVED***);
    ***REMOVED***

    /**
     * Calls necessary functions to update Interchange upon DOM change
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_reflow',
    value: function _reflow() {
      var match;

      // Iterate through each rule, but only save the last match
      for (var i in this.rules) {
        if (this.rules.hasOwnProperty(i)) {
          var rule = this.rules[i];
          if (window.matchMedia(rule.query).matches) {
            match = rule;
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***

      if (match) {
        this.replace(match.path);
      ***REMOVED***
    ***REMOVED***

    /**
     * Gets the Foundation breakpoints and adds them to the Interchange.SPECIAL_QUERIES object.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_addBreakpoints',
    value: function _addBreakpoints() {
      for (var i in __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */].queries) {
        if (__WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */].queries.hasOwnProperty(i)) {
          var query = __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */].queries[i];
          Interchange.SPECIAL_QUERIES[query.name] = query.value;
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

    /**
     * Checks the Interchange element for the provided media query + content pairings
     * @function
     * @private
     * @param {Object***REMOVED*** element - jQuery object that is an Interchange instance
     * @returns {Array***REMOVED*** scenarios - Array of objects that have 'mq' and 'path' keys with corresponding keys
     */

  ***REMOVED***, {
    key: '_generateRules',
    value: function _generateRules(element) {
      var rulesList = [];
      var rules;

      if (this.options.rules) {
        rules = this.options.rules;
      ***REMOVED*** else {
        rules = this.$element.data('interchange');
      ***REMOVED***

      rules = typeof rules === 'string' ? rules.match(/\[.*?\]/g) : rules;

      for (var i in rules) {
        if (rules.hasOwnProperty(i)) {
          var rule = rules[i].slice(1, -1).split(', ');
          var path = rule.slice(0, -1).join('');
          var query = rule[rule.length - 1];

          if (Interchange.SPECIAL_QUERIES[query]) {
            query = Interchange.SPECIAL_QUERIES[query];
          ***REMOVED***

          rulesList.push({
            path: path,
            query: query
          ***REMOVED***);
        ***REMOVED***
      ***REMOVED***

      this.rules = rulesList;
    ***REMOVED***

    /**
     * Update the `src` property of an image, or change the HTML of a container, to the specified path.
     * @function
     * @param {String***REMOVED*** path - Path to the image or HTML partial.
     * @fires Interchange#replaced
     */

  ***REMOVED***, {
    key: 'replace',
    value: function replace(path) {
      if (this.currentPath === path) return;

      var _this = this,
          trigger = 'replaced.zf.interchange';

      // Replacing images
      if (this.$element[0].nodeName === 'IMG') {
        this.$element.attr('src', path).on('load', function () {
          _this.currentPath = path;
        ***REMOVED***).trigger(trigger);
      ***REMOVED***
      // Replacing background images
      else if (path.match(/\.(gif|jpg|jpeg|png|svg|tiff)([?#].*)?/i)) {
          path = path.replace(/\(/g, '%28').replace(/\)/g, '%29');
          this.$element.css({ 'background-image': 'url(' + path + ')' ***REMOVED***).trigger(trigger);
        ***REMOVED***
        // Replacing HTML
        else {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.get(path, function (response) {
              _this.$element.html(response).trigger(trigger);
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()(response).foundation();
              _this.currentPath = path;
            ***REMOVED***);
          ***REMOVED***

      /**
       * Fires when content in an Interchange element is done being loaded.
       * @event Interchange#replaced
       */
      // this.$element.trigger('replaced.zf.interchange');
    ***REMOVED***

    /**
     * Destroys an instance of interchange.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.off('resizeme.zf.trigger');
    ***REMOVED***
  ***REMOVED***]);

  return Interchange;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_2__foundation_plugin__["a" /* Plugin */]);

/**
 * Default settings for plugin
 */


Interchange.defaults = {
  /**
   * Rules to be applied to Interchange elements. Set with the `data-interchange` array notation.
   * @option
   * @type {?array***REMOVED***
   * @default null
   */
  rules: null
***REMOVED***;

Interchange.SPECIAL_QUERIES = {
  'landscape': 'screen and (orientation: landscape)',
  'portrait': 'screen and (orientation: portrait)',
  'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
***REMOVED***;



/***/ ***REMOVED***),
/* 22 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Magellan; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_smoothScroll__ = __webpack_require__(33);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***






/**
 * Magellan module.
 * @module foundation.magellan
 * @requires foundation.smoothScroll
 */

var Magellan = function (_Plugin) {
  _inherits(Magellan, _Plugin);

  function Magellan() {
    _classCallCheck(this, Magellan);

    return _possibleConstructorReturn(this, (Magellan.__proto__ || Object.getPrototypeOf(Magellan)).apply(this, arguments));
  ***REMOVED***

  _createClass(Magellan, [{
    key: '_setup',

    /**
     * Creates a new instance of Magellan.
     * @class
     * @name Magellan
     * @fires Magellan#init
     * @param {Object***REMOVED*** element - jQuery object to add the trigger to.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Magellan.defaults, this.$element.data(), options);
      this.className = 'Magellan'; // ie9 back compat

      this._init();
      this.calcPoints();
    ***REMOVED***

    /**
     * Initializes the Magellan plugin and calls functions to get equalizer functioning on load.
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      var id = this.$element[0].id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["a" /* GetYoDigits */])(6, 'magellan');
      var _this = this;
      this.$targets = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-magellan-target]');
      this.$links = this.$element.find('a');
      this.$element.attr({
        'data-resize': id,
        'data-scroll': id,
        'id': id
      ***REMOVED***);
      this.$active = __WEBPACK_IMPORTED_MODULE_0_jquery___default()();
      this.scrollPos = parseInt(window.pageYOffset, 10);

      this._events();
    ***REMOVED***

    /**
     * Calculates an array of pixel values that are the demarcation lines between locations on the page.
     * Can be invoked if new elements are added or the size of a location changes.
     * @function
     */

  ***REMOVED***, {
    key: 'calcPoints',
    value: function calcPoints() {
      var _this = this,
          body = document.body,
          html = document.documentElement;

      this.points = [];
      this.winHeight = Math.round(Math.max(window.innerHeight, html.clientHeight));
      this.docHeight = Math.round(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight));

      this.$targets.each(function () {
        var $tar = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            pt = Math.round($tar.offset().top - _this.options.threshold);
        $tar.targetPoint = pt;
        _this.points.push(pt);
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes events for Magellan.
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this,
          $body = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body'),
          opts = {
        duration: _this.options.animationDuration,
        easing: _this.options.animationEasing
      ***REMOVED***;
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).one('load', function () {
        if (_this.options.deepLinking) {
          if (location.hash) {
            _this.scrollToLoc(location.hash);
          ***REMOVED***
        ***REMOVED***
        _this.calcPoints();
        _this._updateActive();
      ***REMOVED***);

      this.$element.on({
        'resizeme.zf.trigger': this.reflow.bind(this),
        'scrollme.zf.trigger': this._updateActive.bind(this)
      ***REMOVED***).on('click.zf.magellan', 'a[href^="#"]', function (e) {
        e.preventDefault();
        var arrival = this.getAttribute('href');
        _this.scrollToLoc(arrival);
      ***REMOVED***);

      this._deepLinkScroll = function (e) {
        if (_this.options.deepLinking) {
          _this.scrollToLoc(window.location.hash);
        ***REMOVED***
      ***REMOVED***;

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('popstate', this._deepLinkScroll);
    ***REMOVED***

    /**
     * Function to scroll to a given location on the page.
     * @param {String***REMOVED*** loc - a properly formatted jQuery id selector. Example: '#foo'
     * @function
     */

  ***REMOVED***, {
    key: 'scrollToLoc',
    value: function scrollToLoc(loc) {
      this._inTransition = true;
      var _this = this;

      var options = {
        animationEasing: this.options.animationEasing,
        animationDuration: this.options.animationDuration,
        threshold: this.options.threshold,
        offset: this.options.offset
      ***REMOVED***;

      __WEBPACK_IMPORTED_MODULE_3__foundation_smoothScroll__["a" /* SmoothScroll */].scrollToLoc(loc, options, function () {
        _this._inTransition = false;
        _this._updateActive();
      ***REMOVED***);
    ***REMOVED***

    /**
     * Calls necessary functions to update Magellan upon DOM change
     * @function
     */

  ***REMOVED***, {
    key: 'reflow',
    value: function reflow() {
      this.calcPoints();
      this._updateActive();
    ***REMOVED***

    /**
     * Updates the visibility of an active location link, and updates the url hash for the page, if deepLinking enabled.
     * @private
     * @function
     * @fires Magellan#update
     */

  ***REMOVED***, {
    key: '_updateActive',
    value: function _updateActive() /*evt, elem, scrollPos*/{
      if (this._inTransition) {
        return;
      ***REMOVED***
      var winPos = /*scrollPos ||*/parseInt(window.pageYOffset, 10),
          curIdx;

      if (winPos + this.winHeight === this.docHeight) {
        curIdx = this.points.length - 1;
      ***REMOVED*** else if (winPos < this.points[0]) {
        curIdx = undefined;
      ***REMOVED*** else {
        var isDown = this.scrollPos < winPos,
            _this = this,
            curVisible = this.points.filter(function (p, i) {
          return isDown ? p - _this.options.offset <= winPos : p - _this.options.offset - _this.options.threshold <= winPos;
        ***REMOVED***);
        curIdx = curVisible.length ? curVisible.length - 1 : 0;
      ***REMOVED***

      this.$active.removeClass(this.options.activeClass);
      this.$active = this.$links.filter('[href="#' + this.$targets.eq(curIdx).data('magellan-target') + '"]').addClass(this.options.activeClass);

      if (this.options.deepLinking) {
        var hash = "";
        if (curIdx != undefined) {
          hash = this.$active[0].getAttribute('href');
        ***REMOVED***
        if (hash !== window.location.hash) {
          if (window.history.pushState) {
            window.history.pushState(null, null, hash);
          ***REMOVED*** else {
            window.location.hash = hash;
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***

      this.scrollPos = winPos;
      /**
       * Fires when magellan is finished updating to the new active element.
       * @event Magellan#update
       */
      this.$element.trigger('update.zf.magellan', [this.$active]);
    ***REMOVED***

    /**
     * Destroys an instance of Magellan and resets the url of the window.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.off('.zf.trigger .zf.magellan').find('.' + this.options.activeClass).removeClass(this.options.activeClass);

      if (this.options.deepLinking) {
        var hash = this.$active[0].getAttribute('href');
        window.location.hash.replace(hash, '');
      ***REMOVED***
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('popstate', this._deepLinkScroll);
    ***REMOVED***
  ***REMOVED***]);

  return Magellan;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_2__foundation_plugin__["a" /* Plugin */]);

/**
 * Default settings for plugin
 */


Magellan.defaults = {
  /**
   * Amount of time, in ms, the animated scrolling should take between locations.
   * @option
   * @type {number***REMOVED***
   * @default 500
   */
  animationDuration: 500,
  /**
   * Animation style to use when scrolling between locations. Can be `'swing'` or `'linear'`.
   * @option
   * @type {string***REMOVED***
   * @default 'linear'
   * @see {@link https://api.jquery.com/animate|Jquery animate***REMOVED***
   */
  animationEasing: 'linear',
  /**
   * Number of pixels to use as a marker for location changes.
   * @option
   * @type {number***REMOVED***
   * @default 50
   */
  threshold: 50,
  /**
   * Class applied to the active locations link on the magellan container.
   * @option
   * @type {string***REMOVED***
   * @default 'is-active'
   */
  activeClass: 'is-active',
  /**
   * Allows the script to manipulate the url of the current page, and if supported, alter the history.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  deepLinking: false,
  /**
   * Number of pixels to offset the scroll of the page on item click if using a sticky nav bar.
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  offset: 0
***REMOVED***;



/***/ ***REMOVED***),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return OffCanvas; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__foundation_util_triggers__ = __webpack_require__(5);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***









/**
 * OffCanvas module.
 * @module foundation.offcanvas
 * @requires foundation.util.keyboard
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.triggers
 */

var OffCanvas = function (_Plugin) {
  _inherits(OffCanvas, _Plugin);

  function OffCanvas() {
    _classCallCheck(this, OffCanvas);

    return _possibleConstructorReturn(this, (OffCanvas.__proto__ || Object.getPrototypeOf(OffCanvas)).apply(this, arguments));
  ***REMOVED***

  _createClass(OffCanvas, [{
    key: '_setup',

    /**
     * Creates a new instance of an off-canvas wrapper.
     * @class
     * @name OffCanvas
     * @fires OffCanvas#init
     * @param {Object***REMOVED*** element - jQuery object to initialize.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      var _this3 = this;

      this.className = 'OffCanvas'; // ie9 back compat
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, OffCanvas.defaults, this.$element.data(), options);
      this.contentClasses = { base: [], reveal: [] ***REMOVED***;
      this.$lastTrigger = __WEBPACK_IMPORTED_MODULE_0_jquery___default()();
      this.$triggers = __WEBPACK_IMPORTED_MODULE_0_jquery___default()();
      this.position = 'left';
      this.$content = __WEBPACK_IMPORTED_MODULE_0_jquery___default()();
      this.nested = !!this.options.nested;

      // Defines the CSS transition/position classes of the off-canvas content container.
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(['push', 'overlap']).each(function (index, val) {
        _this3.contentClasses.base.push('has-transition-' + val);
      ***REMOVED***);
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(['left', 'right', 'top', 'bottom']).each(function (index, val) {
        _this3.contentClasses.base.push('has-position-' + val);
        _this3.contentClasses.reveal.push('has-reveal-' + val);
      ***REMOVED***);

      // Triggers init is idempotent, just need to make sure it is initialized
      __WEBPACK_IMPORTED_MODULE_5__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();

      this._init();
      this._events();

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('OffCanvas', {
        'ESCAPE': 'close'
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes the off-canvas wrapper by adding the exit overlay (if needed).
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      var id = this.$element.attr('id');

      this.$element.attr('aria-hidden', 'true');

      // Find off-canvas content, either by ID (if specified), by siblings or by closest selector (fallback)
      if (this.options.contentId) {
        this.$content = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + this.options.contentId);
      ***REMOVED*** else if (this.$element.siblings('[data-off-canvas-content]').length) {
        this.$content = this.$element.siblings('[data-off-canvas-content]').first();
      ***REMOVED*** else {
        this.$content = this.$element.closest('[data-off-canvas-content]').first();
      ***REMOVED***

      if (!this.options.contentId) {
        // Assume that the off-canvas element is nested if it isn't a sibling of the content
        this.nested = this.$element.siblings('[data-off-canvas-content]').length === 0;
      ***REMOVED*** else if (this.options.contentId && this.options.nested === null) {
        // Warning if using content ID without setting the nested option
        // Once the element is nested it is required to work properly in this case
        console.warn('Remember to use the nested option if using the content ID option!');
      ***REMOVED***

      if (this.nested === true) {
        // Force transition overlap if nested
        this.options.transition = 'overlap';
        // Remove appropriate classes if already assigned in markup
        this.$element.removeClass('is-transition-push');
      ***REMOVED***

      this.$element.addClass('is-transition-' + this.options.transition + ' is-closed');

      // Find triggers that affect this element and add aria-expanded to them
      this.$triggers = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(document).find('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-expanded', 'false').attr('aria-controls', id);

      // Get position by checking for related CSS class
      this.position = this.$element.is('.position-left, .position-top, .position-right, .position-bottom') ? this.$element.attr('class').match(/position\-(left|top|right|bottom)/)[1] : this.position;

      // Add an overlay over the content if necessary
      if (this.options.contentOverlay === true) {
        var overlay = document.createElement('div');
        var overlayPosition = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.$element).css("position") === 'fixed' ? 'is-overlay-fixed' : 'is-overlay-absolute';
        overlay.setAttribute('class', 'js-off-canvas-overlay ' + overlayPosition);
        this.$overlay = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(overlay);
        if (overlayPosition === 'is-overlay-fixed') {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.$overlay).insertAfter(this.$element);
        ***REMOVED*** else {
          this.$content.append(this.$overlay);
        ***REMOVED***
      ***REMOVED***

      this.options.isRevealed = this.options.isRevealed || new RegExp(this.options.revealClass, 'g').test(this.$element[0].className);

      if (this.options.isRevealed === true) {
        this.options.revealOn = this.options.revealOn || this.$element[0].className.match(/(reveal-for-medium|reveal-for-large)/g)[0].split('-')[2];
        this._setMQChecker();
      ***REMOVED***

      if (this.options.transitionTime) {
        this.$element.css('transition-duration', this.options.transitionTime);
      ***REMOVED***

      // Initally remove all transition/position CSS classes from off-canvas content container.
      this._removeContentClasses();
    ***REMOVED***

    /**
     * Adds event handlers to the off-canvas wrapper and the exit overlay.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      this.$element.off('.zf.trigger .zf.offcanvas').on({
        'open.zf.trigger': this.open.bind(this),
        'close.zf.trigger': this.close.bind(this),
        'toggle.zf.trigger': this.toggle.bind(this),
        'keydown.zf.offcanvas': this._handleKeyboard.bind(this)
      ***REMOVED***);

      if (this.options.closeOnClick === true) {
        var $target = this.options.contentOverlay ? this.$overlay : this.$content;
        $target.on({ 'click.zf.offcanvas': this.close.bind(this) ***REMOVED***);
      ***REMOVED***
    ***REMOVED***

    /**
     * Applies event listener for elements that will reveal at certain breakpoints.
     * @private
     */

  ***REMOVED***, {
    key: '_setMQChecker',
    value: function _setMQChecker() {
      var _this = this;

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('changed.zf.mediaquery', function () {
        if (__WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */].atLeast(_this.options.revealOn)) {
          _this.reveal(true);
        ***REMOVED*** else {
          _this.reveal(false);
        ***REMOVED***
      ***REMOVED***).one('load.zf.offcanvas', function () {
        if (__WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */].atLeast(_this.options.revealOn)) {
          _this.reveal(true);
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
     * Removes the CSS transition/position classes of the off-canvas content container.
     * Removing the classes is important when another off-canvas gets opened that uses the same content container.
     * @param {Boolean***REMOVED*** hasReveal - true if related off-canvas element is revealed.
     * @private
     */

  ***REMOVED***, {
    key: '_removeContentClasses',
    value: function _removeContentClasses(hasReveal) {
      if (typeof hasReveal !== 'boolean') {
        this.$content.removeClass(this.contentClasses.base.join(' '));
      ***REMOVED*** else if (hasReveal === false) {
        this.$content.removeClass('has-reveal-' + this.position);
      ***REMOVED***
    ***REMOVED***

    /**
     * Adds the CSS transition/position classes of the off-canvas content container, based on the opening off-canvas element.
     * Beforehand any transition/position class gets removed.
     * @param {Boolean***REMOVED*** hasReveal - true if related off-canvas element is revealed.
     * @private
     */

  ***REMOVED***, {
    key: '_addContentClasses',
    value: function _addContentClasses(hasReveal) {
      this._removeContentClasses(hasReveal);
      if (typeof hasReveal !== 'boolean') {
        this.$content.addClass('has-transition-' + this.options.transition + ' has-position-' + this.position);
      ***REMOVED*** else if (hasReveal === true) {
        this.$content.addClass('has-reveal-' + this.position);
      ***REMOVED***
    ***REMOVED***

    /**
     * Handles the revealing/hiding the off-canvas at breakpoints, not the same as open.
     * @param {Boolean***REMOVED*** isRevealed - true if element should be revealed.
     * @function
     */

  ***REMOVED***, {
    key: 'reveal',
    value: function reveal(isRevealed) {
      if (isRevealed) {
        this.close();
        this.isRevealed = true;
        this.$element.attr('aria-hidden', 'false');
        this.$element.off('open.zf.trigger toggle.zf.trigger');
        this.$element.removeClass('is-closed');
      ***REMOVED*** else {
        this.isRevealed = false;
        this.$element.attr('aria-hidden', 'true');
        this.$element.off('open.zf.trigger toggle.zf.trigger').on({
          'open.zf.trigger': this.open.bind(this),
          'toggle.zf.trigger': this.toggle.bind(this)
        ***REMOVED***);
        this.$element.addClass('is-closed');
      ***REMOVED***
      this._addContentClasses(isRevealed);
    ***REMOVED***

    /**
     * Stops scrolling of the body when offcanvas is open on mobile Safari and other troublesome browsers.
     * @private
     */

  ***REMOVED***, {
    key: '_stopScrolling',
    value: function _stopScrolling(event) {
      return false;
    ***REMOVED***

    // Taken and adapted from http://stackoverflow.com/questions/16889447/prevent-full-page-scrolling-ios
    // Only really works for y, not sure how to extend to x or if we need to.

  ***REMOVED***, {
    key: '_recordScrollable',
    value: function _recordScrollable(event) {
      var elem = this; // called from event handler context with this as elem

      // If the element is scrollable (content overflows), then...
      if (elem.scrollHeight !== elem.clientHeight) {
        // If we're at the top, scroll down one pixel to allow scrolling up
        if (elem.scrollTop === 0) {
          elem.scrollTop = 1;
        ***REMOVED***
        // If we're at the bottom, scroll up one pixel to allow scrolling down
        if (elem.scrollTop === elem.scrollHeight - elem.clientHeight) {
          elem.scrollTop = elem.scrollHeight - elem.clientHeight - 1;
        ***REMOVED***
      ***REMOVED***
      elem.allowUp = elem.scrollTop > 0;
      elem.allowDown = elem.scrollTop < elem.scrollHeight - elem.clientHeight;
      elem.lastY = event.originalEvent.pageY;
    ***REMOVED***
  ***REMOVED***, {
    key: '_stopScrollPropagation',
    value: function _stopScrollPropagation(event) {
      var elem = this; // called from event handler context with this as elem
      var up = event.pageY < elem.lastY;
      var down = !up;
      elem.lastY = event.pageY;

      if (up && elem.allowUp || down && elem.allowDown) {
        event.stopPropagation();
      ***REMOVED*** else {
        event.preventDefault();
      ***REMOVED***
    ***REMOVED***

    /**
     * Opens the off-canvas menu.
     * @function
     * @param {Object***REMOVED*** event - Event object passed from listener.
     * @param {jQuery***REMOVED*** trigger - element that triggered the off-canvas to open.
     * @fires OffCanvas#opened
     */

  ***REMOVED***, {
    key: 'open',
    value: function open(event, trigger) {
      if (this.$element.hasClass('is-open') || this.isRevealed) {
        return;
      ***REMOVED***
      var _this = this;

      if (trigger) {
        this.$lastTrigger = trigger;
      ***REMOVED***

      if (this.options.forceTo === 'top') {
        window.scrollTo(0, 0);
      ***REMOVED*** else if (this.options.forceTo === 'bottom') {
        window.scrollTo(0, document.body.scrollHeight);
      ***REMOVED***

      if (this.options.transitionTime && this.options.transition !== 'overlap') {
        this.$element.siblings('[data-off-canvas-content]').css('transition-duration', this.options.transitionTime);
      ***REMOVED*** else {
        this.$element.siblings('[data-off-canvas-content]').css('transition-duration', '');
      ***REMOVED***

      /**
       * Fires when the off-canvas menu opens.
       * @event OffCanvas#opened
       */
      this.$element.addClass('is-open').removeClass('is-closed');

      this.$triggers.attr('aria-expanded', 'true');
      this.$element.attr('aria-hidden', 'false').trigger('opened.zf.offcanvas');

      this.$content.addClass('is-open-' + this.position);

      // If `contentScroll` is set to false, add class and disable scrolling on touch devices.
      if (this.options.contentScroll === false) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').addClass('is-off-canvas-open').on('touchmove', this._stopScrolling);
        this.$element.on('touchstart', this._recordScrollable);
        this.$element.on('touchmove', this._stopScrollPropagation);
      ***REMOVED***

      if (this.options.contentOverlay === true) {
        this.$overlay.addClass('is-visible');
      ***REMOVED***

      if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
        this.$overlay.addClass('is-closable');
      ***REMOVED***

      if (this.options.autoFocus === true) {
        this.$element.one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["c" /* transitionend */])(this.$element), function () {
          if (!_this.$element.hasClass('is-open')) {
            return; // exit if prematurely closed
          ***REMOVED***
          var canvasFocus = _this.$element.find('[data-autofocus]');
          if (canvasFocus.length) {
            canvasFocus.eq(0).focus();
          ***REMOVED*** else {
            _this.$element.find('a, button').eq(0).focus();
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***

      if (this.options.trapFocus === true) {
        this.$content.attr('tabindex', '-1');
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].trapFocus(this.$element);
      ***REMOVED***

      this._addContentClasses();
    ***REMOVED***

    /**
     * Closes the off-canvas menu.
     * @function
     * @param {Function***REMOVED*** cb - optional cb to fire after closure.
     * @fires OffCanvas#closed
     */

  ***REMOVED***, {
    key: 'close',
    value: function close(cb) {
      if (!this.$element.hasClass('is-open') || this.isRevealed) {
        return;
      ***REMOVED***

      var _this = this;

      this.$element.removeClass('is-open');

      this.$element.attr('aria-hidden', 'true')
      /**
       * Fires when the off-canvas menu opens.
       * @event OffCanvas#closed
       */
      .trigger('closed.zf.offcanvas');

      this.$content.removeClass('is-open-left is-open-top is-open-right is-open-bottom');

      // If `contentScroll` is set to false, remove class and re-enable scrolling on touch devices.
      if (this.options.contentScroll === false) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').removeClass('is-off-canvas-open').off('touchmove', this._stopScrolling);
        this.$element.off('touchstart', this._recordScrollable);
        this.$element.off('touchmove', this._stopScrollPropagation);
      ***REMOVED***

      if (this.options.contentOverlay === true) {
        this.$overlay.removeClass('is-visible');
      ***REMOVED***

      if (this.options.closeOnClick === true && this.options.contentOverlay === true) {
        this.$overlay.removeClass('is-closable');
      ***REMOVED***

      this.$triggers.attr('aria-expanded', 'false');

      if (this.options.trapFocus === true) {
        this.$content.removeAttr('tabindex');
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].releaseFocus(this.$element);
      ***REMOVED***

      // Listen to transitionEnd and add class when done.
      this.$element.one(__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["c" /* transitionend */])(this.$element), function (e) {
        _this.$element.addClass('is-closed');
        _this._removeContentClasses();
      ***REMOVED***);
    ***REMOVED***

    /**
     * Toggles the off-canvas menu open or closed.
     * @function
     * @param {Object***REMOVED*** event - Event object passed from listener.
     * @param {jQuery***REMOVED*** trigger - element that triggered the off-canvas to open.
     */

  ***REMOVED***, {
    key: 'toggle',
    value: function toggle(event, trigger) {
      if (this.$element.hasClass('is-open')) {
        this.close(event, trigger);
      ***REMOVED*** else {
        this.open(event, trigger);
      ***REMOVED***
    ***REMOVED***

    /**
     * Handles keyboard input when detected. When the escape key is pressed, the off-canvas menu closes, and focus is restored to the element that opened the menu.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_handleKeyboard',
    value: function _handleKeyboard(e) {
      var _this4 = this;

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'OffCanvas', {
        close: function () {
          _this4.close();
          _this4.$lastTrigger.focus();
          return true;
        ***REMOVED***,
        handled: function () {
          e.stopPropagation();
          e.preventDefault();
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
     * Destroys the offcanvas plugin.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.close();
      this.$element.off('.zf.trigger .zf.offcanvas');
      this.$overlay.off('.zf.offcanvas');
    ***REMOVED***
  ***REMOVED***]);

  return OffCanvas;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_4__foundation_plugin__["a" /* Plugin */]);

OffCanvas.defaults = {
  /**
   * Allow the user to click outside of the menu to close it.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  closeOnClick: true,

  /**
   * Adds an overlay on top of `[data-off-canvas-content]`.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  contentOverlay: true,

  /**
   * Target an off-canvas content container by ID that may be placed anywhere. If null the closest content container will be taken.
   * @option
   * @type {?string***REMOVED***
   * @default null
   */
  contentId: null,

  /**
   * Define the off-canvas element is nested in an off-canvas content. This is required when using the contentId option for a nested element.
   * @option
   * @type {boolean***REMOVED***
   * @default null
   */
  nested: null,

  /**
   * Enable/disable scrolling of the main content when an off canvas panel is open.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  contentScroll: true,

  /**
   * Amount of time in ms the open and close transition requires. If none selected, pulls from body style.
   * @option
   * @type {number***REMOVED***
   * @default null
   */
  transitionTime: null,

  /**
   * Type of transition for the offcanvas menu. Options are 'push', 'detached' or 'slide'.
   * @option
   * @type {string***REMOVED***
   * @default push
   */
  transition: 'push',

  /**
   * Force the page to scroll to top or bottom on open.
   * @option
   * @type {?string***REMOVED***
   * @default null
   */
  forceTo: null,

  /**
   * Allow the offcanvas to remain open for certain breakpoints.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  isRevealed: false,

  /**
   * Breakpoint at which to reveal. JS will use a RegExp to target standard classes, if changing classnames, pass your class with the `revealClass` option.
   * @option
   * @type {?string***REMOVED***
   * @default null
   */
  revealOn: null,

  /**
   * Force focus to the offcanvas on open. If true, will focus the opening trigger on close.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  autoFocus: true,

  /**
   * Class used to force an offcanvas to remain open. Foundation defaults for this are `reveal-for-large` & `reveal-for-medium`.
   * @option
   * @type {string***REMOVED***
   * @default reveal-for-
   * @todo improve the regex testing for this.
   */
  revealClass: 'reveal-for-',

  /**
   * Triggers optional focus trapping when opening an offcanvas. Sets tabindex of [data-off-canvas-content] to -1 for accessibility purposes.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  trapFocus: false
***REMOVED***;



/***/ ***REMOVED***),
/* 24 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Orbit; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_timer__ = __webpack_require__(34);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_util_imageLoader__ = __webpack_require__(8);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__foundation_util_touch__ = __webpack_require__(16);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***










/**
 * Orbit module.
 * @module foundation.orbit
 * @requires foundation.util.keyboard
 * @requires foundation.util.motion
 * @requires foundation.util.timer
 * @requires foundation.util.imageLoader
 * @requires foundation.util.touch
 */

var Orbit = function (_Plugin) {
  _inherits(Orbit, _Plugin);

  function Orbit() {
    _classCallCheck(this, Orbit);

    return _possibleConstructorReturn(this, (Orbit.__proto__ || Object.getPrototypeOf(Orbit)).apply(this, arguments));
  ***REMOVED***

  _createClass(Orbit, [{
    key: '_setup',

    /**
    * Creates a new instance of an orbit carousel.
    * @class
    * @name Orbit
    * @param {jQuery***REMOVED*** element - jQuery object to make into an Orbit Carousel.
    * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
    */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Orbit.defaults, this.$element.data(), options);
      this.className = 'Orbit'; // ie9 back compat

      __WEBPACK_IMPORTED_MODULE_7__foundation_util_touch__["a" /* Touch */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a); // Touch init is idempotent, we just need to make sure it's initialied.

      this._init();

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('Orbit', {
        'ltr': {
          'ARROW_RIGHT': 'next',
          'ARROW_LEFT': 'previous'
        ***REMOVED***,
        'rtl': {
          'ARROW_LEFT': 'next',
          'ARROW_RIGHT': 'previous'
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
    * Initializes the plugin by creating jQuery collections, setting attributes, and starting the animation.
    * @function
    * @private
    */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      // @TODO: consider discussion on PR #9278 about DOM pollution by changeSlide
      this._reset();

      this.$wrapper = this.$element.find('.' + this.options.containerClass);
      this.$slides = this.$element.find('.' + this.options.slideClass);

      var $images = this.$element.find('img'),
          initActive = this.$slides.filter('.is-active'),
          id = this.$element[0].id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_5__foundation_util_core__["a" /* GetYoDigits */])(6, 'orbit');

      this.$element.attr({
        'data-resize': id,
        'id': id
      ***REMOVED***);

      if (!initActive.length) {
        this.$slides.eq(0).addClass('is-active');
      ***REMOVED***

      if (!this.options.useMUI) {
        this.$slides.addClass('no-motionui');
      ***REMOVED***

      if ($images.length) {
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_4__foundation_util_imageLoader__["a" /* onImagesLoaded */])($images, this._prepareForOrbit.bind(this));
      ***REMOVED*** else {
        this._prepareForOrbit(); //hehe
      ***REMOVED***

      if (this.options.bullets) {
        this._loadBullets();
      ***REMOVED***

      this._events();

      if (this.options.autoPlay && this.$slides.length > 1) {
        this.geoSync();
      ***REMOVED***

      if (this.options.accessible) {
        // allow wrapper to be focusable to enable arrow navigation
        this.$wrapper.attr('tabindex', 0);
      ***REMOVED***
    ***REMOVED***

    /**
    * Creates a jQuery collection of bullets, if they are being used.
    * @function
    * @private
    */

  ***REMOVED***, {
    key: '_loadBullets',
    value: function _loadBullets() {
      this.$bullets = this.$element.find('.' + this.options.boxOfBullets).find('button');
    ***REMOVED***

    /**
    * Sets a `timer` object on the orbit, and starts the counter for the next slide.
    * @function
    */

  ***REMOVED***, {
    key: 'geoSync',
    value: function geoSync() {
      var _this = this;
      this.timer = new __WEBPACK_IMPORTED_MODULE_3__foundation_util_timer__["a" /* Timer */](this.$element, {
        duration: this.options.timerDelay,
        infinite: false
      ***REMOVED***, function () {
        _this.changeSlide(true);
      ***REMOVED***);
      this.timer.start();
    ***REMOVED***

    /**
    * Sets wrapper and slide heights for the orbit.
    * @function
    * @private
    */

  ***REMOVED***, {
    key: '_prepareForOrbit',
    value: function _prepareForOrbit() {
      var _this = this;
      this._setWrapperHeight();
    ***REMOVED***

    /**
    * Calulates the height of each slide in the collection, and uses the tallest one for the wrapper height.
    * @function
    * @private
    * @param {Function***REMOVED*** cb - a callback function to fire when complete.
    */

  ***REMOVED***, {
    key: '_setWrapperHeight',
    value: function _setWrapperHeight(cb) {
      //rewrite this to `for` loop
      var max = 0,
          temp,
          counter = 0,
          _this = this;

      this.$slides.each(function () {
        temp = this.getBoundingClientRect().height;
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).attr('data-slide', counter);

        if (!/mui/g.test(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this)[0].className) && _this.$slides.filter('.is-active')[0] !== _this.$slides.eq(counter)[0]) {
          //if not the active slide, set css position and display property
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).css({ 'position': 'relative', 'display': 'none' ***REMOVED***);
        ***REMOVED***
        max = temp > max ? temp : max;
        counter++;
      ***REMOVED***);

      if (counter === this.$slides.length) {
        this.$wrapper.css({ 'height': max ***REMOVED***); //only change the wrapper height property once.
        if (cb) {
          cb(max);
        ***REMOVED*** //fire callback with max height dimension.
      ***REMOVED***
    ***REMOVED***

    /**
    * Sets the max-height of each slide.
    * @function
    * @private
    */

  ***REMOVED***, {
    key: '_setSlideHeight',
    value: function _setSlideHeight(height) {
      this.$slides.each(function () {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).css('max-height', height);
      ***REMOVED***);
    ***REMOVED***

    /**
    * Adds event listeners to basically everything within the element.
    * @function
    * @private
    */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;

      //***************************************
      //**Now using custom event - thanks to:**
      //**      Yohai Ararat of Toronto      **
      //***************************************
      //
      this.$element.off('.resizeme.zf.trigger').on({
        'resizeme.zf.trigger': this._prepareForOrbit.bind(this)
      ***REMOVED***);
      if (this.$slides.length > 1) {

        if (this.options.swipe) {
          this.$slides.off('swipeleft.zf.orbit swiperight.zf.orbit').on('swipeleft.zf.orbit', function (e) {
            e.preventDefault();
            _this.changeSlide(true);
          ***REMOVED***).on('swiperight.zf.orbit', function (e) {
            e.preventDefault();
            _this.changeSlide(false);
          ***REMOVED***);
        ***REMOVED***
        //***************************************

        if (this.options.autoPlay) {
          this.$slides.on('click.zf.orbit', function () {
            _this.$element.data('clickedOn', _this.$element.data('clickedOn') ? false : true);
            _this.timer[_this.$element.data('clickedOn') ? 'pause' : 'start']();
          ***REMOVED***);

          if (this.options.pauseOnHover) {
            this.$element.on('mouseenter.zf.orbit', function () {
              _this.timer.pause();
            ***REMOVED***).on('mouseleave.zf.orbit', function () {
              if (!_this.$element.data('clickedOn')) {
                _this.timer.start();
              ***REMOVED***
            ***REMOVED***);
          ***REMOVED***
        ***REMOVED***

        if (this.options.navButtons) {
          var $controls = this.$element.find('.' + this.options.nextClass + ', .' + this.options.prevClass);
          $controls.attr('tabindex', 0)
          //also need to handle enter/return and spacebar key presses
          .on('click.zf.orbit touchend.zf.orbit', function (e) {
            e.preventDefault();
            _this.changeSlide(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).hasClass(_this.options.nextClass));
          ***REMOVED***);
        ***REMOVED***

        if (this.options.bullets) {
          this.$bullets.on('click.zf.orbit touchend.zf.orbit', function () {
            if (/is-active/g.test(this.className)) {
              return false;
            ***REMOVED*** //if this is active, kick out of function.
            var idx = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('slide'),
                ltr = idx > _this.$slides.filter('.is-active').data('slide'),
                $slide = _this.$slides.eq(idx);

            _this.changeSlide(ltr, $slide, idx);
          ***REMOVED***);
        ***REMOVED***

        if (this.options.accessible) {
          this.$wrapper.add(this.$bullets).on('keydown.zf.orbit', function (e) {
            // handle keyboard event with keyboard util
            __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'Orbit', {
              next: function () {
                _this.changeSlide(true);
              ***REMOVED***,
              previous: function () {
                _this.changeSlide(false);
              ***REMOVED***,
              handled: function () {
                // if bullet is focused, make sure focus moves
                if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target).is(_this.$bullets)) {
                  _this.$bullets.filter('.is-active').focus();
                ***REMOVED***
              ***REMOVED***
            ***REMOVED***);
          ***REMOVED***);
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

    /**
     * Resets Orbit so it can be reinitialized
     */

  ***REMOVED***, {
    key: '_reset',
    value: function _reset() {
      // Don't do anything if there are no slides (first run)
      if (typeof this.$slides == 'undefined') {
        return;
      ***REMOVED***

      if (this.$slides.length > 1) {
        // Remove old events
        this.$element.off('.zf.orbit').find('*').off('.zf.orbit');

        // Restart timer if autoPlay is enabled
        if (this.options.autoPlay) {
          this.timer.restart();
        ***REMOVED***

        // Reset all sliddes
        this.$slides.each(function (el) {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(el).removeClass('is-active is-active is-in').removeAttr('aria-live').hide();
        ***REMOVED***);

        // Show the first slide
        this.$slides.first().addClass('is-active').show();

        // Triggers when the slide has finished animating
        this.$element.trigger('slidechange.zf.orbit', [this.$slides.first()]);

        // Select first bullet if bullets are present
        if (this.options.bullets) {
          this._updateBullets(0);
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

    /**
    * Changes the current slide to a new one.
    * @function
    * @param {Boolean***REMOVED*** isLTR - flag if the slide should move left to right.
    * @param {jQuery***REMOVED*** chosenSlide - the jQuery element of the slide to show next, if one is selected.
    * @param {Number***REMOVED*** idx - the index of the new slide in its collection, if one chosen.
    * @fires Orbit#slidechange
    */

  ***REMOVED***, {
    key: 'changeSlide',
    value: function changeSlide(isLTR, chosenSlide, idx) {
      if (!this.$slides) {
        return;
      ***REMOVED*** // Don't freak out if we're in the middle of cleanup
      var $curSlide = this.$slides.filter('.is-active').eq(0);

      if (/mui/g.test($curSlide[0].className)) {
        return false;
      ***REMOVED*** //if the slide is currently animating, kick out of the function

      var $firstSlide = this.$slides.first(),
          $lastSlide = this.$slides.last(),
          dirIn = isLTR ? 'Right' : 'Left',
          dirOut = isLTR ? 'Left' : 'Right',
          _this = this,
          $newSlide;

      if (!chosenSlide) {
        //most of the time, this will be auto played or clicked from the navButtons.
        $newSlide = isLTR ? //if wrapping enabled, check to see if there is a `next` or `prev` sibling, if not, select the first or last slide to fill in. if wrapping not enabled, attempt to select `next` or `prev`, if there's nothing there, the function will kick out on next step. CRAZY NESTED TERNARIES!!!!!
        this.options.infiniteWrap ? $curSlide.next('.' + this.options.slideClass).length ? $curSlide.next('.' + this.options.slideClass) : $firstSlide : $curSlide.next('.' + this.options.slideClass) : //pick next slide if moving left to right
        this.options.infiniteWrap ? $curSlide.prev('.' + this.options.slideClass).length ? $curSlide.prev('.' + this.options.slideClass) : $lastSlide : $curSlide.prev('.' + this.options.slideClass); //pick prev slide if moving right to left
      ***REMOVED*** else {
        $newSlide = chosenSlide;
      ***REMOVED***

      if ($newSlide.length) {
        /**
        * Triggers before the next slide starts animating in and only if a next slide has been found.
        * @event Orbit#beforeslidechange
        */
        this.$element.trigger('beforeslidechange.zf.orbit', [$curSlide, $newSlide]);

        if (this.options.bullets) {
          idx = idx || this.$slides.index($newSlide); //grab index to update bullets
          this._updateBullets(idx);
        ***REMOVED***

        if (this.options.useMUI && !this.$element.is(':hidden')) {
          __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__["a" /* Motion */].animateIn($newSlide.addClass('is-active').css({ 'position': 'absolute', 'top': 0 ***REMOVED***), this.options['animInFrom' + dirIn], function () {
            $newSlide.css({ 'position': 'relative', 'display': 'block' ***REMOVED***).attr('aria-live', 'polite');
          ***REMOVED***);

          __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__["a" /* Motion */].animateOut($curSlide.removeClass('is-active'), this.options['animOutTo' + dirOut], function () {
            $curSlide.removeAttr('aria-live');
            if (_this.options.autoPlay && !_this.timer.isPaused) {
              _this.timer.restart();
            ***REMOVED***
            //do stuff?
          ***REMOVED***);
        ***REMOVED*** else {
          $curSlide.removeClass('is-active is-in').removeAttr('aria-live').hide();
          $newSlide.addClass('is-active is-in').attr('aria-live', 'polite').show();
          if (this.options.autoPlay && !this.timer.isPaused) {
            this.timer.restart();
          ***REMOVED***
        ***REMOVED***
        /**
        * Triggers when the slide has finished animating in.
        * @event Orbit#slidechange
        */
        this.$element.trigger('slidechange.zf.orbit', [$newSlide]);
      ***REMOVED***
    ***REMOVED***

    /**
    * Updates the active state of the bullets, if displayed.
    * @function
    * @private
    * @param {Number***REMOVED*** idx - the index of the current slide.
    */

  ***REMOVED***, {
    key: '_updateBullets',
    value: function _updateBullets(idx) {
      var $oldBullet = this.$element.find('.' + this.options.boxOfBullets).find('.is-active').removeClass('is-active').blur(),
          span = $oldBullet.find('span:last').detach(),
          $newBullet = this.$bullets.eq(idx).addClass('is-active').append(span);
    ***REMOVED***

    /**
    * Destroys the carousel and hides the element.
    * @function
    */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.off('.zf.orbit').find('*').off('.zf.orbit').end().hide();
    ***REMOVED***
  ***REMOVED***]);

  return Orbit;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_6__foundation_plugin__["a" /* Plugin */]);

Orbit.defaults = {
  /**
  * Tells the JS to look for and loadBullets.
  * @option
   * @type {boolean***REMOVED***
  * @default true
  */
  bullets: true,
  /**
  * Tells the JS to apply event listeners to nav buttons
  * @option
   * @type {boolean***REMOVED***
  * @default true
  */
  navButtons: true,
  /**
  * motion-ui animation class to apply
  * @option
   * @type {string***REMOVED***
  * @default 'slide-in-right'
  */
  animInFromRight: 'slide-in-right',
  /**
  * motion-ui animation class to apply
  * @option
   * @type {string***REMOVED***
  * @default 'slide-out-right'
  */
  animOutToRight: 'slide-out-right',
  /**
  * motion-ui animation class to apply
  * @option
   * @type {string***REMOVED***
  * @default 'slide-in-left'
  *
  */
  animInFromLeft: 'slide-in-left',
  /**
  * motion-ui animation class to apply
  * @option
   * @type {string***REMOVED***
  * @default 'slide-out-left'
  */
  animOutToLeft: 'slide-out-left',
  /**
  * Allows Orbit to automatically animate on page load.
  * @option
   * @type {boolean***REMOVED***
  * @default true
  */
  autoPlay: true,
  /**
  * Amount of time, in ms, between slide transitions
  * @option
   * @type {number***REMOVED***
  * @default 5000
  */
  timerDelay: 5000,
  /**
  * Allows Orbit to infinitely loop through the slides
  * @option
   * @type {boolean***REMOVED***
  * @default true
  */
  infiniteWrap: true,
  /**
  * Allows the Orbit slides to bind to swipe events for mobile, requires an additional util library
  * @option
   * @type {boolean***REMOVED***
  * @default true
  */
  swipe: true,
  /**
  * Allows the timing function to pause animation on hover.
  * @option
   * @type {boolean***REMOVED***
  * @default true
  */
  pauseOnHover: true,
  /**
  * Allows Orbit to bind keyboard events to the slider, to animate frames with arrow keys
  * @option
   * @type {boolean***REMOVED***
  * @default true
  */
  accessible: true,
  /**
  * Class applied to the container of Orbit
  * @option
   * @type {string***REMOVED***
  * @default 'orbit-container'
  */
  containerClass: 'orbit-container',
  /**
  * Class applied to individual slides.
  * @option
   * @type {string***REMOVED***
  * @default 'orbit-slide'
  */
  slideClass: 'orbit-slide',
  /**
  * Class applied to the bullet container. You're welcome.
  * @option
   * @type {string***REMOVED***
  * @default 'orbit-bullets'
  */
  boxOfBullets: 'orbit-bullets',
  /**
  * Class applied to the `next` navigation button.
  * @option
   * @type {string***REMOVED***
  * @default 'orbit-next'
  */
  nextClass: 'orbit-next',
  /**
  * Class applied to the `previous` navigation button.
  * @option
   * @type {string***REMOVED***
  * @default 'orbit-previous'
  */
  prevClass: 'orbit-previous',
  /**
  * Boolean to flag the js to use motion ui classes or not. Default to true for backwards compatability.
  * @option
   * @type {boolean***REMOVED***
  * @default true
  */
  useMUI: true
***REMOVED***;



/***/ ***REMOVED***),
/* 25 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ResponsiveAccordionTabs; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_accordion__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__foundation_tabs__ = __webpack_require__(14);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***









// The plugin matches the plugin classes with these plugin instances.
var MenuPlugins = {
  tabs: {
    cssClass: 'tabs',
    plugin: __WEBPACK_IMPORTED_MODULE_5__foundation_tabs__["a" /* Tabs */]
  ***REMOVED***,
  accordion: {
    cssClass: 'accordion',
    plugin: __WEBPACK_IMPORTED_MODULE_4__foundation_accordion__["a" /* Accordion */]
  ***REMOVED***
***REMOVED***;

/**
 * ResponsiveAccordionTabs module.
 * @module foundation.responsiveAccordionTabs
 * @requires foundation.util.motion
 * @requires foundation.accordion
 * @requires foundation.tabs
 */

var ResponsiveAccordionTabs = function (_Plugin) {
  _inherits(ResponsiveAccordionTabs, _Plugin);

  function ResponsiveAccordionTabs() {
    _classCallCheck(this, ResponsiveAccordionTabs);

    return _possibleConstructorReturn(this, (ResponsiveAccordionTabs.__proto__ || Object.getPrototypeOf(ResponsiveAccordionTabs)).apply(this, arguments));
  ***REMOVED***

  _createClass(ResponsiveAccordionTabs, [{
    key: '_setup',

    /**
     * Creates a new instance of a responsive accordion tabs.
     * @class
     * @name ResponsiveAccordionTabs
     * @fires ResponsiveAccordionTabs#init
     * @param {jQuery***REMOVED*** element - jQuery object to make into Responsive Accordion Tabs.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(element);
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, this.$element.data(), options);
      this.rules = this.$element.data('responsive-accordion-tabs');
      this.currentMq = null;
      this.currentPlugin = null;
      this.className = 'ResponsiveAccordionTabs'; // ie9 back compat
      if (!this.$element.attr('id')) {
        this.$element.attr('id', __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["a" /* GetYoDigits */])(6, 'responsiveaccordiontabs'));
      ***REMOVED***;

      this._init();
      this._events();
    ***REMOVED***

    /**
     * Initializes the Menu by parsing the classes from the 'data-responsive-accordion-tabs' attribute on the element.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();

      // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
      if (typeof this.rules === 'string') {
        var rulesTree = {***REMOVED***;

        // Parse rules from "classes" pulled from data attribute
        var rules = this.rules.split(' ');

        // Iterate through every rule found
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i].split('-');
          var ruleSize = rule.length > 1 ? rule[0] : 'small';
          var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

          if (MenuPlugins[rulePlugin] !== null) {
            rulesTree[ruleSize] = MenuPlugins[rulePlugin];
          ***REMOVED***
        ***REMOVED***

        this.rules = rulesTree;
      ***REMOVED***

      this._getAllOptions();

      if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.isEmptyObject(this.rules)) {
        this._checkMediaQueries();
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***, {
    key: '_getAllOptions',
    value: function _getAllOptions() {
      //get all defaults and options
      var _this = this;
      _this.allOptions = {***REMOVED***;
      for (var key in MenuPlugins) {
        if (MenuPlugins.hasOwnProperty(key)) {
          var obj = MenuPlugins[key];
          try {
            var dummyPlugin = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('<ul></ul>');
            var tmpPlugin = new obj.plugin(dummyPlugin, _this.options);
            for (var keyKey in tmpPlugin.options) {
              if (tmpPlugin.options.hasOwnProperty(keyKey) && keyKey !== 'zfPlugin') {
                var objObj = tmpPlugin.options[keyKey];
                _this.allOptions[keyKey] = objObj;
              ***REMOVED***
            ***REMOVED***
            tmpPlugin.destroy();
          ***REMOVED*** catch (e) {***REMOVED***
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

    /**
     * Initializes events for the Menu.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('changed.zf.mediaquery', function () {
        _this._checkMediaQueries();
      ***REMOVED***);
    ***REMOVED***

    /**
     * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_checkMediaQueries',
    value: function _checkMediaQueries() {
      var matchedMq,
          _this = this;
      // Iterate through each rule and find the last matching rule
      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.each(this.rules, function (key) {
        if (__WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */].atLeast(key)) {
          matchedMq = key;
        ***REMOVED***
      ***REMOVED***);

      // No match? No dice
      if (!matchedMq) return;

      // Plugin already initialized? We good
      if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

      // Remove existing plugin-specific CSS classes
      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.each(MenuPlugins, function (key, value) {
        _this.$element.removeClass(value.cssClass);
      ***REMOVED***);

      // Add the CSS class for the new plugin
      this.$element.addClass(this.rules[matchedMq].cssClass);

      // Create an instance of the new plugin
      if (this.currentPlugin) {
        //don't know why but on nested elements data zfPlugin get's lost
        if (!this.currentPlugin.$element.data('zfPlugin') && this.storezfData) this.currentPlugin.$element.data('zfPlugin', this.storezfData);
        this.currentPlugin.destroy();
      ***REMOVED***
      this._handleMarkup(this.rules[matchedMq].cssClass);
      this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {***REMOVED***);
      this.storezfData = this.currentPlugin.$element.data('zfPlugin');
    ***REMOVED***
  ***REMOVED***, {
    key: '_handleMarkup',
    value: function _handleMarkup(toSet) {
      var _this = this,
          fromString = 'accordion';
      var $panels = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-tabs-content=' + this.$element.attr('id') + ']');
      if ($panels.length) fromString = 'tabs';
      if (fromString === toSet) {
        return;
      ***REMOVED***;

      var tabsTitle = _this.allOptions.linkClass ? _this.allOptions.linkClass : 'tabs-title';
      var tabsPanel = _this.allOptions.panelClass ? _this.allOptions.panelClass : 'tabs-panel';

      this.$element.removeAttr('role');
      var $liHeads = this.$element.children('.' + tabsTitle + ',[data-accordion-item]').removeClass(tabsTitle).removeClass('accordion-item').removeAttr('data-accordion-item');
      var $liHeadsA = $liHeads.children('a').removeClass('accordion-title');

      if (fromString === 'tabs') {
        $panels = $panels.children('.' + tabsPanel).removeClass(tabsPanel).removeAttr('role').removeAttr('aria-hidden').removeAttr('aria-labelledby');
        $panels.children('a').removeAttr('role').removeAttr('aria-controls').removeAttr('aria-selected');
      ***REMOVED*** else {
        $panels = $liHeads.children('[data-tab-content]').removeClass('accordion-content');
      ***REMOVED***;

      $panels.css({ display: '', visibility: '' ***REMOVED***);
      $liHeads.css({ display: '', visibility: '' ***REMOVED***);
      if (toSet === 'accordion') {
        $panels.each(function (key, value) {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()(value).appendTo($liHeads.get(key)).addClass('accordion-content').attr('data-tab-content', '').removeClass('is-active').css({ height: '' ***REMOVED***);
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-tabs-content=' + _this.$element.attr('id') + ']').after('<div id="tabs-placeholder-' + _this.$element.attr('id') + '"></div>').detach();
          $liHeads.addClass('accordion-item').attr('data-accordion-item', '');
          $liHeadsA.addClass('accordion-title');
        ***REMOVED***);
      ***REMOVED*** else if (toSet === 'tabs') {
        var $tabsContent = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-tabs-content=' + _this.$element.attr('id') + ']');
        var $placeholder = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#tabs-placeholder-' + _this.$element.attr('id'));
        if ($placeholder.length) {
          $tabsContent = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('<div class="tabs-content"></div>').insertAfter($placeholder).attr('data-tabs-content', _this.$element.attr('id'));
          $placeholder.remove();
        ***REMOVED*** else {
          $tabsContent = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('<div class="tabs-content"></div>').insertAfter(_this.$element).attr('data-tabs-content', _this.$element.attr('id'));
        ***REMOVED***;
        $panels.each(function (key, value) {
          var tempValue = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(value).appendTo($tabsContent).addClass(tabsPanel);
          var hash = $liHeadsA.get(key).hash.slice(1);
          var id = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(value).attr('id') || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["a" /* GetYoDigits */])(6, 'accordion');
          if (hash !== id) {
            if (hash !== '') {
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()(value).attr('id', hash);
            ***REMOVED*** else {
              hash = id;
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()(value).attr('id', hash);
              __WEBPACK_IMPORTED_MODULE_0_jquery___default()($liHeadsA.get(key)).attr('href', __WEBPACK_IMPORTED_MODULE_0_jquery___default()($liHeadsA.get(key)).attr('href').replace('#', '') + '#' + hash);
            ***REMOVED***;
          ***REMOVED***;
          var isActive = __WEBPACK_IMPORTED_MODULE_0_jquery___default()($liHeads.get(key)).hasClass('is-active');
          if (isActive) {
            tempValue.addClass('is-active');
          ***REMOVED***;
        ***REMOVED***);
        $liHeads.addClass(tabsTitle);
      ***REMOVED***;
    ***REMOVED***

    /**
     * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      if (this.currentPlugin) this.currentPlugin.destroy();
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('.zf.ResponsiveAccordionTabs');
    ***REMOVED***
  ***REMOVED***]);

  return ResponsiveAccordionTabs;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_3__foundation_plugin__["a" /* Plugin */]);

ResponsiveAccordionTabs.defaults = {***REMOVED***;



/***/ ***REMOVED***),
/* 26 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ResponsiveMenu; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_dropdownMenu__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__foundation_drilldown__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__foundation_accordionMenu__ = __webpack_require__(11);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***











var MenuPlugins = {
  dropdown: {
    cssClass: 'dropdown',
    plugin: __WEBPACK_IMPORTED_MODULE_4__foundation_dropdownMenu__["a" /* DropdownMenu */]
  ***REMOVED***,
  drilldown: {
    cssClass: 'drilldown',
    plugin: __WEBPACK_IMPORTED_MODULE_5__foundation_drilldown__["a" /* Drilldown */]
  ***REMOVED***,
  accordion: {
    cssClass: 'accordion-menu',
    plugin: __WEBPACK_IMPORTED_MODULE_6__foundation_accordionMenu__["a" /* AccordionMenu */]
  ***REMOVED***
***REMOVED***;

// import "foundation.util.triggers.js";


/**
 * ResponsiveMenu module.
 * @module foundation.responsiveMenu
 * @requires foundation.util.triggers
 * @requires foundation.util.mediaQuery
 */

var ResponsiveMenu = function (_Plugin) {
  _inherits(ResponsiveMenu, _Plugin);

  function ResponsiveMenu() {
    _classCallCheck(this, ResponsiveMenu);

    return _possibleConstructorReturn(this, (ResponsiveMenu.__proto__ || Object.getPrototypeOf(ResponsiveMenu)).apply(this, arguments));
  ***REMOVED***

  _createClass(ResponsiveMenu, [{
    key: '_setup',

    /**
     * Creates a new instance of a responsive menu.
     * @class
     * @name ResponsiveMenu
     * @fires ResponsiveMenu#init
     * @param {jQuery***REMOVED*** element - jQuery object to make into a dropdown menu.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(element);
      this.rules = this.$element.data('responsive-menu');
      this.currentMq = null;
      this.currentPlugin = null;
      this.className = 'ResponsiveMenu'; // ie9 back compat

      this._init();
      this._events();
    ***REMOVED***

    /**
     * Initializes the Menu by parsing the classes from the 'data-ResponsiveMenu' attribute on the element.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();
      // The first time an Interchange plugin is initialized, this.rules is converted from a string of "classes" to an object of rules
      if (typeof this.rules === 'string') {
        var rulesTree = {***REMOVED***;

        // Parse rules from "classes" pulled from data attribute
        var rules = this.rules.split(' ');

        // Iterate through every rule found
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i].split('-');
          var ruleSize = rule.length > 1 ? rule[0] : 'small';
          var rulePlugin = rule.length > 1 ? rule[1] : rule[0];

          if (MenuPlugins[rulePlugin] !== null) {
            rulesTree[ruleSize] = MenuPlugins[rulePlugin];
          ***REMOVED***
        ***REMOVED***

        this.rules = rulesTree;
      ***REMOVED***

      if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.isEmptyObject(this.rules)) {
        this._checkMediaQueries();
      ***REMOVED***
      // Add data-mutate since children may need it.
      this.$element.attr('data-mutate', this.$element.attr('data-mutate') || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_core__["a" /* GetYoDigits */])(6, 'responsive-menu'));
    ***REMOVED***

    /**
     * Initializes events for the Menu.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('changed.zf.mediaquery', function () {
        _this._checkMediaQueries();
      ***REMOVED***);
      // $(window).on('resize.zf.ResponsiveMenu', function() {
      //   _this._checkMediaQueries();
      // ***REMOVED***);
    ***REMOVED***

    /**
     * Checks the current screen width against available media queries. If the media query has changed, and the plugin needed has changed, the plugins will swap out.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_checkMediaQueries',
    value: function _checkMediaQueries() {
      var matchedMq,
          _this = this;
      // Iterate through each rule and find the last matching rule
      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.each(this.rules, function (key) {
        if (__WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */].atLeast(key)) {
          matchedMq = key;
        ***REMOVED***
      ***REMOVED***);

      // No match? No dice
      if (!matchedMq) return;

      // Plugin already initialized? We good
      if (this.currentPlugin instanceof this.rules[matchedMq].plugin) return;

      // Remove existing plugin-specific CSS classes
      __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.each(MenuPlugins, function (key, value) {
        _this.$element.removeClass(value.cssClass);
      ***REMOVED***);

      // Add the CSS class for the new plugin
      this.$element.addClass(this.rules[matchedMq].cssClass);

      // Create an instance of the new plugin
      if (this.currentPlugin) this.currentPlugin.destroy();
      this.currentPlugin = new this.rules[matchedMq].plugin(this.$element, {***REMOVED***);
    ***REMOVED***

    /**
     * Destroys the instance of the current plugin on this element, as well as the window resize handler that switches the plugins out.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.currentPlugin.destroy();
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('.zf.ResponsiveMenu');
    ***REMOVED***
  ***REMOVED***]);

  return ResponsiveMenu;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_3__foundation_plugin__["a" /* Plugin */]);

ResponsiveMenu.defaults = {***REMOVED***;



/***/ ***REMOVED***),
/* 27 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ResponsiveToggle; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***







/**
 * ResponsiveToggle module.
 * @module foundation.responsiveToggle
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.motion
 */

var ResponsiveToggle = function (_Plugin) {
  _inherits(ResponsiveToggle, _Plugin);

  function ResponsiveToggle() {
    _classCallCheck(this, ResponsiveToggle);

    return _possibleConstructorReturn(this, (ResponsiveToggle.__proto__ || Object.getPrototypeOf(ResponsiveToggle)).apply(this, arguments));
  ***REMOVED***

  _createClass(ResponsiveToggle, [{
    key: '_setup',

    /**
     * Creates a new instance of Tab Bar.
     * @class
     * @name ResponsiveToggle
     * @fires ResponsiveToggle#init
     * @param {jQuery***REMOVED*** element - jQuery object to attach tab bar functionality to.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(element);
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, ResponsiveToggle.defaults, this.$element.data(), options);
      this.className = 'ResponsiveToggle'; // ie9 back compat

      this._init();
      this._events();
    ***REMOVED***

    /**
     * Initializes the tab bar by finding the target element, toggling element, and running update().
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();
      var targetID = this.$element.data('responsive-toggle');
      if (!targetID) {
        console.error('Your tab bar needs an ID of a Menu as the value of data-tab-bar.');
      ***REMOVED***

      this.$targetMenu = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + targetID);
      this.$toggler = this.$element.find('[data-toggle]').filter(function () {
        var target = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).data('toggle');
        return target === targetID || target === "";
      ***REMOVED***);
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, this.options, this.$targetMenu.data());

      // If they were set, parse the animation classes
      if (this.options.animate) {
        var input = this.options.animate.split(' ');

        this.animationIn = input[0];
        this.animationOut = input[1] || null;
      ***REMOVED***

      this._update();
    ***REMOVED***

    /**
     * Adds necessary event handlers for the tab bar to work.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;

      this._updateMqHandler = this._update.bind(this);

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('changed.zf.mediaquery', this._updateMqHandler);

      this.$toggler.on('click.zf.responsiveToggle', this.toggleMenu.bind(this));
    ***REMOVED***

    /**
     * Checks the current media query to determine if the tab bar should be visible or hidden.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_update',
    value: function _update() {
      // Mobile
      if (!__WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */].atLeast(this.options.hideFor)) {
        this.$element.show();
        this.$targetMenu.hide();
      ***REMOVED***

      // Desktop
      else {
          this.$element.hide();
          this.$targetMenu.show();
        ***REMOVED***
    ***REMOVED***

    /**
     * Toggles the element attached to the tab bar. The toggle only happens if the screen is small enough to allow it.
     * @function
     * @fires ResponsiveToggle#toggled
     */

  ***REMOVED***, {
    key: 'toggleMenu',
    value: function toggleMenu() {
      var _this3 = this;

      if (!__WEBPACK_IMPORTED_MODULE_1__foundation_util_mediaQuery__["a" /* MediaQuery */].atLeast(this.options.hideFor)) {
        /**
         * Fires when the element attached to the tab bar toggles.
         * @event ResponsiveToggle#toggled
         */
        if (this.options.animate) {
          if (this.$targetMenu.is(':hidden')) {
            __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__["a" /* Motion */].animateIn(this.$targetMenu, this.animationIn, function () {
              _this3.$element.trigger('toggled.zf.responsiveToggle');
              _this3.$targetMenu.find('[data-mutate]').triggerHandler('mutateme.zf.trigger');
            ***REMOVED***);
          ***REMOVED*** else {
            __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__["a" /* Motion */].animateOut(this.$targetMenu, this.animationOut, function () {
              _this3.$element.trigger('toggled.zf.responsiveToggle');
            ***REMOVED***);
          ***REMOVED***
        ***REMOVED*** else {
          this.$targetMenu.toggle(0);
          this.$targetMenu.find('[data-mutate]').trigger('mutateme.zf.trigger');
          this.$element.trigger('toggled.zf.responsiveToggle');
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.off('.zf.responsiveToggle');
      this.$toggler.off('.zf.responsiveToggle');

      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('changed.zf.mediaquery', this._updateMqHandler);
    ***REMOVED***
  ***REMOVED***]);

  return ResponsiveToggle;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_3__foundation_plugin__["a" /* Plugin */]);

ResponsiveToggle.defaults = {
  /**
   * The breakpoint after which the menu is always shown, and the tab bar is hidden.
   * @option
   * @type {string***REMOVED***
   * @default 'medium'
   */
  hideFor: 'medium',

  /**
   * To decide if the toggle should be animated or not.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  animate: false
***REMOVED***;



/***/ ***REMOVED***),
/* 28 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Reveal; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_motion__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__foundation_util_triggers__ = __webpack_require__(5);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***








/**
 * Reveal module.
 * @module foundation.reveal
 * @requires foundation.util.keyboard
 * @requires foundation.util.triggers
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.motion if using animations
 */

var Reveal = function (_Plugin) {
  _inherits(Reveal, _Plugin);

  function Reveal() {
    _classCallCheck(this, Reveal);

    return _possibleConstructorReturn(this, (Reveal.__proto__ || Object.getPrototypeOf(Reveal)).apply(this, arguments));
  ***REMOVED***

  _createClass(Reveal, [{
    key: '_setup',

    /**
     * Creates a new instance of Reveal.
     * @class
     * @name Reveal
     * @param {jQuery***REMOVED*** element - jQuery object to use for the modal.
     * @param {Object***REMOVED*** options - optional parameters.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Reveal.defaults, this.$element.data(), options);
      this.className = 'Reveal'; // ie9 back compat
      this._init();

      // Triggers init is idempotent, just need to make sure it is initialized
      __WEBPACK_IMPORTED_MODULE_5__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('Reveal', {
        'ESCAPE': 'close'
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initializes the modal by adding the overlay and close buttons, (if selected).
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();
      this.id = this.$element.attr('id');
      this.isActive = false;
      this.cached = { mq: __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */].current ***REMOVED***;
      this.isMobile = mobileSniff();

      this.$anchor = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-open="' + this.id + '"]').length ? __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-open="' + this.id + '"]') : __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-toggle="' + this.id + '"]');
      this.$anchor.attr({
        'aria-controls': this.id,
        'aria-haspopup': true,
        'tabindex': 0
      ***REMOVED***);

      if (this.options.fullScreen || this.$element.hasClass('full')) {
        this.options.fullScreen = true;
        this.options.overlay = false;
      ***REMOVED***
      if (this.options.overlay && !this.$overlay) {
        this.$overlay = this._makeOverlay(this.id);
      ***REMOVED***

      this.$element.attr({
        'role': 'dialog',
        'aria-hidden': true,
        'data-yeti-box': this.id,
        'data-resize': this.id
      ***REMOVED***);

      if (this.$overlay) {
        this.$element.detach().appendTo(this.$overlay);
      ***REMOVED*** else {
        this.$element.detach().appendTo(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.options.appendTo));
        this.$element.addClass('without-overlay');
      ***REMOVED***
      this._events();
      if (this.options.deepLink && window.location.hash === '#' + this.id) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).one('load.zf.reveal', this.open.bind(this));
      ***REMOVED***
    ***REMOVED***

    /**
     * Creates an overlay div to display behind the modal.
     * @private
     */

  ***REMOVED***, {
    key: '_makeOverlay',
    value: function _makeOverlay() {
      var additionalOverlayClasses = '';

      if (this.options.additionalOverlayClasses) {
        additionalOverlayClasses = ' ' + this.options.additionalOverlayClasses;
      ***REMOVED***

      return __WEBPACK_IMPORTED_MODULE_0_jquery___default()('<div></div>').addClass('reveal-overlay' + additionalOverlayClasses).appendTo(this.options.appendTo);
    ***REMOVED***

    /**
     * Updates position of modal
     * TODO:  Figure out if we actually need to cache these values or if it doesn't matter
     * @private
     */

  ***REMOVED***, {
    key: '_updatePosition',
    value: function _updatePosition() {
      var width = this.$element.outerWidth();
      var outerWidth = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).width();
      var height = this.$element.outerHeight();
      var outerHeight = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).height();
      var left, top;
      if (this.options.hOffset === 'auto') {
        left = parseInt((outerWidth - width) / 2, 10);
      ***REMOVED*** else {
        left = parseInt(this.options.hOffset, 10);
      ***REMOVED***
      if (this.options.vOffset === 'auto') {
        if (height > outerHeight) {
          top = parseInt(Math.min(100, outerHeight / 10), 10);
        ***REMOVED*** else {
          top = parseInt((outerHeight - height) / 4, 10);
        ***REMOVED***
      ***REMOVED*** else {
        top = parseInt(this.options.vOffset, 10);
      ***REMOVED***
      this.$element.css({ top: top + 'px' ***REMOVED***);
      // only worry about left if we don't have an overlay or we havea  horizontal offset,
      // otherwise we're perfectly in the middle
      if (!this.$overlay || this.options.hOffset !== 'auto') {
        this.$element.css({ left: left + 'px' ***REMOVED***);
        this.$element.css({ margin: '0px' ***REMOVED***);
      ***REMOVED***
    ***REMOVED***

    /**
     * Adds event handlers for the modal.
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this3 = this;

      var _this = this;

      this.$element.on({
        'open.zf.trigger': this.open.bind(this),
        'close.zf.trigger': function (event, $element) {
          if (event.target === _this.$element[0] || __WEBPACK_IMPORTED_MODULE_0_jquery___default()(event.target).parents('[data-closable]')[0] === $element) {
            // only close reveal when it's explicitly called
            return _this3.close.apply(_this3);
          ***REMOVED***
        ***REMOVED***,
        'toggle.zf.trigger': this.toggle.bind(this),
        'resizeme.zf.trigger': function () {
          _this._updatePosition();
        ***REMOVED***
      ***REMOVED***);

      if (this.options.closeOnClick && this.options.overlay) {
        this.$overlay.off('.zf.reveal').on('click.zf.reveal', function (e) {
          if (e.target === _this.$element[0] || __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.contains(_this.$element[0], e.target) || !__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.contains(document, e.target)) {
            return;
          ***REMOVED***
          _this.close();
        ***REMOVED***);
      ***REMOVED***
      if (this.options.deepLink) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('popstate.zf.reveal:' + this.id, this._handleState.bind(this));
      ***REMOVED***
    ***REMOVED***

    /**
     * Handles modal methods on back/forward button clicks or any other event that triggers popstate.
     * @private
     */

  ***REMOVED***, {
    key: '_handleState',
    value: function _handleState(e) {
      if (window.location.hash === '#' + this.id && !this.isActive) {
        this.open();
      ***REMOVED*** else {
        this.close();
      ***REMOVED***
    ***REMOVED***

    /**
     * Opens the modal controlled by `this.$anchor`, and closes all others by default.
     * @function
     * @fires Reveal#closeme
     * @fires Reveal#open
     */

  ***REMOVED***, {
    key: 'open',
    value: function open() {
      var _this4 = this;

      // either update or replace browser history
      if (this.options.deepLink) {
        var hash = '#' + this.id;

        if (window.history.pushState) {
          if (this.options.updateHistory) {
            window.history.pushState({***REMOVED***, '', hash);
          ***REMOVED*** else {
            window.history.replaceState({***REMOVED***, '', hash);
          ***REMOVED***
        ***REMOVED*** else {
          window.location.hash = hash;
        ***REMOVED***
      ***REMOVED***

      this.isActive = true;

      // Make elements invisible, but remove display: none so we can get size and positioning
      this.$element.css({ 'visibility': 'hidden' ***REMOVED***).show().scrollTop(0);
      if (this.options.overlay) {
        this.$overlay.css({ 'visibility': 'hidden' ***REMOVED***).show();
      ***REMOVED***

      this._updatePosition();

      this.$element.hide().css({ 'visibility': '' ***REMOVED***);

      if (this.$overlay) {
        this.$overlay.css({ 'visibility': '' ***REMOVED***).hide();
        if (this.$element.hasClass('fast')) {
          this.$overlay.addClass('fast');
        ***REMOVED*** else if (this.$element.hasClass('slow')) {
          this.$overlay.addClass('slow');
        ***REMOVED***
      ***REMOVED***

      if (!this.options.multipleOpened) {
        /**
         * Fires immediately before the modal opens.
         * Closes any other modals that are currently open
         * @event Reveal#closeme
         */
        this.$element.trigger('closeme.zf.reveal', this.id);
      ***REMOVED***

      var _this = this;

      function addRevealOpenClasses() {
        if (_this.isMobile) {
          if (!_this.originalScrollPos) {
            _this.originalScrollPos = window.pageYOffset;
          ***REMOVED***
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body').addClass('is-reveal-open');
        ***REMOVED*** else {
          __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').addClass('is-reveal-open');
        ***REMOVED***
      ***REMOVED***
      // Motion UI method of reveal
      if (this.options.animationIn) {
        (function () {
          var afterAnimation = function () {
            _this.$element.attr({
              'aria-hidden': false,
              'tabindex': -1
            ***REMOVED***).focus();
            addRevealOpenClasses();
            __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].trapFocus(_this.$element);
          ***REMOVED***;

          if (_this4.options.overlay) {
            __WEBPACK_IMPORTED_MODULE_3__foundation_util_motion__["a" /* Motion */].animateIn(_this4.$overlay, 'fade-in');
          ***REMOVED***
          __WEBPACK_IMPORTED_MODULE_3__foundation_util_motion__["a" /* Motion */].animateIn(_this4.$element, _this4.options.animationIn, function () {
            if (_this4.$element) {
              // protect against object having been removed
              _this4.focusableElements = __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].findFocusable(_this4.$element);
              afterAnimation();
            ***REMOVED***
          ***REMOVED***);
        ***REMOVED***)();
      ***REMOVED***
      // jQuery method of reveal
      else {
          if (this.options.overlay) {
            this.$overlay.show(0);
          ***REMOVED***
          this.$element.show(this.options.showDelay);
        ***REMOVED***

      // handle accessibility
      this.$element.attr({
        'aria-hidden': false,
        'tabindex': -1
      ***REMOVED***).focus();
      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].trapFocus(this.$element);

      addRevealOpenClasses();

      this._extraHandlers();

      /**
       * Fires when the modal has successfully opened.
       * @event Reveal#open
       */
      this.$element.trigger('open.zf.reveal');
    ***REMOVED***

    /**
     * Adds extra event handlers for the body and window if necessary.
     * @private
     */

  ***REMOVED***, {
    key: '_extraHandlers',
    value: function _extraHandlers() {
      var _this = this;
      if (!this.$element) {
        return;
      ***REMOVED*** // If we're in the middle of cleanup, don't freak out
      this.focusableElements = __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].findFocusable(this.$element);

      if (!this.options.overlay && this.options.closeOnClick && !this.options.fullScreen) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').on('click.zf.reveal', function (e) {
          if (e.target === _this.$element[0] || __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.contains(_this.$element[0], e.target) || !__WEBPACK_IMPORTED_MODULE_0_jquery___default.a.contains(document, e.target)) {
            return;
          ***REMOVED***
          _this.close();
        ***REMOVED***);
      ***REMOVED***

      if (this.options.closeOnEsc) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).on('keydown.zf.reveal', function (e) {
          __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'Reveal', {
            close: function () {
              if (_this.options.closeOnEsc) {
                _this.close();
              ***REMOVED***
            ***REMOVED***
          ***REMOVED***);
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***

    /**
     * Closes the modal.
     * @function
     * @fires Reveal#closed
     */

  ***REMOVED***, {
    key: 'close',
    value: function close() {
      if (!this.isActive || !this.$element.is(':visible')) {
        return false;
      ***REMOVED***
      var _this = this;

      // Motion UI method of hiding
      if (this.options.animationOut) {
        if (this.options.overlay) {
          __WEBPACK_IMPORTED_MODULE_3__foundation_util_motion__["a" /* Motion */].animateOut(this.$overlay, 'fade-out');
        ***REMOVED***

        __WEBPACK_IMPORTED_MODULE_3__foundation_util_motion__["a" /* Motion */].animateOut(this.$element, this.options.animationOut, finishUp);
      ***REMOVED***
      // jQuery method of hiding
      else {
          this.$element.hide(this.options.hideDelay);

          if (this.options.overlay) {
            this.$overlay.hide(0, finishUp);
          ***REMOVED*** else {
            finishUp();
          ***REMOVED***
        ***REMOVED***

      // Conditionals to remove extra event listeners added on open
      if (this.options.closeOnEsc) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('keydown.zf.reveal');
      ***REMOVED***

      if (!this.options.overlay && this.options.closeOnClick) {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').off('click.zf.reveal');
      ***REMOVED***

      this.$element.off('keydown.zf.reveal');

      function finishUp() {
        if (_this.isMobile) {
          if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()('.reveal:visible').length === 0) {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body').removeClass('is-reveal-open');
          ***REMOVED***
          if (_this.originalScrollPos) {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').scrollTop(_this.originalScrollPos);
            _this.originalScrollPos = null;
          ***REMOVED***
        ***REMOVED*** else {
          if (__WEBPACK_IMPORTED_MODULE_0_jquery___default()('.reveal:visible').length === 0) {
            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body').removeClass('is-reveal-open');
          ***REMOVED***
        ***REMOVED***

        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].releaseFocus(_this.$element);

        _this.$element.attr('aria-hidden', true);

        /**
        * Fires when the modal is done closing.
        * @event Reveal#closed
        */
        _this.$element.trigger('closed.zf.reveal');
      ***REMOVED***

      /**
      * Resets the modal content
      * This prevents a running video to keep going in the background
      */
      if (this.options.resetOnClose) {
        this.$element.html(this.$element.html());
      ***REMOVED***

      this.isActive = false;
      if (_this.options.deepLink) {
        if (window.history.replaceState) {
          window.history.replaceState('', document.title, window.location.href.replace('#' + this.id, ''));
        ***REMOVED*** else {
          window.location.hash = '';
        ***REMOVED***
      ***REMOVED***

      this.$anchor.focus();
    ***REMOVED***

    /**
     * Toggles the open/closed state of a modal.
     * @function
     */

  ***REMOVED***, {
    key: 'toggle',
    value: function toggle() {
      if (this.isActive) {
        this.close();
      ***REMOVED*** else {
        this.open();
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***, {
    key: '_destroy',


    /**
     * Destroys an instance of a modal.
     * @function
     */
    value: function _destroy() {
      if (this.options.overlay) {
        this.$element.appendTo(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.options.appendTo)); // move $element outside of $overlay to prevent error unregisterPlugin()
        this.$overlay.hide().off().remove();
      ***REMOVED***
      this.$element.hide().off();
      this.$anchor.off('.zf');
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off('.zf.reveal:' + this.id);
    ***REMOVED***
  ***REMOVED***]);

  return Reveal;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_4__foundation_plugin__["a" /* Plugin */]);

Reveal.defaults = {
  /**
   * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  animationIn: '',
  /**
   * Motion-UI class to use for animated elements. If none used, defaults to simple show/hide.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  animationOut: '',
  /**
   * Time, in ms, to delay the opening of a modal after a click if no animation used.
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  showDelay: 0,
  /**
   * Time, in ms, to delay the closing of a modal after a click if no animation used.
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  hideDelay: 0,
  /**
   * Allows a click on the body/overlay to close the modal.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  closeOnClick: true,
  /**
   * Allows the modal to close if the user presses the `ESCAPE` key.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  closeOnEsc: true,
  /**
   * If true, allows multiple modals to be displayed at once.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  multipleOpened: false,
  /**
   * Distance, in pixels, the modal should push down from the top of the screen.
   * @option
   * @type {number|string***REMOVED***
   * @default auto
   */
  vOffset: 'auto',
  /**
   * Distance, in pixels, the modal should push in from the side of the screen.
   * @option
   * @type {number|string***REMOVED***
   * @default auto
   */
  hOffset: 'auto',
  /**
   * Allows the modal to be fullscreen, completely blocking out the rest of the view. JS checks for this as well.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  fullScreen: false,
  /**
   * Percentage of screen height the modal should push up from the bottom of the view.
   * @option
   * @type {number***REMOVED***
   * @default 10
   */
  btmOffsetPct: 10,
  /**
   * Allows the modal to generate an overlay div, which will cover the view when modal opens.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  overlay: true,
  /**
   * Allows the modal to remove and reinject markup on close. Should be true if using video elements w/o using provider's api, otherwise, videos will continue to play in the background.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  resetOnClose: false,
  /**
   * Allows the modal to alter the url on open/close, and allows the use of the `back` button to close modals. ALSO, allows a modal to auto-maniacally open on page load IF the hash === the modal's user-set id.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  deepLink: false,
  /**
   * Update the browser history with the open modal
   * @option
   * @default false
   */
  updateHistory: false,
  /**
  * Allows the modal to append to custom div.
  * @option
  * @type {string***REMOVED***
  * @default "body"
  */
  appendTo: "body",
  /**
   * Allows adding additional class names to the reveal overlay.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  additionalOverlayClasses: ''
***REMOVED***;

function iPhoneSniff() {
  return (/iP(ad|hone|od).*OS/.test(window.navigator.userAgent)
  );
***REMOVED***

function androidSniff() {
  return (/Android/.test(window.navigator.userAgent)
  );
***REMOVED***

function mobileSniff() {
  return iPhoneSniff() || androidSniff();
***REMOVED***



/***/ ***REMOVED***),
/* 29 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Slider; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__foundation_util_touch__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__foundation_util_triggers__ = __webpack_require__(5);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***











/**
 * Slider module.
 * @module foundation.slider
 * @requires foundation.util.motion
 * @requires foundation.util.triggers
 * @requires foundation.util.keyboard
 * @requires foundation.util.touch
 */

var Slider = function (_Plugin) {
  _inherits(Slider, _Plugin);

  function Slider() {
    _classCallCheck(this, Slider);

    return _possibleConstructorReturn(this, (Slider.__proto__ || Object.getPrototypeOf(Slider)).apply(this, arguments));
  ***REMOVED***

  _createClass(Slider, [{
    key: '_setup',

    /**
     * Creates a new instance of a slider control.
     * @class
     * @name Slider
     * @param {jQuery***REMOVED*** element - jQuery object to make into a slider control.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Slider.defaults, this.$element.data(), options);
      this.className = 'Slider'; // ie9 back compat

      // Touch and Triggers inits are idempotent, we just need to make sure it's initialied.
      __WEBPACK_IMPORTED_MODULE_5__foundation_util_touch__["a" /* Touch */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);
      __WEBPACK_IMPORTED_MODULE_6__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

      this._init();

      __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].register('Slider', {
        'ltr': {
          'ARROW_RIGHT': 'increase',
          'ARROW_UP': 'increase',
          'ARROW_DOWN': 'decrease',
          'ARROW_LEFT': 'decrease',
          'SHIFT_ARROW_RIGHT': 'increase_fast',
          'SHIFT_ARROW_UP': 'increase_fast',
          'SHIFT_ARROW_DOWN': 'decrease_fast',
          'SHIFT_ARROW_LEFT': 'decrease_fast',
          'HOME': 'min',
          'END': 'max'
        ***REMOVED***,
        'rtl': {
          'ARROW_LEFT': 'increase',
          'ARROW_RIGHT': 'decrease',
          'SHIFT_ARROW_LEFT': 'increase_fast',
          'SHIFT_ARROW_RIGHT': 'decrease_fast'
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
     * Initilizes the plugin by reading/setting attributes, creating collections and setting the initial position of the handle(s).
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      this.inputs = this.$element.find('input');
      this.handles = this.$element.find('[data-slider-handle]');

      this.$handle = this.handles.eq(0);
      this.$input = this.inputs.length ? this.inputs.eq(0) : __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + this.$handle.attr('aria-controls'));
      this.$fill = this.$element.find('[data-slider-fill]').css(this.options.vertical ? 'height' : 'width', 0);

      var isDbl = false,
          _this = this;
      if (this.options.disabled || this.$element.hasClass(this.options.disabledClass)) {
        this.options.disabled = true;
        this.$element.addClass(this.options.disabledClass);
      ***REMOVED***
      if (!this.inputs.length) {
        this.inputs = __WEBPACK_IMPORTED_MODULE_0_jquery___default()().add(this.$input);
        this.options.binding = true;
      ***REMOVED***

      this._setInitAttr(0);

      if (this.handles[1]) {
        this.options.doubleSided = true;
        this.$handle2 = this.handles.eq(1);
        this.$input2 = this.inputs.length > 1 ? this.inputs.eq(1) : __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + this.$handle2.attr('aria-controls'));

        if (!this.inputs[1]) {
          this.inputs = this.inputs.add(this.$input2);
        ***REMOVED***
        isDbl = true;

        // this.$handle.triggerHandler('click.zf.slider');
        this._setInitAttr(1);
      ***REMOVED***

      // Set handle positions
      this.setHandles();

      this._events();
    ***REMOVED***
  ***REMOVED***, {
    key: 'setHandles',
    value: function setHandles() {
      var _this3 = this;

      if (this.handles[1]) {
        this._setHandlePos(this.$handle, this.inputs.eq(0).val(), true, function () {
          _this3._setHandlePos(_this3.$handle2, _this3.inputs.eq(1).val(), true);
        ***REMOVED***);
      ***REMOVED*** else {
        this._setHandlePos(this.$handle, this.inputs.eq(0).val(), true);
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***, {
    key: '_reflow',
    value: function _reflow() {
      this.setHandles();
    ***REMOVED***
    /**
    * @function
    * @private
    * @param {Number***REMOVED*** value - floating point (the value) to be transformed using to a relative position on the slider (the inverse of _value)
    */

  ***REMOVED***, {
    key: '_pctOfBar',
    value: function _pctOfBar(value) {
      var pctOfBar = percent(value - this.options.start, this.options.end - this.options.start);

      switch (this.options.positionValueFunction) {
        case "pow":
          pctOfBar = this._logTransform(pctOfBar);
          break;
        case "log":
          pctOfBar = this._powTransform(pctOfBar);
          break;
      ***REMOVED***

      return pctOfBar.toFixed(2);
    ***REMOVED***

    /**
    * @function
    * @private
    * @param {Number***REMOVED*** pctOfBar - floating point, the relative position of the slider (typically between 0-1) to be transformed to a value
    */

  ***REMOVED***, {
    key: '_value',
    value: function _value(pctOfBar) {
      switch (this.options.positionValueFunction) {
        case "pow":
          pctOfBar = this._powTransform(pctOfBar);
          break;
        case "log":
          pctOfBar = this._logTransform(pctOfBar);
          break;
      ***REMOVED***
      var value = (this.options.end - this.options.start) * pctOfBar + this.options.start;

      return value;
    ***REMOVED***

    /**
    * @function
    * @private
    * @param {Number***REMOVED*** value - floating point (typically between 0-1) to be transformed using the log function
    */

  ***REMOVED***, {
    key: '_logTransform',
    value: function _logTransform(value) {
      return baseLog(this.options.nonLinearBase, value * (this.options.nonLinearBase - 1) + 1);
    ***REMOVED***

    /**
    * @function
    * @private
    * @param {Number***REMOVED*** value - floating point (typically between 0-1) to be transformed using the power function
    */

  ***REMOVED***, {
    key: '_powTransform',
    value: function _powTransform(value) {
      return (Math.pow(this.options.nonLinearBase, value) - 1) / (this.options.nonLinearBase - 1);
    ***REMOVED***

    /**
     * Sets the position of the selected handle and fill bar.
     * @function
     * @private
     * @param {jQuery***REMOVED*** $hndl - the selected handle to move.
     * @param {Number***REMOVED*** location - floating point between the start and end values of the slider bar.
     * @param {Function***REMOVED*** cb - callback function to fire on completion.
     * @fires Slider#moved
     * @fires Slider#changed
     */

  ***REMOVED***, {
    key: '_setHandlePos',
    value: function _setHandlePos($hndl, location, noInvert, cb) {
      // don't move if the slider has been disabled since its initialization
      if (this.$element.hasClass(this.options.disabledClass)) {
        return;
      ***REMOVED***
      //might need to alter that slightly for bars that will have odd number selections.
      location = parseFloat(location); //on input change events, convert string to number...grumble.

      // prevent slider from running out of bounds, if value exceeds the limits set through options, override the value to min/max
      if (location < this.options.start) {
        location = this.options.start;
      ***REMOVED*** else if (location > this.options.end) {
        location = this.options.end;
      ***REMOVED***

      var isDbl = this.options.doubleSided;

      //this is for single-handled vertical sliders, it adjusts the value to account for the slider being "upside-down"
      //for click and drag events, it's weird due to the scale(-1, 1) css property
      if (this.options.vertical && !noInvert) {
        location = this.options.end - location;
      ***REMOVED***

      if (isDbl) {
        //this block is to prevent 2 handles from crossing eachother. Could/should be improved.
        if (this.handles.index($hndl) === 0) {
          var h2Val = parseFloat(this.$handle2.attr('aria-valuenow'));
          location = location >= h2Val ? h2Val - this.options.step : location;
        ***REMOVED*** else {
          var h1Val = parseFloat(this.$handle.attr('aria-valuenow'));
          location = location <= h1Val ? h1Val + this.options.step : location;
        ***REMOVED***
      ***REMOVED***

      var _this = this,
          vert = this.options.vertical,
          hOrW = vert ? 'height' : 'width',
          lOrT = vert ? 'top' : 'left',
          handleDim = $hndl[0].getBoundingClientRect()[hOrW],
          elemDim = this.$element[0].getBoundingClientRect()[hOrW],

      //percentage of bar min/max value based on click or drag point
      pctOfBar = this._pctOfBar(location),

      //number of actual pixels to shift the handle, based on the percentage obtained above
      pxToMove = (elemDim - handleDim) * pctOfBar,

      //percentage of bar to shift the handle
      movement = (percent(pxToMove, elemDim) * 100).toFixed(this.options.decimal);
      //fixing the decimal value for the location number, is passed to other methods as a fixed floating-point value
      location = parseFloat(location.toFixed(this.options.decimal));
      // declare empty object for css adjustments, only used with 2 handled-sliders
      var css = {***REMOVED***;

      this._setValues($hndl, location);

      // TODO update to calculate based on values set to respective inputs??
      if (isDbl) {
        var isLeftHndl = this.handles.index($hndl) === 0,

        //empty variable, will be used for min-height/width for fill bar
        dim,

        //percentage w/h of the handle compared to the slider bar
        handlePct = ~~(percent(handleDim, elemDim) * 100);
        //if left handle, the math is slightly different than if it's the right handle, and the left/top property needs to be changed for the fill bar
        if (isLeftHndl) {
          //left or top percentage value to apply to the fill bar.
          css[lOrT] = movement + '%';
          //calculate the new min-height/width for the fill bar.
          dim = parseFloat(this.$handle2[0].style[lOrT]) - movement + handlePct;
          //this callback is necessary to prevent errors and allow the proper placement and initialization of a 2-handled slider
          //plus, it means we don't care if 'dim' isNaN on init, it won't be in the future.
          if (cb && typeof cb === 'function') {
            cb();
          ***REMOVED*** //this is only needed for the initialization of 2 handled sliders
        ***REMOVED*** else {
          //just caching the value of the left/bottom handle's left/top property
          var handlePos = parseFloat(this.$handle[0].style[lOrT]);
          //calculate the new min-height/width for the fill bar. Use isNaN to prevent false positives for numbers <= 0
          //based on the percentage of movement of the handle being manipulated, less the opposing handle's left/top position, plus the percentage w/h of the handle itself
          dim = movement - (isNaN(handlePos) ? (this.options.initialStart - this.options.start) / ((this.options.end - this.options.start) / 100) : handlePos) + handlePct;
        ***REMOVED***
        // assign the min-height/width to our css object
        css['min-' + hOrW] = dim + '%';
      ***REMOVED***

      this.$element.one('finished.zf.animate', function () {
        /**
         * Fires when the handle is done moving.
         * @event Slider#moved
         */
        _this.$element.trigger('moved.zf.slider', [$hndl]);
      ***REMOVED***);

      //because we don't know exactly how the handle will be moved, check the amount of time it should take to move.
      var moveTime = this.$element.data('dragging') ? 1000 / 60 : this.options.moveTime;

      __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_2__foundation_util_motion__["b" /* Move */])(moveTime, $hndl, function () {
        // adjusting the left/top property of the handle, based on the percentage calculated above
        // if movement isNaN, that is because the slider is hidden and we cannot determine handle width,
        // fall back to next best guess.
        if (isNaN(movement)) {
          $hndl.css(lOrT, pctOfBar * 100 + '%');
        ***REMOVED*** else {
          $hndl.css(lOrT, movement + '%');
        ***REMOVED***

        if (!_this.options.doubleSided) {
          //if single-handled, a simple method to expand the fill bar
          _this.$fill.css(hOrW, pctOfBar * 100 + '%');
        ***REMOVED*** else {
          //otherwise, use the css object we created above
          _this.$fill.css(css);
        ***REMOVED***
      ***REMOVED***);

      /**
       * Fires when the value has not been change for a given time.
       * @event Slider#changed
       */
      clearTimeout(_this.timeout);
      _this.timeout = setTimeout(function () {
        _this.$element.trigger('changed.zf.slider', [$hndl]);
      ***REMOVED***, _this.options.changedDelay);
    ***REMOVED***

    /**
     * Sets the initial attribute for the slider element.
     * @function
     * @private
     * @param {Number***REMOVED*** idx - index of the current handle/input to use.
     */

  ***REMOVED***, {
    key: '_setInitAttr',
    value: function _setInitAttr(idx) {
      var initVal = idx === 0 ? this.options.initialStart : this.options.initialEnd;
      var id = this.inputs.eq(idx).attr('id') || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["a" /* GetYoDigits */])(6, 'slider');
      this.inputs.eq(idx).attr({
        'id': id,
        'max': this.options.end,
        'min': this.options.start,
        'step': this.options.step
      ***REMOVED***);
      this.inputs.eq(idx).val(initVal);
      this.handles.eq(idx).attr({
        'role': 'slider',
        'aria-controls': id,
        'aria-valuemax': this.options.end,
        'aria-valuemin': this.options.start,
        'aria-valuenow': initVal,
        'aria-orientation': this.options.vertical ? 'vertical' : 'horizontal',
        'tabindex': 0
      ***REMOVED***);
    ***REMOVED***

    /**
     * Sets the input and `aria-valuenow` values for the slider element.
     * @function
     * @private
     * @param {jQuery***REMOVED*** $handle - the currently selected handle.
     * @param {Number***REMOVED*** val - floating point of the new value.
     */

  ***REMOVED***, {
    key: '_setValues',
    value: function _setValues($handle, val) {
      var idx = this.options.doubleSided ? this.handles.index($handle) : 0;
      this.inputs.eq(idx).val(val);
      $handle.attr('aria-valuenow', val);
    ***REMOVED***

    /**
     * Handles events on the slider element.
     * Calculates the new location of the current handle.
     * If there are two handles and the bar was clicked, it determines which handle to move.
     * @function
     * @private
     * @param {Object***REMOVED*** e - the `event` object passed from the listener.
     * @param {jQuery***REMOVED*** $handle - the current handle to calculate for, if selected.
     * @param {Number***REMOVED*** val - floating point number for the new value of the slider.
     * TODO clean this up, there's a lot of repeated code between this and the _setHandlePos fn.
     */

  ***REMOVED***, {
    key: '_handleEvent',
    value: function _handleEvent(e, $handle, val) {
      var value, hasVal;
      if (!val) {
        //click or drag events
        e.preventDefault();
        var _this = this,
            vertical = this.options.vertical,
            param = vertical ? 'height' : 'width',
            direction = vertical ? 'top' : 'left',
            eventOffset = vertical ? e.pageY : e.pageX,
            halfOfHandle = this.$handle[0].getBoundingClientRect()[param] / 2,
            barDim = this.$element[0].getBoundingClientRect()[param],
            windowScroll = vertical ? __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).scrollTop() : __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).scrollLeft();

        var elemOffset = this.$element.offset()[direction];

        // touch events emulated by the touch util give position relative to screen, add window.scroll to event coordinates...
        // best way to guess this is simulated is if clientY == pageY
        if (e.clientY === e.pageY) {
          eventOffset = eventOffset + windowScroll;
        ***REMOVED***
        var eventFromBar = eventOffset - elemOffset;
        var barXY;
        if (eventFromBar < 0) {
          barXY = 0;
        ***REMOVED*** else if (eventFromBar > barDim) {
          barXY = barDim;
        ***REMOVED*** else {
          barXY = eventFromBar;
        ***REMOVED***
        var offsetPct = percent(barXY, barDim);

        value = this._value(offsetPct);

        // turn everything around for RTL, yay math!
        if (__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_3__foundation_util_core__["b" /* rtl */])() && !this.options.vertical) {
          value = this.options.end - value;
        ***REMOVED***

        value = _this._adjustValue(null, value);
        //boolean flag for the setHandlePos fn, specifically for vertical sliders
        hasVal = false;

        if (!$handle) {
          //figure out which handle it is, pass it to the next function.
          var firstHndlPos = absPosition(this.$handle, direction, barXY, param),
              secndHndlPos = absPosition(this.$handle2, direction, barXY, param);
          $handle = firstHndlPos <= secndHndlPos ? this.$handle : this.$handle2;
        ***REMOVED***
      ***REMOVED*** else {
        //change event on input
        value = this._adjustValue(null, val);
        hasVal = true;
      ***REMOVED***

      this._setHandlePos($handle, value, hasVal);
    ***REMOVED***

    /**
     * Adjustes value for handle in regard to step value. returns adjusted value
     * @function
     * @private
     * @param {jQuery***REMOVED*** $handle - the selected handle.
     * @param {Number***REMOVED*** value - value to adjust. used if $handle is falsy
     */

  ***REMOVED***, {
    key: '_adjustValue',
    value: function _adjustValue($handle, value) {
      var val,
          step = this.options.step,
          div = parseFloat(step / 2),
          left,
          prev_val,
          next_val;
      if (!!$handle) {
        val = parseFloat($handle.attr('aria-valuenow'));
      ***REMOVED*** else {
        val = value;
      ***REMOVED***
      left = val % step;
      prev_val = val - left;
      next_val = prev_val + step;
      if (left === 0) {
        return val;
      ***REMOVED***
      val = val >= prev_val + div ? next_val : prev_val;
      return val;
    ***REMOVED***

    /**
     * Adds event listeners to the slider elements.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      this._eventsForHandle(this.$handle);
      if (this.handles[1]) {
        this._eventsForHandle(this.$handle2);
      ***REMOVED***
    ***REMOVED***

    /**
     * Adds event listeners a particular handle
     * @function
     * @private
     * @param {jQuery***REMOVED*** $handle - the current handle to apply listeners to.
     */

  ***REMOVED***, {
    key: '_eventsForHandle',
    value: function _eventsForHandle($handle) {
      var _this = this,
          curHandle,
          timer;

      this.inputs.off('change.zf.slider').on('change.zf.slider', function (e) {
        var idx = _this.inputs.index(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this));
        _this._handleEvent(e, _this.handles.eq(idx), __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).val());
      ***REMOVED***);

      if (this.options.clickSelect) {
        this.$element.off('click.zf.slider').on('click.zf.slider', function (e) {
          if (_this.$element.data('dragging')) {
            return false;
          ***REMOVED***

          if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.target).is('[data-slider-handle]')) {
            if (_this.options.doubleSided) {
              _this._handleEvent(e);
            ***REMOVED*** else {
              _this._handleEvent(e, _this.$handle);
            ***REMOVED***
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***

      if (this.options.draggable) {
        this.handles.addTouch();

        var $body = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('body');
        $handle.off('mousedown.zf.slider').on('mousedown.zf.slider', function (e) {
          $handle.addClass('is-dragging');
          _this.$fill.addClass('is-dragging'); //
          _this.$element.data('dragging', true);

          curHandle = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(e.currentTarget);

          $body.on('mousemove.zf.slider', function (e) {
            e.preventDefault();
            _this._handleEvent(e, curHandle);
          ***REMOVED***).on('mouseup.zf.slider', function (e) {
            _this._handleEvent(e, curHandle);

            $handle.removeClass('is-dragging');
            _this.$fill.removeClass('is-dragging');
            _this.$element.data('dragging', false);

            $body.off('mousemove.zf.slider mouseup.zf.slider');
          ***REMOVED***);
        ***REMOVED***)
        // prevent events triggered by touch
        .on('selectstart.zf.slider touchmove.zf.slider', function (e) {
          e.preventDefault();
        ***REMOVED***);
      ***REMOVED***

      $handle.off('keydown.zf.slider').on('keydown.zf.slider', function (e) {
        var _$handle = __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this),
            idx = _this.options.doubleSided ? _this.handles.index(_$handle) : 0,
            oldValue = parseFloat(_this.inputs.eq(idx).val()),
            newValue;

        // handle keyboard event with keyboard util
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_keyboard__["a" /* Keyboard */].handleKey(e, 'Slider', {
          decrease: function () {
            newValue = oldValue - _this.options.step;
          ***REMOVED***,
          increase: function () {
            newValue = oldValue + _this.options.step;
          ***REMOVED***,
          decrease_fast: function () {
            newValue = oldValue - _this.options.step * 10;
          ***REMOVED***,
          increase_fast: function () {
            newValue = oldValue + _this.options.step * 10;
          ***REMOVED***,
          min: function () {
            newValue = _this.options.start;
          ***REMOVED***,
          max: function () {
            newValue = _this.options.end;
          ***REMOVED***,
          handled: function () {
            // only set handle pos when event was handled specially
            e.preventDefault();
            _this._setHandlePos(_$handle, newValue, true);
          ***REMOVED***
        ***REMOVED***);
        /*if (newValue) { // if pressed key has special function, update value
          e.preventDefault();
          _this._setHandlePos(_$handle, newValue);
        ***REMOVED****/
      ***REMOVED***);
    ***REMOVED***

    /**
     * Destroys the slider plugin.
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.handles.off('.zf.slider');
      this.inputs.off('.zf.slider');
      this.$element.off('.zf.slider');

      clearTimeout(this.timeout);
    ***REMOVED***
  ***REMOVED***]);

  return Slider;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_4__foundation_plugin__["a" /* Plugin */]);

Slider.defaults = {
  /**
   * Minimum value for the slider scale.
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  start: 0,
  /**
   * Maximum value for the slider scale.
   * @option
   * @type {number***REMOVED***
   * @default 100
   */
  end: 100,
  /**
   * Minimum value change per change event.
   * @option
   * @type {number***REMOVED***
   * @default 1
   */
  step: 1,
  /**
   * Value at which the handle/input *(left handle/first input)* should be set to on initialization.
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  initialStart: 0,
  /**
   * Value at which the right handle/second input should be set to on initialization.
   * @option
   * @type {number***REMOVED***
   * @default 100
   */
  initialEnd: 100,
  /**
   * Allows the input to be located outside the container and visible. Set to by the JS
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  binding: false,
  /**
   * Allows the user to click/tap on the slider bar to select a value.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  clickSelect: true,
  /**
   * Set to true and use the `vertical` class to change alignment to vertical.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  vertical: false,
  /**
   * Allows the user to drag the slider handle(s) to select a value.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  draggable: true,
  /**
   * Disables the slider and prevents event listeners from being applied. Double checked by JS with `disabledClass`.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  disabled: false,
  /**
   * Allows the use of two handles. Double checked by the JS. Changes some logic handling.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  doubleSided: false,
  /**
   * Potential future feature.
   */
  // steps: 100,
  /**
   * Number of decimal places the plugin should go to for floating point precision.
   * @option
   * @type {number***REMOVED***
   * @default 2
   */
  decimal: 2,
  /**
   * Time delay for dragged elements.
   */
  // dragDelay: 0,
  /**
   * Time, in ms, to animate the movement of a slider handle if user clicks/taps on the bar. Needs to be manually set if updating the transition time in the Sass settings.
   * @option
   * @type {number***REMOVED***
   * @default 200
   */
  moveTime: 200, //update this if changing the transition time in the sass
  /**
   * Class applied to disabled sliders.
   * @option
   * @type {string***REMOVED***
   * @default 'disabled'
   */
  disabledClass: 'disabled',
  /**
   * Will invert the default layout for a vertical<span data-tooltip title="who would do this???"> </span>slider.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  invertVertical: false,
  /**
   * Milliseconds before the `changed.zf-slider` event is triggered after value change.
   * @option
   * @type {number***REMOVED***
   * @default 500
   */
  changedDelay: 500,
  /**
  * Basevalue for non-linear sliders
  * @option
  * @type {number***REMOVED***
  * @default 5
  */
  nonLinearBase: 5,
  /**
  * Basevalue for non-linear sliders, possible values are: `'linear'`, `'pow'` & `'log'`. Pow and Log use the nonLinearBase setting.
  * @option
  * @type {string***REMOVED***
  * @default 'linear'
  */
  positionValueFunction: 'linear'
***REMOVED***;

function percent(frac, num) {
  return frac / num;
***REMOVED***
function absPosition($handle, dir, clickPos, param) {
  return Math.abs($handle.position()[dir] + $handle[param]() / 2 - clickPos);
***REMOVED***
function baseLog(base, value) {
  return Math.log(value) / Math.log(base);
***REMOVED***



/***/ ***REMOVED***),
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Sticky; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_util_triggers__ = __webpack_require__(5);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***







/**
 * Sticky module.
 * @module foundation.sticky
 * @requires foundation.util.triggers
 * @requires foundation.util.mediaQuery
 */

var Sticky = function (_Plugin) {
  _inherits(Sticky, _Plugin);

  function Sticky() {
    _classCallCheck(this, Sticky);

    return _possibleConstructorReturn(this, (Sticky.__proto__ || Object.getPrototypeOf(Sticky)).apply(this, arguments));
  ***REMOVED***

  _createClass(Sticky, [{
    key: '_setup',

    /**
     * Creates a new instance of a sticky thing.
     * @class
     * @name Sticky
     * @param {jQuery***REMOVED*** element - jQuery object to make sticky.
     * @param {Object***REMOVED*** options - options object passed when creating the element programmatically.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Sticky.defaults, this.$element.data(), options);
      this.className = 'Sticky'; // ie9 back compat

      // Triggers init is idempotent, just need to make sure it is initialized
      __WEBPACK_IMPORTED_MODULE_4__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

      this._init();
    ***REMOVED***

    /**
     * Initializes the sticky element by adding classes, getting/setting dimensions, breakpoints and attributes
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();

      var $parent = this.$element.parent('[data-sticky-container]'),
          id = this.$element[0].id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["a" /* GetYoDigits */])(6, 'sticky'),
          _this = this;

      if ($parent.length) {
        this.$container = $parent;
      ***REMOVED*** else {
        this.wasWrapped = true;
        this.$element.wrap(this.options.container);
        this.$container = this.$element.parent();
      ***REMOVED***
      this.$container.addClass(this.options.containerClass);

      this.$element.addClass(this.options.stickyClass).attr({ 'data-resize': id, 'data-mutate': id ***REMOVED***);
      if (this.options.anchor !== '') {
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + _this.options.anchor).attr({ 'data-mutate': id ***REMOVED***);
      ***REMOVED***

      this.scrollCount = this.options.checkEvery;
      this.isStuck = false;
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).one('load.zf.sticky', function () {
        //We calculate the container height to have correct values for anchor points offset calculation.
        _this.containerHeight = _this.$element.css("display") == "none" ? 0 : _this.$element[0].getBoundingClientRect().height;
        _this.$container.css('height', _this.containerHeight);
        _this.elemHeight = _this.containerHeight;
        if (_this.options.anchor !== '') {
          _this.$anchor = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + _this.options.anchor);
        ***REMOVED*** else {
          _this._parsePoints();
        ***REMOVED***

        _this._setSizes(function () {
          var scroll = window.pageYOffset;
          _this._calc(false, scroll);
          //Unstick the element will ensure that proper classes are set.
          if (!_this.isStuck) {
            _this._removeSticky(scroll >= _this.topPoint ? false : true);
          ***REMOVED***
        ***REMOVED***);
        _this._events(id.split('-').reverse().join('-'));
      ***REMOVED***);
    ***REMOVED***

    /**
     * If using multiple elements as anchors, calculates the top and bottom pixel values the sticky thing should stick and unstick on.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_parsePoints',
    value: function _parsePoints() {
      var top = this.options.topAnchor == "" ? 1 : this.options.topAnchor,
          btm = this.options.btmAnchor == "" ? document.documentElement.scrollHeight : this.options.btmAnchor,
          pts = [top, btm],
          breaks = {***REMOVED***;
      for (var i = 0, len = pts.length; i < len && pts[i]; i++) {
        var pt;
        if (typeof pts[i] === 'number') {
          pt = pts[i];
        ***REMOVED*** else {
          var place = pts[i].split(':'),
              anchor = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('#' + place[0]);

          pt = anchor.offset().top;
          if (place[1] && place[1].toLowerCase() === 'bottom') {
            pt += anchor[0].getBoundingClientRect().height;
          ***REMOVED***
        ***REMOVED***
        breaks[i] = pt;
      ***REMOVED***

      this.points = breaks;
      return;
    ***REMOVED***

    /**
     * Adds event handlers for the scrolling element.
     * @private
     * @param {String***REMOVED*** id - pseudo-random id for unique scroll event listener.
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events(id) {
      var _this = this,
          scrollListener = this.scrollListener = 'scroll.zf.' + id;
      if (this.isOn) {
        return;
      ***REMOVED***
      if (this.canStick) {
        this.isOn = true;
        __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(scrollListener).on(scrollListener, function (e) {
          if (_this.scrollCount === 0) {
            _this.scrollCount = _this.options.checkEvery;
            _this._setSizes(function () {
              _this._calc(false, window.pageYOffset);
            ***REMOVED***);
          ***REMOVED*** else {
            _this.scrollCount--;
            _this._calc(false, window.pageYOffset);
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***

      this.$element.off('resizeme.zf.trigger').on('resizeme.zf.trigger', function (e, el) {
        _this._eventsHandler(id);
      ***REMOVED***);

      this.$element.on('mutateme.zf.trigger', function (e, el) {
        _this._eventsHandler(id);
      ***REMOVED***);

      if (this.$anchor) {
        this.$anchor.on('mutateme.zf.trigger', function (e, el) {
          _this._eventsHandler(id);
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***

    /**
     * Handler for events.
     * @private
     * @param {String***REMOVED*** id - pseudo-random id for unique scroll event listener.
     */

  ***REMOVED***, {
    key: '_eventsHandler',
    value: function _eventsHandler(id) {
      var _this = this,
          scrollListener = this.scrollListener = 'scroll.zf.' + id;

      _this._setSizes(function () {
        _this._calc(false);
        if (_this.canStick) {
          if (!_this.isOn) {
            _this._events(id);
          ***REMOVED***
        ***REMOVED*** else if (_this.isOn) {
          _this._pauseListeners(scrollListener);
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
     * Removes event handlers for scroll and change events on anchor.
     * @fires Sticky#pause
     * @param {String***REMOVED*** scrollListener - unique, namespaced scroll listener attached to `window`
     */

  ***REMOVED***, {
    key: '_pauseListeners',
    value: function _pauseListeners(scrollListener) {
      this.isOn = false;
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(scrollListener);

      /**
       * Fires when the plugin is paused due to resize event shrinking the view.
       * @event Sticky#pause
       * @private
       */
      this.$element.trigger('pause.zf.sticky');
    ***REMOVED***

    /**
     * Called on every `scroll` event and on `_init`
     * fires functions based on booleans and cached values
     * @param {Boolean***REMOVED*** checkSizes - true if plugin should recalculate sizes and breakpoints.
     * @param {Number***REMOVED*** scroll - current scroll position passed from scroll event cb function. If not passed, defaults to `window.pageYOffset`.
     */

  ***REMOVED***, {
    key: '_calc',
    value: function _calc(checkSizes, scroll) {
      if (checkSizes) {
        this._setSizes();
      ***REMOVED***

      if (!this.canStick) {
        if (this.isStuck) {
          this._removeSticky(true);
        ***REMOVED***
        return false;
      ***REMOVED***

      if (!scroll) {
        scroll = window.pageYOffset;
      ***REMOVED***

      if (scroll >= this.topPoint) {
        if (scroll <= this.bottomPoint) {
          if (!this.isStuck) {
            this._setSticky();
          ***REMOVED***
        ***REMOVED*** else {
          if (this.isStuck) {
            this._removeSticky(false);
          ***REMOVED***
        ***REMOVED***
      ***REMOVED*** else {
        if (this.isStuck) {
          this._removeSticky(true);
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

    /**
     * Causes the $element to become stuck.
     * Adds `position: fixed;`, and helper classes.
     * @fires Sticky#stuckto
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_setSticky',
    value: function _setSticky() {
      var _this = this,
          stickTo = this.options.stickTo,
          mrgn = stickTo === 'top' ? 'marginTop' : 'marginBottom',
          notStuckTo = stickTo === 'top' ? 'bottom' : 'top',
          css = {***REMOVED***;

      css[mrgn] = this.options[mrgn] + 'em';
      css[stickTo] = 0;
      css[notStuckTo] = 'auto';
      this.isStuck = true;
      this.$element.removeClass('is-anchored is-at-' + notStuckTo).addClass('is-stuck is-at-' + stickTo).css(css)
      /**
       * Fires when the $element has become `position: fixed;`
       * Namespaced to `top` or `bottom`, e.g. `sticky.zf.stuckto:top`
       * @event Sticky#stuckto
       */
      .trigger('sticky.zf.stuckto:' + stickTo);
      this.$element.on("transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd", function () {
        _this._setSizes();
      ***REMOVED***);
    ***REMOVED***

    /**
     * Causes the $element to become unstuck.
     * Removes `position: fixed;`, and helper classes.
     * Adds other helper classes.
     * @param {Boolean***REMOVED*** isTop - tells the function if the $element should anchor to the top or bottom of its $anchor element.
     * @fires Sticky#unstuckfrom
     * @private
     */

  ***REMOVED***, {
    key: '_removeSticky',
    value: function _removeSticky(isTop) {
      var stickTo = this.options.stickTo,
          stickToTop = stickTo === 'top',
          css = {***REMOVED***,
          anchorPt = (this.points ? this.points[1] - this.points[0] : this.anchorHeight) - this.elemHeight,
          mrgn = stickToTop ? 'marginTop' : 'marginBottom',
          notStuckTo = stickToTop ? 'bottom' : 'top',
          topOrBottom = isTop ? 'top' : 'bottom';

      css[mrgn] = 0;

      css['bottom'] = 'auto';
      if (isTop) {
        css['top'] = 0;
      ***REMOVED*** else {
        css['top'] = anchorPt;
      ***REMOVED***

      this.isStuck = false;
      this.$element.removeClass('is-stuck is-at-' + stickTo).addClass('is-anchored is-at-' + topOrBottom).css(css)
      /**
       * Fires when the $element has become anchored.
       * Namespaced to `top` or `bottom`, e.g. `sticky.zf.unstuckfrom:bottom`
       * @event Sticky#unstuckfrom
       */
      .trigger('sticky.zf.unstuckfrom:' + topOrBottom);
    ***REMOVED***

    /**
     * Sets the $element and $container sizes for plugin.
     * Calls `_setBreakPoints`.
     * @param {Function***REMOVED*** cb - optional callback function to fire on completion of `_setBreakPoints`.
     * @private
     */

  ***REMOVED***, {
    key: '_setSizes',
    value: function _setSizes(cb) {
      this.canStick = __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */].is(this.options.stickyOn);
      if (!this.canStick) {
        if (cb && typeof cb === 'function') {
          cb();
        ***REMOVED***
      ***REMOVED***
      var _this = this,
          newElemWidth = this.$container[0].getBoundingClientRect().width,
          comp = window.getComputedStyle(this.$container[0]),
          pdngl = parseInt(comp['padding-left'], 10),
          pdngr = parseInt(comp['padding-right'], 10);

      if (this.$anchor && this.$anchor.length) {
        this.anchorHeight = this.$anchor[0].getBoundingClientRect().height;
      ***REMOVED*** else {
        this._parsePoints();
      ***REMOVED***

      this.$element.css({
        'max-width': newElemWidth - pdngl - pdngr + 'px'
      ***REMOVED***);

      var newContainerHeight = this.$element[0].getBoundingClientRect().height || this.containerHeight;
      if (this.$element.css("display") == "none") {
        newContainerHeight = 0;
      ***REMOVED***
      this.containerHeight = newContainerHeight;
      this.$container.css({
        height: newContainerHeight
      ***REMOVED***);
      this.elemHeight = newContainerHeight;

      if (!this.isStuck) {
        if (this.$element.hasClass('is-at-bottom')) {
          var anchorPt = (this.points ? this.points[1] - this.$container.offset().top : this.anchorHeight) - this.elemHeight;
          this.$element.css('top', anchorPt);
        ***REMOVED***
      ***REMOVED***

      this._setBreakPoints(newContainerHeight, function () {
        if (cb && typeof cb === 'function') {
          cb();
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
     * Sets the upper and lower breakpoints for the element to become sticky/unsticky.
     * @param {Number***REMOVED*** elemHeight - px value for sticky.$element height, calculated by `_setSizes`.
     * @param {Function***REMOVED*** cb - optional callback function to be called on completion.
     * @private
     */

  ***REMOVED***, {
    key: '_setBreakPoints',
    value: function _setBreakPoints(elemHeight, cb) {
      if (!this.canStick) {
        if (cb && typeof cb === 'function') {
          cb();
        ***REMOVED*** else {
          return false;
        ***REMOVED***
      ***REMOVED***
      var mTop = emCalc(this.options.marginTop),
          mBtm = emCalc(this.options.marginBottom),
          topPoint = this.points ? this.points[0] : this.$anchor.offset().top,
          bottomPoint = this.points ? this.points[1] : topPoint + this.anchorHeight,

      // topPoint = this.$anchor.offset().top || this.points[0],
      // bottomPoint = topPoint + this.anchorHeight || this.points[1],
      winHeight = window.innerHeight;

      if (this.options.stickTo === 'top') {
        topPoint -= mTop;
        bottomPoint -= elemHeight + mTop;
      ***REMOVED*** else if (this.options.stickTo === 'bottom') {
        topPoint -= winHeight - (elemHeight + mBtm);
        bottomPoint -= winHeight - mBtm;
      ***REMOVED*** else {
        //this would be the stickTo: both option... tricky
      ***REMOVED***

      this.topPoint = topPoint;
      this.bottomPoint = bottomPoint;

      if (cb && typeof cb === 'function') {
        cb();
      ***REMOVED***
    ***REMOVED***

    /**
     * Destroys the current sticky element.
     * Resets the element to the top position first.
     * Removes event listeners, JS-added css properties and classes, and unwraps the $element if the JS added the $container.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this._removeSticky(true);

      this.$element.removeClass(this.options.stickyClass + ' is-anchored is-at-top').css({
        height: '',
        top: '',
        bottom: '',
        'max-width': ''
      ***REMOVED***).off('resizeme.zf.trigger').off('mutateme.zf.trigger');
      if (this.$anchor && this.$anchor.length) {
        this.$anchor.off('change.zf.sticky');
      ***REMOVED***
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()(window).off(this.scrollListener);

      if (this.wasWrapped) {
        this.$element.unwrap();
      ***REMOVED*** else {
        this.$container.removeClass(this.options.containerClass).css({
          height: ''
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***]);

  return Sticky;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_3__foundation_plugin__["a" /* Plugin */]);

Sticky.defaults = {
  /**
   * Customizable container template. Add your own classes for styling and sizing.
   * @option
   * @type {string***REMOVED***
   * @default '&lt;div data-sticky-container&gt;&lt;/div&gt;'
   */
  container: '<div data-sticky-container></div>',
  /**
   * Location in the view the element sticks to. Can be `'top'` or `'bottom'`.
   * @option
   * @type {string***REMOVED***
   * @default 'top'
   */
  stickTo: 'top',
  /**
   * If anchored to a single element, the id of that element.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  anchor: '',
  /**
   * If using more than one element as anchor points, the id of the top anchor.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  topAnchor: '',
  /**
   * If using more than one element as anchor points, the id of the bottom anchor.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  btmAnchor: '',
  /**
   * Margin, in `em`'s to apply to the top of the element when it becomes sticky.
   * @option
   * @type {number***REMOVED***
   * @default 1
   */
  marginTop: 1,
  /**
   * Margin, in `em`'s to apply to the bottom of the element when it becomes sticky.
   * @option
   * @type {number***REMOVED***
   * @default 1
   */
  marginBottom: 1,
  /**
   * Breakpoint string that is the minimum screen size an element should become sticky.
   * @option
   * @type {string***REMOVED***
   * @default 'medium'
   */
  stickyOn: 'medium',
  /**
   * Class applied to sticky element, and removed on destruction. Foundation defaults to `sticky`.
   * @option
   * @type {string***REMOVED***
   * @default 'sticky'
   */
  stickyClass: 'sticky',
  /**
   * Class applied to sticky container. Foundation defaults to `sticky-container`.
   * @option
   * @type {string***REMOVED***
   * @default 'sticky-container'
   */
  containerClass: 'sticky-container',
  /**
   * Number of scroll events between the plugin's recalculating sticky points. Setting it to `0` will cause it to recalc every scroll event, setting it to `-1` will prevent recalc on scroll.
   * @option
   * @type {number***REMOVED***
   * @default -1
   */
  checkEvery: -1
***REMOVED***;

/**
 * Helper function to calculate em values
 * @param Number {em***REMOVED*** - number of em's to calculate into pixels
 */
function emCalc(em) {
  return parseInt(window.getComputedStyle(document.body, null).fontSize, 10) * em;
***REMOVED***



/***/ ***REMOVED***),
/* 31 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Toggler; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_plugin__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_triggers__ = __webpack_require__(5);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***






/**
 * Toggler module.
 * @module foundation.toggler
 * @requires foundation.util.motion
 * @requires foundation.util.triggers
 */

var Toggler = function (_Plugin) {
  _inherits(Toggler, _Plugin);

  function Toggler() {
    _classCallCheck(this, Toggler);

    return _possibleConstructorReturn(this, (Toggler.__proto__ || Object.getPrototypeOf(Toggler)).apply(this, arguments));
  ***REMOVED***

  _createClass(Toggler, [{
    key: '_setup',

    /**
     * Creates a new instance of Toggler.
     * @class
     * @name Toggler
     * @fires Toggler#init
     * @param {Object***REMOVED*** element - jQuery object to add the trigger to.
     * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Toggler.defaults, element.data(), options);
      this.className = '';
      this.className = 'Toggler'; // ie9 back compat

      // Triggers init is idempotent, just need to make sure it is initialized
      __WEBPACK_IMPORTED_MODULE_3__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

      this._init();
      this._events();
    ***REMOVED***

    /**
     * Initializes the Toggler plugin by parsing the toggle class from data-toggler, or animation classes from data-animate.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      var input;
      // Parse animation classes if they were set
      if (this.options.animate) {
        input = this.options.animate.split(' ');

        this.animationIn = input[0];
        this.animationOut = input[1] || null;
      ***REMOVED***
      // Otherwise, parse toggle class
      else {
          input = this.$element.data('toggler');
          // Allow for a . at the beginning of the string
          this.className = input[0] === '.' ? input.slice(1) : input;
        ***REMOVED***

      // Add ARIA attributes to triggers
      var id = this.$element[0].id;
      __WEBPACK_IMPORTED_MODULE_0_jquery___default()('[data-open="' + id + '"], [data-close="' + id + '"], [data-toggle="' + id + '"]').attr('aria-controls', id);
      // If the target is hidden, add aria-hidden
      this.$element.attr('aria-expanded', this.$element.is(':hidden') ? false : true);
    ***REMOVED***

    /**
     * Initializes events for the toggle trigger.
     * @function
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      this.$element.off('toggle.zf.trigger').on('toggle.zf.trigger', this.toggle.bind(this));
    ***REMOVED***

    /**
     * Toggles the target class on the target element. An event is fired from the original trigger depending on if the resultant state was "on" or "off".
     * @function
     * @fires Toggler#on
     * @fires Toggler#off
     */

  ***REMOVED***, {
    key: 'toggle',
    value: function toggle() {
      this[this.options.animate ? '_toggleAnimate' : '_toggleClass']();
    ***REMOVED***
  ***REMOVED***, {
    key: '_toggleClass',
    value: function _toggleClass() {
      this.$element.toggleClass(this.className);

      var isOn = this.$element.hasClass(this.className);
      if (isOn) {
        /**
         * Fires if the target element has the class after a toggle.
         * @event Toggler#on
         */
        this.$element.trigger('on.zf.toggler');
      ***REMOVED*** else {
        /**
         * Fires if the target element does not have the class after a toggle.
         * @event Toggler#off
         */
        this.$element.trigger('off.zf.toggler');
      ***REMOVED***

      this._updateARIA(isOn);
      this.$element.find('[data-mutate]').trigger('mutateme.zf.trigger');
    ***REMOVED***
  ***REMOVED***, {
    key: '_toggleAnimate',
    value: function _toggleAnimate() {
      var _this = this;

      if (this.$element.is(':hidden')) {
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__["a" /* Motion */].animateIn(this.$element, this.animationIn, function () {
          _this._updateARIA(true);
          this.trigger('on.zf.toggler');
          this.find('[data-mutate]').trigger('mutateme.zf.trigger');
        ***REMOVED***);
      ***REMOVED*** else {
        __WEBPACK_IMPORTED_MODULE_1__foundation_util_motion__["a" /* Motion */].animateOut(this.$element, this.animationOut, function () {
          _this._updateARIA(false);
          this.trigger('off.zf.toggler');
          this.find('[data-mutate]').trigger('mutateme.zf.trigger');
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***, {
    key: '_updateARIA',
    value: function _updateARIA(isOn) {
      this.$element.attr('aria-expanded', isOn ? true : false);
    ***REMOVED***

    /**
     * Destroys the instance of Toggler on the element.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.off('.zf.toggler');
    ***REMOVED***
  ***REMOVED***]);

  return Toggler;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_2__foundation_plugin__["a" /* Plugin */]);

Toggler.defaults = {
  /**
   * Tells the plugin if the element should animated when toggled.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  animate: false
***REMOVED***;



/***/ ***REMOVED***),
/* 32 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Tooltip; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__foundation_util_triggers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__foundation_positionable__ = __webpack_require__(15);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; ***REMOVED*** else { return get(parent, property, receiver); ***REMOVED*** ***REMOVED*** else if ("value" in desc) { return desc.value; ***REMOVED*** else { var getter = desc.get; if (getter === undefined) { return undefined; ***REMOVED*** return getter.call(receiver); ***REMOVED*** ***REMOVED***;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***








/**
 * Tooltip module.
 * @module foundation.tooltip
 * @requires foundation.util.box
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.triggers
 */

var Tooltip = function (_Positionable) {
  _inherits(Tooltip, _Positionable);

  function Tooltip() {
    _classCallCheck(this, Tooltip);

    return _possibleConstructorReturn(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).apply(this, arguments));
  ***REMOVED***

  _createClass(Tooltip, [{
    key: '_setup',

    /**
     * Creates a new instance of a Tooltip.
     * @class
     * @name Tooltip
     * @fires Tooltip#init
     * @param {jQuery***REMOVED*** element - jQuery object to attach a tooltip to.
     * @param {Object***REMOVED*** options - object to extend the default configuration.
     */
    value: function _setup(element, options) {
      this.$element = element;
      this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, Tooltip.defaults, this.$element.data(), options);
      this.className = 'Tooltip'; // ie9 back compat

      this.isActive = false;
      this.isClick = false;

      // Triggers init is idempotent, just need to make sure it is initialized
      __WEBPACK_IMPORTED_MODULE_3__foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

      this._init();
    ***REMOVED***

    /**
     * Initializes the tooltip by setting the creating the tip element, adding it's text, setting private variables and setting attributes on the anchor.
     * @private
     */

  ***REMOVED***, {
    key: '_init',
    value: function _init() {
      __WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */]._init();
      var elemId = this.$element.attr('aria-describedby') || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["a" /* GetYoDigits */])(6, 'tooltip');

      this.options.tipText = this.options.tipText || this.$element.attr('title');
      this.template = this.options.template ? __WEBPACK_IMPORTED_MODULE_0_jquery___default()(this.options.template) : this._buildTemplate(elemId);

      if (this.options.allowHtml) {
        this.template.appendTo(document.body).html(this.options.tipText).hide();
      ***REMOVED*** else {
        this.template.appendTo(document.body).text(this.options.tipText).hide();
      ***REMOVED***

      this.$element.attr({
        'title': '',
        'aria-describedby': elemId,
        'data-yeti-box': elemId,
        'data-toggle': elemId,
        'data-resize': elemId
      ***REMOVED***).addClass(this.options.triggerClass);

      _get(Tooltip.prototype.__proto__ || Object.getPrototypeOf(Tooltip.prototype), '_init', this).call(this);
      this._events();
    ***REMOVED***
  ***REMOVED***, {
    key: '_getDefaultPosition',
    value: function _getDefaultPosition() {
      // handle legacy classnames
      var position = this.$element[0].className.match(/\b(top|left|right|bottom)\b/g);
      return position ? position[0] : 'top';
    ***REMOVED***
  ***REMOVED***, {
    key: '_getDefaultAlignment',
    value: function _getDefaultAlignment() {
      return 'center';
    ***REMOVED***
  ***REMOVED***, {
    key: '_getHOffset',
    value: function _getHOffset() {
      if (this.position === 'left' || this.position === 'right') {
        return this.options.hOffset + this.options.tooltipWidth;
      ***REMOVED*** else {
        return this.options.hOffset;
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***, {
    key: '_getVOffset',
    value: function _getVOffset() {
      if (this.position === 'top' || this.position === 'bottom') {
        return this.options.vOffset + this.options.tooltipHeight;
      ***REMOVED*** else {
        return this.options.vOffset;
      ***REMOVED***
    ***REMOVED***

    /**
     * builds the tooltip element, adds attributes, and returns the template.
     * @private
     */

  ***REMOVED***, {
    key: '_buildTemplate',
    value: function _buildTemplate(id) {
      var templateClasses = (this.options.tooltipClass + ' ' + this.options.positionClass + ' ' + this.options.templateClasses).trim();
      var $template = __WEBPACK_IMPORTED_MODULE_0_jquery___default()('<div></div>').addClass(templateClasses).attr({
        'role': 'tooltip',
        'aria-hidden': true,
        'data-is-active': false,
        'data-is-focus': false,
        'id': id
      ***REMOVED***);
      return $template;
    ***REMOVED***

    /**
     * sets the position class of an element and recursively calls itself until there are no more possible positions to attempt, or the tooltip element is no longer colliding.
     * if the tooltip is larger than the screen width, default to full width - any user selected margin
     * @private
     */

  ***REMOVED***, {
    key: '_setPosition',
    value: function _setPosition() {
      _get(Tooltip.prototype.__proto__ || Object.getPrototypeOf(Tooltip.prototype), '_setPosition', this).call(this, this.$element, this.template);
    ***REMOVED***

    /**
     * reveals the tooltip, and fires an event to close any other open tooltips on the page
     * @fires Tooltip#closeme
     * @fires Tooltip#show
     * @function
     */

  ***REMOVED***, {
    key: 'show',
    value: function show() {
      if (this.options.showOn !== 'all' && !__WEBPACK_IMPORTED_MODULE_2__foundation_util_mediaQuery__["a" /* MediaQuery */].is(this.options.showOn)) {
        // console.error('The screen is too small to display this tooltip');
        return false;
      ***REMOVED***

      var _this = this;
      this.template.css('visibility', 'hidden').show();
      this._setPosition();
      this.template.removeClass('top bottom left right').addClass(this.position);
      this.template.removeClass('align-top align-bottom align-left align-right align-center').addClass('align-' + this.alignment);

      /**
       * Fires to close all other open tooltips on the page
       * @event Closeme#tooltip
       */
      this.$element.trigger('closeme.zf.tooltip', this.template.attr('id'));

      this.template.attr({
        'data-is-active': true,
        'aria-hidden': false
      ***REMOVED***);
      _this.isActive = true;
      // console.log(this.template);
      this.template.stop().hide().css('visibility', '').fadeIn(this.options.fadeInDuration, function () {
        //maybe do stuff?
      ***REMOVED***);
      /**
       * Fires when the tooltip is shown
       * @event Tooltip#show
       */
      this.$element.trigger('show.zf.tooltip');
    ***REMOVED***

    /**
     * Hides the current tooltip, and resets the positioning class if it was changed due to collision
     * @fires Tooltip#hide
     * @function
     */

  ***REMOVED***, {
    key: 'hide',
    value: function hide() {
      // console.log('hiding', this.$element.data('yeti-box'));
      var _this = this;
      this.template.stop().attr({
        'aria-hidden': true,
        'data-is-active': false
      ***REMOVED***).fadeOut(this.options.fadeOutDuration, function () {
        _this.isActive = false;
        _this.isClick = false;
      ***REMOVED***);
      /**
       * fires when the tooltip is hidden
       * @event Tooltip#hide
       */
      this.$element.trigger('hide.zf.tooltip');
    ***REMOVED***

    /**
     * adds event listeners for the tooltip and its anchor
     * TODO combine some of the listeners like focus and mouseenter, etc.
     * @private
     */

  ***REMOVED***, {
    key: '_events',
    value: function _events() {
      var _this = this;
      var $template = this.template;
      var isFocus = false;

      if (!this.options.disableHover) {

        this.$element.on('mouseenter.zf.tooltip', function (e) {
          if (!_this.isActive) {
            _this.timeout = setTimeout(function () {
              _this.show();
            ***REMOVED***, _this.options.hoverDelay);
          ***REMOVED***
        ***REMOVED***).on('mouseleave.zf.tooltip', function (e) {
          clearTimeout(_this.timeout);
          if (!isFocus || _this.isClick && !_this.options.clickOpen) {
            _this.hide();
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***

      if (this.options.clickOpen) {
        this.$element.on('mousedown.zf.tooltip', function (e) {
          e.stopImmediatePropagation();
          if (_this.isClick) {
            //_this.hide();
            // _this.isClick = false;
          ***REMOVED*** else {
            _this.isClick = true;
            if ((_this.options.disableHover || !_this.$element.attr('tabindex')) && !_this.isActive) {
              _this.show();
            ***REMOVED***
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED*** else {
        this.$element.on('mousedown.zf.tooltip', function (e) {
          e.stopImmediatePropagation();
          _this.isClick = true;
        ***REMOVED***);
      ***REMOVED***

      if (!this.options.disableForTouch) {
        this.$element.on('tap.zf.tooltip touchend.zf.tooltip', function (e) {
          _this.isActive ? _this.hide() : _this.show();
        ***REMOVED***);
      ***REMOVED***

      this.$element.on({
        // 'toggle.zf.trigger': this.toggle.bind(this),
        // 'close.zf.trigger': this.hide.bind(this)
        'close.zf.trigger': this.hide.bind(this)
      ***REMOVED***);

      this.$element.on('focus.zf.tooltip', function (e) {
        isFocus = true;
        if (_this.isClick) {
          // If we're not showing open on clicks, we need to pretend a click-launched focus isn't
          // a real focus, otherwise on hover and come back we get bad behavior
          if (!_this.options.clickOpen) {
            isFocus = false;
          ***REMOVED***
          return false;
        ***REMOVED*** else {
          _this.show();
        ***REMOVED***
      ***REMOVED***).on('focusout.zf.tooltip', function (e) {
        isFocus = false;
        _this.isClick = false;
        _this.hide();
      ***REMOVED***).on('resizeme.zf.trigger', function () {
        if (_this.isActive) {
          _this._setPosition();
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    /**
     * adds a toggle method, in addition to the static show() & hide() functions
     * @function
     */

  ***REMOVED***, {
    key: 'toggle',
    value: function toggle() {
      if (this.isActive) {
        this.hide();
      ***REMOVED*** else {
        this.show();
      ***REMOVED***
    ***REMOVED***

    /**
     * Destroys an instance of tooltip, removes template element from the view.
     * @function
     */

  ***REMOVED***, {
    key: '_destroy',
    value: function _destroy() {
      this.$element.attr('title', this.template.text()).off('.zf.trigger .zf.tooltip').removeClass('has-tip top right left').removeAttr('aria-describedby aria-haspopup data-disable-hover data-resize data-toggle data-tooltip data-yeti-box');

      this.template.remove();
    ***REMOVED***
  ***REMOVED***]);

  return Tooltip;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_4__foundation_positionable__["a" /* Positionable */]);

Tooltip.defaults = {
  disableForTouch: false,
  /**
   * Time, in ms, before a tooltip should open on hover.
   * @option
   * @type {number***REMOVED***
   * @default 200
   */
  hoverDelay: 200,
  /**
   * Time, in ms, a tooltip should take to fade into view.
   * @option
   * @type {number***REMOVED***
   * @default 150
   */
  fadeInDuration: 150,
  /**
   * Time, in ms, a tooltip should take to fade out of view.
   * @option
   * @type {number***REMOVED***
   * @default 150
   */
  fadeOutDuration: 150,
  /**
   * Disables hover events from opening the tooltip if set to true
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  disableHover: false,
  /**
   * Optional addtional classes to apply to the tooltip template on init.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  templateClasses: '',
  /**
   * Non-optional class added to tooltip templates. Foundation default is 'tooltip'.
   * @option
   * @type {string***REMOVED***
   * @default 'tooltip'
   */
  tooltipClass: 'tooltip',
  /**
   * Class applied to the tooltip anchor element.
   * @option
   * @type {string***REMOVED***
   * @default 'has-tip'
   */
  triggerClass: 'has-tip',
  /**
   * Minimum breakpoint size at which to open the tooltip.
   * @option
   * @type {string***REMOVED***
   * @default 'small'
   */
  showOn: 'small',
  /**
   * Custom template to be used to generate markup for tooltip.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  template: '',
  /**
   * Text displayed in the tooltip template on open.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  tipText: '',
  touchCloseText: 'Tap to close.',
  /**
   * Allows the tooltip to remain open if triggered with a click or touch event.
   * @option
   * @type {boolean***REMOVED***
   * @default true
   */
  clickOpen: true,
  /**
   * DEPRECATED Additional positioning classes, set by the JS
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  positionClass: '',
  /**
   * Position of tooltip. Can be left, right, bottom, top, or auto.
   * @option
   * @type {string***REMOVED***
   * @default 'auto'
   */
  position: 'auto',
  /**
   * Alignment of tooltip relative to anchor. Can be left, right, bottom, top, center, or auto.
   * @option
   * @type {string***REMOVED***
   * @default 'auto'
   */
  alignment: 'auto',
  /**
   * Allow overlap of container/window. If false, tooltip will first try to
   * position as defined by data-position and data-alignment, but reposition if
   * it would cause an overflow.  @option
   * @type {boolean***REMOVED***
   * @default false
   */
  allowOverlap: false,
  /**
   * Allow overlap of only the bottom of the container. This is the most common
   * behavior for dropdowns, allowing the dropdown to extend the bottom of the
   * screen but not otherwise influence or break out of the container.
   * Less common for tooltips.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  allowBottomOverlap: false,
  /**
   * Distance, in pixels, the template should push away from the anchor on the Y axis.
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  vOffset: 0,
  /**
   * Distance, in pixels, the template should push away from the anchor on the X axis
   * @option
   * @type {number***REMOVED***
   * @default 0
   */
  hOffset: 0,
  /**
   * Distance, in pixels, the template spacing auto-adjust for a vertical tooltip
   * @option
   * @type {number***REMOVED***
   * @default 14
   */
  tooltipHeight: 14,
  /**
   * Distance, in pixels, the template spacing auto-adjust for a horizontal tooltip
   * @option
   * @type {number***REMOVED***
   * @default 12
   */
  tooltipWidth: 12,
  /**
  * Allow HTML in tooltip. Warning: If you are loading user-generated content into tooltips,
  * allowing HTML may open yourself up to XSS attacks.
  * @option
  * @type {boolean***REMOVED***
  * @default false
  */
  allowHtml: false
***REMOVED***;

/**
 * TODO utilize resize event trigger
 */



/***/ ***REMOVED***),
/* 33 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SmoothScroll; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__foundation_util_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__foundation_plugin__ = __webpack_require__(2);


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); ***REMOVED*** ***REMOVED*** return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; ***REMOVED***; ***REMOVED***();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); ***REMOVED*** ***REMOVED***

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); ***REMOVED*** return call && (typeof call === "object" || typeof call === "function") ? call : self; ***REMOVED***

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); ***REMOVED*** subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true ***REMOVED*** ***REMOVED***); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; ***REMOVED***





/**
 * SmoothScroll module.
 * @module foundation.smooth-scroll
 */

var SmoothScroll = function (_Plugin) {
    _inherits(SmoothScroll, _Plugin);

    function SmoothScroll() {
        _classCallCheck(this, SmoothScroll);

        return _possibleConstructorReturn(this, (SmoothScroll.__proto__ || Object.getPrototypeOf(SmoothScroll)).apply(this, arguments));
    ***REMOVED***

    _createClass(SmoothScroll, [{
        key: '_setup',

        /**
         * Creates a new instance of SmoothScroll.
         * @class
         * @name SmoothScroll
         * @fires SmoothScroll#init
         * @param {Object***REMOVED*** element - jQuery object to add the trigger to.
         * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
         */
        value: function _setup(element, options) {
            this.$element = element;
            this.options = __WEBPACK_IMPORTED_MODULE_0_jquery___default.a.extend({***REMOVED***, SmoothScroll.defaults, this.$element.data(), options);
            this.className = 'SmoothScroll'; // ie9 back compat

            this._init();
        ***REMOVED***

        /**
         * Initialize the SmoothScroll plugin
         * @private
         */

    ***REMOVED***, {
        key: '_init',
        value: function _init() {
            var id = this.$element[0].id || __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__foundation_util_core__["a" /* GetYoDigits */])(6, 'smooth-scroll');
            var _this = this;
            this.$element.attr({
                'id': id
            ***REMOVED***);

            this._events();
        ***REMOVED***

        /**
         * Initializes events for SmoothScroll.
         * @private
         */

    ***REMOVED***, {
        key: '_events',
        value: function _events() {
            var _this = this;

            // click handler function.
            var handleLinkClick = function (e) {
                // exit function if the event source isn't coming from an anchor with href attribute starts with '#'
                if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default()(this).is('a[href^="#"]')) {
                    return false;
                ***REMOVED***

                var arrival = this.getAttribute('href');

                _this._inTransition = true;

                SmoothScroll.scrollToLoc(arrival, _this.options, function () {
                    _this._inTransition = false;
                ***REMOVED***);

                e.preventDefault();
            ***REMOVED***;

            this.$element.on('click.zf.smoothScroll', handleLinkClick);
            this.$element.on('click.zf.smoothScroll', 'a[href^="#"]', handleLinkClick);
        ***REMOVED***

        /**
         * Function to scroll to a given location on the page.
         * @param {String***REMOVED*** loc - A properly formatted jQuery id selector. Example: '#foo'
         * @param {Object***REMOVED*** options - The options to use.
         * @param {Function***REMOVED*** callback - The callback function.
         * @static
         * @function
         */

    ***REMOVED***], [{
        key: 'scrollToLoc',
        value: function scrollToLoc(loc) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : SmoothScroll.defaults;
            var callback = arguments[2];

            // Do nothing if target does not exist to prevent errors
            if (!__WEBPACK_IMPORTED_MODULE_0_jquery___default()(loc).length) {
                return false;
            ***REMOVED***

            var scrollPos = Math.round(__WEBPACK_IMPORTED_MODULE_0_jquery___default()(loc).offset().top - options.threshold / 2 - options.offset);

            __WEBPACK_IMPORTED_MODULE_0_jquery___default()('html, body').stop(true).animate({ scrollTop: scrollPos ***REMOVED***, options.animationDuration, options.animationEasing, function () {
                if (callback && typeof callback == "function") {
                    callback();
                ***REMOVED***
            ***REMOVED***);
        ***REMOVED***
    ***REMOVED***]);

    return SmoothScroll;
***REMOVED***(__WEBPACK_IMPORTED_MODULE_2__foundation_plugin__["a" /* Plugin */]);

/**
 * Default settings for plugin.
 */


SmoothScroll.defaults = {
    /**
     * Amount of time, in ms, the animated scrolling should take between locations.
     * @option
     * @type {number***REMOVED***
     * @default 500
     */
    animationDuration: 500,
    /**
     * Animation style to use when scrolling between locations. Can be `'swing'` or `'linear'`.
     * @option
     * @type {string***REMOVED***
     * @default 'linear'
     * @see {@link https://api.jquery.com/animate|Jquery animate***REMOVED***
     */
    animationEasing: 'linear',
    /**
     * Number of pixels to use as a marker for location changes.
     * @option
     * @type {number***REMOVED***
     * @default 50
     */
    threshold: 50,
    /**
     * Number of pixels to offset the scroll of the page on item click if using a sticky nav bar.
     * @option
     * @type {number***REMOVED***
     * @default 0
     */
    offset: 0
***REMOVED***;



/***/ ***REMOVED***),
/* 34 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Timer; ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);




function Timer(elem, options, cb) {
  var _this = this,
      duration = options.duration,
      //options is an object for easily adding features later.
  nameSpace = Object.keys(elem.data())[0] || 'timer',
      remain = -1,
      start,
      timer;

  this.isPaused = false;

  this.restart = function () {
    remain = -1;
    clearTimeout(timer);
    this.start();
  ***REMOVED***;

  this.start = function () {
    this.isPaused = false;
    // if(!elem.data('paused')){ return false; ***REMOVED***//maybe implement this sanity check if used for other things.
    clearTimeout(timer);
    remain = remain <= 0 ? duration : remain;
    elem.data('paused', false);
    start = Date.now();
    timer = setTimeout(function () {
      if (options.infinite) {
        _this.restart(); //rerun the timer.
      ***REMOVED***
      if (cb && typeof cb === 'function') {
        cb();
      ***REMOVED***
    ***REMOVED***, remain);
    elem.trigger('timerstart.zf.' + nameSpace);
  ***REMOVED***;

  this.pause = function () {
    this.isPaused = true;
    //if(elem.data('paused')){ return false; ***REMOVED***//maybe implement this sanity check if used for other things.
    clearTimeout(timer);
    elem.data('paused', true);
    var end = Date.now();
    remain = remain - (end - start);
    elem.trigger('timerpaused.zf.' + nameSpace);
  ***REMOVED***;
***REMOVED***



/***/ ***REMOVED***),
/* 35 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true ***REMOVED***);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_jquery___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_jquery__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__ = __webpack_require__(18);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_util_mediaQuery__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_util_triggers__ = __webpack_require__(5);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_abide__ = __webpack_require__(17);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_accordion__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_accordionMenu__ = __webpack_require__(11);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_drilldown__ = __webpack_require__(12);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_dropdown__ = __webpack_require__(19);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_dropdownMenu__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_equalizer__ = __webpack_require__(20);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_interchange__ = __webpack_require__(21);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_magellan__ = __webpack_require__(22);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_offcanvas__ = __webpack_require__(23);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_orbit__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_responsiveMenu__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_responsiveToggle__ = __webpack_require__(27);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_reveal__ = __webpack_require__(28);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_slider__ = __webpack_require__(29);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_sticky__ = __webpack_require__(30);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_tabs__ = __webpack_require__(14);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_toggler__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_tooltip__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_responsiveAccordionTabs__ = __webpack_require__(25);


__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].addToJquery(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a);

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].MediaQuery = __WEBPACK_IMPORTED_MODULE_2__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_util_mediaQuery__["a" /* MediaQuery */];

__WEBPACK_IMPORTED_MODULE_3__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_util_triggers__["a" /* Triggers */].init(__WEBPACK_IMPORTED_MODULE_0_jquery___default.a, __WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */]);

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_4__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_abide__["a" /* Abide */], 'Abide');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_5__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_accordion__["a" /* Accordion */], 'Accordion');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_6__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_accordionMenu__["a" /* AccordionMenu */], 'AccordionMenu');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_7__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_drilldown__["a" /* Drilldown */], 'Drilldown');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_8__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_dropdown__["a" /* Dropdown */], 'Dropdown');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_9__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_dropdownMenu__["a" /* DropdownMenu */], 'DropdownMenu');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_10__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_equalizer__["a" /* Equalizer */], 'Equalizer');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_11__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_interchange__["a" /* Interchange */], 'Interchange');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_12__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_magellan__["a" /* Magellan */], 'Magellan');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_13__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_offcanvas__["a" /* OffCanvas */], 'OffCanvas');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_14__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_orbit__["a" /* Orbit */], 'Orbit');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_15__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_responsiveMenu__["a" /* ResponsiveMenu */], 'ResponsiveMenu');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_16__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_responsiveToggle__["a" /* ResponsiveToggle */], 'ResponsiveToggle');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_17__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_reveal__["a" /* Reveal */], 'Reveal');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_18__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_slider__["a" /* Slider */], 'Slider');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_19__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_sticky__["a" /* Sticky */], 'Sticky');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_20__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_tabs__["a" /* Tabs */], 'Tabs');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_21__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_toggler__["a" /* Toggler */], 'Toggler');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_22__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_tooltip__["a" /* Tooltip */], 'Tooltip');

__WEBPACK_IMPORTED_MODULE_1__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_core__["a" /* Foundation */].plugin(__WEBPACK_IMPORTED_MODULE_23__home_deployer_sites_node_foundation_customizer_node_foundation_customizer_foundation_sites_js_foundation_responsiveAccordionTabs__["a" /* ResponsiveAccordionTabs */], 'ResponsiveAccordionTabs');

/***/ ***REMOVED***)
/******/ ]);