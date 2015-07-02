'use strict';

module.exports = [{
  method: 'GET',
  path: '/assets/{param*}',
  config: {
    handler: require('../controllers/assets'),
    auth: {
      mode: 'try'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    description: 'Static route for the <em>/static/</em> directory.',
    notes: 'This directory contains all the CSS, images, and scripts which are used by the app.',
    tags: ['static', 'assets']
  }
}, {
  method: 'GET',
  path: '/bower_components/{param*}',
  config: {
    handler: require('../controllers/bower_components'),
    auth: {
      mode: 'try'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    description: 'Static route for the <em>/bower_components/</em> directory.',
    notes: 'This directory contains all the bower dependencies.',
    tags: ['static', 'assets']
  }
}];
