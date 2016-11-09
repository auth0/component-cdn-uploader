'use strict';

var resolver = require('./path-resolver');
var aws = require('./aws');
var CDN = require('./cdn');
var Rx = require('rx');
var just = Rx.Observable.just;
var from = Rx.Observable.from;
var logger = require('./logger');

module.exports = function (options) {
  var cdn = new CDN(options);
  cdn.exists(resolver.full(options))
  .tapOnNext(function (exists) {
    if(exists) {
      logger.warn(`File ${options.mainBundleFile} exists for version ${options.version}`);
    }
  })
  .flatMap(function(exist) {
    var version;
    if(exist) {
      logger.info(`About to update snapshot version ${options.snapshotName}`);
      version = just(resolver.snapshot(options));
    } else {
      logger.info(`About to release version ${options.version}`);
      version = from(resolver.all(options));
    }

    return version
    .map(function (remotePath) {
      return aws.uploader(remotePath, options).concat(cdn.purge(remotePath));
    })
    .concatAll()
    .tap(
      function (file) {
        logger.info(`Uploading file ${file}`);
      },
      function (error) {
        logger.error('Unable to sync:', error.stack);
      },
      function () {
        logger.success(`Completed upload of ${options.name} to bucket ${options.bucket}`);
      }
    );
  })
  .subscribe();
};