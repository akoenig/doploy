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
var events = require('events');

var GitTask = require('./git/');

module.exports = function instantiate (options, callback) {
    var push = new PushTask(options);

    return push.execute(callback);
};

function PushTask (options) {
    GitTask.call(this, options);
}

util.inherits(PushTask, GitTask);

PushTask.prototype.execute = function execute () {
    var ee = new events.EventEmitter();

    this.$push()
        .on('out', ee.emit.bind(ee, 'output'))
        .once('error', ee.emit.bind(ee, 'error'))
        .once('done', ee.emit.bind(ee, 'done'));

    return ee;
};
