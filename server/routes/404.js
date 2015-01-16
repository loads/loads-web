'use strict';

module.exports = {
  method: '*',
  path: '/{param*}',
  handler: function (request, reply) {
    reply.file('client/static/404.html').code(404);
  },
  config: {
    description: 'Static route for the <em>/static/</em> directory.',
    notes: 'This directory contains all the CSS, images, and scripts which are used by the app.',
    tags: ['static', 'assets']
  }
};
