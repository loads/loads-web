'use strict';

var handlers = require('../controllers/proxy');

module.exports.routes = [{
  method: 'GET',
  path: '/api/{proxy*}',
  handler: handlers.getAPI
}, {
  method: 'GET',
  path: '/dashboards/{proxy*}',
  handler: handlers.getDashboards
}];
