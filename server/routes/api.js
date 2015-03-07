'use strict';

module.exports = [{
  method: 'GET',
  path: '/api/aws',
  handler: require('../controllers/aws'),
  config: {
    description: 'API to get AWS EC2 instance data and regions.',
    notes: 'This should make it easier for the front-end app to share the same data as the backend server.',
    tags: ['api', 'aws']
  }
}];
