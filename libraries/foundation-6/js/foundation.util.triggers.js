'use strict';

!function($) {

const MutationObserver = (function () {
  var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
  for (var i=0; i < prefixes.length; i++) {
    if (`${prefixes[i]***REMOVED***MutationObserver` in window) {
      return window[`${prefixes[i]***REMOVED***MutationObserver`];
    ***REMOVED***
  ***REMOVED***
  return false;
***REMOVED***());

const triggers = (el, type) => {
  el.data(type).split(' ').forEach(id => {
    $(`#${id***REMOVED***`)[ type === 'close' ? 'trigger' : 'triggerHandler'](`${type***REMOVED***.zf.trigger`, [el]);
  ***REMOVED***);
***REMOVED***;
// Elements with [data-open] will reveal a plugin that supports it when clicked.
$(document).on('click.zf.trigger', '[data-open]', function() {
  triggers($(this), 'open');
***REMOVED***);

// Elements with [data-close] will close a plugin that supports it when clicked.
// If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
$(document).on('click.zf.trigger', '[data-close]', function() {
  let id = $(this).data('close');
  if (id) {
    triggers($(this), 'close');
  ***REMOVED***
  else {
    $(this).trigger('close.zf.trigger');
  ***REMOVED***
***REMOVED***);

// Elements with [data-toggle] will toggle a plugin that supports it when clicked.
$(document).on('click.zf.trigger', '[data-toggle]', function() {
  let id = $(this).data('toggle');
  if (id) {
    triggers($(this), 'toggle');
  ***REMOVED*** else {
    $(this).trigger('toggle.zf.trigger');
  ***REMOVED***
***REMOVED***);

// Elements with [data-closable] will respond to close.zf.trigger events.
$(document).on('close.zf.trigger', '[data-closable]', function(e){
  e.stopPropagation();
  let animation = $(this).data('closable');

  if(animation !== ''){
    Foundation.Motion.animateOut($(this), animation, function() {
      $(this).trigger('closed.zf');
    ***REMOVED***);
  ***REMOVED***else{
    $(this).fadeOut().trigger('closed.zf');
  ***REMOVED***
***REMOVED***);

$(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function() {
  let id = $(this).data('toggle-focus');
  $(`#${id***REMOVED***`).triggerHandler('toggle.zf.trigger', [$(this)]);
***REMOVED***);

/**
* Fires once after all other scripts have loaded
* @function
* @private
*/
$(window).on('load', () => {
  checkListeners();
***REMOVED***);

function checkListeners() {
  eventsListener();
  resizeListener();
  scrollListener();
  closemeListener();
***REMOVED***

//******** only fires this function once on load, if there's something to watch ********
function closemeListener(pluginName) {
  var yetiBoxes = $('[data-yeti-box]'),
      plugNames = ['dropdown', 'tooltip', 'reveal'];

  if(pluginName){
    if(typeof pluginName === 'string'){
      plugNames.push(pluginName);
    ***REMOVED***else if(typeof pluginName === 'object' && typeof pluginName[0] === 'string'){
      plugNames.concat(pluginName);
    ***REMOVED***else{
      console.error('Plugin names must be strings');
    ***REMOVED***
  ***REMOVED***
  if(yetiBoxes.length){
    let listeners = plugNames.map((name) => {
      return `closeme.zf.${name***REMOVED***`;
    ***REMOVED***).join(' ');

    $(window).off(listeners).on(listeners, function(e, pluginId){
      let plugin = e.namespace.split('.')[0];
      let plugins = $(`[data-${plugin***REMOVED***]`).not(`[data-yeti-box="${pluginId***REMOVED***"]`);

      plugins.each(function(){
        let _this = $(this);

        _this.triggerHandler('close.zf.trigger', [_this]);
      ***REMOVED***);
    ***REMOVED***);
  ***REMOVED***
***REMOVED***

function resizeListener(debounce){
  let timer,
      $nodes = $('[data-resize]');
  if($nodes.length){
    $(window).off('resize.zf.trigger')
    .on('resize.zf.trigger', function(e) {
      if (timer) { clearTimeout(timer); ***REMOVED***

      timer = setTimeout(function(){

        if(!MutationObserver){//fallback for IE 9
          $nodes.each(function(){
            $(this).triggerHandler('resizeme.zf.trigger');
          ***REMOVED***);
        ***REMOVED***
        //trigger all listening elements and signal a resize event
        $nodes.attr('data-events', "resize");
      ***REMOVED***, debounce || 10);//default time to emit resize event
    ***REMOVED***);
  ***REMOVED***
***REMOVED***

function scrollListener(debounce){
  let timer,
      $nodes = $('[data-scroll]');
  if($nodes.length){
    $(window).off('scroll.zf.trigger')
    .on('scroll.zf.trigger', function(e){
      if(timer){ clearTimeout(timer); ***REMOVED***

      timer = setTimeout(function(){

        if(!MutationObserver){//fallback for IE 9
          $nodes.each(function(){
            $(this).triggerHandler('scrollme.zf.trigger');
          ***REMOVED***);
        ***REMOVED***
        //trigger all listening elements and signal a scroll event
        $nodes.attr('data-events', "scroll");
      ***REMOVED***, debounce || 10);//default time to emit scroll event
    ***REMOVED***);
  ***REMOVED***
***REMOVED***

function eventsListener() {
  if(!MutationObserver){ return false; ***REMOVED***
  let nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

  //element callback
  var listeningElementsMutation = function (mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

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
			  $target.closest("[data-mutate]").attr("data-events","mutate");
			  $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
		  ***REMOVED***
		  break;

        case "childList":
		  $target.closest("[data-mutate]").attr("data-events","mutate");
		  $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      ***REMOVED***
    ***REMOVED***;

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] ***REMOVED***);
      ***REMOVED***
    ***REMOVED***
  ***REMOVED***

// ------------------------------------

// [PH]
// Foundation.CheckWatchers = checkWatchers;
Foundation.IHearYou = checkListeners;
// Foundation.ISeeYou = scrollListener;
// Foundation.IFeelYou = closemeListener;

***REMOVED***(jQuery);
