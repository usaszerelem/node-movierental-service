const config = require('config');
const morgan = require('morgan');   // Logs HTTP requests
const express = require('express');
const app = express();

require('./startup/config')();
require('./startup/unhandledExceptions')();
require('./startup/validation')();
require('./startup/prod')(app);
require('./startup/routes')(app);
require('./startup/database')();

const logger = require('./utils/logger');

//logger.error("Does this work?", new Error("Yup!"));

app.set('view engine', 'pug');  // To return HTML using pug template module
app.set('views', './views');

if (config.get('Environment') === 'development') {
    app.use(morgan('tiny'));
    logger.info('Morgan enabled...');
}

// -------------------------------------------------

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT} ...`);
});

module.exports = server;
