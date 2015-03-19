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

var readlineSync = require('readline-sync');

module.exports = function stdout (message) {
    return console.log(message);
};

module.exports.write = function write (message) {
    process.stdout.write(message + ' ');
};

module.exports.password = function password (message) {
    return readlineSync.question(message, {noEchoBack: true});
};
