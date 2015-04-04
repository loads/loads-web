'use strict';

module.exports = [{
  method: 'GET',
  path: '/api/gist/{id}',
  config: {
    handler: require('../controllers/gist'),
    description: 'API to get gists from github and return the data',
    notes: 'This is a clever note',
    tags: ['api', 'gist']
  }
}];
