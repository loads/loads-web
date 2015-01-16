'use strict';

var Joi = require('joi');
var Remarkable = require('remarkable');

var Comment = require('../db').Comment;

var md = new Remarkable('full', {
  breaks: true,
  html: true,
  linkify: true,
  typographer: true,
  xhtmlOut: true
});

var mdKey = function (key) {
  return function (result) {
    result.comment = md.render(result.comment);
    return result;
  };
};

module.exports = {
  method: 'GET',
  path: '/api/comments/runId/{runId}',
  handler: function (req, reply) {
    var runId = req.params.runId;

    var args = {
      where: {
        runId: runId
      }
    };

    Comment.findAll(args).on('success', function (comments) {
      comments = comments.map(function (item) {
        var values = item.dataValues;
        // Convert our comment from Markdown to HTML.
        values.comment = md.render(values.comment);
        return values;
      });

      reply(comments);
    });
  },
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
};
