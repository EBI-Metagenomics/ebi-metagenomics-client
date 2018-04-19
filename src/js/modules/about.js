const util = require('../util');
util.setCurrentTab('#about-nav');

util.checkAPIonline();

// Expand button handler, usage as follows
// Button --> <a class='expand-button' for='hiddenId'>Text></a>
// Hidden content <div id='hiddenId' class='hidden'>Content</div>

util.attachExpandButtonCallback();

