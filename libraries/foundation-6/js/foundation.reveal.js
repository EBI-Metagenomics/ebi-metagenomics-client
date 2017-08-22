'use strict';

!function($) {

/**
 * Reveal module.
 * @module foundation.reveal
 * @requires foundation.util.keyboard
 * @requires foundation.util.box
 * @requires foundation.util.triggers
 * @requires foundation.util.mediaQuery
 * @requires foundation.util.motion if using animations
 */

class Reveal {
  /**
   * Creates a new instance of Reveal.
   * @class
   * @param {jQuery***REMOVED*** element - jQuery object to use for the modal.
   * @param {Object***REMOVED*** options - optional parameters.
   */
  constructor(element, options) {
    this.$element = element;
    this.options = $.extend({***REMOVED***, Reveal.defaults, this.$element.data(), options);
    this._init();

    Foundation.registerPlugin(this, 'Reveal');
    Foundation.Keyboard.register('Reveal', {
      'ENTER': 'open',
      'SPACE': 'open',
      'ESCAPE': 'close',
    ***REMOVED***);
  ***REMOVED***

  /**
   * Initializes the modal by adding the overlay and close buttons, (if selected).
   * @private
   */
  _init() {
    this.id = this.$element.attr('id');
    this.isActive = false;
    this.cached = {mq: Foundation.MediaQuery.current***REMOVED***;
    this.isMobile = mobileSniff();

    this.$anchor = $(`[data-open="${this.id***REMOVED***"]`).length ? $(`[data-open="${this.id***REMOVED***"]`) : $(`[data-toggle="${this.id***REMOVED***"]`);
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

    if(this.$overlay) {
      this.$element.detach().appendTo(this.$overlay);
    ***REMOVED*** else {
      this.$element.detach().appendTo($(this.options.appendTo));
      this.$element.addClass('without-overlay');
    ***REMOVED***
    this._events();
    if (this.options.deepLink && window.location.hash === ( `#${this.id***REMOVED***`)) {
      $(window).one('load.zf.reveal', this.open.bind(this));
    ***REMOVED***
  ***REMOVED***

  /**
   * Creates an overlay div to display behind the modal.
   * @private
   */
  _makeOverlay() {
    return $('<div></div>')
      .addClass('reveal-overlay')
      .appendTo(this.options.appendTo);
  ***REMOVED***

  /**
   * Updates position of modal
   * TODO:  Figure out if we actually need to cache these values or if it doesn't matter
   * @private
   */
  _updatePosition() {
    var width = this.$element.outerWidth();
    var outerWidth = $(window).width();
    var height = this.$element.outerHeight();
    var outerHeight = $(window).height();
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
    this.$element.css({top: top + 'px'***REMOVED***);
    // only worry about left if we don't have an overlay or we havea  horizontal offset,
    // otherwise we're perfectly in the middle
    if(!this.$overlay || (this.options.hOffset !== 'auto')) {
      this.$element.css({left: left + 'px'***REMOVED***);
      this.$element.css({margin: '0px'***REMOVED***);
    ***REMOVED***

  ***REMOVED***

  /**
   * Adds event handlers for the modal.
   * @private
   */
  _events() {
    var _this = this;

    this.$element.on({
      'open.zf.trigger': this.open.bind(this),
      'close.zf.trigger': (event, $element) => {
        if ((event.target === _this.$element[0]) ||
            ($(event.target).parents('[data-closable]')[0] === $element)) { // only close reveal when it's explicitly called
          return this.close.apply(this);
        ***REMOVED***
      ***REMOVED***,
      'toggle.zf.trigger': this.toggle.bind(this),
      'resizeme.zf.trigger': function() {
        _this._updatePosition();
      ***REMOVED***
    ***REMOVED***);

    if (this.$anchor.length) {
      this.$anchor.on('keydown.zf.reveal', function(e) {
        if (e.which === 13 || e.which === 32) {
          e.stopPropagation();
          e.preventDefault();
          _this.open();
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    if (this.options.closeOnClick && this.options.overlay) {
      this.$overlay.off('.zf.reveal').on('click.zf.reveal', function(e) {
        if (e.target === _this.$element[0] ||
          $.contains(_this.$element[0], e.target) ||
            !$.contains(document, e.target)) {
              return;
        ***REMOVED***
        _this.close();
      ***REMOVED***);
    ***REMOVED***
    if (this.options.deepLink) {
      $(window).on(`popstate.zf.reveal:${this.id***REMOVED***`, this._handleState.bind(this));
    ***REMOVED***
  ***REMOVED***

  /**
   * Handles modal methods on back/forward button clicks or any other event that triggers popstate.
   * @private
   */
  _handleState(e) {
    if(window.location.hash === ( '#' + this.id) && !this.isActive){ this.open(); ***REMOVED***
    else{ this.close(); ***REMOVED***
  ***REMOVED***


  /**
   * Opens the modal controlled by `this.$anchor`, and closes all others by default.
   * @function
   * @fires Reveal#closeme
   * @fires Reveal#open
   */
  open() {
    if (this.options.deepLink) {
      var hash = `#${this.id***REMOVED***`;

      if (window.history.pushState) {
        window.history.pushState(null, null, hash);
      ***REMOVED*** else {
        window.location.hash = hash;
      ***REMOVED***
    ***REMOVED***

    this.isActive = true;

    // Make elements invisible, but remove display: none so we can get size and positioning
    this.$element
        .css({ 'visibility': 'hidden' ***REMOVED***)
        .show()
        .scrollTop(0);
    if (this.options.overlay) {
      this.$overlay.css({'visibility': 'hidden'***REMOVED***).show();
    ***REMOVED***

    this._updatePosition();

    this.$element
      .hide()
      .css({ 'visibility': '' ***REMOVED***);

    if(this.$overlay) {
      this.$overlay.css({'visibility': ''***REMOVED***).hide();
      if(this.$element.hasClass('fast')) {
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
        if(!_this.originalScrollPos) {
          _this.originalScrollPos = window.pageYOffset;
        ***REMOVED***
        $('html, body').addClass('is-reveal-open');
      ***REMOVED***
      else {
        $('body').addClass('is-reveal-open');
      ***REMOVED***
    ***REMOVED***
    // Motion UI method of reveal
    if (this.options.animationIn) {
      function afterAnimation(){
        _this.$element
          .attr({
            'aria-hidden': false,
            'tabindex': -1
          ***REMOVED***)
          .focus();
        addRevealOpenClasses();
        Foundation.Keyboard.trapFocus(_this.$element);
      ***REMOVED***
      if (this.options.overlay) {
        Foundation.Motion.animateIn(this.$overlay, 'fade-in');
      ***REMOVED***
      Foundation.Motion.animateIn(this.$element, this.options.animationIn, () => {
        if(this.$element) { // protect against object having been removed
          this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);
          afterAnimation();
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***
    // jQuery method of reveal
    else {
      if (this.options.overlay) {
        this.$overlay.show(0);
      ***REMOVED***
      this.$element.show(this.options.showDelay);
    ***REMOVED***

    // handle accessibility
    this.$element
      .attr({
        'aria-hidden': false,
        'tabindex': -1
      ***REMOVED***)
      .focus();
    Foundation.Keyboard.trapFocus(this.$element);

    /**
     * Fires when the modal has successfully opened.
     * @event Reveal#open
     */
    this.$element.trigger('open.zf.reveal');

    addRevealOpenClasses();

    setTimeout(() => {
      this._extraHandlers();
    ***REMOVED***, 0);
  ***REMOVED***

  /**
   * Adds extra event handlers for the body and window if necessary.
   * @private
   */
  _extraHandlers() {
    var _this = this;
    if(!this.$element) { return; ***REMOVED*** // If we're in the middle of cleanup, don't freak out
    this.focusableElements = Foundation.Keyboard.findFocusable(this.$element);

    if (!this.options.overlay && this.options.closeOnClick && !this.options.fullScreen) {
      $('body').on('click.zf.reveal', function(e) {
        if (e.target === _this.$element[0] ||
          $.contains(_this.$element[0], e.target) ||
            !$.contains(document, e.target)) { return; ***REMOVED***
        _this.close();
      ***REMOVED***);
    ***REMOVED***

    if (this.options.closeOnEsc) {
      $(window).on('keydown.zf.reveal', function(e) {
        Foundation.Keyboard.handleKey(e, 'Reveal', {
          close: function() {
            if (_this.options.closeOnEsc) {
              _this.close();
              _this.$anchor.focus();
            ***REMOVED***
          ***REMOVED***
        ***REMOVED***);
      ***REMOVED***);
    ***REMOVED***

    // lock focus within modal while tabbing
    this.$element.on('keydown.zf.reveal', function(e) {
      var $target = $(this);
      // handle keyboard event with keyboard util
      Foundation.Keyboard.handleKey(e, 'Reveal', {
        open: function() {
          if (_this.$element.find(':focus').is(_this.$element.find('[data-close]'))) {
            setTimeout(function() { // set focus back to anchor if close button has been activated
              _this.$anchor.focus();
            ***REMOVED***, 1);
          ***REMOVED*** else if ($target.is(_this.focusableElements)) { // dont't trigger if acual element has focus (i.e. inputs, links, ...)
            _this.open();
          ***REMOVED***
        ***REMOVED***,
        close: function() {
          if (_this.options.closeOnEsc) {
            _this.close();
            _this.$anchor.focus();
          ***REMOVED***
        ***REMOVED***,
        handled: function(preventDefault) {
          if (preventDefault) {
            e.preventDefault();
          ***REMOVED***
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***);
  ***REMOVED***

  /**
   * Closes the modal.
   * @function
   * @fires Reveal#closed
   */
  close() {
    if (!this.isActive || !this.$element.is(':visible')) {
      return false;
    ***REMOVED***
    var _this = this;

    // Motion UI method of hiding
    if (this.options.animationOut) {
      if (this.options.overlay) {
        Foundation.Motion.animateOut(this.$overlay, 'fade-out', finishUp);
      ***REMOVED***
      else {
        finishUp();
      ***REMOVED***

      Foundation.Motion.animateOut(this.$element, this.options.animationOut);
    ***REMOVED***
    // jQuery method of hiding
    else {

      this.$element.hide(this.options.hideDelay);

      if (this.options.overlay) {
        this.$overlay.hide(0, finishUp);
      ***REMOVED***
      else {
        finishUp();
      ***REMOVED***
    ***REMOVED***

    // Conditionals to remove extra event listeners added on open
    if (this.options.closeOnEsc) {
      $(window).off('keydown.zf.reveal');
    ***REMOVED***

    if (!this.options.overlay && this.options.closeOnClick) {
      $('body').off('click.zf.reveal');
    ***REMOVED***

    this.$element.off('keydown.zf.reveal');

    function finishUp() {
      if (_this.isMobile) {
        if ($('.reveal:visible').length === 0) {
          $('html, body').removeClass('is-reveal-open');
        ***REMOVED***
        if(_this.originalScrollPos) {
          $('body').scrollTop(_this.originalScrollPos);
          _this.originalScrollPos = null;
        ***REMOVED***
      ***REMOVED***
      else {
        if ($('.reveal:visible').length  === 0) {
          $('body').removeClass('is-reveal-open');
        ***REMOVED***
      ***REMOVED***


      Foundation.Keyboard.releaseFocus(_this.$element);

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
         window.history.replaceState('', document.title, window.location.href.replace(`#${this.id***REMOVED***`, ''));
       ***REMOVED*** else {
         window.location.hash = '';
       ***REMOVED***
     ***REMOVED***
  ***REMOVED***

  /**
   * Toggles the open/closed state of a modal.
   * @function
   */
  toggle() {
    if (this.isActive) {
      this.close();
    ***REMOVED*** else {
      this.open();
    ***REMOVED***
  ***REMOVED***;

  /**
   * Destroys an instance of a modal.
   * @function
   */
  destroy() {
    if (this.options.overlay) {
      this.$element.appendTo($(this.options.appendTo)); // move $element outside of $overlay to prevent error unregisterPlugin()
      this.$overlay.hide().off().remove();
    ***REMOVED***
    this.$element.hide().off();
    this.$anchor.off('.zf');
    $(window).off(`.zf.reveal:${this.id***REMOVED***`);

    Foundation.unregisterPlugin(this);
  ***REMOVED***;
***REMOVED***

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
   * Allows the modal to append to custom div.
   * @option
   * @type {string***REMOVED***
   * @default "body"
   */
  appendTo: "body"

***REMOVED***;

// Window exports
Foundation.plugin(Reveal, 'Reveal');

function iPhoneSniff() {
  return /iP(ad|hone|od).*OS/.test(window.navigator.userAgent);
***REMOVED***

function androidSniff() {
  return /Android/.test(window.navigator.userAgent);
***REMOVED***

function mobileSniff() {
  return iPhoneSniff() || androidSniff();
***REMOVED***

***REMOVED***(jQuery);
