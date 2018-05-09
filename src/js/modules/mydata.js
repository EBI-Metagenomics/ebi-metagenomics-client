const util = require('../util');
const authApi = require('../components/authApi');

util.setupPage('#overview');

util.getLoginStatus().done(function(isLoggedIn) {
    if (isLoggedIn) {
        const userStudies = new authApi.UserStudies();
        new util.StudiesView({
            collection: userStudies,
            tableClass: 'my-studies-table',
            isPageHeader: true,
            filter: false,
            sectionTitle: 'My studies'
        });
    } else {
        const here = '<a data-open=\'loginModal\'>here</a>';
        util.displayError('You are not logged in.', 'Click ' + here +
            ' to login and view your data.');
    }
});
