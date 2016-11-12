'use strict';

var Rx = require('rx');
var s3 = require('s3');

// Singleton so only one S3 client is used.
var getClient = (function () {
  function createS3Client(region) {
    return s3.createClient({
      s3Options: {
        region: region
      }
    });
  }
  var instance = null;
  return {
    setRegion: function(region) {
      if (instance === null) {
        instance = createS3Client(region);
      }
      return instance;
    }
  };
})();

var uploader = function (remotePath, options) {
  var client = getClient.setRegion(options.region);

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