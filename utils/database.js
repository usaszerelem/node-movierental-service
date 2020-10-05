const config = require('config');

module.exports.dbUri = config.get('db.host');
