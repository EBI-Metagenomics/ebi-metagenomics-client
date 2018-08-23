const util = require('../util');
const authApi = require('../components/authApi');

const fetchLogin = util.setupPage('#submit-nav', window.location.href);

const $actionDiv = $('#action');

const userData = new authApi.UserDetails();
const fetch = userData.fetch();

/**
 * General mailto url for give consent button
 * @return {object} userdata from API
 */
function sendMailToEmail(userData) {
    let body = 'I consent for the MGnify team to analyse the private data of my account ' +
        util.getUsername() + '.';

    util.sendMail(userData['email'], 'Request consent', body);
}

/**
 * Displays relevant UI if user is not logged in
 */
function notLoggedInCallBack() {
    const $button = $(util.getLoginLink('Please click here to login'));
    $button.attr({'class': 'button'});
    $actionDiv.html($button);
}

fetchLogin.done(function(loggedIn) {
    if (!loggedIn) {
        notLoggedInCallBack();
    } else {
        fetch.always(function() {
            if (userData.attributes['analysis'] !== true) {
                const $button = $('<button class=\'button\'>Give consent.</button>');
                $button.click(function(e) {
                    const consentGiven = $('#consent-given').is(':checked');
                    const $consentGivenError = $('#consent-given-error');
                    if (!consentGiven) {
                        $consentGivenError.show();
                        e.preventDefault();
                    } else {
                        $consentGivenError.hide();
                        sendMailToEmail(userData);
                    }
                });
                $actionDiv.html($button);
                $('#consent').removeClass('hidden');
            }
        });
    }
});
