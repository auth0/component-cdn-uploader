'use strict';

module.exports = function (pkgInfo) {
  if (pkgInfo == null || pkgInfo['ccu'] == null) {
    throw 'Missing configuration options from package.json';
  }
  var config = pkgInfo['ccu'];
  var digest = config.digest || {};
  return {
    name: config.name || pkgInfo.name,
    version: pkgInfo.version,
    localPath: config.localPath || 'dist',
    remoteBasePath: config.remoteBasePath || 'js',
    bucket: config.bucket,
    cdn: config.cdn,
    mainBundleFile: config.mainBundleFile,
    snapshotName: config.snapshotName,
    hashes: Array.isArray(digest.hashes) ? digest.hashes : [],
    hashOnly: Array.isArray(digest.extensions) ? digest.extensions : []
  };
};