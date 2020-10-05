const express = require('express');
const helmet = require('helmet');  // HTTP protection
const error = require('../middleware/error');
const genres = require('../routes/genres');
const customers = require('../routes/customers');
const users = require('../routes/users');
const movies = require('../routes/movies');
const home = require('../routes/home');
const auth = require('../routes/auth');
const rentals = require('../routes/rentals');
const returns = require('../routes/returns');
const reqLogger = require('../middleware/reqLogger');
const authenticate = require('../middleware/auth');

module.exports = function(app) {
    app.use(express.json());
    app.use(reqLogger);

    app.use('/api/genres', genres);
    app.use('/api/customers', customers);
    app.use('/api/users', users);
    app.use('/api/movies', movies);
    app.use('/api/auth', auth);
    app.use('/api/rentals', rentals);
    app.use('/api/returns', returns);
    app.use('/', home);
    app.use(error);
}