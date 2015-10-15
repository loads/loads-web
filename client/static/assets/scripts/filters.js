'use strict';

angular.module('LoadsApp')
  .filter('checkmark', function () {
    return function (bool) {
      return bool ? '\u2713' : '\u2718';
    };
  }).filter('successClass', function () {
    return function (bool) {
      return bool ? 'success' : 'danger';
    };
  }).filter('statusToText', function () {
    // Converts status states to an output-friendly format.
    return function (status) {
      var STATUSES = [
        'INITIALIZING',
        'RUNNING',
        'TERMINATING',
        'COMPLETED'
      ];
      return STATUSES[status] || 'UNKNOWN';
    };
  });
