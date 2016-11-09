'use strict';

var chalk = require('chalk');

var log = function (message) {
  console.log(message);
};

module.exports = {
  error: function () {
    log(chalk.red.apply(null, arguments));
  },
  info: function () {
    log(chalk.dim.apply(null, arguments));
  },
  success: function () {
    log(chalk.bold.green.apply(null, arguments));
  },
  warn: function () {
    log(chalk.yellow.apply(null, arguments));
  }
};