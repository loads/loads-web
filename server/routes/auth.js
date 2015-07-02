'use strict';

module.exports = [{
  method: ['GET', 'POST'],
  path: '/login',
  handler: require('../controllers/login'),
  config: {
    auth: {
      mode: 'try'
    },
    plugins: {
      'hapi-auth-cookie': {
        redirectTo: false
      }
    },
    description: 'Login route for the loads web.',
    notes: ' ',
    tags: ['auth']
  }
}, {
  method: 'GET',
  path: '/logout',
  handler: require('../controllers/logout'),
  config: {
    description: 'Logout route for the app.',
    notes: ' ',
    tags: ['auth']
  }
}];
