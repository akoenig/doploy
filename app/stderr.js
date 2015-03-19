/*
 * doploy
 *
 * Copyright(c) 2015 André König <andre.koenig@posteo.de>
 * MIT Licensed
 *
 */

/**
 * @author André König <andre.koenig@posteo.de>
 *
 */

'use strict';

var chalk = require('chalk');

module.exports = function stderr (message) {
    return console.error(chalk.red(chalk.underline('ERROR:') + ' ' + message));
};
