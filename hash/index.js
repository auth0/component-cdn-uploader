'use strict';

const Rx = require('rx');
const from = Rx.Observable.from;
const walk = require('walk');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const availableDigests = ['sha256', 'sha384', 'sha512'];

const hash = function(method, file, dry, callback) {
  const fd = fs.createReadStream(file);
  const hash = crypto.createHash(method);
  hash.setEncoding('base64');
  fd.on('end', function() {
    hash.end();
    const value = hash.read();
    const hashFile = file + "." + method;
    if (!dry) {
      fs.writeFileSync(hashFile, value, { encoding:'utf8' });
    }
    callback(null, { file: file, digest: value, method: method });
  });
  fd.on('error', callback);
  fd.pipe(hash);
};

module.exports = function(options) {
  var logger = options.logger;
  logger.debug(`Checking for files to hash in ${options.localPaths}`);
  return from(options.localPaths).map(function (directoryPath) {
    logger.debug(`Starting to hash files in ${directoryPath}`);
    return Rx.Observable.create(function (observer) {
      var workingDir = process.cwd();
      var walker = walk.walk(directoryPath, { followLinks: false });
      walker.on('file', function (root, stats, next) {
        var localPath = path.relative(workingDir, path.resolve(root, stats.name));
        hash('sha384', localPath, options.dry, function(error, result) {
          if (error) {
            observer.onError(error);
            next();
            return;
          }
          observer.next(result);
          next();
        });
      });
      walker.on('error', function(root, stats, next) {
        observer.onError(stats.error);
        next();
      });
      walker.on('end', function() {
        observer.onCompleted();
      });
      return function() {};
    });
  }).concatAll();
}