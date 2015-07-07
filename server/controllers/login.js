'use strict';

var verify = require('browserid-verify')();

module.exports = function (request, reply) {
  if (request.auth.isAuthenticated) {
    return reply.redirect('/');
  }

  if (request.method === 'get') {
    return reply.view('login', {
      message: ''
    });
  }

  if (request.method === 'post') {
    var assertion = request.payload.assertion;
    var audience = request.info.host;

    verify(assertion, audience, function (err, email, response) {
      if (err) {
        console.error('There was an error : ' + err);
        return reply(err);
      }

      request.server.app.cache.set(assertion, {
        account: email
      }, 0, function (err) {
        if (err) {
          return reply(err);
        }
        request.auth.session.set({
          sid: assertion,
          email: email
        });

        response.status = (response.status === 'okay') && isMozillian(email);
        reply(response);
      });
    });
  }
};

function isMozillian (email) {
  return (/@mozilla\.(com|org)$/i).test(email);
}
