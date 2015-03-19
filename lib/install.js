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

var map = require('map');
var debug = require('debug')('doploy:install');
var VError = require('verror');

var SSHTask = require('./ssh/');
var manifest = require('./manifest/');
var push = require('./push');

module.exports = function instantiate (options) {
    var install = new InstallTask(options);

    return install.execute();
};

function InstallTask (options) {
    SSHTask.call(this, options);
}

util.inherits(InstallTask, SSHTask);

InstallTask.prototype.execute = function execute () {
    var self = this;
    var ee = new events.EventEmitter();

    // The application name which will be set
    // after reading the manifest (see `onManifestRead`).
    var name = '';

    function executer (command, callback) {
        debug('Executing %s', command);

        self.$fireCommand(command)
            .on('out', ee.emit.bind(ee, 'output'))
            .once('error', callback)
            .once('done', callback);
    }

    function onManifestRead (err, mani) {
        if (err) {
            return ee.emit('error', new VError(err, 'please define a proper manifest file (`doploy.json`)'));
        }

        if (!mani.install || mani.install.length === 0) {
            return ee.emit('error', new VError(err, 'no install commands found'));
        }

        name = mani.name;

        map(executer, mani.install, onExecute);
    }

    function onExecute (err) {
        var options = {};

        if (err) {
            return ee.emit('error', new VError(err, 'failed to execute the install commands'));
        }

        options.host = self.$host;
        options.name = name;

        push(options)
            .on('output', ee.emit.bind(ee, 'output'))
            .once('error', onPush)
            .once('done', onPush);
    }

    function onPush (err) {
        if (err) {
            return ee.emit('error', new VError(err, 'failed to push the application to the platform'));
        }

        ee.emit('done');
    }

    manifest().read(onManifestRead);

    return ee;
};
