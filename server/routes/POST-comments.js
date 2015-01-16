'use strict';

var Joi = require('joi');

var Comment = require('../db').Comment;

module.exports = {
  method: 'POST',
  path: '/api/comments/',
  handler: function (req, reply) {

    Comment.create(req.payload).complete(function (err, comment) {
      if (err) {
        return reply(err);
      }
      reply(comment);
    });

    // console.log('a:', JSON.stringify(req.payload, null, 2));
    // reply({success: true});
  // },
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
  }
};
