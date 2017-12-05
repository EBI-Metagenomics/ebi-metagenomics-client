import {initHeadTag, setCurrentTab} from "../util";

setCurrentTab('#about-nav');
initHeadTag('Help');


// Expand button handler, usage as follows
// Button --> <a class='expand-button' for='hiddenId'>Text></a>
// Hidden content <div id='hiddenId' class='hidden'>Content</div>
$(".expand-button").on('click', function(){
   if($(this).hasClass('min')){
       $(this).removeClass('min');
       $($(this).attr('for')).slideUp();
   } else {
        $(this).addClass('min');
       $($(this).attr('for')).slideDown();
    }
});