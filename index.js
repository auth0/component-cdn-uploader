'use strict';

var resolver = require('./path_resolver');
var aws = require('./aws');
var path = require('path');
var Rx = require('rx');

var options = {
  name: 'lock',
  version: '10.4.1',
  path: 'test-resources',
  main: 'lock.min.js',
  bucket: 'hzalaz',
  majorAndMinor: true,
  snapshot: true
};

resolver
.full(options)
.flatMap(function (base) {
  return aws.exists(path.join(base, options.main), options.bucket);
})
.tapOnNext(function (exists) {
  if(exists) {
    console.warn(`File ${options.main} exists for version ${options.version}`);
  }
})
.flatMap(function(exist) {
  var version;
  if(exist) {
    version = resolver.snapshot(options);
  } else {
    version = resolver.all(options);
  }

  return version
  .map(function (remotePath) {
    return aws.uploader(remotePath, options);
  })
  .concatAll()
  .tap(
    function (file) {
      console.log(`uploading file ${file}`);
    },
    function (error) {
      console.error('unable to sync:', error.stack);
    }
  );
})
.subscribe();