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
      majorAndMinor: false,
      snapshot: true,
      snapshotName: 'development'
    };
  });

  it('should upload snapshot only', function (done) {
    var aws = {
      uploader: function (version, opts) {
        expect(version.remotePath).to.eql('js/component/development');
        expect(opts).to.eql(options);
        done();
        return Rx.Observable.just('lock.js');
      }
    };
    var alwaysExist = function () {
      this.exists = function () {
        return Rx.Observable.just(true);
      };
    };

    var uploader = proxyrequire('../index', {'./aws': aws, './cdn': alwaysExist});
    uploader(options);
  });

  it('should upload snapshot only even if it doesn\'t exist', function (done) {
    var aws = {
      uploader: function (version, opts) {
        expect(version.remotePath).to.eql('js/component/development');
        expect(opts).to.eql(options);
        done();
        return Rx.Observable.just('lock.js');
      }
    };
    var alwaysExist = function () {
      this.exists = function () {
        return Rx.Observable.just(false);
      };
    };

    var uploader = proxyrequire('../index', {'./aws': aws, './cdn': alwaysExist});
    options.snapshotOnly = true;
    uploader(options);
  });

  it('should not upload snapshot', function () {
    var aws = {
      uploader: function (version) {
        expect.fail(version.remotePath, 'Should not upload any file to path');
      }
    };
    var alwaysExist = function () {
      this.exists = function () {
        return Rx.Observable.just(true);
      };
    };

    var uploader = proxyrequire('../index', {'./aws': aws, './cdn': alwaysExist});
    options.snapshot = false;
    uploader(options);
  });

  it('should upload full version', function (done) {
    var aws = {
      uploader: function (version, opts) {
        expect(version.remotePath).to.eql('js/component/1.2.3');
        expect(opts).to.eql(options);
        done();
        return Rx.Observable.just('lock.js');
      }
    };
    var doesNotExist = function () {
      this.exists = function () {
        return Rx.Observable.just(false);
      };
    };

    var uploader = proxyrequire('../index', {'./aws': aws, './cdn': doesNotExist});
    options.snapshot = false;
    uploader(options);
  });

});
