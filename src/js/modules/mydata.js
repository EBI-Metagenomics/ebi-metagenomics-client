const util = require('../util');
const authApi = require('../components/authApi');
const _ = require('underscore');

util.setupPage('#overview');

const StudiesViewWithEna = util.StudiesView.extend({

    getRowData(attr) {

        let studyLink = '<a href="' + attr.study_url + '" >' + attr.study_accession + '</a>';
        let enaLink = '';

        if (!attr['is_public']) {
            studyLink = '<span class="icon icon-functional icon-spacer" data-icon="L"></span>' +
                studyLink;
        } else {
            enaLink = '<a class="ext" href="' + attr.ena_url + '" >(' +
                attr.study_secondary_accession + ')</a>';
        }

        const biomes = _.map(attr.biomes, function(b) {
            return '<span class="biome_icon icon_xs ' + b.icon + '" title="' + b.name + '"></span>';
        });

        return [
            biomes.join(' '),
            studyLink + '<br>' + enaLink,
            attr['study_name'],
            attr['abstract'],
            attr['samples_count'],
            attr['last_update']];
    }
});

util.getLoginStatus().done(function(isLoggedIn) {
    if (isLoggedIn) {
        const userStudies = new authApi.UserStudies();
        new StudiesViewWithEna({
            collection: userStudies,
            tableClass: 'my-studies-table',
            isPageHeader: true,
            textFilter: false,
            sectionTitle: 'My studies'
        });
    } else {
        const here = '<a data-open="loginModal">here</a>';
        util.displayError('You are not logged in.', 'Click ' + here +
            ' to login and view your data.');
    }
});
