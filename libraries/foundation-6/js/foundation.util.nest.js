'use strict';

!function($) {

const Nest = {
  Feather(menu, type = 'zf') {
    menu.attr('role', 'menubar');

    var items = menu.find('li').attr({'role': 'menuitem'***REMOVED***),
        subMenuClass = `is-${type***REMOVED***-submenu`,
        subItemClass = `${subMenuClass***REMOVED***-item`,
        hasSubClass = `is-${type***REMOVED***-submenu-parent`;

    items.each(function() {
      var $item = $(this),
          $sub = $item.children('ul');

      if ($sub.length) {
        $item
          .addClass(hasSubClass)
          .attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          ***REMOVED***);
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if(type === 'drilldown') {
            $item.attr({'aria-expanded': false***REMOVED***);
          ***REMOVED***

        $sub
          .addClass(`submenu ${subMenuClass***REMOVED***`)
          .attr({
            'data-submenu': '',
            'role': 'menu'
          ***REMOVED***);
        if(type === 'drilldown') {
          $sub.attr({'aria-hidden': true***REMOVED***);
        ***REMOVED***
      ***REMOVED***

      if ($item.parent('[data-submenu]').length) {
        $item.addClass(`is-submenu-item ${subItemClass***REMOVED***`);
      ***REMOVED***
    ***REMOVED***);

    return;
  ***REMOVED***,

  Burn(menu, type) {
    var //items = menu.find('li'),
        subMenuClass = `is-${type***REMOVED***-submenu`,
        subItemClass = `${subMenuClass***REMOVED***-item`,
        hasSubClass = `is-${type***REMOVED***-submenu-parent`;

    menu
      .find('>li, .menu, .menu > li')
      .removeClass(`${subMenuClass***REMOVED*** ${subItemClass***REMOVED*** ${hasSubClass***REMOVED*** is-submenu-item submenu is-active`)
      .removeAttr('data-submenu').css('display', '');

    // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
    //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
    //           .removeAttr('data-submenu'));
    // items.each(function(){
    //   var $item = $(this),
    //       $sub = $item.children('ul');
    //   if($item.parent('[data-submenu]').length){
    //     $item.removeClass('is-submenu-item ' + subItemClass);
    //   ***REMOVED***
    //   if($sub.length){
    //     $item.removeClass('has-submenu');
    //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
    //   ***REMOVED***
    // ***REMOVED***);
  ***REMOVED***
***REMOVED***

Foundation.Nest = Nest;

***REMOVED***(jQuery);
