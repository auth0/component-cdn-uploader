'use strict';

const Rx = require('rx');
const from = Rx.Observable.from;
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const availableDigests = ['sha256', 'sha384', 'sha512'];

const fromFile = (file, hash) => {
  return Rx.Observable.create((observer) => {
    const fd = fs.createReadStream(file);
    fd.on('end', function() {
      hash.end();
      const value = hash.read();
      observer.next(value);
      observer.onCompleted();
    });
    fd.on('error', (error) => observer.onError(error));
    fd.pipe(hash);
    return () => {};
  });
};

const digest = (method, file) => {
  const hash = crypto.createHash(method);
  hash.setEncoding('base64');
  return fromFile(file, hash).map((value) => {
    return { file, digest: value, method };
  });
};

module.exports = (file, options) => {
  const digests = availableDigests.filter((d) => options.hashes.length == 0 || options.hashes.indexOf(d) != -1);
  return Rx.Observable
  .from(digests)
  .flatMap((method) => digest(method, file));
};

module.exports.available = availableDigests;