'use strict';

var url = require('url');
var path = require('path');
var Rx = require('rx');
var request = require('request');
var logger = require('../logger');

var purge = function (path) {
  var location = url.resolve(this.root, path);
  return Rx.Observable.create(function (observer) {
    logger.info(`Purging ${location}...`);
    request.delete(location, function (error, response, body) {
      if(error) {
        logger.warn(`Failed purge ${location}`, error);
      } else {
        if (response.statusCode >= 400) {
          logger.warn(`Failed to purge ${location} with status code ${response.statusCode}`);
          logger.info(body);
        } else {
          logger.info(body);
        }
      }
      observer.onCompleted()
    });
  });
};

var exists = function (remote) {
  var base = path.join(remote, this.mainFile);
  var location = url.resolve(this.root, base);
  return Rx.Observable.create(function (observer) {
    logger.info(`Checking if file at ${location} exists`);
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
  this.root = options.cdn;
  this.mainFile = options.mainBundleFile;
  this.exists = exists;
  this.purge = purge;
};
