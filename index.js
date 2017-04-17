'use strict';

var resolver = require('./path-resolver');
var aws = require('./aws');
var CDN = require('./cdn');
var Rx = require('rx');
var just = Rx.Observable.just;
var from = Rx.Observable.from;
var logger = require('./logger');
var extend = require('util')._extend;

module.exports = function (options) {
  var cdn = new CDN(options);
  cdn.exists(resolver.full(options).remotePath)
  .tapOnNext(function (exists) {
    if(exists) {
      logger.warn(`File ${options.mainBundleFile} exists for version ${options.version}`);
    }
  })
  .flatMap(function(exist) {
    var list;
    if (exist && !options.snapshot) {
      return Rx.Observable.empty;
    }

    if(exist || options.snapshotOnly) {
      logger.info(`About to update snapshot version ${options.snapshotName}`);
      list = just(resolver.snapshot(options));
    } else {
      logger.info(`About to release version ${options.version}`);
      list = from(resolver.all(options));
    }

    return list
    .map(function (version) {
      return aws.uploader(version, options).concat(cdn.purge(version.remotePath));
    })
    .concatAll()
    .tap(
      function (file) {
        logger.info(`Uploading file ${file}`);
      },
      function  (error) {
        logger.error('Unable to sync:', error.stack);
      },
      function () {
        logger.success(`Completed upload of ${options.name} to bucket ${options.bucket}`);
      }
    );
  })
  .subscribe();
};