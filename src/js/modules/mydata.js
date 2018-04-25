const util = require('../util');
const api = require('../components/api');
util.setupPage('#overview');

util.getLoginStatus().done(function(isLoggedIn) {
    if (isLoggedIn) {
        const userStudies = new api.UserStudies();
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
