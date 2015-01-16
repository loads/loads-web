'use strict';

module.exports = {
  method: 'GET',
  path: '/assets/{param*}',
  handler: {
    directory: {
      path: 'client/static/assets',
      listing: false,
      index: false,
      lookupCompressed: true
    }
  },
  config: {
    description: 'Static route for the <em>/static/</em> directory.',
    notes: 'This directory contains all the CSS, images, and scripts which are used by the app.',
    tags: ['static', 'assets']
  }
};
