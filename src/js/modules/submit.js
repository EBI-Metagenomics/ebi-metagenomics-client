const util = require('../util');
const authApi = require('../components/authApi');

const fetchLogin = util.setupPage('#submit-nav', window.location.href);

const $actionDiv = $('#action');

const userDetails = new authApi.UserDetails();
const fetch = userDetails.fetch();

/**
 * General mailto url for give consent button
 * @param {object} userData
 * @return {object} user data from API
 */
function sendConsentRequest(userData) {
    let body = 'I consent for the MGnify team to analyse the private data of my account ' +
        util.getUsername() + '.';
    return util.sendMail(userDetails.getEmails(), 'Request consent', body, true);
}

/**
 * Displays relevant UI if user is not logged in
 */
function notLoggedInCallBack() {
    const $button = $(util.getLoginLink('Please click here to login'));
    $button.attr({'class': 'button'});
    $actionDiv.html($button);
}

/**
 * Display success or error message on consent request callback
 * @param {boolean} success true if request successfully sent
 **/
function consentRequestCallback(success) {
    if (success) {
        $('#consent-request-success').show();
        $('#consent-request-error').hide();
    } else {
        $('#consent-request-success').hide();
        $('#consent-request-error').show();
    }
}

// If user not logged in display login button
fetchLogin.done(function(loggedIn) {
    if (!loggedIn) {
        notLoggedInCallBack();
    } else {
        fetch.always(function() {
            let userData = userDetails.attributes;
            // If consent not given display consent button
            if (userData['analysis'] !== true) {
                $('#consent-webin-account').html(userData.id);
                $('#consent-webin-emails').html(userDetails.getEmails());
                const $button = $('<button class=\'button\'>Give consent.</button>');
                $button.click(function(e) {
                    const consentGiven = $('#consent-given').is(':checked');
                    const $consentGivenError = $('#consent-given-error');
                    if (!consentGiven) {
                        $consentGivenError.show();
                        e.preventDefault();
                    } else {
                        $consentGivenError.hide();
                        sendConsentRequest(userData).done((result) => {
                            consentRequestCallback(result);
                        });
                    }
                });
                $actionDiv.html($button);
                $('#consent').removeClass('hidden');
            }
        });
    }
});
