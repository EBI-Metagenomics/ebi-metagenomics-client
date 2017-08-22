'use strict';

!function($) {

/**
 * Toggler module.
 * @module foundation.toggler
 * @requires foundation.util.motion
 * @requires foundation.util.triggers
 */

class Toggler {
  /**
   * Creates a new instance of Toggler.
   * @class
   * @fires Toggler#init
   * @param {Object***REMOVED*** element - jQuery object to add the trigger to.
   * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
   */
  constructor(element, options) {
    this.$element = element;
    this.options = $.extend({***REMOVED***, Toggler.defaults, element.data(), options);
    this.className = '';

    this._init();
    this._events();

    Foundation.registerPlugin(this, 'Toggler');
  ***REMOVED***

  /**
   * Initializes the Toggler plugin by parsing the toggle class from data-toggler, or animation classes from data-animate.
   * @function
   * @private
   */
  _init() {
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
    $(`[data-open="${id***REMOVED***"], [data-close="${id***REMOVED***"], [data-toggle="${id***REMOVED***"]`)
      .attr('aria-controls', id);
    // If the target is hidden, add aria-hidden
    this.$element.attr('aria-expanded', this.$element.is(':hidden') ? false : true);
  ***REMOVED***

  /**
   * Initializes events for the toggle trigger.
   * @function
   * @private
   */
  _events() {
    this.$element.off('toggle.zf.trigger').on('toggle.zf.trigger', this.toggle.bind(this));
  ***REMOVED***

  /**
   * Toggles the target class on the target element. An event is fired from the original trigger depending on if the resultant state was "on" or "off".
   * @function
   * @fires Toggler#on
   * @fires Toggler#off
   */
  toggle() {
    this[ this.options.animate ? '_toggleAnimate' : '_toggleClass']();
  ***REMOVED***

  _toggleClass() {
    this.$element.toggleClass(this.className);

    var isOn = this.$element.hasClass(this.className);
    if (isOn) {
      /**
       * Fires if the target element has the class after a toggle.
       * @event Toggler#on
       */
      this.$element.trigger('on.zf.toggler');
    ***REMOVED***
    else {
      /**
       * Fires if the target element does not have the class after a toggle.
       * @event Toggler#off
       */
      this.$element.trigger('off.zf.toggler');
    ***REMOVED***

    this._updateARIA(isOn);
    this.$element.find('[data-mutate]').trigger('mutateme.zf.trigger');
  ***REMOVED***

  _toggleAnimate() {
    var _this = this;

    if (this.$element.is(':hidden')) {
      Foundation.Motion.animateIn(this.$element, this.animationIn, function() {
        _this._updateARIA(true);
        this.trigger('on.zf.toggler');
        this.find('[data-mutate]').trigger('mutateme.zf.trigger');
      ***REMOVED***);
    ***REMOVED***
    else {
      Foundation.Motion.animateOut(this.$element, this.animationOut, function() {
        _this._updateARIA(false);
        this.trigger('off.zf.toggler');
        this.find('[data-mutate]').trigger('mutateme.zf.trigger');
      ***REMOVED***);
    ***REMOVED***
  ***REMOVED***

  _updateARIA(isOn) {
    this.$element.attr('aria-expanded', isOn ? true : false);
  ***REMOVED***

  /**
   * Destroys the instance of Toggler on the element.
   * @function
   */
  destroy() {
    this.$element.off('.zf.toggler');
    Foundation.unregisterPlugin(this);
  ***REMOVED***
***REMOVED***

Toggler.defaults = {
  /**
   * Tells the plugin if the element should animated when toggled.
   * @option
   * @type {boolean***REMOVED***
   * @default false
   */
  animate: false
***REMOVED***;

// Window exports
Foundation.plugin(Toggler, 'Toggler');

***REMOVED***(jQuery);
