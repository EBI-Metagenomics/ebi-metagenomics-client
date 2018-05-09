const util = require('../util');
const authApi = require('../components/authApi');

const fetchLogin = util.setupPage('#submit-nav', window.location.href);

const $actionDiv = $('#action');

const userData = new authApi.UserDetails();
const fetch = userData.fetch();

fetchLogin.done(function(loggedIn) {
    if (!loggedIn) {
        const $button = $(util.getLoginLink('Please click here to login'));
        $button.attr({'class': 'button'});
        $actionDiv.html($button);
    } else {
        fetch.done(function() {
            if (userData.attributes['analysis'] !== true) {
                const $button = $('<fetchLogin class=\'button\'>Give consent.</fetchLogin>');
                $actionDiv.html($button);
                // TODO send email using API
            }
        });
    }
});

