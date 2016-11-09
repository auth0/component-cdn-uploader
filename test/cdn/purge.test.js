'use strict';

var nock = require('nock');
var CDN = require('../../cdn')
var cdn = new CDN({cdn: 'https://cdn.auth0.com'});

describe('cdn.purge', function () {

  before(function () {
    nock.disableNetConnect();
  });

  after(function () {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should purge with url', function(done) {
    var purge = nock('https://cdn.auth0.com').delete('/lock/1.2.3/').reply(200);
    cdn.purge('lock/1.2.3/')
    .tapOnCompleted(function () {
      purge.done();
      done();
    })
    .subscribe();
  });

  it('should always send completed', function(done) {
    var purge = nock('https://cdn.auth0.com').delete('/lock/1.2.3/').reply(404);
    cdn.purge('lock/1.2.3/')
    .tapOnCompleted(function () {
      purge.done();
      done();
    })
    .subscribe();
  });

});