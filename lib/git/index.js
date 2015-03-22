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

var child_process = require('child_process');
var shell = {
    exec: child_process.exec,
    spawn: child_process.spawn
};
var events = require('events');

var debug = require('debug')('doploy:git');
var mandatory = require('mandatory');
var VError = require('verror');

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

    shell.exec('git remote remove ' + this.$remote, onRemove);
};

GitTask.prototype.$addRemote = function $addRemote (callback) {
    function onAdd (err) {
        if (err) {
            debug('failed to add the remote repository');

            return callback(new VError(err, 'failed to add the remote repository'));
        }

        callback(null);
    }

    shell.exec('git remote add ' + this.$remote + ' ' + this.$url, onAdd);
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
        var spawn = null;

        if (err) {
            return ee.emit('error', new VError(err, 'failed to determine the current branch'));
        }

        function onOut (data) {
            data = data.toString('utf-8').replace(/(?:\r\n|\r|\n)/g, '');

            if (data) {
                ee.emit('out', data);
            }
        }

        spawn = shell.spawn('git', ['push', self.$remote, branch + ':master']);

        spawn.stdout.on('data', onOut);
        spawn.stderr.on('data', onOut);

        spawn.on('close', function (code) {
            if (code !== 0) {
                return onPush(new VError('git push failed with exit code: %d', code));
            }

            onPush(null);
        });
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
