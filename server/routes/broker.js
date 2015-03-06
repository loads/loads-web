'use strict';

module.exports = {
  method: 'GET',
  path: '/api/{proxy*}',
  handler: require('../controllers/proxy')
};
