'use strict';

const fs = require('fs');
const walk = require('walk');
const path = require('path');
const Rx = require('rx');


module.exports = {
  write: (filePath, contents) => fs.writeFileSync(filePath, contents, { encoding:'utf8' }),
  walk: (directory) => {
    return Rx.Observable.create((observer) => {
      const walker = walk.walk(directory, { followLinks: false });
      walker.on('file', (root, stats, next) => {
        const workingDir = process.cwd();
        const localPath = path.relative(workingDir, path.resolve(root, stats.name));
        observer.next(localPath);
        next();
      });
      walker.on('error', (root, stats, next) => {
        observer.onError(stats.error);
        next();
      });
      walker.on('end', () => {
        observer.onCompleted();
      });
    });
  }
};
