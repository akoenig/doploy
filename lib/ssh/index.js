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
    mandatory(options.host).is('string', 'Please define a proper host.');
    mandatory(options.user).is('string', 'Please define a proper username.');
    mandatory(options.key).is('string', 'Please define a proper key.');

    this.$host = options.host;
    this.$user = options.user;
    this.$port = options.port || 22;
    this.$key = options.key;
    this.$passphrase = options.passphrase;

    this.$baseCommand = 'sudo dokku ';
}

SSHTask.prototype.$fireCommand = function $fireCommand (command) {
    var ee = new events.EventEmitter();
    var options = {
        host: this.$host,
        user: this.$user,
        key: this.$key,
        passphrase: this.$passphrase,
        port: this.$port
    };

    var shell = new SSH(options);

    function out (data) {
        data = data.replace(/(?:\r\n|\r|\n)/g, '');

        if (data) {
            ee.emit('out', data);
        }
    }

    function exit (code) {
        if (code !== 0) {
            return ee.emit('error', new VError('failed to execute the command "%s" via SSH.', command));
        }

        ee.emit('done');
    }

    function onError (err) {
        ee.emit('error', new VError(err, 'SSH communication failed'));
    }

    shell
        .exec(this.$baseCommand + command, {
            pty: true,
            out: out,
            err: out,
            exit: exit
        })
        .on('error', onError)
        .start();

    return ee;
};
