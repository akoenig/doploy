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

var BaseTask = require('./base');

module.exports = function instantiate (callback) {
    mandatory(callback).is('function', 'Please define a proper callback function.');

    return new InstallTask().execute(callback);
};

function InstallTask () {
    BaseTask.call(this);
}

util.inherits(InstallTask, BaseTask);

InstallTask.prototype.execute = function execute (callback) {
    var self = this;

    function onPrepare (err) {
        if (err) {
            return callback(new VError(err, 'failed to prepare the `install` task'));
        }

        console.log(self.$manifest);

        console.log('HERE');
    }

    this.$prepare(onPrepare);
};
