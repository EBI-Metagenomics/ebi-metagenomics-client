const util = require('../util');
const authApi = require('../components/authApi');

const fetchLogin = util.setupPage('#submit-nav', window.location.href);

const $actionDiv = $('#action');

const userData = new authApi.UserDetails();
const fetch = userData.fetch();

function getMailToLink(userData) {
    let body = 'I consent for the MGnify team to analyse the private data of my account ' +
        util.getUsername() + '.';

    return 'mailto:metagenomics-help@ebi.ac.uk?subject=Request consent&body=' + body;
}

fetchLogin.done(function(loggedIn) {
    if (!loggedIn) {
        const $button = $(util.getLoginLink('Please click here to login'));
        $button.attr({'class': 'button'});
        $actionDiv.html($button);
    } else {
        fetch.done(function() {
            if (userData.attributes['analysis'] !== true) {
                const $button = $('<button class=\'button\'>Give consent.</button>');
                $button.attr('href', getMailToLink(userData.attributes));
                $button.click(function(e) {
                    const consentGiven = $('#consent-given').is(':checked');
                    const $consentGivenError = $('#consent-given-error');
                    if (!consentGiven) {
                        $consentGivenError.show();
                        e.preventDefault();
                    } else {
                        $consentGivenError.hide();
                        window.open($button.attr('href'), '_blank');
                    }
                });
                $actionDiv.html($button);
                $('#consent').removeClass('hidden');
                // TODO send email using API
            }
        });
    }
});

