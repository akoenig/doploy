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

var mandatory = require('mandatory');
var VError = require('verror');

var NAME = 'doploy.json';

module.exports = function instantiate () {
    var mm = new ManifestManager();

    return {
        read: mm.read.bind(mm)
    };
};

function ManifestManager () {}

ManifestManager.prototype.read = function read (callback) {
    var file = '';

    mandatory(callback).is('function', 'Please define a proper callback function.');

    function onRead (err, contents) {
        if (err) {
            return callback(new VError(err, 'failed to read the manifest file (`%s`)', NAME));
        }

        try {
            callback(null, JSON.parse(contents));
        } catch (err) {
            return callback(new VError(err, 'failed to parse the manifest file (`%s`)', NAME));
        }
    }

    file += path.join(process.cwd(), NAME);

    fs.readFile(file, {encoding: 'utf-8'}, onRead);
};
