'use strict';

var nock = require('nock');
var CDN = require('../../cdn')
var cdn = new CDN({cdn: 'https://cdn.auth0.com', mainBundleFile: 'lock.js'});

describe('cdn.exists', function () {

  before(function () {
    nock.disableNetConnect();
  });

  after(function () {
    nock.cleanAll();
    nock.enableNetConnect();
  });


});