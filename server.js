'use strict';

/**
 * This is the Form.io application server.
 */
var express = require('express');
var nunjucks = require('nunjucks');
var fs = require('fs-extra');
var util = require('./src/util/util');
require('colors');
var Q = require('q');
var test = process.env.TEST_SUITE;

module.exports = function(options) {
  options = options || {};
  var q = Q.defer();

  util.log('');
  var rl = require('readline').createInterface({
    input: require('fs').createReadStream('logo.txt')
  });

  rl.on('line', function(line) {
    util.log(
      line.substring(0,4) +
      line.substring(4, 30).cyan.bold +
      line.substring(30, 33) +
      line.substring(33, 42).green.bold +
      line.substring(42)
    );
  });

  rl.on('close', function() {
    // Print the welcome screen.
    util.log('');
    util.log(fs.readFileSync('welcome.txt').toString().green);
  });

  // Use the express application.
  var app = options.app || express();

  // Use the given config.
  var config = options.config || require('config');

  // Configure nunjucks.
  nunjucks.configure('client', {
    autoescape: true,
    express: app
  });

  // Mount the client application.
  app.use('/', express.static(__dirname + '/client/dist'));
//add CORS support
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
   // res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


  // Load the form.io server.
  var server = options.server || require('./index')(config);
  var hooks = options.hooks || {};

  app.use(server.formio.middleware.restrictRequestTypes);
  server.init(hooks).then(function(formio) {
    // Called when we are ready to start the server.
    var start = function() {
      // Start the application.
      if (fs.existsSync('app')) {
        var application = express();
//cors
application.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//end cors


        application.use('/', express.static(__dirname + '/app/dist'));

       config.appPort = config.appPort || 8080;
        application.listen(config.appPort);
        var appHost = 'http://0.0.0.0:' + config.appPort;
        util.log(' > Serving application at ' + appHost.green);
      }

      // Mount the Form.io API platform.
      app.use(options.mount || '/', server);

      // Allow tests access server internals.
      app.formio = formio;

      // Listen on the configured port.
      return q.resolve({
        server: app,
        config: config
      });
    };

    // Which items should be installed.
    var install = {
      download: false,
      extract: false,
      import: false,
      user: false
    };

    // Check for the client folder.
    if (!fs.existsSync('client') && !test) {
      install.download = true;
      install.extract = true;
    }

    // See if they have any forms available.
    formio.db.collection('forms').count(function(err, numForms) {
      // If there are forms, then go ahead and start the server.
      if ((!err && numForms > 0) || test) {
        if (!install.download && !install.extract) {
          return start();
        }
      }

      // Import the project and create the user.
      install.import = true;
      install.user = true;

      // Install.
      require('./install')(formio, install, function(err) {
        if (err) {
          return util.log(err.message);
        }

        // Start the server.
        start();
      });
    });
  });

  return q.promise;
};
