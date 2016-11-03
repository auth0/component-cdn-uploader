'use strict';

var resolver = require('./path-resolver');
var aws = require('./aws');
var purge = require('./purge');
var path = require('path');
var Rx = require('rx');
var just = Rx.Observable.just;
var from = Rx.Observable.from;
var request = require('request');

var exists = function (options) {
  return Rx.Observable.create(function (observer) {
    console.log(`Checking if ${options.checkUrl} exists`);
    request.delete(options.checkUrl, function (error, response, body) {
      if(error) {
        observer.onNext(false);
      } else {
        observer.onNext(response.statusCode == 200);
      }
      observer.onCompleted()
    });
  });
};

module.exports = function (options) {
  just(resolver.full(options))
  .flatMap(function () {
    return exists(options);
  })
  .tapOnNext(function (exists) {
    if(exists) {
      console.warn(`File ${options.main} exists for version ${options.version}`);
    }
  })
  .flatMap(function(exist) {
    var version;
    if(exist) {
      console.log(`About to update snapshot version ${options.snapshotName}`);
      version = just(resolver.snapshot(options));
    } else {
      console.log(`About to release version ${options.version}`);
      version = from(resolver.all(options));
    }

    return version
    .map(function (remotePath) {
      return aws.uploader(remotePath, options).concat(purge(remotePath));
    })
    .concatAll()
    .tap(
      function (file) {
        console.log(`Uploading file ${file}`);
      },
      function (error) {
        console.error('Unable to sync:', error.stack);
      }
    );
  })
  .subscribe();
};