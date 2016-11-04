'use strict';

var expect = require('chai').expect;
var resolver = require('../path-resolver');

describe('path-resolver', function () {

  it('should return full version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3'
    };

    expect(resolver.full(options)).to.equal('js/lock/1.2.3');
  });

  it('should return full version path for custom base', function () {
    var options = {
      name: 'styleguide',
      version: '1.2.3',
      remoteBasePath: 'styleguide'
    };

    expect(resolver.full(options)).to.equal('styleguide/styleguide/1.2.3');
  });

  it('should return snapshot version path', function () {
    var options = {
      name: 'lock',
    };

    expect(resolver.snapshot(options)).to.equal('js/lock/development');
  });

  it('should return snapshot version path for custom base', function () {
    var options = {
      name: 'styleguide',
      remoteBasePath: 'styleguide',
      snapshotName: 'latest'
    };

    expect(resolver.snapshot(options)).to.equal('styleguide/styleguide/latest');
  });

  it('should return only full version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      snapshot: false,
      majorAndMinor: false
    };

    expect(resolver.all(options)).to.eql(['js/lock/1.2.3']);
  });

  it('should return all version path', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      snapshot: true,
      majorAndMinor: true
    };

    expect(resolver.all(options)).to.eql(['js/lock/1.2.3', 'js/lock/1.2', 'js/lock/development']);
  });

  it('should skip snapshot version', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      snapshot: false,
      majorAndMinor: true
    };

    expect(resolver.all(options)).to.eql(['js/lock/1.2.3', 'js/lock/1.2']);
  });

  it('should skip major and minor only', function () {
    var options = {
      name: 'lock',
      version: '1.2.3',
      snapshot: true,
      majorAndMinor: false
    };

    expect(resolver.all(options)).to.eql(['js/lock/1.2.3', 'js/lock/development']);
  });

});