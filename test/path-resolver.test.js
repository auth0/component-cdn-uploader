'use strict';

var expect = require('chai').expect;
var resolver = require('../path-resolver');
var Logger = require('../logger');

describe('path-resolver', function () {

  var logger = new Logger({logLevels: []});

  it('should return full version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      logger: logger
    };

    var full = resolver.full(options);
    expect(full.remotePath).to.equal('js/lock/1.2.3');
    expect(full.cache).to.equal('max-age=2628000,public');
  });

  it('should return full version path for custom base', function () {
    var options = {
      name: 'styleguide',
      version: '1.2.3',
      remoteBasePath: 'styleguide',
      logger: logger
    };

    var full = resolver.full(options);
    expect(full.remotePath).to.equal('styleguide/styleguide/1.2.3');
    expect(full.cache).to.equal('max-age=2628000,public');
  });

  it('should return snapshot version path', function () {
    var options = {
      name: 'lock',
      logger: logger
    };

    var snapshot = resolver.snapshot(options);
    expect(snapshot.remotePath).to.equal('js/lock/development');
    expect(snapshot.cache).to.equal('max-age=0');
  });

  it('should return snapshot version path for custom base', function () {
    var options = {
      name: 'styleguide',
      remoteBasePath: 'styleguide',
      snapshotName: 'latest',
      logger: logger
    };

    var snapshot = resolver.snapshot(options);
    expect(snapshot.remotePath).to.equal('styleguide/styleguide/latest');
    expect(snapshot.cache).to.equal('max-age=0');
  });

  it('should return only full version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      type: 'release',
      onlyFull: true,
      logger: logger
    };

    var all = resolver.for(options, false);
    expect(all[0].remotePath).to.equal('js/lock/1.2.3');
    expect(all[0].cache).to.equal('max-age=2628000,public');
  });

  it('should return no release version if already exists ', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      type: 'release',
      onlyFull: true,
      logger: logger
    };

    var all = resolver.for(options, true);
    expect(all).to.be.empty;
  });

  it('should return all version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      type: 'default',
      onlyFull: false,
      logger: logger
    };

    var all = resolver.for(options, false);
    expect(all.map(function(version) { return version.remotePath; })).to.eql(['js/lock/1.2.3', 'js/lock/1.2', 'js/lock/development']);
    expect(all.map(function(version) { return version.cache; })).to.eql(['max-age=2628000,public', 'max-age=10800,public', 'max-age=0']);
  });

  it('should return only snapshot if release already exists ', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      type: 'default',
      onlyFull: true,
      logger: logger
    };

    var all = resolver.for(options, true);
    expect(all.map(function(version) { return version.remotePath; })).to.eql(['js/lock/development']);
    expect(all.map(function(version) { return version.cache; })).to.eql(['max-age=0']);
  });

  it('should return only snapshot on default mode when exists in cdn', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      type: 'default',
      onlyFull: false,
      logger: logger
    };

    var all = resolver.for(options, true);
    expect(all.map(function(version) { return version.remotePath; })).to.eql(['js/lock/development']);
    expect(all.map(function(version) { return version.cache; })).to.eql(['max-age=0']);
  });

  it('should skip snapshot version', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      type: 'release',
      onlyFull: false,
      logger: logger
    };

    var all = resolver.for(options, false);
    expect(all.map(function(version) { return version.remotePath; })).to.eql(['js/lock/1.2.3', 'js/lock/1.2']);
    expect(all.map(function(version) { return version.cache; })).to.eql(['max-age=2628000,public', 'max-age=10800,public']);
  });

  it('should skip major and minor only', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      type: 'default',
      onlyFull: true,
      logger: logger
    };

    var all = resolver.for(options, false);
    expect(all.map(function(version) { return version.remotePath; })).to.eql(['js/lock/1.2.3', 'js/lock/development']);
    expect(all.map(function(version) { return version.cache; })).to.eql(['max-age=2628000,public', 'max-age=0']);
  });

});
