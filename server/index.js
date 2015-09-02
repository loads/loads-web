'use strict';


var Hapi = require('hapi');
var HapiAuthCookie = require('hapi-auth-cookie');

var conf = require('./config');
var routes = require('./routes/index').routes;
var views = require('./views');

var server = new Hapi.Server();
server.connection({
  host: conf.get('server.connection.host'),
  port: conf.get('server.connection.port')
});

server.register(HapiAuthCookie, function (err) {
  if (err) {
    throw err;
  }

  var cache = server.cache({
    segment: 'sessions',
    expiresIn: conf.get('server.cache.expiresIn')
  });

  server.app.cache = cache;
  server.auth.strategy('session', 'cookie', true, {
    password: conf.get('server.auth.strategy.password'),
    cookie: conf.get('server.auth.strategy.cookie'),
    redirectTo: conf.get('server.auth.strategy.redirectTo'),
    isSecure: conf.get('server.auth.strategy.isSecure'),
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

  server.views(views);
  server.route(routes);

  server.start(function () {
    console.log('Hapi server started at %s', server.info.uri); // eslint-disable-line no-console
  });
});
