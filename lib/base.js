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

var fs = require('fs');
var path = require('path');

var VError = require('verror');

module.exports = BaseTask;

function BaseTask () {
    //
    // Will be set in the `prepare method`.
    //
    this.$manifest = null;
    this.$rc = null;
}

BaseTask.prototype.$readManifest = function $readManifest (callback) {
    var file = path.join(process.cwd(), 'doploy.json');

    function onRead (err, contents) {
        if (err) {
            return callback(new VError(err, 'failed to access the doploy.json - Does it exist?'));
        }

        try {
            contents = JSON.parse(contents);
        } catch (err) {
            return callback(new VError(err, 'failed to parse the doploy.json - Malformed!'));
        }

        callback(null, contents);
    }

    fs.readFile(file, {encoding: 'utf-8'}, onRead);
};

BaseTask.prototype.$readRC = function $readRC (callback) {
    var home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    var file = path.join(home, '.doployrc');

    function onRead (err, contents) {
        if (err) {
            return callback(new VError(err, 'failed to access the .doployrc - Does it exist?'));
        }

        try {
            contents = JSON.parse(contents);
        } catch (err) {
            return callback(new VError(err, 'failed to parse the .doployrc - Malformed!'));
        }

        callback(null, contents);
    }

    fs.readFile(file, {encoding: 'utf-8'}, onRead);
};

BaseTask.prototype.$prepare = function $prepare (callback) {
    var self = this;

    function onReadManifest (err, manifest) {
        if (err) {
            return callback(new VError(err, 'failed to read the manifest'));
        }

        self.$manifest = manifest;

        self.$readRC(onReadRC);
    }

    function onReadRC (err, rc) {
        if (err) {
            return callback(new VError(err, 'failed to read the runtime configuration'));
        }

        self.$rc = rc;

        callback(null);
    }

    this.$readManifest(onReadManifest);
};
