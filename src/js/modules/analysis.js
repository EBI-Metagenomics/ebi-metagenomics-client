const api = require('mgnify').api(process.env.API_URL);
const util = require('../util');

const views = require('./analysis/views');

const analysisID = util.getURLParameter();

util.setupPage('#browse-nav');
util.specifyPageTitle('Analysis', analysisID);

/* Entry point */
const mainView = new views.AnalysisView({
    model: new api.Analysis({id: analysisID, params: {include: 'downloads'}})
});

mainView.render();
