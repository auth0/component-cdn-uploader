'use strict';

const expect = require('chai').expect;
const proxyrequire = require('proxyquire');
const Rx = require('rx');
const Logger = require('../logger');

describe('hash', function () {

  const logger = new Logger({logLevels: []});

  it('should generate hash', function(done) {
    const result = {file: 'file.js', method: 'sha256', value: 'hash1'};
    const digest = () => Rx.Observable.just(result);
    digest.available = ['sha256'];
    const hash = proxyrequire('../hash', {
      '../files': { walk: () => Rx.Observable.just('file.js') },
      './digest': digest
    });

    hash({localPaths: ['build'], dry: true, logger})
    .doOnNext((value) => {
      expect(value).to.eql(result);
      done();
    })
    .subscribe();
  });

  it('should generate hash ignoring hash files', function(done) {
    const digest = (p) => Rx.Observable.just({file: p, method: 'sha256', digest: 'hash1'});
    digest.available = ['sha256'];
    const hash = proxyrequire('../hash', {
      '../files': { walk: () => Rx.Observable.from(['file.js', 'file.js.sha256']) },
      './digest': digest
    });

    hash({localPaths: ['build'], dry: true, logger})
    .map((r) => r.file)
    .toArray()
    .doOnNext((value) => {
      expect(value).to.eql(['file.js']);
      done();
    })
    .subscribe();
  });

  it('should write hash to file', function(done) {
    var filePath, contents;
    const result = {file: 'file.js', method: 'sha256', digest: 'hash1'};
    const digest = () => Rx.Observable.just(result);
    digest.available = ['sha256'];
    const hash = proxyrequire('../hash', {
      '../files': {
        walk: () => Rx.Observable.just('file.js'),
        write: (p, c) => {
          filePath = p;
          contents = c;
        }
      },
      './digest': digest
    });

    hash({localPaths: ['build'], logger})
    .doOnNext((value) => {
      expect(value).to.eql(result);
      expect(filePath).to.eql('file.js.sha256');
      expect(contents).to.eql('hash1');
      done();
    })
    .subscribe();
  });

});
