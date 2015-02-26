'use strict';

var Joi = require('joi');

var Comment = require('../db').Comment;

module.exports = {
  method: 'POST',
  path: '/mock/project',
  handler: function (req, reply) {

    console.log(req);
    console.log(req.payload);

    if(req.payload.project_id) {
      console.log('Updating project id: ', req.payload.project_id);
    }
    else {
      console.log('Creating a new project id');
      reply(1);
    }

  }
};
