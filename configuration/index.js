'use strict';

module.exports = function (pkgInfo) {
  if (pkgInfo == null || pkgInfo['cdn-component'] == null) {
    throw 'Missing configuration options from package.json';
  }
  var config = pkgInfo['cdn-component'];
  return {
    name: config.name || pkgInfo.name,
    version: pkgInfo.version,
    localPath: config.localPath || 'dist',
    remoteBasePath: config.remoteBasePath || 'js',
    bucket: config.bucket,
    cdn: config.cdn,
    mainBundleFile: config.mainBundleFile,
    snapshotName: config.snapshotName
  };
};