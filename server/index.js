'use strict';

var path = require('path');

var Hapi = require('hapi');
var HapiAuthCookie = require('hapi-auth-cookie');
var NunjucksHapi = require('nunjucks-hapi');

var routes = require('./routes/index');

var PORT = process.env.PORT || 5000;
var DAYS_IN_MS = 1000 * 60 * 60 * 24;

var viewPath = path.join(__dirname, 'views');
var env = NunjucksHapi.configure(viewPath);

var server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: PORT
});

server.views({
  engines: {
    html: NunjucksHapi
  },
  path: viewPath
});

server.register(HapiAuthCookie, function (err) {
  if (err) {
    throw err;
  }

  var cache = server.cache({
    segment: 'sessions',
    expiresIn: 7 * DAYS_IN_MS
  });

  server.app.cache = cache;
  server.auth.strategy('session', 'cookie', true, {
    password: 'secret',
    cookie: 'sid-example',
    redirectTo: '/login',
    isSecure: false,
    validateFunc: function (session, callback) {
      cache.get(session.sid, function (err, cached) {
        if (err) {
          return callback(err, false);
        }
        if (!cached) {
          return callback(null, false);
        }

        return callback(null, true, cached.account);
      });
    }
  });

  server.route(routes.routes);

  server.start(function () {
    console.log('Hapi server started at %s', server.info.uri);
  });
});
