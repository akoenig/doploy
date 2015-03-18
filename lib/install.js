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
var util = require('util');

var series = require('async-series');
var debug = require('debug')('doploy:install');
var VError = require('verror');

var SSHTask = require('./ssh/');
var manifest = require('./manifest/')();

module.exports = function instantiate (options, callback) {
    var install = new InstallTask(options);

    return install.execute(callback);
};

function InstallTask (options) {
    SSHTask.call(this, options);
}

util.inherits(InstallTask, SSHTask);

InstallTask.prototype.execute = function execute () {
    var self = this;
    var ee = new events.EventEmitter();

    function output (data) {
        ee.emit('output', data);
    }

    function prepare (instructions) {
        return function execute (callback) {
            debug('Executing %s', instructions);

            self.$fireCommand(instructions)
                .on('out', output)
                .once('error', callback)
                .once('done', callback);
        };
    }

    function onManifestRead (err, mani) {
        var i = 0;
        var len = 0;
        var commands = [];

        if (err) {
            return ee.emit('error', new VError(err, 'please define a proper manifest file (`doploy.json`)'));
        }

        if (!mani.install || mani.install.length === 0) {
            return ee.emit('error', new VError(err, 'no install commands found'));
        }

        len = mani.install.length;

        for (i; i < len; i = i + 1) {
            commands.push(prepare(mani.install[i]));
        }

        series(commands, onDone);
    }

    function onDone (err) {
        if (err) {
            return ee.emit('error', new VError(err, 'failed to execute the install commands'));
        }

    }

    manifest.read(onManifestRead);

    return ee;
};
