'use strict';

var upload = require('../');

var options = {
  name: 'lock',
  version: '10.4.1',
  checkUrl: 'https://cdn.auth0.com/js/lock/10.4.1/lock.min.js',
  localPath: 'test-resources',
  bucket: 'hzalaz',
  remoteBasePath: 'js',
  majorAndMinor: true,
  snapshot: true,
  snapshotName: 'development'
};

upload(options);