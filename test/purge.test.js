'use strict';

var nock = require('nock');
var purge = require('../purge');

describe('purge', function () {

  before(function () {
    nock.disableNetConnect();
  });

  after(function () {
    nock.cleanAll();
    nock.enableNetConnect();
  });

  it('should purge with url', function(done) {
    var cdn = nock('https://cdn.auth0.com').delete('/lock/1.2.3/').reply(200);
    purge('lock/1.2.3/')
    .tapOnCompleted(function () {
      cdn.done();
      done();
    })
    .subscribe();
  });

  it('should always send completed', function(done) {
    var cdn = nock('https://cdn.auth0.com').delete('/lock/1.2.3/').reply(404);
    purge('lock/1.2.3/')
    .tapOnCompleted(function () {
      cdn.done();
      done();
    })
    .subscribe();
  });

});