'use strict';

var expect = require('chai').expect;
var proxyrequire = require('proxyquire');
var Rx = require('rx');


describe('uploader', function () {

  var options;

  beforeEach(function () {
    options = {
      name: 'component',
      version: '1.2.3',
      localPath: 'dist',
      remoteBasePath: 'js',
      bucket: 'hzalaz',
      cdn: 'https://cdn.auth0.com',
      mainBundleFile: 'lock.min.js',
      type: 'default',
      onlyMajor: false,
      snapshotName: 'development',
      logLevels: [],
    };
  });

  it('should upload full version', function (done) {
    var aws = {
      uploader: function (version, actual) {
        expect(version.remotePath).to.eql('js/component/1.2.3');
        expect(actual).to.not.be.empty
        done();
        return Rx.Observable.just('lock.js');
      }
    };
    var doesNotExist = function () {
      this.exists = function () {
        return Rx.Observable.just(false);
      };
    };
    var hash = function () {
      return Rx.Observable.just({});
    };

    var uploader = proxyrequire('../index', {'./aws': aws, './cdn': doesNotExist, './hash': hash});
    options.snapshot = false;
    uploader(options);
  });

});
