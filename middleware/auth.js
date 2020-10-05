const jwt = require('jsonwebtoken');
const config = require('config');
const logger = require('../utils/logger');

function authenticate(req, res, next) {
    logger.debug('Authenticating...');

    const token = req.header('x-auth-token');

    if (!token) {
        const message = 'Access denied. No x-auth-token provided';
        logger.error(message);
        return res.status(401).send(message);
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        logger.debug('Decoded user information:\n' + JSON.stringify(decoded, null, 4));

        // Add decoded user object to the request
        req.user = decoded;
        next();
    }
    catch(ex) {
        logger.error(ex.message);
        res.status(400).send('Invalid x-auth-token');
    }
}

module.exports = authenticate;