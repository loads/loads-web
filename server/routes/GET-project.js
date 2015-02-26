'use strict';

var Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/mock/project/{id}',
  handler: function (req, reply) {

    // For now, return mock data
    reply({"plans":[{"steps":[{"step_name":"Plan 1 Name","instance_count":"1","run_max_time":"1","run_delay":"1","step_url":"","environment_data":"1 Environment Data","dns_mapping":"DNS 1","port_mapping":"Port 1","volume_mapping":"Volume 1","docker_series":"Docker 1"}],"plan_title":"Plan 1 Title","plan_description":"Plan 1 Description"},{"steps":[{"step_name":"Plan 2","instance_count":"22","run_max_time":"22","run_delay":"22","step_url":"","environment_data":"Data 2","dns_mapping":"DNS 2","port_mapping":"Port 2","volume_mapping":"Volumne 2","docker_series":"Docer 2"}],"plan_title":"Plan 2","plan_description":"Description 2"}],"project_title":"P Title", "project_id": "22"});

  },
  config: {
    validate: {
      params: {
        id: Joi.number().min(1)
      }
    },
    description: 'API endpoint to get a project JSON object.',
    notes: 'This is used for returning a specific project',
    tags: ['api', 'results', 'project']
  }
};
