'use strict';

var expect = require('chai').expect;
var configuration = require('../configuration');

describe('configuration', function () {
  it('should fail with no package info', function () {
    expect(function() { configuration(null) }).to.throw('Missing configuration options from package.json');
  });

  it('should fail with when attribute cdn-uploader is missing', function () {
    expect(function() { configuration({}) }).to.throw('Missing configuration options from package.json');
  });

  it('should return configuration options from package.json', function () {
    var json = {
      name: "component",
      version: "1.2.3",
      "ccu": {
        cdn: "https://cdn.auth0.com",
        mainBundleFile: "lock.min.js",
        bucket: "hzalaz",
      }
    };
    expect(configuration(json)).to.eql({
      name: 'component',
      version: '1.2.3',
      localPath: 'dist',
      remoteBasePath: 'js',
      bucket: 'hzalaz',
      cdn: 'https://cdn.auth0.com',
      mainBundleFile: 'lock.min.js',
      snapshotName: undefined,
      hashes: [],
      hashOnly: []
    });
  });

  it('should allow to override name', function () {
    var json = {
      name: "component",
      version: "1.2.3",
      "ccu": {
        name: "auth0-component",
        cdn: "https://cdn.auth0.com",
        mainBundleFile: "lock.min.js",
        bucket: "hzalaz",
      }
    };
    expect(configuration(json)).to.have.property('name', 'auth0-component');
  });

  it('should allow to override snapshot name', function () {
    var json = {
      name: "component",
      version: "1.2.3",
      "ccu": {
        snapshotName: "latest",
        cdn: "https://cdn.auth0.com",
        mainBundleFile: "lock.min.js",
        bucket: "hzalaz",
      }
    };
    expect(configuration(json).snapshotName).to.equal('latest');
  });

  it('should allow to override remote base path', function () {
    var json = {
      name: "component",
      version: "1.2.3",
      "ccu": {
        snapshotName: "latest",
        cdn: "https://cdn.auth0.com",
        mainBundleFile: "lock.min.js",
        remoteBasePath: 'styleguide',
        bucket: "hzalaz",
      }
    };
    expect(configuration(json).remoteBasePath).to.equal('styleguide');
  });

  it('should allow to override local path', function () {
    var json = {
      name: "component",
      version: "1.2.3",
      "ccu": {
        localPath: "build",
        cdn: "https://cdn.auth0.com",
        mainBundleFile: "lock.min.js",
        remoteBasePath: 'styleguide',
        bucket: "hzalaz",
      }
    };
    expect(configuration(json).localPath).to.equal('build');
  });

});