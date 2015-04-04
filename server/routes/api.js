'use strict';

module.exports = [
  {
    method: 'GET',
    path: '/api/aws',
    config: {
      handler: require('../controllers/aws'),
      description: 'API to get AWS EC2 instance data and regions.',
      notes: 'This should make it easier for the front-end app to share the same data as the backend server.',
      tags: ['api', 'aws']
    }
  }, {
    method: 'POST',
    path: '/api/schema/validate',
    config: {
      handler: require('../controllers/schema'),
      description: 'API to validate a load test JSON packet',
      notes: ' ',
      tags: ['api', 'schema']
    }
  }
];
