'use strict';

var upload = require('../');

var options = {
  name: 'lock',
  version: '10.4.1',
  path: 'test-resources',
  checkUrl: 'https://cdn.auth0.com/js/lock/10.4.1/lock.min.js',
  bucket: 'hzalaz',
  basePath: 'js',
  majorAndMinor: true,
  snapshot: true,
  snapshotName: 'development'
};

upload(options);