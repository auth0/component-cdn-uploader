'use strict';

var Rx = require('rx');
var from = Rx.Observable.from;
var { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
var fs = require('fs');
var mime = require('mime');
var files = require('../files');

var uploader = function (version, options) {
  var client = new S3Client({ followRegionRedirects: true, requestChecksumCalculation: 'WHEN_REQUIRED' });
  return from(options.localPaths).map(function (directoryPath) {
    var logger = options.logger;
    var uploadConfig = {
      Bucket: options.bucket,
      remotePath: version.remotePath,
      CacheControl: version.cache,
      ACL: 'public-read'
    };
    if (options.dry) {
      logger.debug(`Starting upload with following S3 config ${logger.pretty(uploadConfig)}`);
      return files
        .walk(directoryPath)
        .map((localFile) => localFile.replace(directoryPath, version.remotePath));
    }
    logger.debug(`Starting upload with following S3 config ${logger.pretty(uploadConfig)}`);
    return files.walk(directoryPath).flatMap(function (localFile) {
      var key = localFile.replace(directoryPath, version.remotePath);
      var body = fs.readFileSync(localFile);
      return Rx.Observable.create(function (observer) {
        client.send(new PutObjectCommand({
          Bucket: options.bucket,
          Key: key,
          Body: body,
          ContentType: mime.getType(localFile) || 'application/octet-stream',
          CacheControl: version.cache,
          ACL: 'public-read'
        }))
          .then(function () {
            observer.onNext(key);
            observer.onCompleted();
          })
          .catch(function (err) {
            observer.onError(err);
          });
        return function () {};
      });
    }, 5);
  });
};

module.exports = {
  uploader: uploader
};
