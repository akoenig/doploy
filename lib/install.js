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

var util = require('util');

var VError = require('verror');
var mandatory = require('mandatory');

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

InstallTask.prototype.execute = function execute (callback) {
    mandatory(callback).is('function', 'Please provide a proper callback function.');

    function onManifestRead (err, mani) {
        if (err) {
            return callback(new VError(err, 'please define a proper manifest file (`doploy.json`)'));
        }

        if (!mani.install || mani.install.length === 0) {
            return callback(new VError(err, 'no install commands found'));
        }
    }

    manifest.read(onManifestRead);
};
