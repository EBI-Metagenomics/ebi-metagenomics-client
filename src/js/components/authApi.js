const api = require('mgnify').api(process.env.API_URL);
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
        let user ={};
        if (response.data.length > 0) {
            const attr = response.data[0].attributes;
            user = {
                'firstName': attr['first-name'],
                'surname': attr['surname'],
                'email': attr['email-address'],
                'analysis': attr['analysis'],
                'submitter': attr['submitter']
            };
            if (response.data.length > 1) {
                user.otherSubmitters = response.data
                    .slice(1)
                    .map((submitter) => {
                        const attr2 = submitter.attributes;
                        return {
                            'firstName': attr2['first-name'],
                            'surname': attr2['surname'],
                            'email': attr2['email-address'],
                            'analysis': attr2['analysis'],
                            'submitter': attr2['submitter']
                        }
                    })
            }
        } 
        return user;
    },
    getEmails() {
        let email = this.attributes['email'];
        if (this.attributes.otherSubmitters && this.attributes.otherSubmitters.length){
            email += ','+this.attributes.otherSubmitters
                .map(submitter=>submitter.email)
                .filter(Boolean)
                .join(',');
        }
        return email;  
    }
});
