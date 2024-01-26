import Config from "./config";

export let Util = {
  getBaseURL: function() {
    return Config.BASE_URL;
  },
  getPageURL: function(page) {
    return Config.BASE_URL + (page !== "overview" ? page : "");
  },
  openPage: function(page) {
    return cy.visit(Util.getPageURL(page));
  },
  waitForPageLoad: function(title) {
    cy.get("h2").should("contain", title);
  },
  waitForBiomesLoad: function(results) {
    cy.get("table tbody tr", { timeout: 10000 }).should("have.length", parseInt(results));
  },
  waitForSearchResults: function(rowSelector, numResults) {
    cy.get(rowSelector, { timeout: 10000 }).should("have.length", parseInt(numResults));
    cy.get(".mg-table-overlay", { timeout: 10000 }).should("not.exist");
  },
  assertTableIsCleared: function() {
    cy.get("table tr.sample").should("not.exist");
  },
  changeTab: function(tabName) {
    cy.get("a[href*='#" + tabName + "'].vf-tabs__link").click();
  },
  changeSubTab: function(subTabName) {
    cy.get("button.mg-button-as-tab").contains(subTabName).click();
  },
  openAndWait: function(page, waitFor) {
    Util.openPage(page);
    Util.waitForPageLoad(waitFor);
  },
  openWaitAndChangeTab: function(page, waitFor, tab) {
    Util.openAndWait(page, waitFor);
    Util.changeTab(tab);
  },
  stripWhitespace: function(str) {
    return str.replace(/\s/g, "");
  },
  datatype: {
    STR: 0,
    NUM: 1,
    DATE: 2
  },
  loginButton: "[data-cy='login']",
  logoutButton: "[data-cy='logout']:visible",
  myDataBtn: "[data-cy='mydata']",
  loginModal: "[data-cy='loginModal']",
  usernameInput: "input[name='username']",
  passwordInput: "input[name='password'][type='password']",

  username: Cypress.env("WEBIN_USERNAME"),
  password: Cypress.env("WEBIN_PASSWORD"),

  checkIsLoggedIn: function() {
    cy.get(Util.loginModal).should("be.hidden");
    cy.get(Util.loginButton).should("not.exist");
    cy.get(Util.logoutButton).should("be.visible");
  },
  fillLoginModalForm: function() {
    cy.get(Util.usernameInput).type(Util.username);
    cy.get(Util.passwordInput).type(Util.password);
    cy.get(Util.loginModal).find("input[name='submit']").click();
  },
  login: function() {
    cy.get(Util.loginButton).click();
    Util.fillLoginModalForm();
    Util.waitForPageLoad("My studies");
    Util.checkIsLoggedIn();
    cy.get(Util.myDataBtn).should("be.visible");
  },
  setupDefaultSearchPageRouting: function() {
    const typeCounts = {
      "amplicon": 356039,
      "assembly": 28873,
      "metabarcoding": 2039,
      "metagenomic": 33827,
      "metatranscriptomic": 2205,
      "long_reads_assembly": 2
    };
    for (const experimentType in typeCounts) {
      cy.intercept("GET", "**/ebisearch/ws/rest/metagenomics_analyses?format=json&" +
        "start=0&" +
        "query=domain_source:metagenomics_analyses&" +
        "size=0&" +
        "fields=id,name,description,biome_name&" +
        "facetcount=0&" +
        "facetsdepth=5&" +
        `facets=experiment_type:${experimentType}`,
        { body: { "hitCount": typeCounts[experimentType], "entries": [], "facets": [] } }).as(`${experimentType}Counts`);
    }
    // Basic page load
    cy.intercept("GET",
      "**ebisearch/ws/rest/metagenomics_projects?format=json&start=0&query=domain_source:metagenomics_projects&size=25&fields=ENA_PROJECT,METAGENOMICS_ANALYSES,biome_name,centre_name,description,name&facetcount=10&facetsdepth=4&facets=",
      {
        fixture: "search/metagenomicsProjectsDepth4.json"
      }).as("basicProjects");

    cy.intercept("GET",
      "**/ebisearch/ws/rest/metagenomics_projects?format=json&" +
      [
        "start=0",
        "query=domain_source:metagenomics_projects",
        "size=0",
        "fields=id,name,description,biome_name",
        "facetcount=0",
        "facetsdepth=5"
      ].join("&"),
      { fixture: "search/projectsInitFilters.json" }).as("basicProjectFilters");

    cy.intercept("GET",
      "**ebisearch/ws/rest/metagenomics_analyses?format=json&start=0&query=domain_source:metagenomics_analyses&size=25&fields=METAGENOMICS_PROJECTS,pipeline_version,experiment_type,sample_name,project_name,ENA_RUN,ANALYSIS,SRA-SAMPLE&facetcount=10&facetsdepth=4&facets=",
      {
        fixture: "search/metagenomicsAnalysesDepth4.json"
      }).as("basicAnalyses");

    cy.intercept("GET",
      "**/ebisearch/ws/rest/metagenomics_analyses?format=json&" +
      [
        "start=0",
        "query=domain_source:metagenomics_analyses",
        "size=0",
        "fields=id,name,description,biome_name",
        "facetcount=0",
        "facetsdepth=5"
      ].join("&"),
      { fixture: "search/analysesInitFilters.json" }).as("basicAnalysesFilters");
  },


  isValidLink: function($el, status) {
    const opts = {};
    if (status != 200) {
      opts.failOnStatusCode = false;
    }
    opts.url = Cypress.$($el).attr("href");
    cy.request(opts).then((resp) => {
      expect(resp["status"]).to.eq(status || 200);
    });
  },
  /**
   * Check the content of a tooltip for a highchart table
   * @param {string} selector Chart bar for the hover event
   * @param {Array} tooltip Array with the tooltip texts
   */
  checkChartTooltip: function(selector, tooltip) {
    cy.get(selector)
      .first()
      .trigger("mouseover", { force: true })
      .then(() => {
        // TODO: fix tooltip mouseover
        // cy.get('svg .highcharts-tooltip text')
        //   .should('contain', tooltip); // i.e. 'Pan-genome Count: 2854'
      });
  }
};
module.exports = Util;
