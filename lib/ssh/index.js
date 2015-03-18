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

var mandatory = require('mandatory');
var SSH = require('simple-ssh');

module.exports = SSHTask;

function SSHTask (options) {
    mandatory(options).is('object', 'Please define a proper options object.');
    mandatory(options.host).is('string', 'Please define a proper host configuration.');
    mandatory(options.user).is('string', 'Please define a proper username.');
    mandatory(options.pass).is('string', 'Please define a proper password.');

    this.$host = options.host;
    this.$user = options.user;
    this.$pass = options.pass;
}

SSHTask.prototype.$fireCommand = function $fireCommand (command) {
    var shell = new SSH({
        host: this.$host,
        user: this.$user,
        pass: this.$pass
    });
};
