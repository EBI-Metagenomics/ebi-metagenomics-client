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
                const $button = $('<button class=\'button\'>Give consent.</button>');
                $button.click(function() {
                    console.log('click');
                    const consentGiven = $('#consent-given').is(':checked');
                    const $consentGivenError = $('#consent-given-error');
                    if (!consentGiven) {
                        $consentGivenError.show();
                    } else {
                        $consentGivenError.hide();
                    }
                });
                $actionDiv.html($button);
                $('#consent').removeClass('hidden');
                // TODO send email using API
            }
        });
    }
});

