'use strict';

angular.module('LoadsApp')
  .config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(false);

    $routeProvider
      .when('/', route('RunsController', 'runs'))
      .when('/cluster', route('ClusterManagementController', 'cluster'))
      .when('/agents/status', route('AgentsStatusController', 'agents-status'))
      .when('/agents/check', route('LaunchAgentHealthCheckController', 'agents-check'))
      .when('/tests', route('TestsController', 'tests'))
      .when('/runs', route('RunsController', 'runs'))
      .when('/runs/active', route('ActiveRunsController', 'runs-active'))
      .when('/runs/finished', route('FinishedRunsController', 'runs-finished'))
      .when('/run/:id?', route('RunDetailController', 'run-detail'))
      .when('/reference', route('ReferenceController', 'reference'))
      .otherwise({
        redirectTo: '/'
      });
  });

function route(controller, templateUrl) {
  return {
    controller: controller,
    templateUrl: 'assets/views/' + templateUrl + '.html'
  };
}
