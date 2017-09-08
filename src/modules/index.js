import * as util from '../main';

util.setCurrentTab('#overview-nav');

$('#this_close').on('click', function(){
    $('.jumbo-header').slideUp();
});
