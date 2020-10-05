const logger = require('../utils/logger');

module.exports = function() {
    // -------------------------------------------------
    // Unhandled synchronous exception. To test:
    // throw new Error('Something crashed');

    process.on('uncaughtException', (ex) => {
        logger.error(ex.message, ex);
        process.exit(1);
    });

    // -------------------------------------------------
    // Unhandled asynchronous exception. To test:
    // const p = Promise.reject(new Error('Something failed miserably.'));
    // p.then(() => console.log('Done'));
    process.on('unhandledRejection', (ex) => {
        logger.error(ex.message, ex);
        process.exit(1);
    });
}