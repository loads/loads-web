'use strict';

var conf = require('../config');

module.exports = function (request, reply) {
  reply({
    instanceTypes: conf.get('aws.instanceTypes'),
    regions: conf.get('aws.regions')
  });
};
