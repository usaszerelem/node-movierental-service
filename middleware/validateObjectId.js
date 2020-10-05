const mongoose = require('mongoose');
const logger = require('../utils/logger');

module.exports = function(req, res, next) {
    logger.info('Middleware validating Object ID: ' + req.params.id);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        const message = `Object id ${req.params.id} is not valid`;
        logger.error(message);
        return res.status(404).send(message);
    }

    next();
}