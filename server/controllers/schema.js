'use strict';

var Joi = require('joi');
var P = require('promise');

// var schema = require('../schema');

var validatep = P.denodeify(Joi.validate);

module.exports = function (request, reply) {
  validateSchema(request.payload.data).then(function (result) {
    reply({
      success: true,
      result: result
    });
  }).catch(function (err) {
    reply({
      success: false,
      message: err.message || '(unknown error)',
      details: err.details
    });
  });
};

function validateSchema(data, schema) {
  if (typeof data === 'string') {
    data = JSON.pares(data);
  }
  return validatep(data, schema);
}
