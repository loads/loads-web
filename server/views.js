'use strict';

var path = require('path');

var NunjucksHapi = require('nunjucks-hapi');

var viewPath = path.join(__dirname, 'views');

NunjucksHapi.configure(viewPath);

module.exports = {
  engines: {
    html: NunjucksHapi
  },
  path: viewPath
};
