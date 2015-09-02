'use strict';

module.exports = function (req, reply) {
  if (req.payload.project_id) {
    console.log('Updating project id: ', req.payload.project_id); // eslint-disable-line no-console
    reply(0);
  } else {
    console.log('Creating a new project id'); // eslint-disable-line no-console
    reply(1);
  }
};
