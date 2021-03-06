'use strict';

var url = require('url');
var path = require('path');
var Rx = require('rx');
var request = require('request');

var exists = function (remote) {
  var base = path.join(remote, this.mainFile);
  var location = url.resolve(this.root, base);
  this.logger.info(`Checking if file at ${location} exists`);
  return Rx.Observable.create(function (observer) {
    request.head(location, function (error, response) {
      if(error) {
        observer.onNext(false);
      } else {
        observer.onNext(response.statusCode == 200);
      }
      observer.onCompleted()
    });
  });
};

module.exports = function (options) {
  this.logger = options.logger;
  this.root = options.cdn;
  this.mainFile = options.mainBundleFile;
  this.exists = exists;
};
