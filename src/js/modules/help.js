import {setCurrentTab, initHeadTag} from "../util";

const commons = require('../commons');
const readTheDocsUrl = commons.READTHEDOCS_URL;
$("#doc-link").prop('href', readTheDocsUrl);
$("#doc-link-2").prop('href', readTheDocsUrl);


setCurrentTab('#help-nav');
initHeadTag('Help');