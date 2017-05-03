'use strict';

var expect = require('chai').expect;
var resolver = require('../path-resolver');

describe('path-resolver', function () {

  it('should return full version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3'
    };

    var full = resolver.full(options);
    expect(full.remotePath).to.equal('js/lock/1.2.3');
    expect(full.cache).to.equal('max-age=2628000,public');
  });

  it('should return full version path for custom base', function () {
    var options = {
      name: 'styleguide',
      version: '1.2.3',
      remoteBasePath: 'styleguide'
    };

    var full = resolver.full(options);
    expect(full.remotePath).to.equal('styleguide/styleguide/1.2.3');
    expect(full.cache).to.equal('max-age=2628000,public');
  });

  it('should return snapshot version path', function () {
    var options = {
      name: 'lock',
    };

    var snapshot = resolver.snapshot(options);
    expect(snapshot.remotePath).to.equal('js/lock/development');
    expect(snapshot.cache).to.equal('max-age=0');
  });

  it('should return snapshot version path for custom base', function () {
    var options = {
      name: 'styleguide',
      remoteBasePath: 'styleguide',
      snapshotName: 'latest'
    };

    var snapshot = resolver.snapshot(options);
    expect(snapshot.remotePath).to.equal('styleguide/styleguide/latest');
    expect(snapshot.cache).to.equal('max-age=0');
  });

  it('should return only full version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      snapshot: false,
      majorAndMinor: false
    };

    var all = resolver.all(options);
    expect(all[0].remotePath).to.equal('js/lock/1.2.3');
    expect(all[0].cache).to.equal('max-age=2628000,public');
  });

  it('should return all version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      snapshot: true,
      majorAndMinor: true
    };

    var all = resolver.all(options);
    expect(all.map(function(version) { return version.remotePath; })).to.eql(['js/lock/1.2.3', 'js/lock/1.2', 'js/lock/development']);
    expect(all.map(function(version) { return version.cache; })).to.eql(['max-age=2628000,public', 'max-age=10800,public', 'max-age=0']);
  });

  it('should skip snapshot version', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      snapshot: false,
      majorAndMinor: true
    };

    var all = resolver.all(options);
    expect(all.map(function(version) { return version.remotePath; })).to.eql(['js/lock/1.2.3', 'js/lock/1.2']);
    expect(all.map(function(version) { return version.cache; })).to.eql(['max-age=2628000,public', 'max-age=10800,public']);
  });

  it('should skip major and minor only', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      snapshot: true,
      majorAndMinor: false
    };

    var all = resolver.all(options);
    expect(all.map(function(version) { return version.remotePath; })).to.eql(['js/lock/1.2.3', 'js/lock/development']);
    expect(all.map(function(version) { return version.cache; })).to.eql(['max-age=2628000,public', 'max-age=0']);
  });

});
