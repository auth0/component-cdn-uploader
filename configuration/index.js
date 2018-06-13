'use strict';

module.exports = function (pkgInfo) {
  if (pkgInfo == null || pkgInfo['ccu'] == null) {
    throw 'Missing configuration options from package.json';
  }
  var config = pkgInfo['ccu'];
  var sri = config.sri || {};
  return {
    name: config.name || pkgInfo.name,
    version: pkgInfo.version,
    localPath: config.localPath || 'dist',
    remoteBasePath: config.remoteBasePath || 'js',
    bucket: config.bucket,
    cdn: config.cdn,
    mainBundleFile: config.mainBundleFile,
    snapshotName: config.snapshotName,
    hashes: Array.isArray(sri.hashes) ? sri.hashes : [],
    hashOnly: Array.isArray(sri.extensions) ? sri.extensions : []
  };
};