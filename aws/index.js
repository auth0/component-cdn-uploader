'use strict';

var Rx = require('rx');
var s3 = require('s3');

var client = null;

var uploader = function (remotePath, options) {
  if (client === null) {
    client = createS3Client(options.region);
  }

  return Rx.Observable.create(function (observer) {
    var params = {
      localDir: options.localPath,
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
  uploader: uploader
};

function createS3Client(region) {
  return s3.createClient({
    s3Options: {
      region: region
    }
  });
}
