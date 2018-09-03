const api = require('mgnify').api;
const Backbone = require('backbone');
export const API_LOGIN_ROOT = api.API_URL.split('/').slice(0, -2).join('/') + '/';

/**
 * Fetch login form from API
 * @return {jQuery.Promise}
 */
export function getLoginForm() {
    const url = API_LOGIN_ROOT + 'http-auth/login_form';
    return $.ajax({
        method: 'get',
        url: url,
        credentials: 'same-origin'
    });
}

export const UserStudies = api.StudiesCollection.extend({
    url() {
        return api.API_URL + 'mydata';
    }
});

export const UserDetails = Backbone.Model.extend({
    url() {
        return api.API_URL + 'utils/myaccounts';
    },
    parse(response) {
        let user;
        if (response.data.length > 0) {
            const attr = response.data[0].attributes;
            user = {
                'firstName': attr['first-name'],
                'surname': attr['surname'],
                'email': attr['email-address'],
                'analysis': attr['analysis'],
                'submitter': attr['submitter']
            };
        } else {
            user = {};
        }
        return user;
    }
});
