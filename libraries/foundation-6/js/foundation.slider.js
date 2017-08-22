'use strict';

!function($) {

/**
 * Slider module.
 * @module foundation.slider
 * @requires foundation.util.motion
 * @requires foundation.util.triggers
 * @requires foundation.util.keyboard
 * @requires foundation.util.touch
 */

class Slider {
  /**
   * Creates a new instance of a slider control.
   * @class
   * @param {jQuery***REMOVED*** element - jQuery object to make into a slider control.
   * @param {Object***REMOVED*** options - Overrides to the default plugin settings.
   */
  constructor(element, options) {
    this.$element = element;
    this.options = $.extend({***REMOVED***, Slider.defaults, this.$element.data(), options);

    this._init();

    Foundation.registerPlugin(this, 'Slider');
    Foundation.Keyboard.register('Slider', {
      'ltr': {
        'ARROW_RIGHT': 'increase',
        'ARROW_UP': 'increase',
        'ARROW_DOWN': 'decrease',
        'ARROW_LEFT': 'decrease',
        'SHIFT_ARROW_RIGHT': 'increase_fast',
        'SHIFT_ARROW_UP': 'increase_fast',
        'SHIFT_ARROW_DOWN': 'decrease_fast',
        'SHIFT_ARROW_LEFT': 'decrease_fast'
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
  _init() {
    this.inputs = this.$element.find('input');
    this.handles = this.$element.find('[data-slider-handle]');

    this.$handle = this.handles.eq(0);
    this.$input = this.inputs.length ? this.inputs.eq(0) : $(`#${this.$handle.attr('aria-controls')***REMOVED***`);
    this.$fill = this.$element.find('[data-slider-fill]').css(this.options.vertical ? 'height' : 'width', 0);

    var isDbl = false,
        _this = this;
    if (this.options.disabled || this.$element.hasClass(this.options.disabledClass)) {
      this.options.disabled = true;
      this.$element.addClass(this.options.disabledClass);
    ***REMOVED***
    if (!this.inputs.length) {
      this.inputs = $().add(this.$input);
      this.options.binding = true;
    ***REMOVED***

    this._setInitAttr(0);

    if (this.handles[1]) {
      this.options.doubleSided = true;
      this.$handle2 = this.handles.eq(1);
      this.$input2 = this.inputs.length > 1 ? this.inputs.eq(1) : $(`#${this.$handle2.attr('aria-controls')***REMOVED***`);

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

  setHandles() {
    if(this.handles[1]) {
      this._setHandlePos(this.$handle, this.inputs.eq(0).val(), true, () => {
        this._setHandlePos(this.$handle2, this.inputs.eq(1).val(), true);
      ***REMOVED***);
    ***REMOVED*** else {
      this._setHandlePos(this.$handle, this.inputs.eq(0).val(), true);
    ***REMOVED***
  ***REMOVED***

  _reflow() {
    this.setHandles();
  ***REMOVED***
  /**
  * @function
  * @private
  * @param {Number***REMOVED*** value - floating point (the value) to be transformed using to a relative position on the slider (the inverse of _value)
  */
  _pctOfBar(value) {
    var pctOfBar = percent(value - this.options.start, this.options.end - this.options.start)

    switch(this.options.positionValueFunction) {
    case "pow":
      pctOfBar = this._logTransform(pctOfBar);
      break;
    case "log":
      pctOfBar = this._powTransform(pctOfBar);
      break;
    ***REMOVED***

    return pctOfBar.toFixed(2)
  ***REMOVED***

  /**
  * @function
  * @private
  * @param {Number***REMOVED*** pctOfBar - floating point, the relative position of the slider (typically between 0-1) to be transformed to a value
  */
  _value(pctOfBar) {
    switch(this.options.positionValueFunction) {
    case "pow":
      pctOfBar = this._powTransform(pctOfBar);
      break;
    case "log":
      pctOfBar = this._logTransform(pctOfBar);
      break;
    ***REMOVED***
    var value = (this.options.end - this.options.start) * pctOfBar + this.options.start;

    return value
  ***REMOVED***

  /**
  * @function
  * @private
  * @param {Number***REMOVED*** value - floating point (typically between 0-1) to be transformed using the log function
  */
  _logTransform(value) {
    return baseLog(this.options.nonLinearBase, ((value*(this.options.nonLinearBase-1))+1))
  ***REMOVED***

  /**
  * @function
  * @private
  * @param {Number***REMOVED*** value - floating point (typically between 0-1) to be transformed using the power function
  */
  _powTransform(value) {
    return (Math.pow(this.options.nonLinearBase, value) - 1) / (this.options.nonLinearBase - 1)
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
  _setHandlePos($hndl, location, noInvert, cb) {
    // don't move if the slider has been disabled since its initialization
    if (this.$element.hasClass(this.options.disabledClass)) {
      return;
    ***REMOVED***
    //might need to alter that slightly for bars that will have odd number selections.
    location = parseFloat(location);//on input change events, convert string to number...grumble.

    // prevent slider from running out of bounds, if value exceeds the limits set through options, override the value to min/max
    if (location < this.options.start) { location = this.options.start; ***REMOVED***
    else if (location > this.options.end) { location = this.options.end; ***REMOVED***

    var isDbl = this.options.doubleSided;

    if (isDbl) { //this block is to prevent 2 handles from crossing eachother. Could/should be improved.
      if (this.handles.index($hndl) === 0) {
        var h2Val = parseFloat(this.$handle2.attr('aria-valuenow'));
        location = location >= h2Val ? h2Val - this.options.step : location;
      ***REMOVED*** else {
        var h1Val = parseFloat(this.$handle.attr('aria-valuenow'));
        location = location <= h1Val ? h1Val + this.options.step : location;
      ***REMOVED***
    ***REMOVED***

    //this is for single-handled vertical sliders, it adjusts the value to account for the slider being "upside-down"
    //for click and drag events, it's weird due to the scale(-1, 1) css property
    if (this.options.vertical && !noInvert) {
      location = this.options.end - location;
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
          handlePct =  ~~(percent(handleDim, elemDim) * 100);
      //if left handle, the math is slightly different than if it's the right handle, and the left/top property needs to be changed for the fill bar
      if (isLeftHndl) {
        //left or top percentage value to apply to the fill bar.
        css[lOrT] = `${movement***REMOVED***%`;
        //calculate the new min-height/width for the fill bar.
        dim = parseFloat(this.$handle2[0].style[lOrT]) - movement + handlePct;
        //this callback is necessary to prevent errors and allow the proper placement and initialization of a 2-handled slider
        //plus, it means we don't care if 'dim' isNaN on init, it won't be in the future.
        if (cb && typeof cb === 'function') { cb(); ***REMOVED***//this is only needed for the initialization of 2 handled sliders
      ***REMOVED*** else {
        //just caching the value of the left/bottom handle's left/top property
        var handlePos = parseFloat(this.$handle[0].style[lOrT]);
        //calculate the new min-height/width for the fill bar. Use isNaN to prevent false positives for numbers <= 0
        //based on the percentage of movement of the handle being manipulated, less the opposing handle's left/top position, plus the percentage w/h of the handle itself
        dim = movement - (isNaN(handlePos) ? (this.options.initialStart - this.options.start)/((this.options.end-this.options.start)/100) : handlePos) + handlePct;
      ***REMOVED***
      // assign the min-height/width to our css object
      css[`min-${hOrW***REMOVED***`] = `${dim***REMOVED***%`;
    ***REMOVED***

    this.$element.one('finished.zf.animate', function() {
                    /**
                     * Fires when the handle is done moving.
                     * @event Slider#moved
                     */
                    _this.$element.trigger('moved.zf.slider', [$hndl]);
                ***REMOVED***);

    //because we don't know exactly how the handle will be moved, check the amount of time it should take to move.
    var moveTime = this.$element.data('dragging') ? 1000/60 : this.options.moveTime;

    Foundation.Move(moveTime, $hndl, function() {
      // adjusting the left/top property of the handle, based on the percentage calculated above
      // if movement isNaN, that is because the slider is hidden and we cannot determine handle width,
      // fall back to next best guess.
      if (isNaN(movement)) {
        $hndl.css(lOrT, `${pctOfBar * 100***REMOVED***%`);
      ***REMOVED***
      else {
        $hndl.css(lOrT, `${movement***REMOVED***%`);
      ***REMOVED***

      if (!_this.options.doubleSided) {
        //if single-handled, a simple method to expand the fill bar
        _this.$fill.css(hOrW, `${pctOfBar * 100***REMOVED***%`);
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
    _this.timeout = setTimeout(function(){
      _this.$element.trigger('changed.zf.slider', [$hndl]);
    ***REMOVED***, _this.options.changedDelay);
  ***REMOVED***

  /**
   * Sets the initial attribute for the slider element.
   * @function
   * @private
   * @param {Number***REMOVED*** idx - index of the current handle/input to use.
   */
  _setInitAttr(idx) {
    var initVal = (idx === 0 ? this.options.initialStart : this.options.initialEnd)
    var id = this.inputs.eq(idx).attr('id') || Foundation.GetYoDigits(6, 'slider');
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
  _setValues($handle, val) {
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
  _handleEvent(e, $handle, val) {
    var value, hasVal;
    if (!val) {//click or drag events
      e.preventDefault();
      var _this = this,
          vertical = this.options.vertical,
          param = vertical ? 'height' : 'width',
          direction = vertical ? 'top' : 'left',
          eventOffset = vertical ? e.pageY : e.pageX,
          halfOfHandle = this.$handle[0].getBoundingClientRect()[param] / 2,
          barDim = this.$element[0].getBoundingClientRect()[param],
          windowScroll = vertical ? $(window).scrollTop() : $(window).scrollLeft();


      var elemOffset = this.$element.offset()[direction];

      // touch events emulated by the touch util give position relative to screen, add window.scroll to event coordinates...
      // best way to guess this is simulated is if clientY == pageY
      if (e.clientY === e.pageY) { eventOffset = eventOffset + windowScroll; ***REMOVED***
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
      if (Foundation.rtl() && !this.options.vertical) {value = this.options.end - value;***REMOVED***

      value = _this._adjustValue(null, value);
      //boolean flag for the setHandlePos fn, specifically for vertical sliders
      hasVal = false;

      if (!$handle) {//figure out which handle it is, pass it to the next function.
        var firstHndlPos = absPosition(this.$handle, direction, barXY, param),
            secndHndlPos = absPosition(this.$handle2, direction, barXY, param);
            $handle = firstHndlPos <= secndHndlPos ? this.$handle : this.$handle2;
      ***REMOVED***

    ***REMOVED*** else {//change event on input
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
  _adjustValue($handle, value) {
    var val,
      step = this.options.step,
      div = parseFloat(step/2),
      left, prev_val, next_val;
    if (!!$handle) {
      val = parseFloat($handle.attr('aria-valuenow'));
    ***REMOVED***
    else {
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
  _events() {
    this._eventsForHandle(this.$handle);
    if(this.handles[1]) {
      this._eventsForHandle(this.$handle2);
    ***REMOVED***
  ***REMOVED***


  /**
   * Adds event listeners a particular handle
   * @function
   * @private
   * @param {jQuery***REMOVED*** $handle - the current handle to apply listeners to.
   */
  _eventsForHandle($handle) {
    var _this = this,
        curHandle,
        timer;

      this.inputs.off('change.zf.slider').on('change.zf.slider', function(e) {
        var idx = _this.inputs.index($(this));
        _this._handleEvent(e, _this.handles.eq(idx), $(this).val());
      ***REMOVED***);

      if (this.options.clickSelect) {
        this.$element.off('click.zf.slider').on('click.zf.slider', function(e) {
          if (_this.$element.data('dragging')) { return false; ***REMOVED***

          if (!$(e.target).is('[data-slider-handle]')) {
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

      var $body = $('body');
      $handle
        .off('mousedown.zf.slider')
        .on('mousedown.zf.slider', function(e) {
          $handle.addClass('is-dragging');
          _this.$fill.addClass('is-dragging');//
          _this.$element.data('dragging', true);

          curHandle = $(e.currentTarget);

          $body.on('mousemove.zf.slider', function(e) {
            e.preventDefault();
            _this._handleEvent(e, curHandle);

          ***REMOVED***).on('mouseup.zf.slider', function(e) {
            _this._handleEvent(e, curHandle);

            $handle.removeClass('is-dragging');
            _this.$fill.removeClass('is-dragging');
            _this.$element.data('dragging', false);

            $body.off('mousemove.zf.slider mouseup.zf.slider');
          ***REMOVED***);
      ***REMOVED***)
      // prevent events triggered by touch
      .on('selectstart.zf.slider touchmove.zf.slider', function(e) {
        e.preventDefault();
      ***REMOVED***);
    ***REMOVED***

    $handle.off('keydown.zf.slider').on('keydown.zf.slider', function(e) {
      var _$handle = $(this),
          idx = _this.options.doubleSided ? _this.handles.index(_$handle) : 0,
          oldValue = parseFloat(_this.inputs.eq(idx).val()),
          newValue;

      // handle keyboard event with keyboard util
      Foundation.Keyboard.handleKey(e, 'Slider', {
        decrease: function() {
          newValue = oldValue - _this.options.step;
        ***REMOVED***,
        increase: function() {
          newValue = oldValue + _this.options.step;
        ***REMOVED***,
        decrease_fast: function() {
          newValue = oldValue - _this.options.step * 10;
        ***REMOVED***,
        increase_fast: function() {
          newValue = oldValue + _this.options.step * 10;
        ***REMOVED***,
        handled: function() { // only set handle pos when event was handled specially
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
  destroy() {
    this.handles.off('.zf.slider');
    this.inputs.off('.zf.slider');
    this.$element.off('.zf.slider');

    clearTimeout(this.timeout);

    Foundation.unregisterPlugin(this);
  ***REMOVED***
***REMOVED***

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
  moveTime: 200,//update this if changing the transition time in the sass
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
  positionValueFunction: 'linear',
***REMOVED***;

function percent(frac, num) {
  return (frac / num);
***REMOVED***
function absPosition($handle, dir, clickPos, param) {
  return Math.abs(($handle.position()[dir] + ($handle[param]() / 2)) - clickPos);
***REMOVED***
function baseLog(base, value) {
  return Math.log(value)/Math.log(base)
***REMOVED***

// Window exports
Foundation.plugin(Slider, 'Slider');

***REMOVED***(jQuery);

