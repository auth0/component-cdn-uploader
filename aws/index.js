'use strict';

var Rx = require('rx');
var from = Rx.Observable.from;
var { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
var fs = require('fs');
var mime = require('mime');
var files = require('../files');

var client = new S3Client({});

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
    logger.debug(`Starting upload with following S3 config ${logger.pretty(params)}`);
    return files.walk(directoryPath).flatMap(function (localFile) {
      var key = localFile.replace(directoryPath, version.remotePath);
      return Rx.Observable.create(function (observer) {
        client.send(new PutObjectCommand({
          Bucket: options.bucket,
          Key: key,
          Body: fs.createReadStream(localFile),
          ContentType: mime.getType(localFile),
          CacheControl: version.cache,
          ACL: 'public-read'
        }))
          .then(function () {
            observer.onNext(key);
            observer.onCompleted();
          })
          .catch(function (err) {
            if (!observer.isStopped) {
              observer.onError(err);
            }
          });
        return function () {};
      });
    });
  });
};

module.exports = {
  uploader: uploader
};
