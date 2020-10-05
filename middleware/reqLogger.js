const logger = require('../utils/logger');
const express = require('express');

function reqLogger(req, res, next) {

    if (req.body != undefined) {
        logger.debug('Request', JSON.stringify(req.body));
    }

    next();
}

module.exports = reqLogger;
