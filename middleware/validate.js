const logger = require('../utils/logger');

module.exports = (validator) => {
    return (req, res, next) => {
        const { error } = validator(req.body);

        if (error) {
            logger.error('Bad POST request\n' + error.details[0].message);
            return res.status(400).send(error.details[0].message);
        }

        next();
    }
}
