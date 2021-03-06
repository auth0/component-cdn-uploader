'use strict';

var SemVer = require('semver');
var path = require('path');

var baseFrom = function (options) {
  return path.join(options.remoteBasePath || 'js', options.name.toLowerCase());
};

var fullFrom = function (options) {
  var base = baseFrom(options);
  var version = SemVer.parse(options.version);
  return { cache: 'max-age=2628000,public', remotePath: path.join(base, version.raw) };
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

var forType = function (options, exists) {
  var logger = options.logger;
  if (options.type === 'release' && exists) {
    logger.info(`Version already released, nothing to do.`);
    return [];
  }

  var snapshot = snapshotFrom(options);
  if (options.type === 'snapshot' || exists) {
    logger.info(`Uploading snapshot ${options.snapshotName}...`);
    return [snapshot];
  }

  var full = fullFrom(options);
  var versions = [full];
  var majorMinor = majorMinorFrom(options);

  if (!options.onlyFull) {
    versions.push(majorMinor);
  }

  if (options.type === 'default') {
    versions.push(snapshot);
  }

  logger.info(`Uploading version ${options.version}`);
  logger.debug(`Resolved the following remote paths ${logger.pretty(versions)}`);
  return versions;
};

module.exports = {
  for: forType,
  full: fullFrom,
  snapshot: snapshotFrom
};