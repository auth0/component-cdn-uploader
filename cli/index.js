'use strict';

var upload = require('../');
var fs = require('fs');

var pkg = JSON.parse(fs.readFileSync('./package.json'), 'utf8');

upload(pkg["auth0-uploader"]);