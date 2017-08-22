'use strict';

!function($) {

Foundation.Box = {
  ImNotTouchingYou: ImNotTouchingYou,
  GetDimensions: GetDimensions,
  GetOffsets: GetOffsets
***REMOVED***

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
function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
  var eleDims = GetDimensions(element),
      top, bottom, left, right;

  if (parent) {
    var parDims = GetDimensions(parent);

    bottom = (eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top);
    top    = (eleDims.offset.top >= parDims.offset.top);
    left   = (eleDims.offset.left >= parDims.offset.left);
    right  = (eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left);
  ***REMOVED***
  else {
    bottom = (eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top);
    top    = (eleDims.offset.top >= eleDims.windowDims.offset.top);
    left   = (eleDims.offset.left >= eleDims.windowDims.offset.left);
    right  = (eleDims.offset.left + eleDims.width <= eleDims.windowDims.width);
  ***REMOVED***

  var allDirs = [bottom, top, left, right];

  if (lrOnly) {
    return left === right === true;
  ***REMOVED***

  if (tbOnly) {
    return top === bottom === true;
  ***REMOVED***

  return allDirs.indexOf(false) === -1;
***REMOVED***;

/**
 * Uses native methods to return an object of dimension values.
 * @function
 * @param {jQuery || HTML***REMOVED*** element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
 * @returns {Object***REMOVED*** - nested object of integer pixel values
 * TODO - if element is window, return only those values.
 */
function GetDimensions(elem, test){
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
  ***REMOVED***
***REMOVED***

/**
 * Returns an object of top and left integer pixel values for dynamically rendered elements,
 * such as: Tooltip, Reveal, and Dropdown
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
  var $eleDims = GetDimensions(element),
      $anchorDims = anchor ? GetDimensions(anchor) : null;

  switch (position) {
    case 'top':
      return {
        left: (Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left),
        top: $anchorDims.offset.top - ($eleDims.height + vOffset)
      ***REMOVED***
      break;
    case 'left':
      return {
        left: $anchorDims.offset.left - ($eleDims.width + hOffset),
        top: $anchorDims.offset.top
      ***REMOVED***
      break;
    case 'right':
      return {
        left: $anchorDims.offset.left + $anchorDims.width + hOffset,
        top: $anchorDims.offset.top
      ***REMOVED***
      break;
    case 'center top':
      return {
        left: ($anchorDims.offset.left + ($anchorDims.width / 2)) - ($eleDims.width / 2),
        top: $anchorDims.offset.top - ($eleDims.height + vOffset)
      ***REMOVED***
      break;
    case 'center bottom':
      return {
        left: isOverflow ? hOffset : (($anchorDims.offset.left + ($anchorDims.width / 2)) - ($eleDims.width / 2)),
        top: $anchorDims.offset.top + $anchorDims.height + vOffset
      ***REMOVED***
      break;
    case 'center left':
      return {
        left: $anchorDims.offset.left - ($eleDims.width + hOffset),
        top: ($anchorDims.offset.top + ($anchorDims.height / 2)) - ($eleDims.height / 2)
      ***REMOVED***
      break;
    case 'center right':
      return {
        left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
        top: ($anchorDims.offset.top + ($anchorDims.height / 2)) - ($eleDims.height / 2)
      ***REMOVED***
      break;
    case 'center':
      return {
        left: ($eleDims.windowDims.offset.left + ($eleDims.windowDims.width / 2)) - ($eleDims.width / 2),
        top: ($eleDims.windowDims.offset.top + ($eleDims.windowDims.height / 2)) - ($eleDims.height / 2)
      ***REMOVED***
      break;
    case 'reveal':
      return {
        left: ($eleDims.windowDims.width - $eleDims.width) / 2,
        top: $eleDims.windowDims.offset.top + vOffset
      ***REMOVED***
    case 'reveal full':
      return {
        left: $eleDims.windowDims.offset.left,
        top: $eleDims.windowDims.offset.top
      ***REMOVED***
      break;
    case 'left bottom':
      return {
        left: $anchorDims.offset.left,
        top: $anchorDims.offset.top + $anchorDims.height + vOffset
      ***REMOVED***;
      break;
    case 'right bottom':
      return {
        left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
        top: $anchorDims.offset.top + $anchorDims.height + vOffset
      ***REMOVED***;
      break;
    default:
      return {
        left: (Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset),
        top: $anchorDims.offset.top + $anchorDims.height + vOffset
      ***REMOVED***
  ***REMOVED***
***REMOVED***

***REMOVED***(jQuery);
