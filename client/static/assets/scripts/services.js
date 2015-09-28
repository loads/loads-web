'use strict';

angular.module('LoadsApp')
  .factory('RunsService', function ($rootScope, $http) {

    return $http.get('/api')
     .then(function (res) {
        $rootScope.runs = res.data.runs;
        $rootScope.lastSync = Date.now();
      });
  });
