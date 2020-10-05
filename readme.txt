// ------------------------------------------------------------------
// Debug package that is controlled using environment variables
// The namespace specifies in which namespace to write logs to
// Set environment variable to enable specific namespaces:
//      export DEBUG=app:startup,app:db
// Set environment variable to enable all namespaces:
//      export DEBUG=app:*
// startupDebugger('Morgan enabled...');

//const startupDebugger = require('debug')('app:startup');
//const dbDebugger = require('debug')('app:db');

// ------------------------------------------------------------------
// Heroku deployment
// https://tinymovie.herokuapp.com/ | https://git.heroku.com/tinymovie.git
