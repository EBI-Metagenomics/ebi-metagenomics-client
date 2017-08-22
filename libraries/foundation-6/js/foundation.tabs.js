'use strict';

!function($) {

/**
 * Tabs module.
 * @module foundation.tabs
 * @requires foundation.util.keyboard
 * @requires foundation.util.timerAndImageLoader if tabs contain images
 */

class Tabs {
  /**
   * Creates a new instance of tabs.
   * @class
   * @fires Tabs#init
   * @param {jQuery***REMOVED*** element - jQuery object to make into tabs.
   * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
   */
  constructor(element, options) {
    this.$element = element;
    this.options = $.extend({***REMOVED***, Tabs.defaults, this.$element.data(), options);

    this._init();
    Foundation.registerPlugin(this, 'Tabs');
    Foundation.Keyboard.register('Tabs', {
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
  _init() {
    var _this = this;

    this.$element.attr({'role': 'tablist'***REMOVED***);
    this.$tabTitles = this.$element.find(`.${this.options.linkClass***REMOVED***`);
    this.$tabContent = $(`[data-tabs-content="${this.$element[0].id***REMOVED***"]`);

    this.$tabTitles.each(function(){
      var $elem = $(this),
          $link = $elem.find('a'),
          isActive = $elem.hasClass(`${_this.options.linkActiveClass***REMOVED***`),
          hash = $link[0].hash.slice(1),
          linkId = $link[0].id ? $link[0].id : `${hash***REMOVED***-label`,
          $tabContent = $(`#${hash***REMOVED***`);

      $elem.attr({'role': 'presentation'***REMOVED***);

      $link.attr({
        'role': 'tab',
        'aria-controls': hash,
        'aria-selected': isActive,
        'id': linkId
      ***REMOVED***);

      $tabContent.attr({
        'role': 'tabpanel',
        'aria-hidden': !isActive,
        'aria-labelledby': linkId
      ***REMOVED***);

      if(isActive && _this.options.autoFocus){
        $(window).load(function() {
          $('html, body').animate({ scrollTop: $elem.offset().top ***REMOVED***, _this.options.deepLinkSmudgeDelay, () => {
            $link.focus();
          ***REMOVED***);
        ***REMOVED***);
      ***REMOVED***
    ***REMOVED***);
    if(this.options.matchHeight) {
      var $images = this.$tabContent.find('img');

      if ($images.length) {
        Foundation.onImagesLoaded($images, this._setHeight.bind(this));
      ***REMOVED*** else {
        this._setHeight();
      ***REMOVED***
    ***REMOVED***

     //current context-bound function to open tabs on page load or history popstate
    this._checkDeepLink = () => {
      var anchor = window.location.hash;
      //need a hash and a relevant anchor in this tabset
      if(anchor.length) {
        var $link = this.$element.find('[href$="'+anchor+'"]');
        if ($link.length) {
          this.selectTab($(anchor), true);

          //roll up a little to show the titles
          if (this.options.deepLinkSmudge) {
            var offset = this.$element.offset();
            $('html, body').animate({ scrollTop: offset.top ***REMOVED***, this.options.deepLinkSmudgeDelay);
          ***REMOVED***

          /**
            * Fires when the zplugin has deeplinked at pageload
            * @event Tabs#deeplink
            */
           this.$element.trigger('deeplink.zf.tabs', [$link, $(anchor)]);
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
   * Adds event handlers for items within the tabs.
   * @private
   */
  _events() {
    this._addKeyHandler();
    this._addClickHandler();
    this._setHeightMqHandler = null;

    if (this.options.matchHeight) {
      this._setHeightMqHandler = this._setHeight.bind(this);

      $(window).on('changed.zf.mediaquery', this._setHeightMqHandler);
    ***REMOVED***

    if(this.options.deepLink) {
      $(window).on('popstate', this._checkDeepLink);
    ***REMOVED***
  ***REMOVED***

  /**
   * Adds click handlers for items within the tabs.
   * @private
   */
  _addClickHandler() {
    var _this = this;

    this.$element
      .off('click.zf.tabs')
      .on('click.zf.tabs', `.${this.options.linkClass***REMOVED***`, function(e){
        e.preventDefault();
        e.stopPropagation();
        _this._handleTabChange($(this));
      ***REMOVED***);
  ***REMOVED***

  /**
   * Adds keyboard event handlers for items within the tabs.
   * @private
   */
  _addKeyHandler() {
    var _this = this;

    this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function(e){
      if (e.which === 9) return;


      var $element = $(this),
        $elements = $element.parent('ul').children('li'),
        $prevElement,
        $nextElement;

      $elements.each(function(i) {
        if ($(this).is($element)) {
          if (_this.options.wrapOnKeys) {
            $prevElement = i === 0 ? $elements.last() : $elements.eq(i-1);
            $nextElement = i === $elements.length -1 ? $elements.first() : $elements.eq(i+1);
          ***REMOVED*** else {
            $prevElement = $elements.eq(Math.max(0, i-1));
            $nextElement = $elements.eq(Math.min(i+1, $elements.length-1));
          ***REMOVED***
          return;
        ***REMOVED***
      ***REMOVED***);

      // handle keyboard event with keyboard util
      Foundation.Keyboard.handleKey(e, 'Tabs', {
        open: function() {
          $element.find('[role="tab"]').focus();
          _this._handleTabChange($element);
        ***REMOVED***,
        previous: function() {
          $prevElement.find('[role="tab"]').focus();
          _this._handleTabChange($prevElement);
        ***REMOVED***,
        next: function() {
          $nextElement.find('[role="tab"]').focus();
          _this._handleTabChange($nextElement);
        ***REMOVED***,
        handled: function() {
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
  _handleTabChange($target, historyHandled) {

    /**
     * Check for active class on target. Collapse if exists.
     */
    if ($target.hasClass(`${this.options.linkActiveClass***REMOVED***`)) {
        if(this.options.activeCollapse) {
            this._collapseTab($target);

           /**
            * Fires when the zplugin has successfully collapsed tabs.
            * @event Tabs#collapse
            */
            this.$element.trigger('collapse.zf.tabs', [$target]);
        ***REMOVED***
        return;
    ***REMOVED***

    var $oldTab = this.$element.
          find(`.${this.options.linkClass***REMOVED***.${this.options.linkActiveClass***REMOVED***`),
          $tabLink = $target.find('[role="tab"]'),
          hash = $tabLink[0].hash,
          $targetContent = this.$tabContent.find(hash);

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
  _openTab($target) {
      var $tabLink = $target.find('[role="tab"]'),
          hash = $tabLink[0].hash,
          $targetContent = this.$tabContent.find(hash);

      $target.addClass(`${this.options.linkActiveClass***REMOVED***`);

      $tabLink.attr({'aria-selected': 'true'***REMOVED***);

      $targetContent
        .addClass(`${this.options.panelActiveClass***REMOVED***`)
        .attr({'aria-hidden': 'false'***REMOVED***);
  ***REMOVED***

  /**
   * Collapses `$targetContent` defined by `$target`.
   * @param {jQuery***REMOVED*** $target - Tab to Open.
   * @function
   */
  _collapseTab($target) {
    var $target_anchor = $target
      .removeClass(`${this.options.linkActiveClass***REMOVED***`)
      .find('[role="tab"]')
      .attr({ 'aria-selected': 'false' ***REMOVED***);

    $(`#${$target_anchor.attr('aria-controls')***REMOVED***`)
      .removeClass(`${this.options.panelActiveClass***REMOVED***`)
      .attr({ 'aria-hidden': 'true' ***REMOVED***);
  ***REMOVED***

  /**
   * Public method for selecting a content pane to display.
   * @param {jQuery | String***REMOVED*** elem - jQuery object or string of the id of the pane to display.
   * @param {boolean***REMOVED*** historyHandled - browser has already handled a history update
   * @function
   */
  selectTab(elem, historyHandled) {
    var idStr;

    if (typeof elem === 'object') {
      idStr = elem[0].id;
    ***REMOVED*** else {
      idStr = elem;
    ***REMOVED***

    if (idStr.indexOf('#') < 0) {
      idStr = `#${idStr***REMOVED***`;
    ***REMOVED***

    var $target = this.$tabTitles.find(`[href$="${idStr***REMOVED***"]`).parent(`.${this.options.linkClass***REMOVED***`);

    this._handleTabChange($target, historyHandled);
  ***REMOVED***;
  /**
   * Sets the height of each panel to the height of the tallest panel.
   * If enabled in options, gets called on media query change.
   * If loading content via external source, can be called directly or with _reflow.
   * If enabled with `data-match-height="true"`, tabs sets to equal height
   * @function
   * @private
   */
  _setHeight() {
    var max = 0,
        _this = this; // Lock down the `this` value for the root tabs object

    this.$tabContent
      .find(`.${this.options.panelClass***REMOVED***`)
      .css('height', '')
      .each(function() {

        var panel = $(this),
            isActive = panel.hasClass(`${_this.options.panelActiveClass***REMOVED***`); // get the options from the parent instead of trying to get them from the child

        if (!isActive) {
          panel.css({'visibility': 'hidden', 'display': 'block'***REMOVED***);
        ***REMOVED***

        var temp = this.getBoundingClientRect().height;

        if (!isActive) {
          panel.css({
            'visibility': '',
            'display': ''
          ***REMOVED***);
        ***REMOVED***

        max = temp > max ? temp : max;
      ***REMOVED***)
      .css('height', `${max***REMOVED***px`);
  ***REMOVED***

  /**
   * Destroys an instance of an tabs.
   * @fires Tabs#destroyed
   */
  destroy() {
    this.$element
      .find(`.${this.options.linkClass***REMOVED***`)
      .off('.zf.tabs').hide().end()
      .find(`.${this.options.panelClass***REMOVED***`)
      .hide();

    if (this.options.matchHeight) {
      if (this._setHeightMqHandler != null) {
         $(window).off('changed.zf.mediaquery', this._setHeightMqHandler);
      ***REMOVED***
    ***REMOVED***

    if (this.options.deepLink) {
      $(window).off('popstate', this._checkDeepLink);
    ***REMOVED***

    Foundation.unregisterPlugin(this);
  ***REMOVED***
***REMOVED***

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

// Window exports
Foundation.plugin(Tabs, 'Tabs');

***REMOVED***(jQuery);
