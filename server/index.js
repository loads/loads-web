'use strict';

var path = require('path');

var Hapi = require('hapi');
var HapiAuthCookie = require('hapi-auth-cookie');
var NunjucksHapi = require('nunjucks-hapi');

var conf = require('./config');
var routes = require('./routes/index');

var viewPath = path.join(__dirname, 'views');
var env = NunjucksHapi.configure(viewPath);

var server = new Hapi.Server();
server.connection({
  host: conf.get('host'),
  port: conf.get('port')
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
    expiresIn: conf.get('server.session.duration')
  });

  server.app.cache = cache;
  server.auth.strategy('session', 'cookie', true, {
    password: conf.get('server.session.secret'),
    cookie: conf.get('server.session.cookieName'),
    redirectTo: '/login',
    isSecure: conf.get('server.session.secure'),
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
