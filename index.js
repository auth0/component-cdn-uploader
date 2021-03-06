'use strict';

var resolver = require('./path-resolver');
var aws = require('./aws');
var CDN = require('./cdn');
var Rx = require('rx');
var from = Rx.Observable.from;
var Logger = require('./logger');
var hash = require('./hash');

module.exports = function (options) {
  var logger = new Logger(options);
  logger.info(`About to upload ${options.name}@${options.version} from '${logger.pretty(options.localPaths)}' to '${options.remoteBasePath}'`);
  logger.debug(`Starting upload process with parameters ${logger.pretty(options)}`);
  var state = Object.assign({ logger: logger }, options);
  var cdn = new CDN(state);

  hash(state)
  .tapOnNext(function (result) {
    logger.debug(`File ${result.file} has ${result.method} digest ${result.digest}`);
  })
  .subscribeOnCompleted(() => {
    cdn.exists(resolver.full(state).remotePath).tapOnNext(function (exists) {
      if(exists) {
        logger.warn(`File ${state.mainBundleFile} exists for version ${state.version}`);
      }
    })
    .flatMap(function(result) {
      const exist = result;
      return from(resolver.for(state, exist))
      .flatMap(function (version) {
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
  });
};
