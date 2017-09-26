var chai = require('chai');
var expect = chai.expect;
var request = require('request');
var httpUtils = require('request-mocha')(request);

describe('A server receiving a request', function () {

    // Make request and save results to `this.err`, `this.res`, and `this.body`
    httpUtils.save('http://localhost:8080/');

    // Assert against mocha's `this` context
    it('Server is online.', function () {
        console.log(this.err);
        console.log(this.res);
        console.log(this.body);
        expect(this.err).to.equal(null);
        expect(this.res.statusCode).to.equal(200);
    });
});