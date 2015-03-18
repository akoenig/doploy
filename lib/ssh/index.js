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

var events = require('events');

var mandatory = require('mandatory');
var VError = require('verror');
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
    this.$port = options.port || 22;

    this.$baseCommand = 'sudo dokku ';
}

SSHTask.prototype.$fireCommand = function $fireCommand (command) {
    var ee = new events.EventEmitter();

    var shell = new SSH({
        host: this.$host,
        user: this.$user,
        pass: this.$pass,
        port: this.$port
    });

    function out (data) {
        ee.emit('out', data);
    }

    function exit (code) {
        if (code !== 0) {
            return ee.emit('error', new VError('failed to execute the command "%s" via SSH.', command));
        }

        ee.emit('done');
    }

    shell.exec(this.$baseCommand + command, {
        pty: true,
        out: out,
        err: out,
        exit: exit
    }).start();

    return ee;
};
