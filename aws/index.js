'use strict';

var Rx = require('rx');
var from = Rx.Observable.from;
var s3 = require('@auth0/s3');
var walk = require('walk');
var path = require('path');
var client = s3.createClient({});
var files = require('../files');

var uploader = function (version, options) {
  return from(options.localPaths).map(function (directoryPath) {
    var params = {
      localDir: directoryPath,
      deleteRemoved: false,
      s3Params: {
        Bucket: options.bucket,
        Prefix: version.remotePath,
        CacheControl: version.cache,
        ACL: 'public-read'
      }
    };
    var logger = options.logger;
    if (options.dry) {
      logger.debug(`Starting upload with following S3 config ${logger.pretty(params)}`);
      return files
      .walk(params.localDir)
      .map((localFile) => localFile.replace(directoryPath, version.remotePath));
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
  });

};

module.exports = {
  uploader: uploader
};
