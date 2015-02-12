var url = require('url');

module.exports = {
  method: 'GET',
  path: '/api/{proxy*}',
  handler: {
    proxy: {
      passThrough: true,
      mapUri: function mapUri(request, callback) {
        var pathname = '/api';
        if (request.params.proxy) {
          pathname += '/' + request.params.proxy;
        }
        var proxyURI = url.format({
          hostname: 'loadsv2.stage.mozaws.net',
          port: 8080,
          protocol: 'http',
          pathname: pathname
        });
        callback(null, proxyURI);
      }
    }
  }
};
