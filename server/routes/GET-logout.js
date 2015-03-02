'use strict';

module.exports = {
  method: 'GET',
  path: '/logout',
  handler: function (request, reply) {
    request.auth.session.clear();
    reply.redirect('/');
  },
  config: {
    description: 'Logout route for the app.',
    notes: ' ',
    tags: ['auth']
  }
};
