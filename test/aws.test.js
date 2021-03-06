'use strict';

var expect = require('chai').expect;
var proxyrequire = require('proxyquire');
var events = require('events');
var s3 = {};
var Rx = require('rx');
var Logger = require('../logger');

describe('aws', function () {

  var client, uploader, emitter;
  var logger = new Logger({logLevels: []});
  var options = {localPaths: ['build'], bucket: 'auth0', logger: logger};

  beforeEach(function () {
    emitter = new events.EventEmitter();
    client = {
        uploadDir: function () {
          return emitter;
        }
    };

    s3.createClient = function () {
      return client;
    };

    uploader = proxyrequire('../aws', {'@auth0/s3': s3}).uploader;
  });

  it('should return observable', function () {
    expect(uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)).to.be.instanceOf(Rx.Observable);
  });

  it('should start upload with correct params', function (done) {
    client.uploadDir = function (params) {
      expect(params.localDir).to.be.eql(options.localPaths[0]);
      expect(params.deleteRemoved).to.be.false;
      expect(params.s3Params.Bucket).to.eql(options.bucket);
      expect(params.s3Params.Prefix).to.eql('lock/1.2.3');
      expect(params.s3Params.CacheControl).to.eql('max-age=0');
      expect(params.s3Params.ACL).to.eql('public-read');
      done();
      return new events.EventEmitter();
    };
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options).concatAll().subscribe();
  });

  it('should relay errors', function (done) {
    var expected = new Error('MOCK');
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
    .concatAll()
    .tapOnError(function (error) {
      expect(error).to.eql(expected);
      done();
    })
    .subscribe();
    emitter.emit('error', expected);
  });

  it('should relay file upload started', function (done) {
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
    .concatAll()
    .tapOnNext(function (file) {
      expect(file).to.eql('lock.js');
      done();
    })
    .subscribe();
    emitter.emit('fileUploadStart', 'lock/1.2.3', 'lock.js');
  });

  it('should complete stream when upload ends', function (done) {
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
    .tapOnCompleted(function () {
      done();
    })
    .subscribe();
    emitter.emit('end');
  });

});
