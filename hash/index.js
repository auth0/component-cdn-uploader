'use strict';

const Rx = require('rx');
const from = Rx.Observable.from;
const files = require('../files');
const digest = require('./digest');
const path = require('path');

module.exports = function(options) {
  if (options.hashes.length == 0) {
    return Rx.Observable.empty();
  }
  const logger = options.logger;
  const ignoredExtensions = digest.available.map((d) => `.${d}`);
  const hashOnly = options.hashOnly;
  logger.debug(`Checking for files to hash in ${options.localPaths}`);
  return from(options.localPaths).map(function (directoryPath) {
    logger.debug(`Starting to hash files in ${directoryPath}`);
    return files.walk(directoryPath)
    .filter((filePath) => {
      const parts = path.parse(filePath);
      return ignoredExtensions.indexOf(parts.ext) == -1 && (hashOnly.length == 0 || hashOnly.indexOf(parts.ext) != -1);
    })
    .flatMap((localPath) => {
      return digest(localPath, options)
    })
  })
  .concatAll()
  .doOnNext((value) => {
    if (!options.dry) {
      files.write(`${value.file}.${value.method}`, value.digest);
    }
  });
}