const express = require('express');
const config = require('config');
const { dbUri } = require('../utils/database');

let configLog;

// This causes conflict with jest test automation and that is why it is disabled.

if (typeof jest !== 'undefined') {
    configLog = jest.fn();
} else {
    configLog = require('debug')('app:config');
}

module.exports = function(app) {
    // Detect environment that we are working in.

    if (!config.get('jwtPrivateKey')) {
        throw new Error('FATAL ERROR: jwtPrivateKey is not defined');
    }

    if (!config.get('db.host')) {
        throw new Error('FATAL ERROR: MONGO_HOST environment variable not found');
    }

    configLog('Application: ' + config.get('name'));
    configLog('MongoDB URI: ' + dbUri);
    configLog('Mail Server: ' + config.get('mail.host'));
    configLog('Mail Password: ' + config.get('mail.password'));
}