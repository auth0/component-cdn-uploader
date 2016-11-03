'use strict';

var Rx = require('rx');
var s3 = require('s3');
var client = s3.createClient({});

var exists = function (file, bucket) {
  return Rx.Observable.create(function (observer) {
    client.s3
    .headObject({
      Bucket: bucket,
      Key: file
    }, function (err) {
      observer.onNext(err == null);
      observer.onCompleted();
    });
  });
};

var uploader = function (remotePath, options) {
  return Rx.Observable.create(function (observer) {
    var params = {
      localDir: options.path,
      deleteRemoved: false,
      s3Params: {
        Bucket: options.bucket,
        Prefix: remotePath
      }
    };
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
  exists: exists,
  uploader: uploader
};