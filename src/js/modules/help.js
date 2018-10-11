const util = require('../util');
const commons = require('../commons');
const readTheDocsUrl = commons.READTHEDOCS_URL;
$('#doc-link').prop('href', readTheDocsUrl);
$('#doc-link-2').prop('href', readTheDocsUrl);

util.setupPage('#help-nav');

const prevPage = document.referrer;
if (prevPage.indexOf('sequence-search/search/phmmer') > -1 ||
    window.location.href.indexOf('?origin=phmmer') > -1) {
    $(function() {
        const $seqSearch = $('#seq-search');
        $seqSearch.addClass('highlight');
        $seqSearch[0].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    });
}
