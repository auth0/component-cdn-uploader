'use strict';

var Rx = require('rx');
var SemVer = require('semver');
var path = require('path');

var baseFrom = function (options) {
  return path.join('js', options.name.toLowerCase());
};

var fullFrom = function (options) {
  var base = baseFrom(options);
  var version = SemVer.parse(options.version);
  return path.join(base, version.raw);
};

var majorMinorFrom = function (options) {
  var base = baseFrom(options);
  var version = SemVer.parse(options.version);
  return path.join(base, `${version.major}.${version.minor}`);
};

var snapshotFrom = function (options) {
  var base = baseFrom(options);
  return path.join(base, 'development');
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

  return Rx.Observable.from(versions);
};

var full = function (options) {
  return Rx.Observable.just(fullFrom(options));
};

var snapshot = function (options) {
  return Rx.Observable.just(snapshotFrom(options));
};

module.exports = {
  all: all,
  full: full,
  snapshot: snapshot
};