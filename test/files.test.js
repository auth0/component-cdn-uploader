'use strict';

var expect = require('chai').expect;
var proxyrequire = require('proxyquire');
var events = require('events');
var Rx = require('rx');

describe('files', function () {

  var walker, emitter, files;

  beforeEach(function () {
    emitter = new events.EventEmitter();
    walker = () => {
      return emitter;
    };

    files = proxyrequire('../files', {'walk': {walk: walker}});
  });

  it('should return observable', function () {
    expect(files.walk('build')).to.be.instanceOf(Rx.Observable);
  });

  const directory = 'auth0/build';

  it('should emit found file', function (done) {
    const walker = files.walk(directory);
    walker
    .doOnNext((value) => {
      expect(value).to.equals(`${directory}/file.js`);
      done();
    })
    .subscribe();
    emitter.emit('file', directory, {name: 'file.js'}, () => {});
    emitter.emit('end');
  });

  it('should complete on walker end', function (done) {
    const walker = files.walk(directory);
    walker
    .doOnCompleted(() => {
      done();
    })
    .subscribe();
    emitter.emit('end');
  });

  it('should report walker error', function (done) {
    const walker = files.walk(directory);
    const error = new Error('MOCK');
    walker
    .doOnError((err) => {
      expect(err).to.eql(error);
      done();
    })
    .subscribe();
    emitter.emit('error', directory, { error }, () => {});
  });

});
