'use strict';

var Rx = require('rx');
var s3 = require('s3');
var walk = require('walk');
var path = require('path');
var client = s3.createClient({});

var uploader = function (version, options) {
  var params = {
    localDir: options.localPath,
    deleteRemoved: false,
    s3Params: {
      Bucket: options.bucket,
      Prefix: version.remotePath,
      CacheControl: version.cache
    }
  };
  var logger = options.logger;
  if (options.dry) {
    return Rx.Observable.create(function (observer) {
      logger.debug(`Starting upload with following S3 config ${logger.pretty(params)}`);
      var workingDir = process.cwd();
      var walker = walk.walk(params.localDir, { followLinks: false });
      walker.on('file', function (root, stats, next) {
        var localPath = path.relative(workingDir, path.resolve(root, stats.name));
        var file = localPath.replace(options.localPath, version.remotePath);
        observer.next(file);
        next();
      });
      walker.on('error', function(root, stats, next) {
        observer.onError(stats.error);
        next();
      });
      walker.on('end', function() {
        observer.onCompleted();
      });
      return function() {};
    });
  }
  return Rx.Observable.create(function (observer) {
    logger.debug(`Starting upload with following S3 config ${logger.pretty(params)}`);
    var uploader = client.uploadDir(params);
    uploader.on('error', function(err) {
      observer.onError(err);
    });
    uploader.on('fileUploadStart', function (path, key) {
      observer.onNext(key);
    });
    uploader.on('end', function() {
      observer.onCompleted();
    });
    return function() {};
  });
};

module.exports = {
  uploader: uploader
};