'use strict';

var Joi = require('joi');

var controller = require('../controllers/comments');

module.exports = [{
  method: 'GET',
  path: '/api/comments/runId/{runId}',
  handler: controller.getComments,
  config: {
    validate: {
      params: {
        runId: Joi.string().required()
      }
    },
    description: 'API endpoint to get all comments for a specific `runId`.',
    notes: 'This is used on the runs details page.',
    tags: ['api', 'comments']
  }
}, {
  method: 'POST',
  path: '/api/comments/',
  handler: controller.saveComment
  // config: {
  //   validate: {
  //     params: {
  //       runId: Joi.string().required(),
  //       name: Joi.string(),
  //       comment: Joi.string()
  //     }
  //   },
  //   description: 'API endpoint to add a comment to the database for a specific `runId`.',
  //   notes: 'Requires the following keys `runId`, `name`, `comment`.',
  //   tags: ['api', 'comments']
  // }
}];
