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
var parse = require('sshconf/parse');
var merge = require('sshconf/merge');
var VError = require('verror');

module.exports = function instantiate (host, callback) {
    var sshconfig = new SSHConfig(host);

    return sshconfig.load(callback);
};

function SSHConfig (host) {
    this.$homeDirectory = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
    this.$host = host;
    this.$file = path.join(this.$homeDirectory, '.ssh', 'config');
}

SSHConfig.prototype.$parseHostSetting = function $parseHostSetting (entries) {
    var self = this;

    entries = entries.filter(function filter (entry) {
        return (entry.Host[0] === self.$host);
    });

    return entries[0];
};

SSHConfig.prototype.$readKey = function $readKey (keyfile, callback) {
    if (keyfile.charAt(0) === '~') {
        keyfile = keyfile.replace('~', '');
        keyfile = path.join(this.$homeDirectory, keyfile);
    }

    function onRead (err, contents) {
        if (err) {
            return callback(new VError(err, 'I/O error while reading SSH key'));
        }

        callback(null, contents);
    }

    fs.readFile(keyfile, onRead);
};

SSHConfig.prototype.load = function load (callback) {
    var self = this;
    var config = {
        host: '',
        port: 22,
        user: '',
        key: null
    };

    function onParsed (err, parsed) {
        var host = null;

        if (err) {
            return callback(new VError(err, 'failed to parse ssh configuration file'));
        }

        host = self.$parseHostSetting(parsed.hosts);

        if (!host) {
            return callback(new VError('SSH configuration of host "%s" not found.', self.$host));
        }

        config.host = self.$host;
        config.port = host.Port || 22;
        config.user = host.User;
        config.key = host.IdentityFile;

        if (!config.host || !config.user || !config.key) {
            return callback(new VError('SSH configuration of host "%s" is incomplete', self.$host));
        }

        self.$readKey(config.key, onReadKey);
    }

    function onReadKey (err, contents) {
        if (err) {
            return callback(new VError(err, 'failed to read the SSH key'));
        }

        config.key = contents;

        if (!!~contents.toString('utf-8').indexOf('ENCRYPTED')) {
            config.needsPassphrase = true;
        }

        callback(null, config);
    }

    fs.createReadStream(this.$file)
      .pipe(parse())
      .pipe(merge(onParsed));
};
