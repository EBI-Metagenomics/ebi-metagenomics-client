'use strict';

!function($) {

/**
 * Accordion module.
 * @module foundation.accordion
 * @requires foundation.util.keyboard
 * @requires foundation.util.motion
 */

class Accordion {
  /**
   * Creates a new instance of an accordion.
   * @class
   * @fires Accordion#init
   * @param {jQuery***REMOVED*** element - jQuery object to make into an accordion.
   * @param {Object***REMOVED*** options - a plain object with settings to override the default options.
   */
  constructor(element, options) {
    this.$element = element;
    this.options = $.extend({***REMOVED***, Accordion.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Accordion');
    Foundation.Keyboard.register('Accordion', {
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
  _init() {
    this.$element.attr('role', 'tablist');
    this.$tabs = this.$element.children('[data-accordion-item]');

    this.$tabs.each(function(idx, el) {
      var $el = $(el),
          $content = $el.children('[data-tab-content]'),
          id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
          linkId = el.id || `${id***REMOVED***-label`;

      $el.find('a:first').attr({
        'aria-controls': id,
        'role': 'tab',
        'id': linkId,
        'aria-expanded': false,
        'aria-selected': false
      ***REMOVED***);

      $content.attr({'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id***REMOVED***);
    ***REMOVED***);
    var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
    this.firstTimeInit = true;
    if($initActive.length){
      this.down($initActive, this.firstTimeInit);
      this.firstTimeInit = false;
    ***REMOVED***

    this._checkDeepLink = () => {
      var anchor = window.location.hash;
      //need a hash and a relevant anchor in this tabset
      if(anchor.length) {
        var $link = this.$element.find('[href$="'+anchor+'"]'),
        $anchor = $(anchor);

        if ($link.length && $anchor) {
          if (!$link.parent('[data-accordion-item]').hasClass('is-active')) {
            this.down($anchor, this.firstTimeInit);
            this.firstTimeInit = false;
          ***REMOVED***;

          //roll up a little to show the titles
          if (this.options.deepLinkSmudge) {
            var _this = this;
            $(window).load(function() {
              var offset = _this.$element.offset();
              $('html, body').animate({ scrollTop: offset.top ***REMOVED***, _this.options.deepLinkSmudgeDelay);
            ***REMOVED***);
          ***REMOVED***

          /**
            * Fires when the zplugin has deeplinked at pageload
            * @event Accordion#deeplink
            */
          this.$element.trigger('deeplink.zf.accordion', [$link, $anchor]);
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***

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
  _events() {
    var _this = this;

    this.$tabs.each(function() {
      var $elem = $(this);
      var $tabContent = $elem.children('[data-tab-content]');
      if ($tabContent.length) {
        $elem.children('a').off('click.zf.accordion keydown.zf.accordion')
               .on('click.zf.accordion', function(e) {
          e.preventDefault();
          _this.toggle($tabContent);
        ***REMOVED***).on('keydown.zf.accordion', function(e){
          Foundation.Keyboard.handleKey(e, 'Accordion', {
            toggle: function() {
              _this.toggle($tabContent);
            ***REMOVED***,
            next: function() {
              var $a = $elem.next().find('a').focus();
              if (!_this.options.multiExpand) {
                $a.trigger('click.zf.accordion')
              ***REMOVED***
            ***REMOVED***,
            previous: function() {
              var $a = $elem.prev().find('a').focus();
              if (!_this.options.multiExpand) {
                $a.trigger('click.zf.accordion')
              ***REMOVED***
            ***REMOVED***,
            handled: function() {
              e.preventDefault();
              e.stopPropagation();
            ***REMOVED***
          ***REMOVED***);
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***);
    if(this.options.deepLink) {
      $(window).on('popstate', this._checkDeepLink);
    ***REMOVED***
  ***REMOVED***

  /**
   * Toggles the selected content pane's open/close state.
   * @param {jQuery***REMOVED*** $target - jQuery object of the pane to toggle (`.accordion-content`).
   * @function
   */
  toggle($target) {
    if($target.parent().hasClass('is-active')) {
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
  down($target, firstTime) {
    $target
      .attr('aria-hidden', false)
      .parent('[data-tab-content]')
      .addBack()
      .parent().addClass('is-active');

    if (!this.options.multiExpand && !firstTime) {
      var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
      if ($currentActive.length) {
        this.up($currentActive.not($target));
      ***REMOVED***
    ***REMOVED***

    $target.slideDown(this.options.slideSpeed, () => {
      /**
       * Fires when the tab is done opening.
       * @event Accordion#down
       */
      this.$element.trigger('down.zf.accordion', [$target]);
    ***REMOVED***);

    $(`#${$target.attr('aria-labelledby')***REMOVED***`).attr({
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
  up($target) {
    var $aunts = $target.parent().siblings(),
        _this = this;

    if((!this.options.allowAllClosed && !$aunts.hasClass('is-active')) || !$target.parent().hasClass('is-active')) {
      return;
    ***REMOVED***

    // Foundation.Move(this.options.slideSpeed, $target, function(){
      $target.slideUp(_this.options.slideSpeed, function () {
        /**
         * Fires when the tab is done collapsing up.
         * @event Accordion#up
         */
        _this.$element.trigger('up.zf.accordion', [$target]);
      ***REMOVED***);
    // ***REMOVED***);

    $target.attr('aria-hidden', true)
           .parent().removeClass('is-active');

    $(`#${$target.attr('aria-labelledby')***REMOVED***`).attr({
     'aria-expanded': false,
     'aria-selected': false
   ***REMOVED***);
  ***REMOVED***

  /**
   * Destroys an instance of an accordion.
   * @fires Accordion#destroyed
   * @function
   */
  destroy() {
    this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
    this.$element.find('a').off('.zf.accordion');
    if(this.options.deepLink) {
      $(window).off('popstate', this._checkDeepLink);
    ***REMOVED***

    Foundation.unregisterPlugin(this);
  ***REMOVED***
***REMOVED***

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

// Window exports
Foundation.plugin(Accordion, 'Accordion');

***REMOVED***(jQuery);
