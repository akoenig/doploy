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

var VError = require('verror');

var sshconfig = require('./sshconfig');
var stdout = require('./stdout');
var stderr = require('./stderr');

module.exports = function instantiate (duploy) {
    var app = new Application(duploy);

    return {
        install: app.install.bind(app),
        uninstall: app.uninstall.bind(app)
    };
};

function Application (duploy) {
    this.$duploy = duploy;
}

Application.prototype.$getSshConfiguration = function $getSshConfiguration (host, callback) {

    function onConfiguration (err, config) {
        if (err) {
            return callback(new VError(err, 'failed to determine the SSH configuration of "%s"', host));
        }

        if (config.needsPassphrase) {
            config.passphrase = stdout.password('Passphrase for SSH key:');
        }

        callback(null, config);
    }

    sshconfig(host, onConfiguration);
};

Application.prototype.install = function install (host) {
    var self = this;

    function onError (err) {
        stderr(err);

        return process.exit(1);
    }

    function onSshConfiguration (err, config) {
        if (err) {
            stderr(err.message);

            return process.exit(1);
        }

        self.$duploy.install(config)
            .once('error', onError)
            .on('output', stdout);
    }

    this.$getSshConfiguration(host, onSshConfiguration);
};

Application.prototype.uninstall = function uninstall (host) {
    var self = this;

    function onError (err) {
        stderr(err);

        return process.exit(1);
    }

    function onSshConfiguration (err, config) {
        if (err) {
            stderr(err.message);

            return process.exit(1);
        }

        self.$duploy.uninstall(config)
            .once('error', onError)
            .on('output', stdout);
    }

    this.$getSshConfiguration(host, onSshConfiguration);
};
