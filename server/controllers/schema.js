'use strict';

var Joi = require('joi');
var schema = require('../schema');

module.exports = function (request, reply) {
  var data = request.payload.data;
  data = JSON.parse(data);

  Joi.validate(data, schema, function (err, value) {
    if (err) {
      return reply({
        success: false,
        message: err.message || '(unknown error)',
        details: err.details
      });
    }
    reply({
      success: true,
      result: value
    });
  });
};
