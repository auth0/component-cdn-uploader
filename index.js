'use strict';

var resolver = require('./path-resolver');
var aws = require('./aws');
var CDN = require('./cdn');
var Rx = require('rx');
var just = Rx.Observable.just;
var from = Rx.Observable.from;
var Logger = require('./logger');
var extend = require('util')._extend;

module.exports = function (options) {
  var logger = new Logger(options);
  logger.info(`About to upload ${options.name}@${options.version} from '${options.localPath}' to '${options.remoteBasePath}'`);
  logger.debug(`Starting upload process with parameters ${logger.pretty(options)}`);
  var state = Object.assign({ logger: logger }, options);
  var cdn = new CDN(state);
  cdn.exists(resolver.full(state).remotePath)
  .tapOnNext(function (exists) {
    if(exists) {
      logger.warn(`File ${state.mainBundleFile} exists for version ${state.version}`);
    }
  })
  .flatMap(function(exist) {
    return from(resolver.for(state, exist))
    .map(function (version) {
      return aws.uploader(version, state);
    })
    .concatAll()
    .doOnNext(function (file) {
      logger.info(`Uploading file ${file}`);
    })
    .doOnError(function (error) {
      logger.error('Unable to upload:', error);
    });
  }).subscribeOnCompleted(function () {
      logger.success(`Completed upload of ${state.name}@${state.version} to bucket ${state.bucket}`);
  });
};