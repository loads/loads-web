'use strict';

var url = require('url');

function makeMapFunc(prefix) {
  return function mapUri(request, callback) {
    var pathname = prefix;
    if (request.params.proxy) {
      pathname += '/' + request.params.proxy;
    }
    var proxyURI = url.format({
      hostname: 'loadsv2.stage.mozaws.net',
      port: 8080,
      protocol: 'http',
      pathname: pathname,
      search: request.url.search
    });
    callback(null, proxyURI);
  };
}

exports.getAPI = {
  proxy: {
    passThrough: true,
    mapUri: makeMapFunc('/api')
  }
};

exports.getDashboards = {
  proxy: {
    passThrough: true,
    mapUri: makeMapFunc('/dashboards')
  }
};
