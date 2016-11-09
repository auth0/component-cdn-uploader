'use strict';

var resolver = require('./path-resolver');
var aws = require('./aws');
var CDN = require('./cdn');
var Rx = require('rx');
var just = Rx.Observable.just;
var from = Rx.Observable.from;

module.exports = function (options) {
  var cdn = new CDN(options);
  cdn.exists(resolver.full(options))
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
      return aws.uploader(remotePath, options).concat(cdn.purge(remotePath));
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