var url = require('url');
var Rx = require('rx');
var request = require('request');

var purge = function (path) {
  return Rx.Observable.create(function (observer) {
    console.log(`Purging path ${path}`);
    request.delete(url.resolve('https://cdn.auth0.com', path), function (error, response, body) {
      if(error) {
        console.error(`Failed purge for ${path}`, error);
      } else {
        console.log(body);
      }
      observer.onCompleted()
    });
  });
};

module.exports = purge;
