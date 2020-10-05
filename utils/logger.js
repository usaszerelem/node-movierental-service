// If jest is running, disable windows logger as this
// module causes problem with some tests

let logger = '';

if (typeof jest !== 'undefined') {
    logger = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
      };
} else {
    logger = require('./_logger');
}

module.exports = logger;