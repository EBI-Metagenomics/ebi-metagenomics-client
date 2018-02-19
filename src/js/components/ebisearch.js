const Backbone = require('backbone');
const searchUrl = process.env.SEARCH_URL;

const Search = Backbone.Collection.extend({
    domainIdShort: 'runs',
    domainId: 'metagenomics_runs',
    params: {
        format: 'json',
        size: 0,
        start: 0,
        fields: 'id,name',
        facetcount: 0,
        facetsdepth: 5,
    },
    initialize: function () {
        this.query = ''

    },
    url: function () {
        return searchUrl + this.domainIdShort + '?' + this.buildParamStr();
    },
    parse: function (response) {
        return response.data;
    },
    buildParamStr: function () {
        let key;
        let result = '';
        for (key in this.params) {
            result += key + '=' + this.params[key];
        }

        return result;
    }
});

// const ProjectCount = Search.extend({
//     domainIdShort: 'projects',
//     domainId: 'metagenomics_projects',
//     parse: function (response) {
//         console.log(response);
//         return response;
//     }
// });

// var Person = Backbone.Model.extend({urlRoot : '/person/details'});
// var myName = new Person({id: "12345"});
// myName.fetch();
// URL http://[domainName]/person/details/id

export const ProjectCount = Backbone.Model.extend({url: searchUrl + 'projects?query=domain_source:metagenomics_projects&format=json&size=0&start=0&fields=id,name,description,biome_name,metagenomics_samples&facetcount=0&facetsdepth=5'});