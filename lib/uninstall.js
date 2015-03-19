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
var debug = require('debug')('doploy:uninstall');
var VError = require('verror');

var SSHTask = require('./ssh/');
var manifest = require('./manifest/');

module.exports = function instantiate (options) {
    var uninstall = new UninstallTask(options);

    return uninstall.execute();
};

function UninstallTask (options) {
    SSHTask.call(this, options);
}

util.inherits(UninstallTask, SSHTask);

UninstallTask.prototype.execute = function execute () {
    var self = this;
    var ee = new events.EventEmitter();

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

        if (!mani.uninstall || mani.uninstall.length === 0) {
            return ee.emit('error', new VError(err, 'no uninstall commands found'));
        }

        map(executer, mani.uninstall, onExecute);
    }

    function onExecute (err) {
        if (err) {
            return ee.emit('error', new VError(err, 'failed to execute the uninstall commands'));
        }

        ee.emit('done');
    }

    manifest().read(onManifestRead);

    return ee;
};
