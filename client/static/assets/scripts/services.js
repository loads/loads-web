'use strict';

angular.module('LoadsApp')
  .factory('RunsService', function ($rootScope, WEBSOCKET_URL) {
    var cleanData = function (arr) {
      return arr.map(function (result) {
        var data = {
          date: result[0],
          name: result[1],
          runId: result[2],
          details: result[3]
        };
        data.success = (data.details.metadata.style === 'green');
        data.cssClass = (data.success) ? 'success' : 'danger';
        data.iconClass = (data.success) ? 'checkmark' : 'remove';
        return data;
      });
    };

    var ws = new WebSocket(WEBSOCKET_URL);
    ws.onopen = function () {
      console.log('Socket has been opened to %s', WEBSOCKET_URL);
    };
    ws.onmessage = function (message) {
      $rootScope.$apply(function () {
        try {
          var data = angular.fromJson(message.data);
          $rootScope.runs = {
            active: cleanData(data.active),
            inactive: cleanData(data.inactive),
            hasActive: (data.active.length !== 0),
            hasInactive: (data.inactive.length !== 0),
            lastSync: new Date()
          };
        } catch (err) {
          console.error(err);
          console.log(message);
        }
      });
    };

    return ws;
  });
