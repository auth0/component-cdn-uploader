'use strict';

var chalk = require('chalk');

var log = function (message) {
  console.log(message);
};

function messageLog(name, levels, chalk) {
  var noop = function() {};
  var message = function() {
    log(chalk.apply(null, arguments));
  };
  return levels.indexOf(name) !== -1 ? message : noop;
}

module.exports = function(options) {
  var levels = options.logLevels;
  this.error = messageLog('error', levels, chalk.red);
  this.info = messageLog('info', levels, chalk.dim);
  this.success = messageLog('success', levels, chalk.bold.green);
  this.warn = messageLog('warn', levels, chalk.yellow);
  this.debug = messageLog('debug', levels, chalk.white);
  this.pretty = function(json) {
    return JSON.stringify(json, null, 2);
  };
};