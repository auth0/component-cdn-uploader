'use strict';

var url = require('url');
var path = require('path');
var Rx = require('rx');

var exists = function (remote) {
  const base = path.join(remote, this.mainFile);
  const location = url.resolve(this.root, base);

  this.logger.info(`Checking if file at ${location} exists`);

  return Rx.Observable.create(observer => {
    fetch(location, { method: 'HEAD' })
      .then(response => {
        observer.onNext(response.status === 200);
        observer.onCompleted();
      })
      .catch(error => {
        this.logger.debug(`Failed to check file existence at ${location}: ${error.message}`);
        observer.onNext(false);
        observer.onCompleted();
      });
  });
};

module.exports = function (options) {
  this.logger = options.logger;
  this.root = options.cdn;
  this.mainFile = options.mainBundleFile;
  this.exists = exists;
};