'use strict';

var Remarkable = require('remarkable');

var db = require('../db');

var md = new Remarkable('full', {
  breaks: true,
  html: true,
  linkify: true,
  typographer: true,
  xhtmlOut: true
});

exports.getComments = function (req, reply) {
  var runId = req.params.runId;

  var args = {
    where: {
      runId: runId
    }
  };

  db.Comment.findAll(args).on('success', function (comments) {
    comments = comments.map(function (item) {
      var values = item.dataValues;
      // Convert our comment from Markdown to HTML.
      values.comment = md.render(values.comment);
      return values;
    });

    reply(comments);
  });
};

exports.saveComment = function (req, reply) {
  db.Comment.create(req.payload).complete(function (err, comment) {
    if (err) {
      return reply(err);
    }
    reply(comment);
  });
};
