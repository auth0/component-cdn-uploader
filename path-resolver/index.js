'use strict';

var SemVer = require('semver');
var path = require('path');

var baseFrom = function (options) {
  return path.join(options.remoteBasePath || 'js', options.name.toLowerCase());
};

var fullFrom = function (options) {
  var base = baseFrom(options);
  var version = SemVer.parse(options.version);
  return { cache: 'max-age=86400,public', remotePath: path.join(base, version.raw) };
};

var majorMinorFrom = function (options) {
  var base = baseFrom(options);
  var version = SemVer.parse(options.version);
  return { cache: 'max-age=10800,public', remotePath: path.join(base, `${version.major}.${version.minor}`) };
};

var snapshotFrom = function (options) {
  var base = baseFrom(options);
  return { cache: 'max-age=0', remotePath: path.join(base, options.snapshotName || 'development') };
};

var all = function (options) {
  var versions = [
    fullFrom(options)
  ];

  if(options.majorAndMinor) {
    versions.push(majorMinorFrom(options));
  }

  if(options.snapshot) {
    versions.push(snapshotFrom(options));
  }

  return versions;
};

module.exports = {
  all: all,
  full: fullFrom,
  snapshot: snapshotFrom
};