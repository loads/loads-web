'use strict';

module.exports = {
  method: 'GET',
  path: '/',
  config: {
    handler: function (request, reply) {
      reply.file('client/static/index.html');
    },
    description: 'Static route for the <em>/static/</em> directory.',
    notes: 'This directory contains all the CSS, images, and scripts which are used by the app.',
    tags: ['static', 'assets']
  }
};
