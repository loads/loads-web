'use strict';

module.exports = function (req, reply) {
  // console.log(JSON.stringify(req.payload, null, 2));

  if (req.payload.project_id) {
    console.log('Updating project id: ', req.payload.project_id);
    reply(0);
  } else {
    console.log('Creating a new project id');
    reply(1);
  }
};
