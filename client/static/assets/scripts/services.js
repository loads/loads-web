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
  })
  .factory('MockRunsService', ['$http', function ($http) {
    var getRuns = function (active, count) {
      active = active ? 'active' : 'finished';
      count = Math.min(parseInt(count, 10), 30);

      // Example: "/mock/api/finished/5"
      var API_URL = ['/mock', 'api', active, count].join('/');

      return $http.get(API_URL).error(function (err) {
        console.error(err);
      });
    };

    return {
      getActiveRuns: function () {
        var cnt = Math.floor(Math.random() * 5);
        return getRuns(true, cnt).success(function (runs) {
          runs.map(function (run) {
            run.success = true;
            return run;
          });

          if (runs.length > 3) {
            return [];
          }
          return runs;
        });
      },
      getFinishedRuns: function (count) {
        return getRuns(false, count).success(function (runs) {
          // console.table(runs);
          return runs.sort(function (runA, runB) {
            return new Date(runB.endDate) - new Date(runA.endDate);
          });
        });
      }
    };
  }]);
