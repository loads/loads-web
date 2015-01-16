'use strict';

module.exports = {
  method: 'GET',
  path: '/bower_components/{param*}',
  handler: {
    directory: {
      path: 'client/bower_components',
      index: false,
      listing: false,
      lookupCompressed: true
    }
  },
  config: {
    description: 'Static route for the <em>/bower_components/</em> directory.',
    notes: 'This directory contains all the bower dependencies.',
    tags: ['static', 'assets']
  }
};
