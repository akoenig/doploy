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

var shell = require('child_process');
var events = require('events');

var debug = require('debug')('doploy:git');
var mandatory = require('mandatory');
var VError = require('verror');
var git = require('simple-git')();

module.exports = GitTask;

function GitTask (options) {
    mandatory(options).is('object', 'Please define a proper options object.');
    mandatory(options.host).is('string', 'Please define a proper host configuration.');
    mandatory(options.name).is('string', 'Please define a proper application name.');

    this.$url = 'dokku@' + options.host + ':' + options.name;
    this.$remote = 'doploy';
}

GitTask.prototype.$removeRemote = function $removeRemote (callback) {

    function onRemove (err) {
        if (err) {
            debug('failed to remove the remote repository. Not too bad. Means it does not exist');
        }

        callback(null);
    }

    git.removeRemote(this.$remote, onRemove);
};

GitTask.prototype.$addRemote = function $addRemote (callback) {
    function onAdd (err) {
        if (err) {
            debug('failed to add the remote repository');

            return callback(new VError(err, 'failed to add the remote repository'));
        }

        callback(null);
    }

    git.addRemote(this.$remote, this.$url, onAdd);
};

GitTask.prototype.$getCurrentBranch = function $getCurrentBranch (callback) {
    function onBranch (err, stdout) {
        if (err) {
            debug('Failed to get the current branch');
            return callback(new VError(err, 'failed to execute `git rev-parse ...`'));
        }

        stdout = stdout.replace(/(?:\r\n|\r|\n)/g, '');

        callback(null, stdout);
    }

    shell.exec('git rev-parse --abbrev-ref HEAD', onBranch);
};

GitTask.prototype.$push = function $push () {
    var self = this;
    var ee = new events.EventEmitter();

    function onRemoveRemote (err) {
        self.$addRemote(onAddRemote)
    }

    function onAddRemote (err) {
        if (err) {
            return ee.emit('error', new VError(err, 'failed to add the remote repository'));
        }

        self.$getCurrentBranch(onGetBranch);
    }

    function onGetBranch (err, branch) {
        if (err) {
            return ee.emit('error', new VError(err, 'failed to determine the current branch'));
        }

        git
            .outputHandler(function onResponse (command, stdout, stderr) {
                stdout.on('data', ee.emit.bind(ee, 'out'));
                stderr.on('data', ee.emit.bind(ee, 'out'));
            })
            .push(self.$remote, branch + ':master');
    }

    function onPush (err) {
        if (err) {
            return ee.emit('error', new VError(err, 'failed to push the current state'));
        }

        ee.emit('done');
    }

    this.$removeRemote(onRemoveRemote);

    return ee;
};
