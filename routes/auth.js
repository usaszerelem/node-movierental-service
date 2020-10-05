const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');
const { User } = require('../models/users');
const logger = require('../utils/logger');

// -------------------------------------------------

router.post('/', async (req,res) => {
    logger.debug('Received authentication request:\n', JSON.stringify(req.body, null, 4));

    const { error } = validate(req.body);

    if (error) {
        logger.error('Bad validation');
        return res.status(400).send(error.details[0].message);
    }

    // There can only be one user with the same email
    // registered. Check if there is already a user
    // that uses this same email.

    let user = await User.findOne({ email: req.body.email });

    if (!user) {
        logger.error('Invalid email');
        return res.status(400).send('Invalid email or password.');
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);

    if (!validPassword) {
        logger.error('Invalid password');
        return res.status(400).send('Invalid email or password.');
    }

    const token = user.generateAuthToken();
    logger.debug('Returning authentication token:\n' + token);
    res.send(token);
});

// -------------------------------------------------

function validate(req) {

    const schema = Joi.object({
        email: Joi.string().min(10).max(255).required().email(),
        password: Joi.string().min(4).max(255).required()
    });

    return schema.validate(req);
}

module.exports = router;
