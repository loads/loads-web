'use strict';

var Joi = require('joi');

var makeResults = require('mockloadsresults').makeResults;

module.exports = {
  method: 'GET',
  path: '/mock/api/{active}/{count?}',
  handler: function (req, reply) {
    var active = (req.params.active === 'active');
    var count = req.params.count;
    var results = makeResults(active, count);
    if (results.length < 2) {
      return reply([]);
    }
    reply(results);
  },
  config: {
    validate: {
      params: {
        active: Joi.string().required().valid('active', 'finished'),
        count: Joi.number().min(0).max(30)
      }
    },
    description: 'API endpoint to get an array of active or finished results.',
    notes: 'This is used for the <em>/runs/</em>, <em>/runs/active/</em>, and <em>/runs/finished/</em> routes.',
    tags: ['api', 'results', 'runs']
  }
};
