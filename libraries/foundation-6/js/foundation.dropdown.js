'use strict';

!function($) {

/**
 * Dropdown module.
 * @module foundation.dropdown
 * @requires foundation.util.keyboard
 * @requires foundation.util.box
 * @requires foundation.util.triggers
 */

class Dropdown {
  /**
   * Creates a new instance of a dropdown.
   * @class
   * @param {jQuery***REMOVED*** element - jQuery object to make into a dropdown.
   *        Object should be of the dropdown panel, rather than its anchor.
   * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
   */
  constructor(element, options) {
    this.$element = element;
    this.options = $.extend({***REMOVED***, Dropdown.defaults, this.$element.data(), options);
    this._init();

    Foundation.registerPlugin(this, 'Dropdown');
    Foundation.Keyboard.register('Dropdown', {
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
  _init() {
    var $id = this.$element.attr('id');

    this.$anchor = $(`[data-toggle="${$id***REMOVED***"]`).length ? $(`[data-toggle="${$id***REMOVED***"]`) : $(`[data-open="${$id***REMOVED***"]`);
    this.$anchor.attr({
      'aria-controls': $id,
      'data-is-focus': false,
      'data-yeti-box': $id,
      'aria-haspopup': true,
      'aria-expanded': false

    ***REMOVED***);

    if(this.options.parentClass){
      this.$parent = this.$element.parents('.' + this.options.parentClass);
    ***REMOVED***else{
      this.$parent = null;
    ***REMOVED***
    this.options.positionClass = this.getPositionClass();
    this.counter = 4;
    this.usedPositions = [];
    this.$element.attr({
      'aria-hidden': 'true',
      'data-yeti-box': $id,
      'data-resize': $id,
      'aria-labelledby': this.$anchor[0].id || Foundation.GetYoDigits(6, 'dd-anchor')
    ***REMOVED***);
    this._events();
  ***REMOVED***

  /**
   * Helper function to determine current orientation of dropdown pane.
   * @function
   * @returns {String***REMOVED*** position - string value of a position class.
   */
  getPositionClass() {
    var verticalPosition = this.$element[0].className.match(/(top|left|right|bottom)/g);
        verticalPosition = verticalPosition ? verticalPosition[0] : '';
    var horizontalPosition = /float-(\S+)/.exec(this.$anchor[0].className);
        horizontalPosition = horizontalPosition ? horizontalPosition[1] : '';
    var position = horizontalPosition ? horizontalPosition + ' ' + verticalPosition : verticalPosition;

    return position;
  ***REMOVED***

  /**
   * Adjusts the dropdown panes orientation by adding/removing positioning classes.
   * @function
   * @private
   * @param {String***REMOVED*** position - position class to remove.
   */
  _reposition(position) {
    this.usedPositions.push(position ? position : 'bottom');
    //default, try switching to opposite side
    if(!position && (this.usedPositions.indexOf('top') < 0)){
      this.$element.addClass('top');
    ***REMOVED***else if(position === 'top' && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    ***REMOVED***else if(position === 'left' && (this.usedPositions.indexOf('right') < 0)){
      this.$element.removeClass(position)
          .addClass('right');
    ***REMOVED***else if(position === 'right' && (this.usedPositions.indexOf('left') < 0)){
      this.$element.removeClass(position)
          .addClass('left');
    ***REMOVED***

    //if default change didn't work, try bottom or left first
    else if(!position && (this.usedPositions.indexOf('top') > -1) && (this.usedPositions.indexOf('left') < 0)){
      this.$element.addClass('left');
    ***REMOVED***else if(position === 'top' && (this.usedPositions.indexOf('bottom') > -1) && (this.usedPositions.indexOf('left') < 0)){
      this.$element.removeClass(position)
          .addClass('left');
    ***REMOVED***else if(position === 'left' && (this.usedPositions.indexOf('right') > -1) && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    ***REMOVED***else if(position === 'right' && (this.usedPositions.indexOf('left') > -1) && (this.usedPositions.indexOf('bottom') < 0)){
      this.$element.removeClass(position);
    ***REMOVED***
    //if nothing cleared, set to bottom
    else{
      this.$element.removeClass(position);
    ***REMOVED***
    this.classChanged = true;
    this.counter--;
  ***REMOVED***

  /**
   * Sets the position and orientation of the dropdown pane, checks for collisions.
   * Recursively calls itself if a collision is detected, with a new position class.
   * @function
   * @private
   */
  _setPosition() {
    if(this.$anchor.attr('aria-expanded') === 'false'){ return false; ***REMOVED***
    var position = this.getPositionClass(),
        $eleDims = Foundation.Box.GetDimensions(this.$element),
        $anchorDims = Foundation.Box.GetDimensions(this.$anchor),
        _this = this,
        direction = (position === 'left' ? 'left' : ((position === 'right') ? 'left' : 'top')),
        param = (direction === 'top') ? 'height' : 'width',
        offset = (param === 'height') ? this.options.vOffset : this.options.hOffset;

    if(($eleDims.width >= $eleDims.windowDims.width) || (!this.counter && !Foundation.Box.ImNotTouchingYou(this.$element, this.$parent))){
      var newWidth = $eleDims.windowDims.width,
          parentHOffset = 0;
      if(this.$parent){
        var $parentDims = Foundation.Box.GetDimensions(this.$parent),
            parentHOffset = $parentDims.offset.left;
        if ($parentDims.width < newWidth){
          newWidth = $parentDims.width;
        ***REMOVED***
      ***REMOVED***

      this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, 'center bottom', this.options.vOffset, this.options.hOffset + parentHOffset, true)).css({
        'width': newWidth - (this.options.hOffset * 2),
        'height': 'auto'
      ***REMOVED***);
      this.classChanged = true;
      return false;
    ***REMOVED***

    this.$element.offset(Foundation.Box.GetOffsets(this.$element, this.$anchor, position, this.options.vOffset, this.options.hOffset));

    while(!Foundation.Box.ImNotTouchingYou(this.$element, this.$parent, true) && this.counter){
      this._reposition(position);
      this._setPosition();
    ***REMOVED***
  ***REMOVED***

  /**
   * Adds event listeners to the element utilizing the triggers utility library.
   * @function
   * @private
   */
  _events() {
    var _this = this;
    this.$element.on({
      'open.zf.trigger': this.open.bind(this),
      'close.zf.trigger': this.close.bind(this),
      'toggle.zf.trigger': this.toggle.bind(this),
      'resizeme.zf.trigger': this._setPosition.bind(this)
    ***REMOVED***);

    if(this.options.hover){
      this.$anchor.off('mouseenter.zf.dropdown mouseleave.zf.dropdown')
      .on('mouseenter.zf.dropdown', function(){
        var bodyData = $('body').data();
        if(typeof(bodyData.whatinput) === 'undefined' || bodyData.whatinput === 'mouse') {
          clearTimeout(_this.timeout);
          _this.timeout = setTimeout(function(){
            _this.open();
            _this.$anchor.data('hover', true);
          ***REMOVED***, _this.options.hoverDelay);
        ***REMOVED***
      ***REMOVED***).on('mouseleave.zf.dropdown', function(){
        clearTimeout(_this.timeout);
        _this.timeout = setTimeout(function(){
          _this.close();
          _this.$anchor.data('hover', false);
        ***REMOVED***, _this.options.hoverDelay);
      ***REMOVED***);
      if(this.options.hoverPane){
        this.$element.off('mouseenter.zf.dropdown mouseleave.zf.dropdown')
            .on('mouseenter.zf.dropdown', function(){
              clearTimeout(_this.timeout);
            ***REMOVED***).on('mouseleave.zf.dropdown', function(){
              clearTimeout(_this.timeout);
              _this.timeout = setTimeout(function(){
                _this.close();
                _this.$anchor.data('hover', false);
              ***REMOVED***, _this.options.hoverDelay);
            ***REMOVED***);
      ***REMOVED***
    ***REMOVED***
    this.$anchor.add(this.$element).on('keydown.zf.dropdown', function(e) {

      var $target = $(this),
        visibleFocusableElements = Foundation.Keyboard.findFocusable(_this.$element);

      Foundation.Keyboard.handleKey(e, 'Dropdown', {
        open: function() {
          if ($target.is(_this.$anchor)) {
            _this.open();
            _this.$element.attr('tabindex', -1).focus();
            e.preventDefault();
          ***REMOVED***
        ***REMOVED***,
        close: function() {
          _this.close();
          _this.$anchor.focus();
        ***REMOVED***
      ***REMOVED***);
    ***REMOVED***);
  ***REMOVED***

  /**
   * Adds an event handler to the body to close any dropdowns on a click.
   * @function
   * @private
   */
  _addBodyHandler() {
     var $body = $(document.body).not(this.$element),
         _this = this;
     $body.off('click.zf.dropdown')
          .on('click.zf.dropdown', function(e){
            if(_this.$anchor.is(e.target) || _this.$anchor.find(e.target).length) {
              return;
            ***REMOVED***
            if(_this.$element.find(e.target).length) {
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
  open() {
    // var _this = this;
    /**
     * Fires to close other open dropdowns, typically when dropdown is opening
     * @event Dropdown#closeme
     */
    this.$element.trigger('closeme.zf.dropdown', this.$element.attr('id'));
    this.$anchor.addClass('hover')
        .attr({'aria-expanded': true***REMOVED***);
    // this.$element/*.show()*/;
    this._setPosition();
    this.$element.addClass('is-open')
        .attr({'aria-hidden': false***REMOVED***);

    if(this.options.autoFocus){
      var $focusable = Foundation.Keyboard.findFocusable(this.$element);
      if($focusable.length){
        $focusable.eq(0).focus();
      ***REMOVED***
    ***REMOVED***

    if(this.options.closeOnClick){ this._addBodyHandler(); ***REMOVED***

    if (this.options.trapFocus) {
      Foundation.Keyboard.trapFocus(this.$element);
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
  close() {
    if(!this.$element.hasClass('is-open')){
      return false;
    ***REMOVED***
    this.$element.removeClass('is-open')
        .attr({'aria-hidden': true***REMOVED***);

    this.$anchor.removeClass('hover')
        .attr('aria-expanded', false);

    if(this.classChanged){
      var curPositionClass = this.getPositionClass();
      if(curPositionClass){
        this.$element.removeClass(curPositionClass);
      ***REMOVED***
      this.$element.addClass(this.options.positionClass)
          /*.hide()*/.css({height: '', width: ''***REMOVED***);
      this.classChanged = false;
      this.counter = 4;
      this.usedPositions.length = 0;
    ***REMOVED***
    /**
     * Fires once the dropdown is no longer visible.
     * @event Dropdown#hide
     */
    this.$element.trigger('hide.zf.dropdown', [this.$element]);

    if (this.options.trapFocus) {
      Foundation.Keyboard.releaseFocus(this.$element);
    ***REMOVED***
  ***REMOVED***

  /**
   * Toggles the dropdown pane's visibility.
   * @function
   */
  toggle() {
    if(this.$element.hasClass('is-open')){
      if(this.$anchor.data('hover')) return;
      this.close();
    ***REMOVED***else{
      this.open();
    ***REMOVED***
  ***REMOVED***

  /**
   * Destroys the dropdown.
   * @function
   */
  destroy() {
    this.$element.off('.zf.trigger').hide();
    this.$anchor.off('.zf.dropdown');

    Foundation.unregisterPlugin(this);
  ***REMOVED***
***REMOVED***

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
   * @default 1
   */
  vOffset: 1,
  /**
   * Number of pixels between the dropdown pane and the triggering element on open.
   * @option
   * @type {number***REMOVED***
   * @default 1
   */
  hOffset: 1,
  /**
   * Class applied to adjust open position. JS will test and fill this in.
   * @option
   * @type {string***REMOVED***
   * @default ''
   */
  positionClass: '',
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
***REMOVED***

// Window exports
Foundation.plugin(Dropdown, 'Dropdown');

***REMOVED***(jQuery);
