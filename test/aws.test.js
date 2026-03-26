'use strict';

var expect = require('chai').expect;
var proxyrequire = require('proxyquire');
var Rx = require('rx');
var Logger = require('../logger');

describe('aws', function () {

  var uploader;
  var logger = new Logger({logLevels: []});
  var options = {localPaths: ['build'], bucket: 'auth0', logger: logger};
  var mockFiles = ['build/lock.js', 'build/lock.css'];
  var sentCommands;
  var mockS3Client;

  beforeEach(function () {
    sentCommands = [];
    mockS3Client = {
      send: function (command) {
        sentCommands.push(command);
        return Promise.resolve({});
      }
    };

    var MockS3Client = function (config) { mockS3Client.config = config; return mockS3Client; };
    var MockPutObjectCommand = function (params) { this.params = params; };

    var mockFilesModule = {
      walk: function () { return Rx.Observable.from(mockFiles); }
    };

    uploader = proxyrequire('../aws', {
      '@aws-sdk/client-s3': { S3Client: MockS3Client, PutObjectCommand: MockPutObjectCommand },
      '../files': mockFilesModule,
      'fs': { readFileSync: function (f) { return Buffer.from(f); } }
    }).uploader;
  });

  it('should return observable', function () {
    expect(uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)).to.be.instanceOf(Rx.Observable);
  });

  it('should initialize S3Client with requestChecksumCalculation WHEN_REQUIRED', function (done) {
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
      .concatAll()
      .toArray()
      .subscribe(function () {
        expect(mockS3Client.config.requestChecksumCalculation).to.eql('WHEN_REQUIRED');
        done();
      });
  });

  it('should upload files with correct params', function (done) {
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
      .concatAll()
      .toArray()
      .subscribe(function () {
        expect(sentCommands).to.have.lengthOf(2);
        expect(sentCommands[0].params.Bucket).to.eql('auth0');
        expect(sentCommands[0].params.Key).to.eql('lock/1.2.3/lock.js');
        expect(sentCommands[0].params.CacheControl).to.eql('max-age=0');
        expect(sentCommands[0].params.ACL).to.eql('public-read');
        expect(sentCommands[0].params.ContentType).to.eql('application/javascript');
        expect(Buffer.isBuffer(sentCommands[0].params.Body)).to.eql(true);
        expect(sentCommands[1].params.Key).to.eql('lock/1.2.3/lock.css');
        expect(sentCommands[1].params.ContentType).to.eql('text/css');
        done();
      });
  });

  it('should use application/octet-stream for unknown file types', function (done) {
    var mockFilesModuleUnknown = {
      walk: function () { return Rx.Observable.from(['build/lock.unknownext']); }
    };
    var MockS3Client = function () { return mockS3Client; };
    var MockPutObjectCommand = function (params) { this.params = params; };
    var uploaderUnknown = proxyrequire('../aws', {
      '@aws-sdk/client-s3': { S3Client: MockS3Client, PutObjectCommand: MockPutObjectCommand },
      '../files': mockFilesModuleUnknown,
      'fs': { readFileSync: function (f) { return Buffer.from(f); } }
    }).uploader;

    uploaderUnknown({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
      .concatAll()
      .toArray()
      .subscribe(function () {
        expect(sentCommands[0].params.ContentType).to.eql('application/octet-stream');
        done();
      });
  });

  it('should relay errors', function (done) {
    var expected = new Error('MOCK');
    mockS3Client.send = function () { return Promise.reject(expected); };
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
      .concatAll()
      .tapOnError(function (error) {
        expect(error).to.eql(expected);
        done();
      })
      .subscribe(function () {}, function () {});
  });

  it('should emit file keys on upload', function (done) {
    var uploaded = [];
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
      .concatAll()
      .subscribe(
        function (key) { uploaded.push(key); },
        function () {},
        function () {
          expect(uploaded).to.include('lock/1.2.3/lock.js');
          done();
        }
      );
  });

  it('should complete stream when upload ends', function (done) {
    uploader({remotePath: 'lock/1.2.3', cache: 'max-age=0'}, options)
      .concatAll()
      .toArray()
      .tapOnCompleted(function () {
        done();
      })
      .subscribe(function () {}, function () {});
  });

});
