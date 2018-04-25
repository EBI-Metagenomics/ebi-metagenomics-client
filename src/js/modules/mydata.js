const util = require('../util');
const api = require('../components/api');
util.setupPage('#overview');

util.getLoginStatus().done(function(isLoggedIn) {
    if (isLoggedIn) {
        const userStudies = new api.UserStudies();
        new util.StudiesView({collection: userStudies});
    } else {
        $('body').html('User is not logged in');
    }
});
