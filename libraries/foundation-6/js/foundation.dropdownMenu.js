'use strict';

!function($) {

/**
 * DropdownMenu module.
 * @module foundation.dropdown-menu
 * @requires foundation.util.keyboard
 * @requires foundation.util.box
 * @requires foundation.util.nest
 */

class DropdownMenu {
  /**
   * Creates a new instance of DropdownMenu.
   * @class
   * @fires DropdownMenu#init
   * @param {jQuery***REMOVED*** element - jQuery object to make into a dropdown menu.
   * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
   */
  constructor(element, options) {
    this.$element = element;
    this.options = $.extend({***REMOVED***, DropdownMenu.defaults, this.$element.data(), options);

    Foundation.Nest.Feather(this.$element, 'dropdown');
    this._init();

    Foundation.registerPlugin(this, 'DropdownMenu');
    Foundation.Keyboard.register('DropdownMenu', {
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
  _init() {
    var subs = this.$element.find('li.is-dropdown-submenu-parent');
    this.$element.children('.is-dropdown-submenu-parent').children('.is-dropdown-submenu').addClass('first-sub');

    this.$menuItems = this.$element.find('[role="menuitem"]');
    this.$tabs = this.$element.children('[role="menuitem"]');
    this.$tabs.find('ul.is-dropdown-submenu').addClass(this.options.verticalClass);

    if (this.$element.hasClass(this.options.rightClass) || this.options.alignment === 'right' || Foundation.rtl() || this.$element.parents('.top-bar-right').is('*')) {
      this.options.alignment = 'right';
      subs.addClass('opens-left');
    ***REMOVED*** else {
      subs.addClass('opens-right');
    ***REMOVED***
    this.changed = false;
    this._events();
  ***REMOVED***;

  _isVertical() {
    return this.$tabs.css('display') === 'block';
  ***REMOVED***

  /**
   * Adds event listeners to elements within the menu
   * @private
   * @function
   */
  _events() {
    var _this = this,
        hasTouch = 'ontouchstart' in window || (typeof window.ontouchstart !== 'undefined'),
        parClass = 'is-dropdown-submenu-parent';

    // used for onClick and in the keyboard handlers
    var handleClickFn = function(e) {
      var $elem = $(e.target).parentsUntil('ul', `.${parClass***REMOVED***`),
          hasSub = $elem.hasClass(parClass),
          hasClicked = $elem.attr('data-is-click') === 'true',
          $sub = $elem.children('.is-dropdown-submenu');

      if (hasSub) {
        if (hasClicked) {
          if (!_this.options.closeOnClick || (!_this.options.clickOpen && !hasTouch) || (_this.options.forceFollow && hasTouch)) { return; ***REMOVED***
          else {
            e.stopImmediatePropagation();
            e.preventDefault();
            _this._hide($elem);
          ***REMOVED***
        ***REMOVED*** else {
          e.preventDefault();
          e.stopImmediatePropagation();
          _this._show($sub);
          $elem.add($elem.parentsUntil(_this.$element, `.${parClass***REMOVED***`)).attr('data-is-click', true);
        ***REMOVED***
      ***REMOVED***
    ***REMOVED***;

    if (this.options.clickOpen || hasTouch) {
      this.$menuItems.on('click.zf.dropdownmenu touchstart.zf.dropdownmenu', handleClickFn);
    ***REMOVED***

    // Handle Leaf element Clicks
    if(_this.options.closeOnClickInside){
      this.$menuItems.on('click.zf.dropdownmenu', function(e) {
        var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
        if(!hasSub){
          _this._hide();
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***

    if (!this.options.disableHover) {
      this.$menuItems.on('mouseenter.zf.dropdownmenu', function(e) {
        var $elem = $(this),
            hasSub = $elem.hasClass(parClass);

        if (hasSub) {
          clearTimeout($elem.data('_delay'));
          $elem.data('_delay', setTimeout(function() {
            _this._show($elem.children('.is-dropdown-submenu'));
          ***REMOVED***, _this.options.hoverDelay));
        ***REMOVED***
      ***REMOVED***).on('mouseleave.zf.dropdownmenu', function(e) {
        var $elem = $(this),
            hasSub = $elem.hasClass(parClass);
        if (hasSub && _this.options.autoclose) {
          if ($elem.attr('data-is-click') === 'true' && _this.options.clickOpen) { return false; ***REMOVED***

          clearTimeout($elem.data('_delay'));
          $elem.data('_delay', setTimeout(function() {
            _this._hide($elem);
          ***REMOVED***, _this.options.closingTime));
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***
    this.$menuItems.on('keydown.zf.dropdownmenu', function(e) {
      var $element = $(e.target).parentsUntil('ul', '[role="menuitem"]'),
          isTab = _this.$tabs.index($element) > -1,
          $elements = isTab ? _this.$tabs : $element.siblings('li').add($element),
          $prevElement,
          $nextElement;

      $elements.each(function(i) {
        if ($(this).is($element)) {
          $prevElement = $elements.eq(i-1);
          $nextElement = $elements.eq(i+1);
          return;
        ***REMOVED***
      ***REMOVED***);

      var nextSibling = function() {
        if (!$element.is(':last-child')) {
          $nextElement.children('a:first').focus();
          e.preventDefault();
        ***REMOVED***
      ***REMOVED***, prevSibling = function() {
        $prevElement.children('a:first').focus();
        e.preventDefault();
      ***REMOVED***, openSub = function() {
        var $sub = $element.children('ul.is-dropdown-submenu');
        if ($sub.length) {
          _this._show($sub);
          $element.find('li > a:first').focus();
          e.preventDefault();
        ***REMOVED*** else { return; ***REMOVED***
      ***REMOVED***, closeSub = function() {
        //if ($element.is(':first-child')) {
        var close = $element.parent('ul').parent('li');
        close.children('a:first').focus();
        _this._hide(close);
        e.preventDefault();
        //***REMOVED***
      ***REMOVED***;
      var functions = {
        open: openSub,
        close: function() {
          _this._hide(_this.$element);
          _this.$menuItems.find('a:first').focus(); // focus to first element
          e.preventDefault();
        ***REMOVED***,
        handled: function() {
          e.stopImmediatePropagation();
        ***REMOVED***
      ***REMOVED***;

      if (isTab) {
        if (_this._isVertical()) { // vertical menu
          if (Foundation.rtl()) { // right aligned
            $.extend(functions, {
              down: nextSibling,
              up: prevSibling,
              next: closeSub,
              previous: openSub
            ***REMOVED***);
          ***REMOVED*** else { // left aligned
            $.extend(functions, {
              down: nextSibling,
              up: prevSibling,
              next: openSub,
              previous: closeSub
            ***REMOVED***);
          ***REMOVED***
        ***REMOVED*** else { // horizontal menu
          if (Foundation.rtl()) { // right aligned
            $.extend(functions, {
              next: prevSibling,
              previous: nextSibling,
              down: openSub,
              up: closeSub
            ***REMOVED***);
          ***REMOVED*** else { // left aligned
            $.extend(functions, {
              next: nextSibling,
              previous: prevSibling,
              down: openSub,
              up: closeSub
            ***REMOVED***);
          ***REMOVED***
        ***REMOVED***
      ***REMOVED*** else { // not tabs -> one sub
        if (Foundation.rtl()) { // right aligned
          $.extend(functions, {
            next: closeSub,
            previous: openSub,
            down: nextSibling,
            up: prevSibling
          ***REMOVED***);
        ***REMOVED*** else { // left aligned
          $.extend(functions, {
            next: openSub,
            previous: closeSub,
            down: nextSibling,
            up: prevSibling
          ***REMOVED***);
        ***REMOVED***
      ***REMOVED***
      Foundation.Keyboard.handleKey(e, 'DropdownMenu', functions);

    ***REMOVED***);
  ***REMOVED***

  /**
   * Adds an event handler to the body to close any dropdowns on a click.
   * @function
   * @private
   */
  _addBodyHandler() {
    var $body = $(document.body),
        _this = this;
    $body.off('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu')
         .on('mouseup.zf.dropdownmenu touchend.zf.dropdownmenu', function(e) {
           var $link = _this.$element.find(e.target);
           if ($link.length) { return; ***REMOVED***

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
  _show($sub) {
    var idx = this.$tabs.index(this.$tabs.filter(function(i, el) {
      return $(el).find($sub).length > 0;
    ***REMOVED***));
    var $sibs = $sub.parent('li.is-dropdown-submenu-parent').siblings('li.is-dropdown-submenu-parent');
    this._hide($sibs, idx);
    $sub.css('visibility', 'hidden').addClass('js-dropdown-active')
        .parent('li.is-dropdown-submenu-parent').addClass('is-active');
    var clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
    if (!clear) {
      var oldClass = this.options.alignment === 'left' ? '-right' : '-left',
          $parentLi = $sub.parent('.is-dropdown-submenu-parent');
      $parentLi.removeClass(`opens${oldClass***REMOVED***`).addClass(`opens-${this.options.alignment***REMOVED***`);
      clear = Foundation.Box.ImNotTouchingYou($sub, null, true);
      if (!clear) {
        $parentLi.removeClass(`opens-${this.options.alignment***REMOVED***`).addClass('opens-inner');
      ***REMOVED***
      this.changed = true;
    ***REMOVED***
    $sub.css('visibility', '');
    if (this.options.closeOnClick) { this._addBodyHandler(); ***REMOVED***
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
  _hide($elem, idx) {
    var $toClose;
    if ($elem && $elem.length) {
      $toClose = $elem;
    ***REMOVED*** else if (idx !== undefined) {
      $toClose = this.$tabs.not(function(i, el) {
        return i === idx;
      ***REMOVED***);
    ***REMOVED***
    else {
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
        $toClose.find('li.is-dropdown-submenu-parent').add($toClose)
                .removeClass(`opens-inner opens-${this.options.alignment***REMOVED***`)
                .addClass(`opens-${oldClass***REMOVED***`);
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
  destroy() {
    this.$menuItems.off('.zf.dropdownmenu').removeAttr('data-is-click')
        .removeClass('is-right-arrow is-left-arrow is-down-arrow opens-right opens-left opens-inner');
    $(document.body).off('.zf.dropdownmenu');
    Foundation.Nest.Burn(this.$element, 'dropdown');
    Foundation.unregisterPlugin(this);
  ***REMOVED***
***REMOVED***

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
   * Position of the menu relative to what direction the submenus should open. Handled by JS. Can be `'left'` or `'right'`.
   * @option
   * @type {string***REMOVED***
   * @default 'left'
   */
  alignment: 'left',
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

// Window exports
Foundation.plugin(DropdownMenu, 'DropdownMenu');

***REMOVED***(jQuery);
